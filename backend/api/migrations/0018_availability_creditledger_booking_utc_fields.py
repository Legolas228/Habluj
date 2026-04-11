from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from django.db import migrations, models
import django.db.models.deletion


def backfill_booking_utc_fields(apps, schema_editor):
    Booking = apps.get_model('api', 'Booking')
    teacher_tz = ZoneInfo('Europe/Madrid')
    for booking in Booking.objects.filter(start_time_utc__isnull=True):
        if not booking.date or not booking.time:
            continue
        local_dt = datetime.combine(booking.date, booking.time).replace(tzinfo=teacher_tz)
        booking.start_time_utc = local_dt.astimezone(ZoneInfo('UTC'))
        booking.end_time_utc = booking.start_time_utc + timedelta(minutes=60)
        booking.save(update_fields=['start_time_utc', 'end_time_utc'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_weeklyavailabilityslot_bookingslotblock'),
    ]

    operations = [
        migrations.CreateModel(
            name='Availability',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('weekday', models.PositiveSmallIntegerField(choices=[(0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday')])),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('buffer_minutes', models.PositiveSmallIntegerField(default=10)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['weekday', 'start_time'],
            },
        ),
        migrations.AddField(
            model_name='booking',
            name='end_time_utc',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='google_event_id',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='booking',
            name='google_meet_link',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='reschedule_count',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='booking',
            name='start_time_utc',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='student_timezone',
            field=models.CharField(default='UTC', max_length=64),
        ),
        migrations.AlterField(
            model_name='booking',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled'), ('completed', 'Completed'), ('no_show', 'No Show'), ('consumed', 'Consumed')], default='pending', max_length=20),
        ),
        migrations.CreateModel(
            name='CreditLedger',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('delta', models.IntegerField()),
                ('reason', models.CharField(choices=[('top_up', 'Top Up'), ('booking_debit', 'Booking Debit'), ('cancellation_refund', 'Cancellation Refund'), ('admin_adjustment', 'Admin Adjustment')], max_length=32)),
                ('description', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('booking', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='credit_movements', to='api.booking')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='credit_ledger', to='auth.user')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.RunPython(backfill_booking_utc_fields, migrations.RunPython.noop),
    ]
