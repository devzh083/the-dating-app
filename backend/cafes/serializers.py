from rest_framework import serializers

from .models import Cafe, CafePartnerApplication, Booking


class CafeSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    date_booking_discount_percent = serializers.SerializerMethodField()

    class Meta:
        model = Cafe
        fields = [
            "id", "name", "cuisine", "description", "area", "address",
            "image", "rating", "price_for_two", "date_booking_discount_percent",
            "pure_veg", "serves_alcohol", "rooftop", "has_table_booking",
            "total_tables", "opening_time", "closing_time",
            "is_verified", "active", "created_at",
        ]
        read_only_fields = ["is_verified", "created_at"]

    def get_image(self, obj):
        return obj.image.url if obj.image else None

    def get_date_booking_discount_percent(self, obj):
        return Booking.DATE_BOOKING_DISCOUNT_PERCENT


class CafeAdminSerializer(CafeSerializer):
    """Same as CafeSerializer but exposes internal partner-contact fields and
    lets admins set is_verified directly (public serializer keeps it read-only)."""

    class Meta(CafeSerializer.Meta):
        fields = CafeSerializer.Meta.fields + ["partner_name", "partner_email", "partner_phone"]
        read_only_fields = ["created_at"]


class CafePartnerApplicationSerializer(serializers.ModelSerializer):
    reviewed_by_username = serializers.CharField(source="reviewed_by.username", read_only=True, allow_null=True)

    class Meta:
        model = CafePartnerApplication
        fields = [
            "id", "business_name", "contact_name", "contact_email", "contact_phone",
            "area", "address", "cuisine", "price_for_two", "description",
            "pure_veg", "serves_alcohol", "rooftop", "has_table_booking",
            "status", "admin_notes", "reviewed_by_username", "reviewed_at",
            "resulting_cafe", "created_at",
        ]
        read_only_fields = ["status", "admin_notes", "reviewed_by_username", "reviewed_at", "resulting_cafe", "created_at"]


class BookingSerializer(serializers.ModelSerializer):
    cafe_name = serializers.CharField(source="cafe.name", read_only=True)
    cafe_area = serializers.CharField(source="cafe.area", read_only=True)
    original_price_for_two = serializers.IntegerField(source="cafe.price_for_two", read_only=True)
    discounted_price_for_two = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id", "cafe", "cafe_name", "cafe_area", "match", "booked_by",
            "booking_type", "discount_percent", "original_price_for_two", "discounted_price_for_two",
            "date", "time_slot", "party_size", "status", "created_at",
        ]
        read_only_fields = ["booked_by", "booking_type", "discount_percent", "status", "created_at"]

    def get_discounted_price_for_two(self, obj):
        price = obj.cafe.price_for_two
        if obj.discount_percent:
            return round(price * (100 - obj.discount_percent) / 100)
        return price
