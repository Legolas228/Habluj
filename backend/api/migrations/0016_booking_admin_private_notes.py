from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_progress_grammar_vocabulary'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='admin_private_notes',
            field=models.TextField(blank=True, default=''),
        ),
    ]
