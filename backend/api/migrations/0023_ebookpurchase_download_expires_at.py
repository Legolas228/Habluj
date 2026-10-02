from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0022_ebookpurchase_email_sent_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='ebookpurchase',
            name='download_expires_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
