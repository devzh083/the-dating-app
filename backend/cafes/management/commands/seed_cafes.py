from django.core.management.base import BaseCommand

from cafes.models import Cafe

PLACEHOLDER_CAFES = [
    dict(
        name="Sunset Terrace", cuisine="Italian", area="Jubilee Hills",
        description="Romantic rooftop dining with skyline views — a favourite for first dates.",
        rating=4.6, price_for_two=1200, pure_veg=False, serves_alcohol=True, rooftop=True,
        total_tables=8, opening_time="12:00", closing_time="23:00",
    ),
    dict(
        name="The Rustic Table", cuisine="Continental", area="Banjara Hills",
        description="Warm, candlelit indoor seating with a seasonal tasting menu.",
        rating=4.4, price_for_two=1500, pure_veg=False, serves_alcohol=True, rooftop=False,
        total_tables=10, opening_time="11:00", closing_time="22:30",
    ),
    dict(
        name="Green Leaf Kitchen", cuisine="Pure Vegetarian", area="Madhapur",
        description="Farm-to-table vegetarian fare in a bright, plant-filled space.",
        rating=4.5, price_for_two=800, pure_veg=True, serves_alcohol=False, rooftop=False,
        total_tables=12, opening_time="11:30", closing_time="22:00",
    ),
    dict(
        name="Brew & Bloom Café", cuisine="Cafe", area="Gachibowli",
        description="Cozy specialty-coffee café with garden seating, perfect for a low-key first date.",
        rating=4.3, price_for_two=600, pure_veg=True, serves_alcohol=False, rooftop=False,
        total_tables=15, opening_time="08:00", closing_time="21:00",
    ),
    dict(
        name="Skyline Lounge", cuisine="Asian Fusion", area="Hitech City",
        description="Sleek rooftop bar and lounge with skyline views and live music on weekends.",
        rating=4.7, price_for_two=2000, pure_veg=False, serves_alcohol=True, rooftop=True,
        total_tables=6, opening_time="17:00", closing_time="23:30",
    ),
    dict(
        name="La Piazza", cuisine="Mediterranean", area="Banjara Hills",
        description="Sun-drenched courtyard dining with wood-fired pizza and fresh seafood.",
        rating=4.4, price_for_two=1400, pure_veg=False, serves_alcohol=True, rooftop=False,
        total_tables=9, opening_time="12:00", closing_time="22:30",
    ),
    dict(
        name="The Tea Room", cuisine="Cafe", area="Jubilee Hills",
        description="Quiet, elegant tea house — ideal for a relaxed afternoon date.",
        rating=4.2, price_for_two=500, pure_veg=True, serves_alcohol=False, rooftop=False,
        total_tables=10, opening_time="10:00", closing_time="20:00",
    ),
    dict(
        name="Copper Canopy", cuisine="North Indian", area="Kondapur",
        description="Classic North Indian comfort food under a striking copper-lit canopy.",
        rating=4.3, price_for_two=1000, pure_veg=False, serves_alcohol=True, rooftop=True,
        total_tables=12, opening_time="12:00", closing_time="23:00",
    ),
]


class Command(BaseCommand):
    help = "Seed a handful of verified placeholder cafes so the app isn't empty on a fresh deploy."

    def handle(self, *args, **options):
        created = 0
        for data in PLACEHOLDER_CAFES:
            _, was_created = Cafe.objects.get_or_create(
                name=data["name"],
                defaults={**data, "is_verified": True, "active": True, "has_table_booking": True},
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {created} new cafe(s); {len(PLACEHOLDER_CAFES) - created} already existed."
        ))
