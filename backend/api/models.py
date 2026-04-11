import re

from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from django.db.models import Q

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    language_level = models.CharField(max_length=20, choices=[
        ('A1', 'Beginner'),
        ('A2', 'Elementary'),
        ('B1', 'Intermediate'),
        ('B2', 'Upper Intermediate'),
        ('C1', 'Advanced'),
        ('C2', 'Mastery'),
    ])
    bio = models.TextField(blank=True)
    learning_reason = models.TextField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    private_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username

class Lesson(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    level = models.CharField(max_length=20)
    duration = models.IntegerField(help_text=_('Duration in minutes'))
    price = models.DecimalField(max_digits=6, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Booking(models.Model):
    CURRENCY_CHOICES = [
        ('EUR', 'Euro'),
        ('CZK', 'Czech Koruna'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    start_time_utc = models.DateTimeField(null=True, blank=True, db_index=True)
    end_time_utc = models.DateTimeField(null=True, blank=True, db_index=True)
    student_timezone = models.CharField(max_length=64, default='UTC')
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='EUR')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('no_show', 'No Show'),
        ('consumed', 'Consumed'),
    ], default='pending')
    google_meet_link = models.URLField(blank=True)
    google_event_id = models.CharField(max_length=255, blank=True)
    reschedule_count = models.PositiveSmallIntegerField(default=0)
    notes = models.TextField(blank=True)
    admin_private_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['date', 'time'],
                condition=Q(status__in=['pending', 'confirmed']),
                name='unique_active_booking_slot',
            ),
        ]

    def __str__(self):
        return f"{self.student.username} - {self.lesson.title} - {self.date}"


class WeeklyAvailabilitySlot(models.Model):
    WEEKDAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    weekday = models.PositiveSmallIntegerField(choices=WEEKDAY_CHOICES)
    time = models.TimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['weekday', 'time']
        constraints = [
            models.UniqueConstraint(fields=['weekday', 'time'], name='unique_weekly_availability_slot'),
        ]

    def __str__(self):
        return f"Weekday {self.weekday} @ {self.time}"


class Availability(models.Model):
    WEEKDAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    weekday = models.PositiveSmallIntegerField(choices=WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    buffer_minutes = models.PositiveSmallIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['weekday', 'start_time']

    def __str__(self):
        return f"Availability {self.weekday} {self.start_time}-{self.end_time}"


class BookingSlotBlock(models.Model):
    date = models.DateField()
    time = models.TimeField()
    reason = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='created_booking_slot_blocks',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'time']
        constraints = [
            models.UniqueConstraint(fields=['date', 'time'], name='unique_booking_slot_block'),
        ]

    def __str__(self):
        return f"Blocked {self.date} {self.time}"


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending_user', 'Pending User Payment'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('credited', 'Credited'),
    ]

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, choices=Booking.CURRENCY_CHOICES, default='EUR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_user')
    gopay_payment_id = models.CharField(max_length=255, blank=True)
    gopay_checkout_url = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment<{self.booking_id}:{self.status}:{self.amount} {self.currency}>"


class CreditLedger(models.Model):
    REASON_CHOICES = [
        ('top_up', 'Top Up'),
        ('booking_debit', 'Booking Debit'),
        ('cancellation_refund', 'Cancellation Refund'),
        ('admin_adjustment', 'Admin Adjustment'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_ledger')
    booking = models.ForeignKey(
        Booking,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='credit_movements',
    )
    delta = models.IntegerField()
    reason = models.CharField(max_length=32, choices=REASON_CHOICES)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Credit<{self.student.username}:{self.delta}:{self.reason}>"

class Progress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, null=True, blank=True)
    completed = models.BooleanField(default=False)
    score = models.IntegerField(null=True, blank=True)
    speaking_score = models.PositiveSmallIntegerField(null=True, blank=True)
    listening_score = models.PositiveSmallIntegerField(null=True, blank=True)
    reading_score = models.PositiveSmallIntegerField(null=True, blank=True)
    writing_score = models.PositiveSmallIntegerField(null=True, blank=True)
    grammar_score = models.PositiveSmallIntegerField(null=True, blank=True)
    vocabulary_score = models.PositiveSmallIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'lesson']

    def __str__(self):
        lesson_label = self.lesson.title if self.lesson else 'Sin clase'
        return f"{self.student.username} - {lesson_label}"


class StudentMaterial(models.Model):
    TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('link', 'Link'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('other', 'Other'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='materials')
    created_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='created_materials',
    )
    booking = models.ForeignKey(
        Booking,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='materials',
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    resource_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    uploaded_file = models.FileField(upload_to='student_materials/', blank=True)
    external_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.username} - {self.title}"


class StudentGoal(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    created_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='created_goals',
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['is_completed', '-created_at']

    def __str__(self):
        return f"{self.student.username} - {self.title}"


class StudentMessage(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='sent_student_messages',
    )
    subject = models.CharField(max_length=200)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Message to {self.student.username}: {self.subject}"


class Lead(models.Model):
    STAGE_CHOICES = [
        ('new', 'New'),
        ('nurturing', 'Nurturing'),
        ('qualified', 'Qualified'),
        ('booked', 'Booked'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ]

    LANGUAGE_CHOICES = [
        ('sk', 'Slovak'),
        ('cz', 'Czech'),
        ('es', 'Spanish'),
    ]

    full_name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=32, blank=True)
    preferred_language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='sk')
    source = models.CharField(max_length=80, default='lead_magnet')
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='new')
    notes = models.TextField(blank=True)
    follow_up_at = models.DateTimeField(null=True, blank=True)
    last_contacted_at = models.DateTimeField(null=True, blank=True)
    duplicate_of = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='duplicate_children',
    )
    duplicate_confidence = models.CharField(max_length=20, blank=True)

    consent_privacy = models.BooleanField(default=False)
    consent_marketing = models.BooleanField(default=False)
    consent_at = models.DateTimeField(auto_now_add=True)
    consent_version = models.CharField(max_length=20, default='v1')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)

    mailerlite_contact_id = models.CharField(max_length=80, blank=True)
    mailerlite_synced_at = models.DateTimeField(null=True, blank=True)
    mailerlite_sync_error = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} <{self.email}>"

    @staticmethod
    def normalize_email(value):
        return (value or '').strip().lower()

    @staticmethod
    def normalize_phone(value):
        return re.sub(r'[^0-9+]', '', (value or '').strip())

    def refresh_duplicate_status(self):
        email = self.normalize_email(self.email)
        phone = self.normalize_phone(self.phone)

        matches = Lead.objects.exclude(pk=self.pk)
        email_match = None
        phone_match = None

        if email:
            email_match = matches.filter(email__iexact=email).order_by('created_at').first()
        if phone:
            for candidate in matches.exclude(phone='').order_by('created_at'):
                if self.normalize_phone(candidate.phone) == phone:
                    phone_match = candidate
                    break

        if email_match and phone_match:
            self.duplicate_of = email_match if email_match.created_at <= phone_match.created_at else phone_match
            self.duplicate_confidence = 'both'
            return

        if email_match:
            self.duplicate_of = email_match
            self.duplicate_confidence = 'email'
            return

        if phone_match:
            self.duplicate_of = phone_match
            self.duplicate_confidence = 'phone'
            return

        self.duplicate_of = None
        self.duplicate_confidence = ''


class LeadActivity(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='activities')
    actor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=40)
    from_stage = models.CharField(max_length=20, blank=True)
    to_stage = models.CharField(max_length=20, blank=True)
    details = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"LeadActivity<{self.lead_id}:{self.action}>"
