# Generated migration for lottery models

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Draw',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=200)),
                ('algorithm_used', models.CharField(choices=[('pure_random', 'Pure Random'), ('weighted_losses', 'Weighted by Losses'), ('round_robin', 'Round-Robin Fair'), ('equal_chance', 'Equal Chance')], default='pure_random', max_length=50)),
                ('wine_name', models.CharField(blank=True, max_length=200)),
                ('wine_description', models.TextField(blank=True)),
                ('wine_image_url', models.URLField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('performed_at', models.DateTimeField(blank=True, null=True)),
                ('voided_at', models.DateTimeField(blank=True, null=True)),
                ('winner_name', models.CharField(blank=True, max_length=100)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='DrawParticipant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('ticket_count', models.PositiveIntegerField(default=1)),
                ('is_winner', models.BooleanField(default=False)),
                ('draw', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='participants', to='lottery.draw')),
            ],
            options={
                'ordering': ['name'],
                'unique_together': {('draw', 'name')},
            },
        ),
    ]
