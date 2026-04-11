from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_progress_lesson_optional'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='private_notes',
            field=models.TextField(blank=True),
        ),
    ]
