from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_userprofile_private_notes'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='birth_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='learning_reason',
            field=models.TextField(blank=True),
        ),
    ]
