from django.conf import settings
from django.db import migrations, models


DEFAULT_WEEKLY_SLOTS = {
    0: ['09:00:00', '10:00:00', '11:00:00', '16:00:00', '17:00:00'],
    1: ['10:00:00', '11:00:00', '12:00:00', '17:00:00', '18:00:00'],
    2: ['09:00:00', '10:00:00', '11:00:00', '16:00:00', '17:00:00'],
    3: ['10:00:00', '11:00:00', '12:00:00', '17:00:00', '18:00:00'],
    4: ['09:00:00', '10:00:00', '11:00:00', '12:00:00'],
    5: ['10:00:00', '11:00:00'],
    6: [],
}


def seed_default_weekly_slots(apps, schema_editor):
    WeeklyAvailabilitySlot = apps.get_model('api', 'WeeklyAvailabilitySlot')

    if WeeklyAvailabilitySlot.objects.exists():
        return

    for weekday, slots in DEFAULT_WEEKLY_SLOTS.items():
        for slot in slots:
            WeeklyAvailabilitySlot.objects.create(
                weekday=weekday,
                time=slot,
                is_active=True,
            )


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_booking_admin_private_notes'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='WeeklyAvailabilitySlot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('weekday', models.PositiveSmallIntegerField(choices=[(0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday')])),
                ('time', models.TimeField()),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['weekday', 'time'],
            },
        ),
        migrations.CreateModel(
            name='BookingSlotBlock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('time', models.TimeField()),
                ('reason', models.CharField(blank=True, max_length=255)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=models.deletion.SET_NULL, related_name='created_booking_slot_blocks', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['date', 'time'],
            },
        ),
        migrations.AddConstraint(
            model_name='weeklyavailabilityslot',
            constraint=models.UniqueConstraint(fields=('weekday', 'time'), name='unique_weekly_availability_slot'),
        ),
        migrations.AddConstraint(
            model_name='bookingslotblock',
            constraint=models.UniqueConstraint(fields=('date', 'time'), name='unique_booking_slot_block'),
        ),
        migrations.RunPython(seed_default_weekly_slots, migrations.RunPython.noop),
    ]
