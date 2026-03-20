import re

from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

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
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ], default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['date', 'time']

    def __str__(self):
        return f"{self.student.username} - {self.lesson.title} - {self.date}"

class Progress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    score = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'lesson']

    def __str__(self):
        return f"{self.student.username} - {self.lesson.title}"


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

    brevo_contact_id = models.CharField(max_length=80, blank=True)
    brevo_synced_at = models.DateTimeField(null=True, blank=True)
    brevo_sync_error = models.TextField(blank=True)

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
