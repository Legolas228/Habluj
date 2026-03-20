from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_lead_followup_activity_duplicates'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lead',
            name='preferred_language',
            field=models.CharField(
                choices=[('sk', 'Slovak'), ('cz', 'Czech'), ('es', 'Spanish')],
                default='sk',
                max_length=2,
            ),
        ),
    ]
