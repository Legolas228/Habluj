from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0021_rename_gopay_payment_fields_to_stripe'),
    ]

    operations = [
        migrations.AddField(
            model_name='ebookpurchase',
            name='email_sent_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
