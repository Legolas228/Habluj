from rest_framework import serializers
from datetime import datetime, timedelta, timezone as dt_timezone
from decimal import Decimal, ROUND_HALF_UP
from django.conf import settings
from django.db import transaction
from django.db.models import Q, Sum
from django.contrib.auth.models import User
from django.utils import timezone
from zoneinfo import ZoneInfo
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
from .google_calendar import create_google_meet_event, get_busy_windows

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class AdminStudentSerializer(serializers.ModelSerializer):
    language_level = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    learning_reason = serializers.SerializerMethodField()
    birth_date = serializers.SerializerMethodField()
    private_notes = serializers.SerializerMethodField()
    booking_count = serializers.IntegerField(read_only=True)
    upcoming_bookings = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'date_joined',
            'last_login',
            'language_level',
            'bio',
            'learning_reason',
            'birth_date',
            'private_notes',
            'booking_count',
            'upcoming_bookings',
        )

    def get_language_level(self, obj):
        profile = getattr(obj, 'userprofile', None)
        return getattr(profile, 'language_level', '')

    def get_bio(self, obj):
        profile = getattr(obj, 'userprofile', None)
        return getattr(profile, 'bio', '')

    def get_learning_reason(self, obj):
        profile = getattr(obj, 'userprofile', None)
        return getattr(profile, 'learning_reason', '')

    def get_birth_date(self, obj):
        profile = getattr(obj, 'userprofile', None)
        value = getattr(profile, 'birth_date', None)
        return value.isoformat() if value else None

    def get_private_notes(self, obj):
        profile = getattr(obj, 'userprofile', None)
        return getattr(profile, 'private_notes', '')

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    language_level = serializers.CharField(required=True)
    learning_reason = serializers.CharField(write_only=True, required=True, allow_blank=False)
    birth_date = serializers.DateField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'password',
            'password_confirm',
            'language_level',
            'first_name',
            'last_name',
            'learning_reason',
            'birth_date',
        )

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists.')
        return value

    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        language_level = validated_data.pop('language_level')
        learning_reason = validated_data.pop('learning_reason', '')
        birth_date = validated_data.pop('birth_date', None)
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(
            user=user,
            language_level=language_level,
            learning_reason=learning_reason,
            birth_date=birth_date,
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ('id', 'user', 'language_level', 'bio', 'created_at', 'updated_at')

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            'id',
            'amount',
            'currency',
            'status',
            'gopay_payment_id',
            'gopay_checkout_url',
            'completed_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


def teacher_tz():
    return ZoneInfo(getattr(settings, 'BOOKING_TEACHER_TIMEZONE', 'Europe/Madrid'))


def class_duration_minutes():
    return int(getattr(settings, 'BOOKING_CLASS_MINUTES', 60))


def lead_time_hours():
    return int(getattr(settings, 'BOOKING_LEAD_TIME_HOURS', 12))


def default_buffer_minutes():
    return int(getattr(settings, 'BOOKING_DEFAULT_BUFFER_MINUTES', 10))


def to_utc_slot(date_value, time_value, source_timezone):
    naive = datetime.combine(date_value, time_value)
    aware = timezone.make_aware(naive, source_timezone)
    start_utc = aware.astimezone(dt_timezone.utc)
    end_utc = start_utc + timedelta(minutes=class_duration_minutes())
    return start_utc, end_utc


def to_utc_slot_with_duration(date_value, time_value, source_timezone, duration_minutes):
    naive = datetime.combine(date_value, time_value)
    aware = timezone.make_aware(naive, source_timezone)
    start_utc = aware.astimezone(dt_timezone.utc)
    end_utc = start_utc + timedelta(minutes=max(15, int(duration_minutes or class_duration_minutes())))
    return start_utc, end_utc


def slot_has_weekly_availability(start_utc, end_utc):
    local_start = start_utc.astimezone(teacher_tz())
    weekday = local_start.weekday()
    local_time = local_start.time().replace(second=0, microsecond=0)

    has_range = Availability.objects.filter(
        weekday=weekday,
        start_time__lte=local_time,
        end_time__gt=local_time,
        is_active=True,
    ).exists()
    if has_range:
        return True

    # Backward compatibility with legacy weekly slot table.
    return WeeklyAvailabilitySlot.objects.filter(
        weekday=weekday,
        time=local_time,
        is_active=True,
    ).exists()


def slot_is_blocked(start_utc):
    local_start = start_utc.astimezone(teacher_tz())
    return BookingSlotBlock.objects.filter(
        date=local_start.date(),
        time=local_start.time().replace(second=0, microsecond=0),
        is_active=True,
    ).exists()


def slot_has_booking_conflict(start_utc, end_utc, exclude_booking_id=None, lock_rows=False):
    buffer_delta = timedelta(minutes=default_buffer_minutes())
    window_start = start_utc - buffer_delta
    window_end = end_utc + buffer_delta
    queryset = Booking.objects.filter(
        status__in=['pending', 'confirmed'],
        start_time_utc__lt=window_end,
        end_time_utc__gt=window_start,
    )
    if exclude_booking_id:
        queryset = queryset.exclude(id=exclude_booking_id)
    if lock_rows:
        queryset = queryset.select_for_update()
    return queryset.exists()


def slot_has_google_busy_conflict(start_utc, end_utc):
    try:
        busy_windows = get_busy_windows(
            time_min_utc=start_utc - timedelta(minutes=default_buffer_minutes()),
            time_max_utc=end_utc + timedelta(minutes=default_buffer_minutes()),
        )
    except Exception:
        return False

    target_start = start_utc - timedelta(minutes=default_buffer_minutes())
    target_end = end_utc + timedelta(minutes=default_buffer_minutes())
    for busy_start, busy_end in busy_windows:
        if busy_start < target_end and target_start < busy_end:
            return True
    return False


class WeeklyAvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyAvailabilitySlot
        fields = (
            'id',
            'weekday',
            'time',
            'is_active',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = (
            'id',
            'weekday',
            'start_time',
            'end_time',
            'buffer_minutes',
            'is_active',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate(self, attrs):
        start = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end = attrs.get('end_time', getattr(self.instance, 'end_time', None))
        if start and end and start >= end:
            raise serializers.ValidationError({'end_time': 'end_time must be after start_time.'})
        return attrs


class BookingSlotBlockSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = BookingSlotBlock
        fields = (
            'id',
            'date',
            'time',
            'reason',
            'is_active',
            'created_by',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)

class BookingSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    lesson = LessonSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)
    payment_status = serializers.SerializerMethodField()
    has_admin_private_notes = serializers.SerializerMethodField()
    duration_minutes = serializers.IntegerField(write_only=True, required=False, min_value=15, max_value=240)
    effective_duration_minutes = serializers.SerializerMethodField()
    lesson_id = serializers.PrimaryKeyRelatedField(
        queryset=Lesson.objects.all(),
        write_only=True
    )
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_staff=False),
        write_only=True,
        required=False,
        allow_null=True,
    )
    start_time_utc = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Booking
        fields = (
            'id',
            'student',
            'lesson',
            'lesson_id',
            'student_id',
            'payment',
            'payment_status',
            'duration_minutes',
            'effective_duration_minutes',
            'start_time_utc',
            'end_time_utc',
            'date',
            'time',
            'student_timezone',
            'currency',
            'status',
            'google_meet_link',
            'reschedule_count',
            'notes',
            'admin_private_notes',
            'has_admin_private_notes',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'student',
            'lesson',
            'payment',
            'payment_status',
            'end_time_utc',
            'has_admin_private_notes',
            'google_meet_link',
            'reschedule_count',
            'created_at',
            'updated_at',
        )

    def get_payment_status(self, obj):
        payment = getattr(obj, 'payment', None)
        return payment.status if payment else None

    def get_has_admin_private_notes(self, obj):
        return bool((obj.admin_private_notes or '').strip())

    def get_effective_duration_minutes(self, obj):
        if obj.start_time_utc and obj.end_time_utc:
            delta_minutes = int((obj.end_time_utc - obj.start_time_utc).total_seconds() // 60)
            if delta_minutes > 0:
                return delta_minutes
        return int(getattr(obj.lesson, 'duration', class_duration_minutes()) or class_duration_minutes())

    def validate(self, attrs):
        attrs = super().validate(attrs)
        request = self.context.get('request')
        is_admin = bool(request and request.user and request.user.is_staff)
        lesson = attrs.get('lesson_id', getattr(self.instance, 'lesson', None))
        duration_input = attrs.get('duration_minutes', None)
        if duration_input is not None and duration_input % 15 != 0:
            raise serializers.ValidationError({'duration_minutes': 'duration_minutes must be in 15-minute increments.'})
        duration_minutes = class_duration_minutes()
        if is_admin and duration_input is not None:
            duration_minutes = int(duration_input)
        elif is_admin and lesson is not None:
            duration_minutes = int(getattr(lesson, 'duration', class_duration_minutes()) or class_duration_minutes())

        if request and not is_admin and 'admin_private_notes' in attrs:
            raise serializers.ValidationError({'admin_private_notes': 'Only admin can update private booking notes.'})

        if request and not is_admin and attrs.get('student_id') is not None:
            raise serializers.ValidationError({'student_id': 'Students cannot set student_id.'})

        if request and is_admin and self.instance is None and attrs.get('student_id') is None:
            raise serializers.ValidationError({'student_id': 'student_id is required for admin booking creation.'})

        date = attrs.get('date', getattr(self.instance, 'date', None))
        slot = attrs.get('time', getattr(self.instance, 'time', None))
        start_time_utc = attrs.get('start_time_utc', getattr(self.instance, 'start_time_utc', None))
        student_timezone = attrs.get('student_timezone', getattr(self.instance, 'student_timezone', 'UTC') or 'UTC')

        if start_time_utc is None and date and slot:
            source_timezone = teacher_tz()
            if request and not is_admin and student_timezone:
                try:
                    source_timezone = ZoneInfo(student_timezone)
                except Exception:
                    source_timezone = teacher_tz()
            start_time_utc, end_time_utc = to_utc_slot_with_duration(date, slot, source_timezone, duration_minutes)
            attrs['start_time_utc'] = start_time_utc
            attrs['end_time_utc'] = end_time_utc
        elif start_time_utc is not None:
            if timezone.is_naive(start_time_utc):
                start_time_utc = timezone.make_aware(start_time_utc, dt_timezone.utc)
            attrs['start_time_utc'] = start_time_utc.astimezone(dt_timezone.utc)
            attrs['end_time_utc'] = attrs['start_time_utc'] + timedelta(minutes=duration_minutes)
            local_teacher = attrs['start_time_utc'].astimezone(teacher_tz())
            attrs['date'] = local_teacher.date()
            attrs['time'] = local_teacher.time().replace(second=0, microsecond=0)

        computed_start = attrs.get('start_time_utc', getattr(self.instance, 'start_time_utc', None))
        computed_end = attrs.get('end_time_utc', getattr(self.instance, 'end_time_utc', None))
        slot_changed = self.instance is None or any(field in attrs for field in ('date', 'time', 'start_time_utc'))

        if computed_start and computed_end and not is_admin:
            min_start = timezone.now() + timedelta(hours=lead_time_hours())
            if computed_start < min_start:
                raise serializers.ValidationError({'start_time_utc': 'Booking requires at least 12h lead time.'})

        if computed_start and computed_end and slot_changed and not is_admin:
            if not slot_has_weekly_availability(computed_start, computed_end):
                raise serializers.ValidationError({'time': 'This slot is outside teacher availability.'})

            if slot_is_blocked(computed_start):
                raise serializers.ValidationError({'time': 'This slot is blocked by the teacher.'})

            if slot_has_booking_conflict(computed_start, computed_end, exclude_booking_id=getattr(self.instance, 'id', None)):
                raise serializers.ValidationError({'non_field_errors': ['This slot is no longer available.']})

            if slot_has_google_busy_conflict(computed_start, computed_end):
                raise serializers.ValidationError({'non_field_errors': ['Teacher has external calendar conflict for this slot.']})

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if not request or not request.user.is_staff:
            data.pop('admin_private_notes', None)
            data.pop('has_admin_private_notes', None)
        return data

    def _amount_for_currency(self, lesson, currency):
        base_amount = Decimal(str(lesson.price))
        if currency == 'CZK':
            rate = Decimal(str(getattr(settings, 'BOOKING_EUR_TO_CZK_RATE', '25')))
            return (base_amount * rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return base_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    def create(self, validated_data):
        lesson = validated_data.pop('lesson_id')
        selected_student = validated_data.pop('student_id', None)
        duration_input = validated_data.pop('duration_minutes', None)
        request_user = self.context['request'].user
        student = selected_student if request_user.is_staff and selected_student is not None else request_user
        booking_date = validated_data.get('date')
        booking_time = validated_data.get('time')
        start_time_utc = validated_data.get('start_time_utc')
        end_time_utc = validated_data.get('end_time_utc')
        requested_currency = (validated_data.pop('currency', None) or 'EUR').upper()
        allowed_currencies = {choice[0] for choice in Booking.CURRENCY_CHOICES}
        if requested_currency not in allowed_currencies:
            requested_currency = 'EUR'

        duration_minutes = class_duration_minutes()
        if request_user.is_staff:
            if duration_input is not None:
                duration_minutes = int(duration_input)
            else:
                duration_minutes = int(getattr(lesson, 'duration', class_duration_minutes()) or class_duration_minutes())

        if start_time_utc is None and booking_date and booking_time:
            start_time_utc, end_time_utc = to_utc_slot_with_duration(booking_date, booking_time, teacher_tz(), duration_minutes)
            validated_data['start_time_utc'] = start_time_utc
            validated_data['end_time_utc'] = end_time_utc

        with transaction.atomic():
            if not request_user.is_staff and slot_has_booking_conflict(start_time_utc, end_time_utc, lock_rows=True):
                raise serializers.ValidationError({'non_field_errors': ['This slot is no longer available.']})

            status_value = validated_data.pop('status', 'confirmed')
            meet_link = ''
            event_id = ''

            if not request_user.is_staff:
                # Student bookings no longer require credits up front.
                # They must complete payment afterwards (tokens or bank transfer).
                status_value = 'pending'

            booking = Booking.objects.create(
                student=student,
                lesson=lesson,
                currency=requested_currency,
                status=status_value or 'confirmed',
                google_meet_link=meet_link,
                google_event_id=event_id,
                **validated_data
            )
            if not request_user.is_staff:
                Payment.objects.create(
                    booking=booking,
                    amount=self._amount_for_currency(lesson, requested_currency),
                    currency=requested_currency,
                    status='pending_user',
                    metadata={'payment_method': 'pending_selection'},
                )

        return booking

    def update(self, instance, validated_data):
        lesson = validated_data.pop('lesson_id', None)
        selected_student = validated_data.pop('student_id', None)
        duration_input = validated_data.pop('duration_minutes', None)
        if lesson is not None:
            instance.lesson = lesson
        if selected_student is not None and self.context['request'].user.is_staff:
            instance.student = selected_student

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if instance.start_time_utc and (duration_input is not None or not instance.end_time_utc):
            duration_minutes = class_duration_minutes()
            if self.context['request'].user.is_staff:
                if duration_input is not None:
                    duration_minutes = int(duration_input)
                else:
                    duration_minutes = int(getattr(instance.lesson, 'duration', class_duration_minutes()) or class_duration_minutes())
            instance.end_time_utc = instance.start_time_utc + timedelta(minutes=duration_minutes)

        # Ensure confirmed bookings have a Meet link available.
        if (
            instance.status == 'confirmed'
            and not instance.google_meet_link
            and instance.start_time_utc
            and instance.end_time_utc
            and instance.student.email
        ):
            try:
                meet_link, event_id = create_google_meet_event(
                    start_utc=instance.start_time_utc,
                    end_utc=instance.end_time_utc,
                    attendee_email=instance.student.email,
                    summary=f'Clase 1:1 - {instance.lesson.title}',
                )
                instance.google_meet_link = meet_link
                instance.google_event_id = event_id
            except Exception:
                # Do not block admin/student updates if Meet generation fails.
                pass

        instance.save()
        return instance

class ProgressSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    lesson = LessonSerializer(read_only=True)
    lesson_id = serializers.PrimaryKeyRelatedField(
        queryset=Lesson.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_staff=False),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Progress
        fields = (
            'id',
            'student',
            'student_id',
            'lesson',
            'lesson_id',
            'completed',
            'score',
            'speaking_score',
            'listening_score',
            'reading_score',
            'writing_score',
            'grammar_score',
            'vocabulary_score',
            'notes',
            'completed_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'student', 'lesson', 'created_at', 'updated_at')

    def validate(self, attrs):
        request = self.context.get('request')
        if request is None:
            return attrs

        if not request.user.is_staff and attrs.get('student_id') is not None:
            raise serializers.ValidationError({'student_id': 'Students cannot set student_id.'})

        if request.user.is_staff and self.instance is None and attrs.get('student_id') is None:
            raise serializers.ValidationError({'student_id': 'student_id is required for admin progress creation.'})

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data.pop('lesson_id', None)
        selected_student = validated_data.pop('student_id', None)

        if request and request.user and request.user.is_authenticated:
            student = selected_student if request.user.is_staff else request.user
        else:
            student = selected_student

        completed = bool(validated_data.get('completed'))
        if completed and not validated_data.get('completed_at'):
            validated_data['completed_at'] = timezone.now()

        existing = Progress.objects.filter(student=student).order_by('-updated_at').first()
        if existing:
            existing.lesson = None
            if 'completed' in validated_data:
                if completed and not existing.completed_at:
                    existing.completed_at = timezone.now()
                if not completed:
                    existing.completed_at = None

            for attr, value in validated_data.items():
                setattr(existing, attr, value)

            existing.save()
            return existing

        return Progress.objects.create(student=student, lesson=None, **validated_data)

    def update(self, instance, validated_data):
        lesson = validated_data.pop('lesson_id', None)
        selected_student = validated_data.pop('student_id', None)

        if lesson is not None:
            instance.lesson = lesson

        if selected_student is not None:
            instance.student = selected_student

        if 'completed' in validated_data:
            completed = bool(validated_data['completed'])
            if completed and not instance.completed_at:
                instance.completed_at = timezone.now()
            if not completed:
                instance.completed_at = None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class StudentGoalSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_staff=False),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = StudentGoal
        fields = (
            'id',
            'student',
            'created_by',
            'student_id',
            'title',
            'description',
            'due_date',
            'is_completed',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'student', 'created_by', 'created_at', 'updated_at')

    def validate(self, attrs):
        request = self.context.get('request')
        if request is None:
            return attrs

        title = (attrs.get('title', getattr(self.instance, 'title', '')) or '').strip()
        if len(title) < 3:
            raise serializers.ValidationError({'title': 'Title must have at least 3 characters.'})

        if not request.user.is_staff and attrs.get('student_id') is not None:
            raise serializers.ValidationError({'student_id': 'Students cannot set student_id.'})

        if request.user.is_staff and self.instance is None and attrs.get('student_id') is None:
            raise serializers.ValidationError({'student_id': 'student_id is required for admin goal creation.'})

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        selected_student = validated_data.pop('student_id', None)

        if request and request.user and request.user.is_authenticated:
            student = selected_student if request.user.is_staff else request.user
            creator = request.user
        else:
            student = selected_student
            creator = None

        return StudentGoal.objects.create(student=student, created_by=creator, **validated_data)

    def update(self, instance, validated_data):
        selected_student = validated_data.pop('student_id', None)
        if selected_student is not None:
            instance.student = selected_student

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class StudentMessageSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    sender = UserSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_staff=False),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = StudentMessage
        fields = (
            'id',
            'student',
            'sender',
            'student_id',
            'subject',
            'body',
            'is_read',
            'created_at',
        )
        read_only_fields = ('id', 'student', 'sender', 'created_at')
        extra_kwargs = {
            'subject': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        request = self.context.get('request')
        if request is None:
            return attrs

        if not request.user.is_staff:
            if self.instance is None:
                disallowed = set(attrs.keys()) - {'subject', 'body'}
                if disallowed:
                    raise serializers.ValidationError('Students can only send subject and body.')

                body = (attrs.get('body') or '').strip()
                return attrs

            disallowed = set(attrs.keys()) - {'is_read'}
            if disallowed:
                raise serializers.ValidationError('Students can only update read status.')
            return attrs

        if self.instance is None and attrs.get('student_id') is None:
            raise serializers.ValidationError({'student_id': 'student_id is required for admin message creation.'})

        subject = (attrs.get('subject', getattr(self.instance, 'subject', 'Chat')) or '').strip()
        body = (attrs.get('body', getattr(self.instance, 'body', '')) or '').strip()

        if subject and len(subject) < 3:
            raise serializers.ValidationError({'subject': 'Subject must have at least 3 characters.'})

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        selected_student = validated_data.pop('student_id', None)
        if request and request.user and request.user.is_authenticated and not request.user.is_staff:
            selected_student = request.user
        validated_data['subject'] = (validated_data.get('subject') or '').strip() or 'Chat'
        sender = request.user if request and request.user and request.user.is_authenticated else None
        return StudentMessage.objects.create(student=selected_student, sender=sender, **validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and not request.user.is_staff:
            instance.is_read = validated_data.get('is_read', instance.is_read)
            instance.save(update_fields=['is_read'])
            return instance

        selected_student = validated_data.pop('student_id', None)
        if selected_student is not None:
            instance.student = selected_student

        if 'subject' in validated_data:
            validated_data['subject'] = (validated_data.get('subject') or '').strip() or 'Chat'

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class StudentMaterialSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    can_delete = serializers.SerializerMethodField()
    booking = BookingSerializer(read_only=True)
    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_staff=False),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = StudentMaterial
        fields = (
            'id',
            'student',
            'created_by',
            'can_delete',
            'student_id',
            'booking',
            'booking_id',
            'title',
            'description',
            'resource_type',
            'uploaded_file',
            'external_url',
            'is_active',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'student', 'created_by', 'can_delete', 'booking', 'created_at', 'updated_at')

    def get_can_delete(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return bool(obj.created_by_id and obj.created_by_id == request.user.id)

    def validate(self, attrs):
        existing = self.instance

        title = attrs.get('title', getattr(existing, 'title', ''))
        description = attrs.get('description', getattr(existing, 'description', ''))
        title = (title or '').strip()
        description = (description or '').strip()

        external_url = attrs.get('external_url', getattr(existing, 'external_url', ''))
        external_url = (external_url or '').strip()

        uploaded_file = attrs.get('uploaded_file', getattr(existing, 'uploaded_file', None))

        if len(title) < 3:
            raise serializers.ValidationError({'title': 'Title must have at least 3 characters.'})

        if len(description) < 10:
            raise serializers.ValidationError({'description': 'Description must have at least 10 characters.'})

        if not external_url and not uploaded_file:
            raise serializers.ValidationError('Provide at least one URL or upload a file.')

        request = self.context.get('request')
        if request is None:
            return attrs

        is_staff = bool(request.user and request.user.is_staff)
        selected_student = attrs.get('student_id') if is_staff else request.user
        if is_staff and existing is not None and selected_student is None:
            selected_student = existing.student

        if is_staff and existing is None and selected_student is None:
            raise serializers.ValidationError({'student_id': 'student_id is required for admin material creation.'})

        if not is_staff and attrs.get('student_id') is not None:
            raise serializers.ValidationError({'student_id': 'Students cannot set student_id.'})

        booking = attrs.get('booking_id')
        if booking is not None and booking.student_id != selected_student.id:
            raise serializers.ValidationError({'booking_id': 'Booking does not belong to selected student.'})

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        booking = validated_data.pop('booking_id', None)
        selected_student = validated_data.pop('student_id', None)

        if request and request.user and request.user.is_authenticated:
            if request.user.is_staff:
                student = selected_student
            else:
                student = request.user
        else:
            student = selected_student

        return StudentMaterial.objects.create(
            student=student,
            created_by=request.user if request and request.user and request.user.is_authenticated else None,
            booking=booking,
            **validated_data,
        )

    def update(self, instance, validated_data):
        booking = validated_data.pop('booking_id', None)
        selected_student = validated_data.pop('student_id', None)

        if booking is not None:
            instance.booking = booking

        if selected_student is not None:
            instance.student = selected_student

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class LeadActivitySerializer(serializers.ModelSerializer):
    actor_username = serializers.SerializerMethodField()

    class Meta:
        model = LeadActivity
        fields = (
            'id',
            'action',
            'from_stage',
            'to_stage',
            'details',
            'actor_username',
            'created_at',
        )

    def get_actor_username(self, obj):
        return obj.actor.username if obj.actor else ''


class LeadSerializer(serializers.ModelSerializer):
    duplicate_of_email = serializers.SerializerMethodField()
    activities = serializers.SerializerMethodField()

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request')
        # Public create must only set lead form fields.
        if request and request.method == 'POST':
            fields['stage'].read_only = True
            fields['follow_up_at'].read_only = True
            fields['last_contacted_at'].read_only = True
            fields['duplicate_of'].read_only = True
            fields['duplicate_confidence'].read_only = True
        return fields

    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = (
            'id',
            'mailerlite_contact_id',
            'mailerlite_synced_at',
            'mailerlite_sync_error',
            'created_at',
            'updated_at',
        )

    def get_duplicate_of_email(self, obj):
        return obj.duplicate_of.email if obj.duplicate_of else ''

    def get_activities(self, obj):
        include = self.context.get('include_activities', False)
        if not include:
            return []
        return LeadActivitySerializer(obj.activities.all()[:20], many=True).data

    def validate(self, attrs):
        # Consent is mandatory at creation time.
        if self.instance is None and not attrs.get('consent_privacy'):
            raise serializers.ValidationError({'consent_privacy': 'Privacy consent is required.'})

        # Prevent switching off privacy consent once captured.
        if self.instance is not None and attrs.get('consent_privacy') is False:
            raise serializers.ValidationError({'consent_privacy': 'Privacy consent is required.'})
        return attrs
