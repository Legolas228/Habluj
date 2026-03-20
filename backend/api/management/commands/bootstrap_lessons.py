from django.core.management.base import BaseCommand

from api.models import Lesson


DEFAULT_LESSONS = [
    {
        'title': 'Clase individual A1-A2',
        'description': 'Fundamentos de espanol para principiantes. Enfoque en comprension, vocabulario y expresion basica.',
        'level': 'A1',
        'duration': 60,
        'price': '20.00',
    },
    {
        'title': 'Clase conversacion B1-B2',
        'description': 'Practica oral guiada para mejorar fluidez, pronunciacion y confianza en situaciones reales.',
        'level': 'B1',
        'duration': 60,
        'price': '20.00',
    },
    {
        'title': 'Clase avanzada C1-C2',
        'description': 'Sesion avanzada centrada en precision gramatical, registro y comunicacion natural.',
        'level': 'C1',
        'duration': 60,
        'price': '20.00',
    },
]


class Command(BaseCommand):
    help = 'Create or update default lesson catalog for booking flow.'

    def handle(self, *args, **options):
        created = 0
        updated = 0

        for item in DEFAULT_LESSONS:
            lesson, was_created = Lesson.objects.update_or_create(
                title=item['title'],
                defaults={
                    'description': item['description'],
                    'level': item['level'],
                    'duration': item['duration'],
                    'price': item['price'],
                },
            )
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f'Created lesson: {lesson.title}'))
            else:
                updated += 1
                self.stdout.write(self.style.WARNING(f'Updated lesson: {lesson.title}'))

        self.stdout.write(
            self.style.SUCCESS(
                f'Lesson bootstrap complete. Created: {created}. Updated: {updated}.'
            )
        )
