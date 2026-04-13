import csv
import hmac
import json
from datetime import datetime, time
from datetime import timedelta
from datetime import timezone as dt_timezone
from decimal import Decimal, ROUND_HALF_UP
from zoneinfo import ZoneInfo

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from django.db.models import Count, Q, Sum
from django.db import transaction
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .mailerlite import MailerLiteSyncError, sync_lead_to_mailerlite, send_new_lead_notification, send_level_test_results_email
from .models import (
    UserProfile,
    Lesson,
    Booking,
    Availability,
    WeeklyAvailabilitySlot,
    BookingSlotBlock,
    CreditLedger,
    Payment,
    Progress,
    StudentMaterial,
    StudentGoal,
    StudentMessage,
    Lead,
    LeadActivity,
)
from .serializers import (
    UserProfileSerializer,
    LessonSerializer,
    BookingSerializer,
    AvailabilitySerializer,
    WeeklyAvailabilitySlotSerializer,
    BookingSlotBlockSerializer,
    ProgressSerializer,
    StudentMaterialSerializer,
    StudentGoalSerializer,
    StudentMessageSerializer,
    LeadSerializer,
    UserRegisterSerializer,
    AdminStudentSerializer,
)
from .google_calendar import (
    get_busy_windows,
    create_google_meet_event,
    list_calendar_events,
    upsert_block_event,
    delete_block_event,
)


def ensure_meet_for_confirmed_booking(booking):
    if (
        booking.status == 'confirmed'
        and not booking.google_meet_link
        and booking.start_time_utc
        and booking.end_time_utc
        and booking.student.email
    ):
        try:
            meet_link, event_id = create_google_meet_event(
                start_utc=booking.start_time_utc,
                end_utc=booking.end_time_utc,
                attendee_email=booking.student.email,
                summary=f'Clase 1:1 - {booking.lesson.title}',
            )
            booking.google_meet_link = meet_link
            booking.google_event_id = event_id
            booking.save(update_fields=['google_meet_link', 'google_event_id', 'updated_at'])
        except Exception:
            return


def sync_google_block_event(block):
    if not block or not block.date or not block.time:
        return
    teacher_tz = ZoneInfo(getattr(settings, 'BOOKING_TEACHER_TIMEZONE', 'Europe/Madrid'))
    start_local = datetime.combine(block.date, block.time, tzinfo=teacher_tz)
    start_utc = start_local.astimezone(dt_timezone.utc)
    end_utc = start_utc + timedelta(minutes=15)
    summary = 'No disponible (Habluj)'
    description = block.reason or 'Bloqueo puntual desde agenda interna'
    try:
        upsert_block_event(
            block_id=block.id,
            start_utc=start_utc,
            end_utc=end_utc,
            summary=summary,
            description=description,
        )
    except Exception:
        return


def remove_google_block_event(block):
    if not block:
        return
    try:
        delete_block_event(block_id=block.id)
    except Exception:
        return


def _get_client_ip(request):
    forwarded = (request.META.get('HTTP_X_FORWARDED_FOR') or '').split(',')[0].strip()
    return forwarded or request.META.get('REMOTE_ADDR') or 'unknown'


def _auth_fail_key(scope, ip):
    return f'auth_fail:{scope}:{ip}'


def _auth_lock_key(scope, ip):
    return f'auth_lock:{scope}:{ip}'


def _auth_lock_remaining_seconds(scope, ip):
    lock_until = cache.get(_auth_lock_key(scope, ip))
    if not lock_until:
        return 0
    remaining = int((lock_until - timezone.now()).total_seconds())
    if remaining <= 0:
        cache.delete(_auth_lock_key(scope, ip))
        return 0
    return remaining


def _register_auth_failure(scope, ip):
    min_failures = int(getattr(settings, 'AUTH_IP_LOCK_MIN_FAILURES', 5))
    base_seconds = int(getattr(settings, 'AUTH_IP_LOCK_BASE_SECONDS', 60))
    max_seconds = int(getattr(settings, 'AUTH_IP_LOCK_MAX_SECONDS', 3600))
    window_seconds = int(getattr(settings, 'AUTH_IP_ATTEMPT_WINDOW_SECONDS', 3600))

    key = _auth_fail_key(scope, ip)
    failures = int(cache.get(key, 0)) + 1
    cache.set(key, failures, window_seconds)

    if failures < min_failures:
        return 0

    exponent = failures - min_failures
    lock_seconds = min(max_seconds, base_seconds * (2 ** exponent))
    cache.set(_auth_lock_key(scope, ip), timezone.now() + timedelta(seconds=lock_seconds), lock_seconds)
    return lock_seconds


def _clear_auth_failures(scope, ip):
    cache.delete(_auth_fail_key(scope, ip))
    cache.delete(_auth_lock_key(scope, ip))


class StudentLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'student_login'

    def post(self, request):
        ip = _get_client_ip(request)
        lock_remaining = _auth_lock_remaining_seconds('login', ip)
        if lock_remaining > 0:
            return Response({
                'detail': 'Too many failed login attempts. Try again later.',
                'retry_after_seconds': lock_remaining,
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        identifier = (request.data.get('identifier') or request.data.get('username') or '').strip()
        password = request.data.get('password') or ''

        if not identifier or not password:
            _register_auth_failure('login', ip)
            return Response({'detail': 'Identifier and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = authenticate(request=request, username=identifier, password=password)
        except Exception:
            user = None
        if not user:
            # Defensive fallback: accept username or email even if auth backend
            # configuration differs across environments.
            for user_candidate in User.objects.filter(
                Q(username__iexact=identifier) | Q(email__iexact=identifier)
            ).order_by('id'):
                if user_candidate.check_password(password):
                    user = user_candidate
                    break
        if not user or not user.is_active:
            lock_seconds = _register_auth_failure('login', ip)
            if lock_seconds > 0:
                return Response({
                    'detail': 'Too many failed login attempts. Try again later.',
                    'retry_after_seconds': lock_seconds,
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            return Response({'detail': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        _clear_auth_failures('login', ip)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
            },
        })


class StudentRegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'student_register'

    def post(self, request):
        ip = _get_client_ip(request)
        lock_remaining = _auth_lock_remaining_seconds('register', ip)
        if lock_remaining > 0:
            return Response({
                'detail': 'Too many failed register attempts. Try again later.',
                'retry_after_seconds': lock_remaining,
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        serializer = UserRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            lock_seconds = _register_auth_failure('register', ip)
            if lock_seconds > 0:
                return Response({
                    'detail': 'Too many failed register attempts. Try again later.',
                    'retry_after_seconds': lock_seconds,
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        _clear_auth_failures('register', ip)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
            },
        }, status=status.HTTP_201_CREATED)



class StudentLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class StudentMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
        })


class StudentProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={'language_level': 'A1'},
        )
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={'language_level': 'A1'},
        )
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_queryset(self):
        if self.request.user.is_staff:
            queryset = Booking.objects.all().select_related('student', 'lesson')
            booking_status = self.request.query_params.get('status')
            level = self.request.query_params.get('level')
            search = (self.request.query_params.get('q') or '').strip()

            if booking_status:
                queryset = queryset.filter(status=booking_status)

            if level:
                queryset = queryset.filter(lesson__level=level)

            if search:
                queryset = queryset.filter(
                    Q(student__username__icontains=search)
                    | Q(student__email__icontains=search)
                    | Q(student__first_name__icontains=search)
                    | Q(student__last_name__icontains=search)
                    | Q(lesson__title__icontains=search)
                )

            return queryset
        return Booking.objects.filter(student=self.request.user)

    def _expire_pending_if_stale(self, booking):
        payment = getattr(booking, 'payment', None)
        if not payment:
            return False

        ttl_minutes = int(getattr(settings, 'BOOKING_PAYMENT_TTL_MINUTES', 15))
        is_stale = timezone.now() - payment.created_at > timedelta(minutes=ttl_minutes)
        if booking.status == 'pending' and payment.status in ('pending_user', 'processing') and is_stale:
            booking.status = 'cancelled'
            booking.save(update_fields=['status', 'updated_at'])
            payment.status = 'failed'
            payment.metadata = {**(payment.metadata or {}), 'expired_by_ttl': True}
            payment.save(update_fields=['status', 'metadata', 'updated_at'])
            return True
        return False

    def _assert_booking_owner_or_admin(self, request, booking):
        if booking.student_id != request.user.id and not request.user.is_staff:
            raise PermissionDenied('You can only manage your own booking.')

    @action(detail=False, methods=['get'])
    def availability(self, request):
        try:
            days_ahead = int(request.query_params.get('days', 21))
        except (TypeError, ValueError):
            days_ahead = 21
        days_ahead = max(1, min(days_ahead, 60))
        teacher_tz = ZoneInfo(getattr(settings, 'BOOKING_TEACHER_TIMEZONE', 'Europe/Madrid'))
        student_tz_raw = (request.query_params.get('tz') or '').strip() or getattr(request.user, 'timezone', '') or 'UTC'
        try:
            student_tz = ZoneInfo(student_tz_raw)
        except Exception:
            student_tz = ZoneInfo('UTC')
            student_tz_raw = 'UTC'

        class_minutes = int(getattr(settings, 'BOOKING_CLASS_MINUTES', 60))
        lead_time_hours = int(getattr(settings, 'BOOKING_LEAD_TIME_HOURS', 12))
        buffer_minutes = int(getattr(settings, 'BOOKING_DEFAULT_BUFFER_MINUTES', 10))

        teacher_today = timezone.now().astimezone(teacher_tz).date()
        teacher_end_date = teacher_today + timedelta(days=days_ahead)

        availability_ranges = Availability.objects.filter(is_active=True).order_by('weekday', 'start_time')
        availability_by_weekday = {}
        for item in availability_ranges:
            availability_by_weekday.setdefault(item.weekday, []).append(item)

        # Backward compatibility if ranges are not configured yet.
        if not availability_by_weekday:
            for slot in WeeklyAvailabilitySlot.objects.filter(is_active=True).order_by('weekday', 'time'):
                synthetic = Availability(
                    weekday=slot.weekday,
                    start_time=slot.time,
                    end_time=(datetime.combine(datetime.today(), slot.time) + timedelta(minutes=class_minutes)).time(),
                    buffer_minutes=buffer_minutes,
                    is_active=True,
                )
                availability_by_weekday.setdefault(slot.weekday, []).append(synthetic)

        utc_min = datetime.combine(teacher_today, time.min, tzinfo=teacher_tz).astimezone(dt_timezone.utc)
        utc_max = datetime.combine(teacher_end_date + timedelta(days=1), time.min, tzinfo=teacher_tz).astimezone(dt_timezone.utc)

        busy_windows = get_busy_windows(utc_min, utc_max)
        blocked_rows = BookingSlotBlock.objects.filter(
            is_active=True,
            date__gte=teacher_today,
            date__lte=teacher_end_date,
        ).values_list('date', 'time')
        blocked_keys = {(d.isoformat(), t.strftime('%H:%M:%S')) for d, t in blocked_rows}

        booking_rows = Booking.objects.filter(
            status__in=['pending', 'confirmed'],
            start_time_utc__lt=utc_max,
            end_time_utc__gt=utc_min,
        ).values_list('start_time_utc', 'end_time_utc')
        local_busy = []
        for start_utc, end_utc in booking_rows:
            if not start_utc or not end_utc:
                continue
            local_busy.append((start_utc - timedelta(minutes=buffer_minutes), end_utc + timedelta(minutes=buffer_minutes)))
        legacy_rows = Booking.objects.filter(
            status__in=['pending', 'confirmed'],
            start_time_utc__isnull=True,
            date__gte=teacher_today,
            date__lte=teacher_end_date,
        ).values_list('date', 'time')
        for legacy_date, legacy_time in legacy_rows:
            legacy_start = datetime.combine(legacy_date, legacy_time, tzinfo=teacher_tz).astimezone(dt_timezone.utc)
            legacy_end = legacy_start + timedelta(minutes=class_minutes)
            local_busy.append((legacy_start - timedelta(minutes=buffer_minutes), legacy_end + timedelta(minutes=buffer_minutes)))
        for busy_start, busy_end in busy_windows:
            local_busy.append((busy_start - timedelta(minutes=buffer_minutes), busy_end + timedelta(minutes=buffer_minutes)))

        min_start_utc = timezone.now().astimezone(dt_timezone.utc) + timedelta(hours=lead_time_hours)

        days_map = {}
        for offset in range(days_ahead + 1):
            current_teacher_date = teacher_today + timedelta(days=offset)
            ranges_for_day = availability_by_weekday.get(current_teacher_date.weekday(), [])
            for range_item in ranges_for_day:
                cursor = datetime.combine(current_teacher_date, range_item.start_time, tzinfo=teacher_tz)
                range_end = datetime.combine(current_teacher_date, range_item.end_time, tzinfo=teacher_tz)
                current_buffer = getattr(range_item, 'buffer_minutes', buffer_minutes) or buffer_minutes
                while cursor + timedelta(minutes=class_minutes) <= range_end:
                    start_utc = cursor.astimezone(dt_timezone.utc)
                    end_utc = (cursor + timedelta(minutes=class_minutes)).astimezone(dt_timezone.utc)
                    if start_utc < min_start_utc:
                        cursor += timedelta(minutes=class_minutes)
                        continue

                    key = (current_teacher_date.isoformat(), cursor.time().replace(second=0, microsecond=0).strftime('%H:%M:%S'))
                    if key in blocked_keys:
                        cursor += timedelta(minutes=class_minutes)
                        continue

                    target_start = start_utc - timedelta(minutes=current_buffer)
                    target_end = end_utc + timedelta(minutes=current_buffer)
                    overlap = any(busy_start < target_end and target_start < busy_end for busy_start, busy_end in local_busy)
                    if overlap:
                        cursor += timedelta(minutes=class_minutes)
                        continue

                    student_local_start = start_utc.astimezone(student_tz)
                    student_day = student_local_start.date().isoformat()
                    days_map.setdefault(student_day, []).append({
                        'time': student_local_start.strftime('%H:%M:%S'),
                        'start_time_utc': start_utc.isoformat(),
                        'end_time_utc': end_utc.isoformat(),
                    })
                    cursor += timedelta(minutes=class_minutes)

        days = []
        for day_key in sorted(days_map.keys()):
            slots = sorted(days_map[day_key], key=lambda slot: slot['start_time_utc'])
            days.append({'date': day_key, 'slots': slots})

        return Response({
            'days': days,
            'timezone': student_tz_raw,
            'teacher_timezone': str(teacher_tz),
        })

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        self._expire_pending_if_stale(booking)
        if booking.status == 'pending' or booking.status == 'confirmed':
            change_window_hours = int(getattr(settings, 'BOOKING_CHANGE_WINDOW_HOURS', 24))
            slot_start = booking.start_time_utc
            if slot_start is None and booking.date and booking.time:
                teacher_tz = ZoneInfo(getattr(settings, 'BOOKING_TEACHER_TIMEZONE', 'Europe/Madrid'))
                slot_start = datetime.combine(booking.date, booking.time, tzinfo=teacher_tz).astimezone(dt_timezone.utc)

            if slot_start and slot_start - timezone.now().astimezone(dt_timezone.utc) < timedelta(hours=change_window_hours):
                booking.status = 'consumed'
                booking.save(update_fields=['status', 'updated_at'])
                return Response({'status': 'booking consumed'})

            booking.status = 'cancelled'
            booking.save(update_fields=['status', 'updated_at'])
            CreditLedger.objects.create(
                student=booking.student,
                booking=booking,
                delta=1,
                reason='cancellation_refund',
                description='Refund for cancellation with >=24h',
            )
            return Response({'status': 'booking cancelled'})
        return Response(
            {'error': 'Booking cannot be cancelled'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        booking = self.get_object()
        if booking.student_id != request.user.id and not request.user.is_staff:
            raise PermissionDenied('You can only reschedule your own booking.')

        if booking.status not in ('pending', 'confirmed'):
            return Response({'error': 'Only active bookings can be rescheduled.'}, status=status.HTTP_400_BAD_REQUEST)

        new_start_raw = request.data.get('start_time_utc')
        if not new_start_raw:
            return Response({'error': 'start_time_utc is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            new_start = datetime.fromisoformat(str(new_start_raw).replace('Z', '+00:00'))
        except Exception:
            return Response({'error': 'Invalid start_time_utc.'}, status=status.HTTP_400_BAD_REQUEST)
        if timezone.is_naive(new_start):
            new_start = timezone.make_aware(new_start, dt_timezone.utc)
        new_start = new_start.astimezone(dt_timezone.utc)

        now_utc = timezone.now().astimezone(dt_timezone.utc)
        change_window_hours = int(getattr(settings, 'BOOKING_CHANGE_WINDOW_HOURS', 24))
        lead_time_hours = int(getattr(settings, 'BOOKING_LEAD_TIME_HOURS', 12))
        class_minutes = int(getattr(booking.lesson, 'duration', getattr(settings, 'BOOKING_CLASS_MINUTES', 60)) or getattr(settings, 'BOOKING_CLASS_MINUTES', 60))

        if booking.start_time_utc and booking.start_time_utc - now_utc < timedelta(hours=change_window_hours):
            booking.status = 'consumed'
            booking.save(update_fields=['status', 'updated_at'])
            return Response({'status': 'booking consumed'})

        if new_start - now_utc < timedelta(hours=lead_time_hours):
            return Response({'error': 'Reschedule requires at least 12h lead time.'}, status=status.HTTP_400_BAD_REQUEST)

        month_start = new_start.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)

        monthly_reschedules = Booking.objects.filter(
            student=booking.student,
            updated_at__gte=month_start,
            updated_at__lt=month_end,
        ).aggregate(total=Sum('reschedule_count'))['total'] or 0
        if monthly_reschedules >= 2:
            return Response({'error': 'Monthly reschedule limit reached (2).'}, status=status.HTTP_400_BAD_REQUEST)

        booking.start_time_utc = new_start
        booking.end_time_utc = new_start + timedelta(minutes=class_minutes)
        teacher_tz = ZoneInfo(getattr(settings, 'BOOKING_TEACHER_TIMEZONE', 'Europe/Madrid'))
        local_teacher = booking.start_time_utc.astimezone(teacher_tz)
        booking.date = local_teacher.date()
        booking.time = local_teacher.time().replace(second=0, microsecond=0)
        booking.reschedule_count += 1
        booking.status = 'confirmed'
        booking.save(update_fields=[
            'start_time_utc',
            'end_time_utc',
            'date',
            'time',
            'reschedule_count',
            'status',
            'updated_at',
        ])
        return Response({'status': 'booking rescheduled', 'booking_id': booking.id})

    @action(detail=True, methods=['post'])
    def initiate_payment(self, request, pk=None):
        booking = self.get_object()
        if booking.student_id != request.user.id and not request.user.is_staff:
            raise PermissionDenied('You can only pay your own booking.')

        self._expire_pending_if_stale(booking)
        payment = getattr(booking, 'payment', None)
        if booking.status != 'pending' or not payment:
            return Response({'error': 'Booking is not payable.'}, status=status.HTTP_400_BAD_REQUEST)

        if payment.status == 'completed':
            return Response({'error': 'Payment already completed.'}, status=status.HTTP_400_BAD_REQUEST)

        currency = (request.data.get('currency') or booking.currency or 'EUR').upper()
        if currency not in {'EUR', 'CZK'}:
            return Response({'error': 'Unsupported currency.'}, status=status.HTTP_400_BAD_REQUEST)

        if payment.status == 'pending_user':
            if currency != payment.currency:
                eur_price = Decimal(str(booking.lesson.price))
                if currency == 'CZK':
                    rate = Decimal(str(getattr(settings, 'BOOKING_EUR_TO_CZK_RATE', '25')))
                    new_amount = (eur_price * rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                else:
                    new_amount = eur_price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                booking.currency = currency
                booking.save(update_fields=['currency', 'updated_at'])
                payment.amount = new_amount
                payment.currency = currency

        gopay_client_id = getattr(settings, 'GOPAY_CLIENT_ID', '')
        gopay_client_secret = getattr(settings, 'GOPAY_CLIENT_SECRET', '')
        gopay_goid = getattr(settings, 'GOPAY_GOID', '')
        if not gopay_client_id or not gopay_client_secret or not gopay_goid:
            return Response({'error': 'GoPay is not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        amount_minor = int((Decimal(str(payment.amount)) * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))

        gopay_payment_id = f"gopay-{booking.id}-{int(timezone.now().timestamp())}"
        checkout_base = getattr(settings, 'GOPAY_CHECKOUT_BASE_URL', 'https://gate.gopay.cz').rstrip('/')
        checkout_url = f"{checkout_base}/payments/{gopay_payment_id}"

        payment.gopay_payment_id = gopay_payment_id
        payment.gopay_checkout_url = checkout_url
        payment.status = 'processing'
        payment.metadata = {
            **(payment.metadata or {}),
            'gopay_last_payment_id': gopay_payment_id,
            'gopay_amount_minor': amount_minor,
        }
        payment.save()

        return Response({
            'booking_id': booking.id,
            'payment_id': payment.id,
            'amount': str(payment.amount),
            'currency': payment.currency,
            'checkout_url': checkout_url,
            'payment_gateway': 'gopay',
        })

    @action(detail=True, methods=['post'])
    def pay_with_tokens(self, request, pk=None):
        booking = self.get_object()
        self._assert_booking_owner_or_admin(request, booking)
        self._expire_pending_if_stale(booking)

        with transaction.atomic():
            booking = Booking.objects.select_for_update().select_related('student', 'lesson').get(pk=booking.pk)
            payment = Payment.objects.select_for_update().filter(booking=booking).first()
            if booking.status != 'pending' or not payment:
                return Response({'error': 'Booking is not payable.'}, status=status.HTTP_400_BAD_REQUEST)

            credit_balance = CreditLedger.objects.filter(student=booking.student).aggregate(total=Sum('delta'))['total'] or 0
            if credit_balance <= 0:
                return Response({'error': 'No credits available for token payment.'}, status=status.HTTP_400_BAD_REQUEST)

            CreditLedger.objects.create(
                student=booking.student,
                booking=booking,
                delta=-1,
                reason='booking_debit',
                description='Booking payment with tokens',
            )

            payment.status = 'completed'
            payment.completed_at = timezone.now()
            payment.metadata = {**(payment.metadata or {}), 'payment_method': 'tokens'}
            payment.save(update_fields=['status', 'completed_at', 'metadata', 'updated_at'])

            booking.status = 'confirmed'
            booking.save(update_fields=['status', 'updated_at'])

        ensure_meet_for_confirmed_booking(booking)
        return Response({'status': 'confirmed', 'booking_id': booking.id})

    @action(detail=True, methods=['post'])
    def pay_bank_transfer(self, request, pk=None):
        booking = self.get_object()
        self._assert_booking_owner_or_admin(request, booking)
        self._expire_pending_if_stale(booking)

        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(pk=booking.pk)
            payment = Payment.objects.select_for_update().filter(booking=booking).first()
            if booking.status != 'pending' or not payment:
                return Response({'error': 'Booking is not payable.'}, status=status.HTTP_400_BAD_REQUEST)

            payment.status = 'processing'
            payment.metadata = {**(payment.metadata or {}), 'payment_method': 'bank_transfer', 'bank_transfer_requested': True}
            payment.save(update_fields=['status', 'metadata', 'updated_at'])

        return Response({
            'status': 'processing',
            'booking_id': booking.id,
            'message': 'Reserva pendiente de validación por transferencia bancaria.',
        })

    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        booking = self.get_object()
        if booking.student_id != request.user.id and not request.user.is_staff:
            raise PermissionDenied('You can only confirm your own payment.')

        payment = getattr(booking, 'payment', None)
        if not payment or not payment.gopay_payment_id:
            return Response({'error': 'GoPay payment is not initialized.'}, status=status.HTTP_400_BAD_REQUEST)

        payment.refresh_from_db()
        booking.refresh_from_db()

        if payment.status == 'completed' and booking.status == 'confirmed':
            return Response({'status': 'confirmed', 'booking_id': booking.id})

        if payment.status == 'credited':
            return Response({
                'status': 'credited',
                'message': 'Payment converted to student credit because slot is unavailable.',
            })

        if payment.status in {'failed', 'refunded'}:
            return Response({'status': payment.status}, status=status.HTTP_400_BAD_REQUEST)

        # Do not trust client-triggered confirmation for payment completion.
        # Final status is set by signed GoPay webhook events only.
        return Response({
            'status': 'processing',
            'message': 'Waiting for GoPay webhook confirmation.',
        }, status=status.HTTP_202_ACCEPTED)


class GoPayWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'gopay_webhook'

    def post(self, request):
        webhook_secret = getattr(settings, 'GOPAY_WEBHOOK_SECRET', '')
        if not webhook_secret and not settings.DEBUG:
            return Response({'error': 'GoPay webhook secret is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        if webhook_secret:
            received_secret = request.META.get('HTTP_X_GOPAY_WEBHOOK_SECRET', '')
            if not received_secret or not hmac.compare_digest(received_secret, webhook_secret):
                return Response({'error': 'Invalid GoPay webhook secret.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            event = json.loads(request.body.decode('utf-8') or '{}')
        except Exception:
            return Response({'error': 'Invalid JSON payload.'}, status=status.HTTP_400_BAD_REQUEST)

        payment_id = str(event.get('id') or '').strip()
        payment_state = str(event.get('state') or '').strip().upper()
        if not payment_id:
            return Response({'status': 'ignored'})

        payment = Payment.objects.filter(gopay_payment_id=payment_id).select_related('booking').first()
        if not payment:
            return Response({'status': 'ignored'})

        booking = payment.booking
        if payment_state in {'PAID', 'AUTHORIZED'}:
            with transaction.atomic():
                booking = Booking.objects.select_for_update().get(pk=booking.pk)
                payment = Payment.objects.select_for_update().get(pk=payment.pk)
                if payment.status == 'completed':
                    return Response({'status': 'ok'})

                if booking.status != 'pending':
                    payment.status = 'credited'
                    payment.completed_at = timezone.now()
                    payment.metadata = {**(payment.metadata or {}), 'credited_reason': 'slot_unavailable_after_payment'}
                    payment.save(update_fields=['status', 'completed_at', 'metadata', 'updated_at'])
                    return Response({'status': 'credited'})

                payment.status = 'completed'
                payment.completed_at = timezone.now()
                payment.metadata = {**(payment.metadata or {}), 'gopay_status': payment_state}
                payment.save(update_fields=['status', 'completed_at', 'metadata', 'updated_at'])
                booking.status = 'confirmed'
                booking.save(update_fields=['status', 'updated_at'])
                ensure_meet_for_confirmed_booking(booking)

        if payment_state in {'FAILED', 'CANCELED', 'REFUNDED'}:
            payment.status = 'failed'
            payment.metadata = {**(payment.metadata or {}), 'gopay_status': payment_state}
            payment.save(update_fields=['status', 'metadata', 'updated_at'])

        return Response({'status': 'ok'})


class WeeklyAvailabilitySlotViewSet(viewsets.ModelViewSet):
    queryset = WeeklyAvailabilitySlot.objects.all().order_by('weekday', 'time')
    serializer_class = WeeklyAvailabilitySlotSerializer
    permission_classes = [permissions.IsAdminUser]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    http_method_names = ['get', 'post', 'patch', 'put', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = WeeklyAvailabilitySlot.objects.all().order_by('weekday', 'time')
        active_param = self.request.query_params.get('active')
        if active_param == 'true':
            queryset = queryset.filter(is_active=True)
        if active_param == 'false':
            queryset = queryset.filter(is_active=False)
        return queryset


class AvailabilityViewSet(viewsets.ModelViewSet):
    queryset = Availability.objects.all().order_by('weekday', 'start_time')
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAdminUser]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    http_method_names = ['get', 'post', 'patch', 'put', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = Availability.objects.all().order_by('weekday', 'start_time')
        active_param = self.request.query_params.get('active')
        if active_param == 'true':
            queryset = queryset.filter(is_active=True)
        if active_param == 'false':
            queryset = queryset.filter(is_active=False)
        return queryset


class BookingSlotBlockViewSet(viewsets.ModelViewSet):
    queryset = BookingSlotBlock.objects.all().order_by('date', 'time')
    serializer_class = BookingSlotBlockSerializer
    permission_classes = [permissions.IsAdminUser]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    http_method_names = ['get', 'post', 'patch', 'put', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = BookingSlotBlock.objects.select_related('created_by').order_by('date', 'time')
        active_param = self.request.query_params.get('active')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if active_param == 'true':
            queryset = queryset.filter(is_active=True)
        if active_param == 'false':
            queryset = queryset.filter(is_active=False)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        return queryset

    def perform_create(self, serializer):
        block = serializer.save()
        if block.is_active:
            sync_google_block_event(block)
        else:
            remove_google_block_event(block)

    def perform_update(self, serializer):
        block = serializer.save()
        if block.is_active:
            sync_google_block_event(block)
        else:
            remove_google_block_event(block)

    def perform_destroy(self, instance):
        remove_google_block_event(instance)
        super().perform_destroy(instance)




class ProgressViewSet(viewsets.ModelViewSet):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    http_method_names = ['get', 'post', 'patch', 'put', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = Progress.objects.select_related('student', 'lesson')

        if self.request.user.is_staff:
            student_id = self.request.query_params.get('student')
            if student_id:
                queryset = queryset.filter(student_id=student_id)
            return queryset.order_by('-updated_at')

        return queryset.filter(student=self.request.user).order_by('-updated_at')


class StudentGoalViewSet(viewsets.ModelViewSet):
    queryset = StudentGoal.objects.all()
    serializer_class = StudentGoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    http_method_names = ['get', 'post', 'patch', 'put', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = StudentGoal.objects.select_related('student', 'created_by')
        if self.request.user.is_staff:
            student_id = self.request.query_params.get('student')
            if student_id:
                queryset = queryset.filter(student_id=student_id)
            return queryset
        return queryset.filter(student=self.request.user)


class StudentMessageViewSet(viewsets.ModelViewSet):
    queryset = StudentMessage.objects.all()
    serializer_class = StudentMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    http_method_names = ['get', 'post', 'patch', 'put', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = StudentMessage.objects.select_related('student', 'sender')
        if self.request.user.is_staff:
            student_id = self.request.query_params.get('student')
            if student_id:
                queryset = queryset.filter(student_id=student_id)
            return queryset
        return queryset.filter(student=self.request.user)

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied('Only staff can delete student messages.')
        return super().destroy(request, *args, **kwargs)


class StudentMaterialViewSet(viewsets.ModelViewSet):
    queryset = StudentMaterial.objects.all().select_related('booking', 'booking__lesson')
    serializer_class = StudentMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'post', 'patch', 'put', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = StudentMaterial.objects.select_related('student', 'booking', 'booking__lesson')

        if self.request.user.is_staff:
            student_id = self.request.query_params.get('student')
            if student_id:
                queryset = queryset.filter(student_id=student_id)
            return queryset.order_by('-created_at')

        return queryset.filter(student=self.request.user, is_active=True).order_by('-created_at')

    def destroy(self, request, *args, **kwargs):
        material = self.get_object()
        if material.created_by_id != request.user.id:
            raise PermissionDenied('Only the user who created this material can delete it.')
        return super().destroy(request, *args, **kwargs)


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all().select_related('duplicate_of').prefetch_related('activities')
    serializer_class = LeadSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    throttle_classes = [ScopedRateThrottle]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.action in ('retrieve',):
            context['include_activities'] = True
        return context

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_throttles(self):
        if self.action == 'create':
            self.throttle_scope = 'lead_create'
        return super().get_throttles()

    def get_queryset(self):
        queryset = super().get_queryset()
        request = self.request

        stage = request.query_params.get('stage')
        source = request.query_params.get('source')
        language = request.query_params.get('language')
        search = request.query_params.get('q', '').strip()
        follow_up = request.query_params.get('follow_up')
        duplicates = request.query_params.get('duplicates')

        if stage:
            queryset = queryset.filter(stage=stage)
        if source:
            queryset = queryset.filter(source=source)
        if language:
            queryset = queryset.filter(preferred_language=language)

        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search)
                | Q(email__icontains=search)
                | Q(notes__icontains=search)
                | Q(source__icontains=search)
            )

        now = timezone.now()
        start_of_today = datetime.combine(now.date(), time.min, tzinfo=now.tzinfo)
        end_of_today = datetime.combine(now.date(), time.max, tzinfo=now.tzinfo)

        if follow_up == 'today':
            queryset = queryset.filter(follow_up_at__range=(start_of_today, end_of_today))
        elif follow_up == 'overdue':
            queryset = queryset.filter(follow_up_at__lt=now)
        elif follow_up == 'scheduled':
            queryset = queryset.filter(follow_up_at__isnull=False)
        elif follow_up == 'none':
            queryset = queryset.filter(follow_up_at__isnull=True)

        if duplicates in ('1', 'true', 'yes'):
            queryset = queryset.filter(duplicate_of__isnull=False)

        return queryset

    def _create_activity(self, lead, action, *, from_stage='', to_stage='', details=''):
        actor = self.request.user if self.request.user.is_authenticated else None
        LeadActivity.objects.create(
            lead=lead,
            actor=actor,
            action=action,
            from_stage=from_stage,
            to_stage=to_stage,
            details=details,
        )

    def _extract_level_test_result(self, lead):
        if lead.source != 'advanced_level_test':
            return None

        raw_notes = lead.notes or ''
        score = None
        band = ''
        for fragment in raw_notes.split('|'):
            item = fragment.strip()
            if item.startswith('test_score:'):
                value = item.split(':', 1)[1].strip()
                try:
                    score = int(value.split('/')[0])
                except (ValueError, IndexError):
                    score = None
            if item.startswith('test_band:'):
                band = item.split(':', 1)[1].strip()

        if score is None:
            return None

        if score <= 3:
            band = band or 'A0-A1'
            return {'score': score, 'band': band}
        if score <= 6:
            band = band or 'A2'
            return {'score': score, 'band': band}
        if score <= 9:
            band = band or 'B1'
            return {'score': score, 'band': band}
        if score <= 12:
            band = band or 'B1 alto'
            return {'score': score, 'band': band}

        band = band or 'B2 (maximo del test)'
        return {'score': score, 'band': band}

    def _send_level_test_email(self, lead):
        parsed = self._extract_level_test_result(lead)
        if not parsed:
            return None

        try:
            result = send_level_test_results_email(
                lead=lead,
                score=parsed['score'],
                band=parsed['band'],
            )
        except MailerLiteSyncError as exc:
            return f'level_test_email: {exc}'

        if result.get('status') != 'sent':
            return f"level_test_email: {result.get('reason', 'skipped')}"
        return None

    def perform_create(self, serializer):
        ip = self.request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip() or self.request.META.get('REMOTE_ADDR')
        user_agent = self.request.META.get('HTTP_USER_AGENT', '')[:255]
        lead = serializer.save(ip_address=ip or None, user_agent=user_agent)
        lead.refresh_duplicate_status()
        lead.save(update_fields=['duplicate_of', 'duplicate_confidence', 'updated_at'])
        self._create_activity(lead, 'created', details='Lead created from public form')
        if lead.duplicate_of_id:
            self._create_activity(
                lead,
                'duplicate_detected',
                details=f'Potential duplicate of lead #{lead.duplicate_of_id} ({lead.duplicate_confidence})',
            )
        warnings = []

        level_test_email_warning = self._send_level_test_email(lead)
        if level_test_email_warning:
            warnings.append(level_test_email_warning)

        if not getattr(settings, 'LEAD_EXTERNAL_INTEGRATIONS_ENABLED', False):
            lead.mailerlite_sync_error = ' | '.join(warnings) if warnings else ''
            lead.save(update_fields=['mailerlite_sync_error', 'updated_at'])
            return lead, warnings

        sync_result = sync_lead_to_mailerlite(lead)
        if sync_result['status'] == 'synced':
            lead.mailerlite_contact_id = sync_result.get('contact_id', '')
            lead.mailerlite_synced_at = timezone.now()
            lead.mailerlite_sync_error = ''
        else:
            reason = sync_result.get('reason', 'MailerLite sync skipped')
            lead.mailerlite_sync_error = reason
            warnings.append(reason)

        try:
            notification_result = send_new_lead_notification(lead)
            if notification_result.get('status') != 'sent':
                reason = notification_result.get('reason', 'Lead notification skipped')
                warnings.append(reason)
                existing = lead.mailerlite_sync_error.strip()
                lead.mailerlite_sync_error = f'{existing} | notify: {reason}' if existing else f'notify: {reason}'
        except MailerLiteSyncError as exc:
            warning = f'notify: {exc}'
            warnings.append(warning)
            existing = lead.mailerlite_sync_error.strip()
            lead.mailerlite_sync_error = f'{existing} | {warning}' if existing else warning

        lead.save(update_fields=['mailerlite_contact_id', 'mailerlite_synced_at', 'mailerlite_sync_error', 'updated_at'])
        return lead, warnings

    def perform_update(self, serializer):
        lead = self.get_object()
        previous_stage = lead.stage
        previous_follow_up = lead.follow_up_at
        previous_notes = lead.notes

        updated_lead = serializer.save()
        updated_lead.refresh_duplicate_status()
        updated_lead.save(update_fields=['duplicate_of', 'duplicate_confidence', 'updated_at'])

        if previous_stage != updated_lead.stage:
            self._create_activity(
                updated_lead,
                'stage_changed',
                from_stage=previous_stage,
                to_stage=updated_lead.stage,
                details='Stage updated from dashboard',
            )

        if previous_follow_up != updated_lead.follow_up_at:
            detail = 'Follow-up removed' if not updated_lead.follow_up_at else f'Follow-up set to {updated_lead.follow_up_at.isoformat()}'
            self._create_activity(updated_lead, 'follow_up_updated', details=detail)

        if previous_notes != updated_lead.notes:
            self._create_activity(updated_lead, 'notes_updated', details='Lead notes updated')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lead = None
        warnings = []
        try:
            lead, warnings = self.perform_create(serializer)
            lead = Lead.objects.get(pk=serializer.instance.pk)
            response = self.get_serializer(lead).data
            if warnings:
                response['warning'] = ' | '.join(warnings)
            headers = self.get_success_headers(response)
            return Response(response, status=status.HTTP_201_CREATED, headers=headers)
        except MailerLiteSyncError as exc:
            if serializer.instance is not None:
                lead = serializer.instance
                lead.mailerlite_sync_error = str(exc)
                lead.save(update_fields=['mailerlite_sync_error', 'updated_at'])
            response = self.get_serializer(lead or serializer.instance).data if (lead or serializer.instance) else {}
            response['warning'] = str(exc)
            headers = self.get_success_headers(response)
            return Response(response, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'])
    def metrics(self, request):
        queryset = self.get_queryset()
        total = queryset.count()
        by_stage = list(queryset.values('stage').annotate(count=Count('id')).order_by('stage'))
        by_source = list(queryset.values('source').annotate(count=Count('id')).order_by('source'))
        by_language = list(queryset.values('preferred_language').annotate(count=Count('id')).order_by('preferred_language'))

        booked_count = queryset.filter(stage='booked').count()
        won_count = queryset.filter(stage='won').count()
        duplicates_count = queryset.filter(duplicate_of__isnull=False).count()
        now = timezone.now()
        start_of_today = datetime.combine(now.date(), time.min, tzinfo=now.tzinfo)
        end_of_today = datetime.combine(now.date(), time.max, tzinfo=now.tzinfo)
        follow_up_due_today = queryset.filter(follow_up_at__range=(start_of_today, end_of_today)).count()
        follow_up_overdue = queryset.filter(follow_up_at__lt=now).count()
        conversion_to_booked = (booked_count / total * 100) if total else 0
        conversion_to_won = (won_count / total * 100) if total else 0

        return Response({
            'total_leads': total,
            'by_stage': by_stage,
            'by_source': by_source,
            'by_language': by_language,
            'duplicates_count': duplicates_count,
            'follow_up_due_today': follow_up_due_today,
            'follow_up_overdue': follow_up_overdue,
            'conversion_to_booked_pct': round(conversion_to_booked, 2),
            'conversion_to_won_pct': round(conversion_to_won, 2),
        })

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        queryset = self.get_queryset().order_by('-created_at')
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="leads_export.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'id',
            'full_name',
            'email',
            'phone',
            'preferred_language',
            'source',
            'stage',
            'follow_up_at',
            'duplicate_of_id',
            'duplicate_confidence',
            'created_at',
            'updated_at',
        ])

        for lead in queryset:
            writer.writerow([
                lead.id,
                lead.full_name,
                lead.email,
                lead.phone,
                lead.preferred_language,
                lead.source,
                lead.stage,
                lead.follow_up_at.isoformat() if lead.follow_up_at else '',
                lead.duplicate_of_id or '',
                lead.duplicate_confidence,
                lead.created_at.isoformat(),
                lead.updated_at.isoformat(),
            ])

        return response


class AdminStudentListView(APIView):
    permission_classes = [permissions.IsAdminUser]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get(self, request):
        queryset = UserProfile.objects.select_related('user').filter(user__is_staff=False)

        search = (request.query_params.get('q') or '').strip()
        level = (request.query_params.get('level') or '').strip()
        active = (request.query_params.get('active') or '').strip().lower()

        if level:
            queryset = queryset.filter(language_level=level)

        if active in ('true', 'false'):
            queryset = queryset.filter(user__is_active=(active == 'true'))

        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search)
                | Q(user__email__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
            )

        users = (
            queryset
            .values_list('user_id', flat=True)
        )

        user_queryset = (
            User.objects
            .filter(id__in=users)
            .select_related('userprofile')
            .annotate(
                booking_count=Count('bookings', distinct=True),
                upcoming_bookings=Count(
                    'bookings',
                    filter=Q(bookings__date__gte=timezone.localdate()),
                    distinct=True,
                ),
            )
            .order_by('-date_joined')
        )

        serializer = AdminStudentSerializer(user_queryset, many=True)
        return Response(serializer.data)


class AdminStudentDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def _get_user(self, user_id):
        return User.objects.filter(id=user_id, is_staff=False).select_related('userprofile').first()

    def patch(self, request, user_id):
        user = self._get_user(user_id)
        if user is None:
            return Response({'detail': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'language_level': 'A1'})
        payload = request.data or {}

        if 'email' in payload:
            email = (payload.get('email') or '').strip()
            if not email:
                return Response({'detail': 'Email cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)
            email_exists = User.objects.filter(email=email).exclude(id=user.id).exists()
            if email_exists:
                return Response({'detail': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email

        if 'first_name' in payload:
            user.first_name = (payload.get('first_name') or '').strip()

        if 'last_name' in payload:
            user.last_name = (payload.get('last_name') or '').strip()

        if 'is_active' in payload:
            user.is_active = bool(payload.get('is_active'))

        if 'language_level' in payload:
            level = (payload.get('language_level') or '').strip()
            valid_levels = {choice[0] for choice in UserProfile._meta.get_field('language_level').choices}
            if level not in valid_levels:
                return Response({'detail': 'Invalid language level.'}, status=status.HTTP_400_BAD_REQUEST)
            profile.language_level = level

        if 'bio' in payload:
            profile.bio = payload.get('bio') or ''

        if 'learning_reason' in payload:
            profile.learning_reason = payload.get('learning_reason') or ''

        if 'birth_date' in payload:
            profile.birth_date = payload.get('birth_date') or None

        if 'private_notes' in payload:
            profile.private_notes = payload.get('private_notes') or ''

        user.save()
        profile.save()

        annotated_user = (
            User.objects
            .filter(id=user.id)
            .select_related('userprofile')
            .annotate(
                booking_count=Count('bookings', distinct=True),
                upcoming_bookings=Count(
                    'bookings',
                    filter=Q(bookings__date__gte=timezone.localdate()),
                    distinct=True,
                ),
            )
            .first()
        )

        serializer = AdminStudentSerializer(annotated_user)
        return Response(serializer.data)


class AdminGoogleCalendarEventsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get(self, request):
        start_date_raw = (request.query_params.get('start_date') or '').strip()
        end_date_raw = (request.query_params.get('end_date') or '').strip()
        teacher_tz = ZoneInfo(getattr(settings, 'BOOKING_TEACHER_TIMEZONE', 'Europe/Madrid'))

        try:
            start_date = datetime.fromisoformat(start_date_raw).date() if start_date_raw else timezone.localdate()
        except Exception:
            start_date = timezone.localdate()
        try:
            end_date = datetime.fromisoformat(end_date_raw).date() if end_date_raw else (start_date + timedelta(days=30))
        except Exception:
            end_date = start_date + timedelta(days=30)

        if end_date < start_date:
            start_date, end_date = end_date, start_date

        local_start = datetime.combine(start_date, time.min, tzinfo=teacher_tz)
        local_end = datetime.combine(end_date + timedelta(days=1), time.min, tzinfo=teacher_tz)
        start_utc = local_start.astimezone(dt_timezone.utc)
        end_utc = local_end.astimezone(dt_timezone.utc)

        events = list_calendar_events(start_utc=start_utc, end_utc=end_utc)
        payload = []
        for event in events:
            start_local = event['start_time_utc'].astimezone(teacher_tz)
            end_local = event['end_time_utc'].astimezone(teacher_tz)
            payload.append({
                'id': event.get('id', ''),
                'summary': event.get('summary', ''),
                'description': event.get('description', ''),
                'start_time_utc': event['start_time_utc'].isoformat(),
                'end_time_utc': event['end_time_utc'].isoformat(),
                'start_local_iso': start_local.isoformat(),
                'end_local_iso': end_local.isoformat(),
                'start_date_local': start_local.date().isoformat(),
                'end_date_local': end_local.date().isoformat(),
                'start_time_local': start_local.strftime('%H:%M:%S'),
                'end_time_local': end_local.strftime('%H:%M:%S'),
                'html_link': event.get('html_link', ''),
                'is_habluj_block': bool(event.get('is_habluj_block')),
                'habluj_block_id': event.get('habluj_block_id', ''),
            })

        return Response(payload)
