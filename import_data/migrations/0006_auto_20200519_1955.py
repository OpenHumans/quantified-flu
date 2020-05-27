# Generated by Django 2.2.12 on 2020-05-19 19:55

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('openhumans', '0001_initial'),
        ('import_data', '0005_auto_20200506_0804'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fitbitmember',
            name='last_submitted',
            field=models.DateTimeField(default='2020-05-12 19:55:04+00:00'),
        ),
        migrations.AlterField(
            model_name='fitbitmember',
            name='last_updated',
            field=models.DateTimeField(default='2020-05-12 19:55:04+00:00'),
        ),
        migrations.AlterField(
            model_name='fitbitmember',
            name='token_expires',
            field=models.DateTimeField(default='2020-05-19 19:55:04+00:00'),
        ),
        migrations.CreateModel(
            name='GarminMember',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('userid', models.CharField(max_length=255, null=True, unique=True)),
                ('access_token', models.CharField(max_length=512)),
                ('last_updated', models.DateTimeField(null=True)),
                ('earliest_available_data', models.DateTimeField(null=True)),
                ('member', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='garmin_member', to='openhumans.OpenHumansMember')),
            ],
        ),
    ]