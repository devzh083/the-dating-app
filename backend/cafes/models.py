from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from login.models import Match


class Cafe(models.Model):
    """A partner-verified date spot, listed publicly once approved."""

    name = models.CharField(max_length=150)
    cuisine = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    area = models.CharField(max_length=150, blank=True)
    address = models.CharField(max_length=300, blank=True)

    image = models.ImageField(upload_to="cafes/", null=True, blank=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.0)
    price_for_two = models.PositiveIntegerField(default=0)

    pure_veg = models.BooleanField(default=False)
    serves_alcohol = models.BooleanField(default=False)
    rooftop = models.BooleanField(default=False)
    has_table_booking = models.BooleanField(default=True)

    # Booking/availability configuration
    total_tables = models.PositiveIntegerField(default=5)
    opening_time = models.TimeField(default="11:00")
    closing_time = models.TimeField(default="23:00")

    # Partner contact (internal — not exposed on public endpoints)
    partner_name = models.CharField(max_length=150, blank=True)
    partner_email = models.EmailField(blank=True)
    partner_phone = models.CharField(max_length=20, blank=True)

    is_verified = models.BooleanField(default=False)
    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cafes"
        ordering = ["-rating", "name"]

    def __str__(self):
        return self.name


class CafePartnerApplication(models.Model):
    """A cafe owner applying to be listed. Approving one creates a Cafe."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    business_name = models.CharField(max_length=150)
    contact_name = models.CharField(max_length=150)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True)

    area = models.CharField(max_length=150, blank=True)
    address = models.CharField(max_length=300, blank=True)
    cuisine = models.CharField(max_length=100, blank=True)
    price_for_two = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)

    pure_veg = models.BooleanField(default=False)
    serves_alcohol = models.BooleanField(default=False)
    rooftop = models.BooleanField(default=False)
    has_table_booking = models.BooleanField(default=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    admin_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_cafe_applications"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    resulting_cafe = models.ForeignKey(
        Cafe, on_delete=models.SET_NULL, null=True, blank=True, related_name="application"
    )

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "cafe_partner_applications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.business_name} ({self.status})"


class Booking(models.Model):
    """A table booking at a verified cafe — either solo, or a date with a match."""

    STATUS_CHOICES = [
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
    ]

    BOOKING_TYPE_CHOICES = [
        ("solo", "Solo"),
        ("date", "Date"),
    ]

    DATE_BOOKING_DISCOUNT_PERCENT = 20

    cafe = models.ForeignKey(Cafe, on_delete=models.CASCADE, related_name="bookings")
    # Only set for booking_type="date" — a solo booking has no match.
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="bookings", null=True, blank=True)

    booking_type = models.CharField(max_length=10, choices=BOOKING_TYPE_CHOICES, default="solo")
    # Snapshot of the discount applied at booking time, so it stays accurate
    # even if the promo terms change later.
    discount_percent = models.PositiveIntegerField(default=0)

    # Which user made the booking (for display/notifications)
    booked_by = models.EmailField()

    date = models.DateField()
    time_slot = models.TimeField()
    party_size = models.PositiveIntegerField(default=2)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="confirmed")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "cafe_bookings"
        ordering = ["-date", "-time_slot"]
        indexes = [
            models.Index(fields=["cafe", "date", "time_slot"]),
        ]

    def __str__(self):
        return f"{self.cafe.name} — {self.date} {self.time_slot} ({self.status})"
