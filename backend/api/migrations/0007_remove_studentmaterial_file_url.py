from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_studentmaterial_uploaded_file'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='studentmaterial',
            name='file_url',
        ),
    ]
