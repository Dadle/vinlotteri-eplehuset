# Migration for Wine model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lottery', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Wine',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('producer', models.CharField(blank=True, max_length=200)),
                ('wine_type', models.CharField(choices=[('red', 'Red'), ('white', 'White'), ('rose', 'Rosé'), ('sparkling', 'Sparkling'), ('dessert', 'Dessert'), ('fortified', 'Fortified')], default='red', max_length=20)),
                ('country', models.CharField(blank=True, max_length=100)),
                ('region', models.CharField(blank=True, max_length=100)),
                ('vintage', models.PositiveIntegerField(blank=True, null=True)),
                ('grape_variety', models.CharField(blank=True, max_length=200)),
                ('price', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('description', models.TextField(blank=True)),
                ('image_url', models.URLField(blank=True)),
                ('vinmonopolet_id', models.CharField(blank=True, help_text='Product ID from Vinmonopolet', max_length=50)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.AddField(
            model_name='draw',
            name='wine',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='draws', to='lottery.wine'),
        ),
    ]
