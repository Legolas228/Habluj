from django.contrib.auth.models import User
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand, CommandError

from api.models import Lead


class Command(BaseCommand):
    help = 'Create or update Ester staff account with lead-management permissions.'

    def add_arguments(self, parser):
        parser.add_argument('--username', default='ester', help='Admin username (default: ester)')
        parser.add_argument('--email', default='habluj.sk@gmail.com', help='Admin email')
        parser.add_argument('--password', default=None, help='Admin password (required on first create)')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        user, created = User.objects.get_or_create(username=username, defaults={'email': email})

        if created and not password:
            raise CommandError('Password is required when creating a new user. Use --password.')

        user.email = email
        user.is_active = True
        user.is_staff = True
        user.is_superuser = False
        if password:
            user.set_password(password)
        user.save()

        content_type = ContentType.objects.get_for_model(Lead)
        perms = Permission.objects.filter(
            content_type=content_type,
            codename__in=['add_lead', 'change_lead', 'delete_lead', 'view_lead'],
        )
        user.user_permissions.set(perms)

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created staff user "{username}" with lead permissions.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Updated staff user "{username}" with lead permissions.'))
