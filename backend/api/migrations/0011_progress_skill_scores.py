from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_payment_alter_booking_unique_together_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='progress',
            name='listening_score',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='progress',
            name='reading_score',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='progress',
            name='speaking_score',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='progress',
            name='writing_score',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
    ]
