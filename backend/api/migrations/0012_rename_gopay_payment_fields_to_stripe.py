from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0011_progress_skill_scores'),
    ]

    operations = [
        migrations.RenameField(
            model_name='payment',
            old_name='gopay_payment_id',
            new_name='stripe_payment_id',
        ),
        migrations.RenameField(
            model_name='payment',
            old_name='gopay_checkout_url',
            new_name='stripe_checkout_url',
        ),
    ]
