from django.contrib import admin

from .models import Cafe, CafePartnerApplication, Booking


@admin.register(Cafe)
class CafeAdmin(admin.ModelAdmin):
    list_display = ("name", "area", "is_verified", "active", "rating", "total_tables")
    list_filter = ("is_verified", "active", "pure_veg", "rooftop")
    search_fields = ("name", "area")


@admin.register(CafePartnerApplication)
class CafePartnerApplicationAdmin(admin.ModelAdmin):
    list_display = ("business_name", "contact_email", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("business_name", "contact_email")


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("cafe", "date", "time_slot", "status", "booked_by")
    list_filter = ("status", "date")
