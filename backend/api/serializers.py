from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
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

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class AdminStudentSerializer(serializers.ModelSerializer):
    language_level = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
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
            'booking_count',
            'upcoming_bookings',
        )

    def get_language_level(self, obj):
        profile = getattr(obj, 'userprofile', None)
        return getattr(profile, 'language_level', '')

    def get_bio(self, obj):
        profile = getattr(obj, 'userprofile', None)
        return getattr(profile, 'bio', '')

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    language_level = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'language_level', 'first_name', 'last_name')

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
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, language_level=language_level)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    lesson = LessonSerializer(read_only=True)
    lesson_id = serializers.PrimaryKeyRelatedField(
        queryset=Lesson.objects.all(),
        write_only=True
    )

    class Meta:
        model = Booking
        fields = '__all__'

    def create(self, validated_data):
        lesson = validated_data.pop('lesson_id')
        student = self.context['request'].user
        booking = Booking.objects.create(
            student=student,
            lesson=lesson,
            **validated_data
        )
        return booking

    def update(self, instance, validated_data):
        lesson = validated_data.pop('lesson_id', None)
        if lesson is not None:
            instance.lesson = lesson

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class ProgressSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    lesson = LessonSerializer(read_only=True)
    lesson_id = serializers.PrimaryKeyRelatedField(
        queryset=Lesson.objects.all(),
        write_only=True,
        required=True,
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
        lesson = validated_data.pop('lesson_id')
        selected_student = validated_data.pop('student_id', None)

        if request and request.user and request.user.is_authenticated:
            student = selected_student if request.user.is_staff else request.user
        else:
            student = selected_student

        completed = bool(validated_data.get('completed'))
        if completed and not validated_data.get('completed_at'):
            validated_data['completed_at'] = timezone.now()

        return Progress.objects.create(student=student, lesson=lesson, **validated_data)

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

    def validate(self, attrs):
        request = self.context.get('request')
        if request is None:
            return attrs

        if not request.user.is_staff:
            disallowed = set(attrs.keys()) - {'is_read'}
            if disallowed:
                raise serializers.ValidationError('Students can only update read status.')
            return attrs

        if self.instance is None and attrs.get('student_id') is None:
            raise serializers.ValidationError({'student_id': 'student_id is required for admin message creation.'})

        subject = (attrs.get('subject', getattr(self.instance, 'subject', '')) or '').strip()
        body = (attrs.get('body', getattr(self.instance, 'body', '')) or '').strip()
        if len(subject) < 3:
            raise serializers.ValidationError({'subject': 'Subject must have at least 3 characters.'})
        if len(body) < 5:
            raise serializers.ValidationError({'body': 'Message body must have at least 5 characters.'})

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        selected_student = validated_data.pop('student_id', None)
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
            'brevo_contact_id',
            'brevo_synced_at',
            'brevo_sync_error',
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
