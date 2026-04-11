from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_availability_creditledger_booking_utc_fields'),
    ]

    operations = [
        migrations.RenameField(
            model_name='lead',
            old_name='brevo_contact_id',
            new_name='mailerlite_contact_id',
        ),
        migrations.RenameField(
            model_name='lead',
            old_name='brevo_synced_at',
            new_name='mailerlite_synced_at',
        ),
        migrations.RenameField(
            model_name='lead',
            old_name='brevo_sync_error',
            new_name='mailerlite_sync_error',
        ),
    ]
