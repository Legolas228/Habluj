import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0019_rename_brevo_fields_to_mailerlite'),
    ]

    operations = [
        migrations.CreateModel(
            name='EbookPurchase',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stripe_session_id', models.CharField(max_length=255, unique=True)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('currency', models.CharField(choices=[('EUR', 'Euro'), ('CZK', 'Czech Koruna')], default='EUR', max_length=3)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending', max_length=20)),
                ('download_token', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]