from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_userprofile_registration_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='progress',
            name='grammar_score',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='progress',
            name='vocabulary_score',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
    ]
