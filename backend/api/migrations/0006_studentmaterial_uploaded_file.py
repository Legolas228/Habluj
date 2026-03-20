from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_studentmaterial'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentmaterial',
            name='uploaded_file',
            field=models.FileField(blank=True, upload_to='student_materials/'),
        ),
    ]
