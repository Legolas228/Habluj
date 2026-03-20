from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def populate_material_created_by(apps, schema_editor):
    StudentMaterial = apps.get_model('api', 'StudentMaterial')
    for material in StudentMaterial.objects.filter(created_by__isnull=True).iterator():
        material.created_by_id = material.student_id
        material.save(update_fields=['created_by'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_remove_studentmaterial_file_url'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='studentmaterial',
            name='created_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_materials', to=settings.AUTH_USER_MODEL),
        ),
        migrations.RunPython(populate_material_created_by, migrations.RunPython.noop),
    ]
