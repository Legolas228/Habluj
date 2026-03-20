import csv
from datetime import datetime, time

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.conf import settings
from django.utils import timezone
from django.db.models import Count, Q
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.authentication import BasicAuthentication, SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .brevo import BrevoSyncError, sync_lead_to_brevo, send_new_lead_notification
from .models import (
    UserProfile,
    Lesson,
    Booking,
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
    ProgressSerializer,
    StudentMaterialSerializer,
    StudentGoalSerializer,
    StudentMessageSerializer,
    LeadSerializer,
    UserRegisterSerializer,
    AdminStudentSerializer,
)


class StudentLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'student_login'

    def post(self, request):
        identifier = (request.data.get('identifier') or request.data.get('username') or '').strip()
        password = request.data.get('password') or ''

        if not identifier or not password:
            return Response({'detail': 'Identifier and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request=request, username=identifier, password=password)
        if not user or not user.is_active:
            return Response({'detail': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

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
        serializer = UserRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
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
    authentication_classes = [TokenAuthentication, SessionAuthentication, BasicAuthentication]

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication, BasicAuthentication]

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

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'pending' or booking.status == 'confirmed':
            booking.status = 'cancelled'
            booking.save()
            return Response({'status': 'booking cancelled'})
        return Response(
            {'error': 'Booking cannot be cancelled'},
            status=status.HTTP_400_BAD_REQUEST
        )

class ProgressViewSet(viewsets.ModelViewSet):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication, BasicAuthentication]
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
    authentication_classes = [TokenAuthentication, SessionAuthentication, BasicAuthentication]
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
    authentication_classes = [TokenAuthentication, SessionAuthentication, BasicAuthentication]
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
        if not request.user.is_staff:
            raise PermissionDenied('Only staff can send student messages.')
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied('Only staff can delete student messages.')
        return super().destroy(request, *args, **kwargs)


class StudentMaterialViewSet(viewsets.ModelViewSet):
    queryset = StudentMaterial.objects.all().select_related('booking', 'booking__lesson')
    serializer_class = StudentMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication, BasicAuthentication]
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
    authentication_classes = [TokenAuthentication, SessionAuthentication, BasicAuthentication]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.action in ('retrieve',):
            context['include_activities'] = True
        return context

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

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

        if not getattr(settings, 'LEAD_EXTERNAL_INTEGRATIONS_ENABLED', False):
            lead.brevo_sync_error = ''
            lead.save(update_fields=['brevo_sync_error', 'updated_at'])
            return lead, warnings

        sync_result = sync_lead_to_brevo(lead)
        if sync_result['status'] == 'synced':
            lead.brevo_contact_id = sync_result.get('contact_id', '')
            lead.brevo_synced_at = timezone.now()
            lead.brevo_sync_error = ''
        else:
            reason = sync_result.get('reason', 'Brevo sync skipped')
            lead.brevo_sync_error = reason
            warnings.append(reason)

        try:
            notification_result = send_new_lead_notification(lead)
            if notification_result.get('status') != 'sent':
                reason = notification_result.get('reason', 'Lead notification skipped')
                warnings.append(reason)
                existing = lead.brevo_sync_error.strip()
                lead.brevo_sync_error = f'{existing} | notify: {reason}' if existing else f'notify: {reason}'
        except BrevoSyncError as exc:
            warning = f'notify: {exc}'
            warnings.append(warning)
            existing = lead.brevo_sync_error.strip()
            lead.brevo_sync_error = f'{existing} | {warning}' if existing else warning

        lead.save(update_fields=['brevo_contact_id', 'brevo_synced_at', 'brevo_sync_error', 'updated_at'])
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
        except BrevoSyncError as exc:
            if serializer.instance is not None:
                lead = serializer.instance
                lead.brevo_sync_error = str(exc)
                lead.save(update_fields=['brevo_sync_error', 'updated_at'])
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
    authentication_classes = [TokenAuthentication, SessionAuthentication, BasicAuthentication]

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
    authentication_classes = [TokenAuthentication, SessionAuthentication, BasicAuthentication]

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
