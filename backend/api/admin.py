from django.contrib import admin
from django.utils import timezone
from .mailerlite import MailerLiteSyncError, send_new_lead_notification, sync_lead_to_mailerlite
from .models import UserProfile, Lesson, Booking, Progress, Lead, LeadActivity

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'language_level', 'created_at')
    search_fields = ('user__username', 'user__email')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'level', 'duration', 'price')
    search_fields = ('title', 'description')
    list_filter = ('level',)

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'date', 'time', 'status')
    search_fields = ('student__username', 'lesson__title')
    list_filter = ('status', 'date')

@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'completed', 'score')
    search_fields = ('student__username', 'lesson__title')
    list_filter = ('completed',)


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        'full_name',
        'email',
        'preferred_language',
        'source',
        'stage',
        'follow_up_at',
        'duplicate_confidence',
        'mailerlite_status',
        'created_at',
    )
    search_fields = ('full_name', 'email', 'phone')
    list_filter = ('preferred_language', 'source', 'stage', 'duplicate_confidence', 'consent_marketing', 'consent_privacy', 'created_at')
    readonly_fields = ('created_at', 'updated_at', 'mailerlite_contact_id', 'mailerlite_synced_at', 'mailerlite_sync_error', 'duplicate_of', 'duplicate_confidence')
    actions = (
        'mark_as_nurturing',
        'mark_as_qualified',
        'mark_as_booked',
        'mark_as_won',
        'mark_as_lost',
        'resync_with_mailerlite',
        'resend_notification_email',
    )

    @admin.display(description='MailerLite')
    def mailerlite_status(self, obj):
        if obj.mailerlite_synced_at:
            return 'Synced'
        if obj.mailerlite_sync_error:
            return 'Error'
        return 'Pending'

    def _bulk_set_stage(self, request, queryset, stage):
        updated = queryset.update(stage=stage, updated_at=timezone.now())
        self.message_user(request, f'{updated} leads moved to "{stage}".')

    @admin.action(description='Move stage to nurturing')
    def mark_as_nurturing(self, request, queryset):
        self._bulk_set_stage(request, queryset, 'nurturing')

    @admin.action(description='Move stage to qualified')
    def mark_as_qualified(self, request, queryset):
        self._bulk_set_stage(request, queryset, 'qualified')

    @admin.action(description='Move stage to booked')
    def mark_as_booked(self, request, queryset):
        self._bulk_set_stage(request, queryset, 'booked')

    @admin.action(description='Move stage to won')
    def mark_as_won(self, request, queryset):
        self._bulk_set_stage(request, queryset, 'won')

    @admin.action(description='Move stage to lost')
    def mark_as_lost(self, request, queryset):
        self._bulk_set_stage(request, queryset, 'lost')

    @admin.action(description='Re-sync selected leads to MailerLite subscribers')
    def resync_with_mailerlite(self, request, queryset):
        synced = 0
        failed = 0
        for lead in queryset:
            try:
                result = sync_lead_to_mailerlite(lead)
                if result.get('status') == 'synced':
                    lead.mailerlite_contact_id = result.get('contact_id', '')
                    lead.mailerlite_synced_at = timezone.now()
                    lead.mailerlite_sync_error = ''
                    lead.save(update_fields=['mailerlite_contact_id', 'mailerlite_synced_at', 'mailerlite_sync_error', 'updated_at'])
                    synced += 1
                else:
                    failed += 1
                    lead.mailerlite_sync_error = result.get('reason', 'MailerLite sync skipped')
                    lead.save(update_fields=['mailerlite_sync_error', 'updated_at'])
            except MailerLiteSyncError as exc:
                failed += 1
                lead.mailerlite_sync_error = str(exc)
                lead.save(update_fields=['mailerlite_sync_error', 'updated_at'])

        self.message_user(request, f'Re-sync completed. Success: {synced}. Failed/skipped: {failed}.')

    @admin.action(description='Resend notification email for selected leads')
    def resend_notification_email(self, request, queryset):
        sent = 0
        failed = 0
        for lead in queryset:
            try:
                result = send_new_lead_notification(lead)
                if result.get('status') == 'sent':
                    sent += 1
                else:
                    failed += 1
            except MailerLiteSyncError:
                failed += 1

        self.message_user(request, f'Notification resend completed. Sent: {sent}. Failed/skipped: {failed}.')


@admin.register(LeadActivity)
class LeadActivityAdmin(admin.ModelAdmin):
    list_display = ('lead', 'action', 'actor', 'from_stage', 'to_stage', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('lead__full_name', 'lead__email', 'details', 'actor__username')
    readonly_fields = ('lead', 'action', 'actor', 'from_stage', 'to_stage', 'details', 'created_at')
