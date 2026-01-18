# Seed default wines

from django.db import migrations


def seed_wines(apps, schema_editor):
    Wine = apps.get_model('lottery', 'Wine')
    
    # Popular wines available at Vinmonopolet
    default_wines = [
        {
            'name': 'Catena Zapata Malbec',
            'producer': 'Catena Zapata',
            'wine_type': 'red',
            'country': 'Argentina',
            'region': 'Mendoza',
            'vintage': 2021,
            'grape_variety': 'Malbec',
            'price': 249.90,
            'description': 'A rich and elegant Malbec with notes of blackberry, plum, and subtle oak.',
        },
        {
            'name': 'Cloudy Bay Sauvignon Blanc',
            'producer': 'Cloudy Bay',
            'wine_type': 'white',
            'country': 'New Zealand',
            'region': 'Marlborough',
            'vintage': 2023,
            'grape_variety': 'Sauvignon Blanc',
            'price': 269.90,
            'description': 'Crisp and refreshing with tropical fruit, citrus, and herbaceous notes.',
        },
        {
            'name': 'Barolo Riserva',
            'producer': 'Fontanafredda',
            'wine_type': 'red',
            'country': 'Italy',
            'region': 'Piedmont',
            'vintage': 2018,
            'grape_variety': 'Nebbiolo',
            'price': 499.90,
            'description': 'The king of wines - complex with cherry, tar, roses, and truffle.',
        },
        {
            'name': 'Moët & Chandon Impérial',
            'producer': 'Moët & Chandon',
            'wine_type': 'sparkling',
            'country': 'France',
            'region': 'Champagne',
            'grape_variety': 'Chardonnay, Pinot Noir, Pinot Meunier',
            'price': 599.00,
            'description': 'Classic Champagne with bright fruitiness, seductive palate, and elegant maturity.',
        },
        {
            'name': 'Whispering Angel',
            'producer': 'Château d\'Esclans',
            'wine_type': 'rose',
            'country': 'France',
            'region': 'Provence',
            'vintage': 2023,
            'grape_variety': 'Grenache, Rolle',
            'price': 249.90,
            'description': 'Pale pink rosé with notes of fresh strawberry, peach, and citrus.',
        },
        {
            'name': 'Penfolds Bin 389',
            'producer': 'Penfolds',
            'wine_type': 'red',
            'country': 'Australia',
            'region': 'South Australia',
            'vintage': 2021,
            'grape_variety': 'Cabernet Sauvignon, Shiraz',
            'price': 549.90,
            'description': 'Known as Baby Grange - rich and complex with dark fruit and chocolate.',
        },
        {
            'name': 'Chablis Premier Cru',
            'producer': 'William Fèvre',
            'wine_type': 'white',
            'country': 'France',
            'region': 'Burgundy',
            'vintage': 2022,
            'grape_variety': 'Chardonnay',
            'price': 399.90,
            'description': 'Mineral-driven Chardonnay with citrus, green apple, and flinty notes.',
        },
        {
            'name': 'Amarone della Valpolicella',
            'producer': 'Bertani',
            'wine_type': 'red',
            'country': 'Italy',
            'region': 'Veneto',
            'vintage': 2017,
            'grape_variety': 'Corvina, Rondinella, Molinara',
            'price': 699.90,
            'description': 'Rich and powerful with dried fruit, chocolate, and spice.',
        },
        {
            'name': 'Sancerre',
            'producer': 'Domaine Vacheron',
            'wine_type': 'white',
            'country': 'France',
            'region': 'Loire Valley',
            'vintage': 2023,
            'grape_variety': 'Sauvignon Blanc',
            'price': 329.90,
            'description': 'Classic Sancerre with mineral notes, citrus, and fresh herbs.',
        },
        {
            'name': 'Rioja Gran Reserva',
            'producer': 'López de Heredia',
            'wine_type': 'red',
            'country': 'Spain',
            'region': 'Rioja',
            'vintage': 2011,
            'grape_variety': 'Tempranillo, Garnacha',
            'price': 599.90,
            'description': 'Traditional Rioja with extended aging - vanilla, leather, and dried fruit.',
        },
        {
            'name': 'Riesling Spätlese',
            'producer': 'Dr. Loosen',
            'wine_type': 'white',
            'country': 'Germany',
            'region': 'Mosel',
            'vintage': 2022,
            'grape_variety': 'Riesling',
            'price': 279.90,
            'description': 'Off-dry Riesling with peach, apricot, and slate minerality.',
        },
        {
            'name': 'Châteauneuf-du-Pape',
            'producer': 'Château de Beaucastel',
            'wine_type': 'red',
            'country': 'France',
            'region': 'Rhône Valley',
            'vintage': 2020,
            'grape_variety': 'Grenache, Mourvèdre, Syrah',
            'price': 749.90,
            'description': 'Complex Southern Rhône blend with garrigue, dark fruit, and spice.',
        },
    ]
    
    for wine_data in default_wines:
        Wine.objects.create(**wine_data)


def remove_wines(apps, schema_editor):
    Wine = apps.get_model('lottery', 'Wine')
    Wine.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('lottery', '0002_wine_draw_wine'),
    ]

    operations = [
        migrations.RunPython(seed_wines, remove_wines),
    ]
