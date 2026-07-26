from datetime import datetime, timedelta

from django.db.models import Q, Count
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from admin_panel.permissions import HasSectionPermission

from login.models import Match, Notification
from login.ws import notify_user

from .models import Cafe, CafePartnerApplication, Booking
from .serializers import (
    CafeSerializer,
    CafeAdminSerializer,
    CafePartnerApplicationSerializer,
    BookingSerializer,
)


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC
# ─────────────────────────────────────────────────────────────────────────────

class CafeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cafes = Cafe.objects.filter(is_verified=True, active=True)
        return Response(CafeSerializer(cafes, many=True).data)


class CafeDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            cafe = Cafe.objects.get(pk=pk, is_verified=True, active=True)
        except Cafe.DoesNotExist:
            return Response({"error": "Cafe not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(CafeSerializer(cafe).data)


class CafeAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            cafe = Cafe.objects.get(pk=pk, is_verified=True, active=True)
        except Cafe.DoesNotExist:
            return Response({"error": "Cafe not found"}, status=status.HTTP_404_NOT_FOUND)

        date_str = request.query_params.get("date")
        if not date_str:
            return Response({"error": "date query param required (YYYY-MM-DD)"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format, use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)

        if target_date < timezone.localdate():
            return Response({"error": "Cannot check availability for a past date"}, status=status.HTTP_400_BAD_REQUEST)

        booked_counts = dict(
            Booking.objects.filter(cafe=cafe, date=target_date, status="confirmed")
            .values_list("time_slot")
            .annotate(count=Count("id"))
        )

        slots = []
        current = datetime.combine(target_date, cafe.opening_time)
        end = datetime.combine(target_date, cafe.closing_time)
        while current < end:
            slot_time = current.time()
            booked = booked_counts.get(slot_time, 0)
            slots.append({
                "time": slot_time.strftime("%H:%M"),
                "remaining": max(0, cafe.total_tables - booked),
                "available": booked < cafe.total_tables,
            })
            current += timedelta(hours=1)

        return Response({"date": date_str, "slots": slots})


class CafePartnerApplyView(APIView):
    """Public form for a cafe owner to apply to be listed as a partner."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CafePartnerApplicationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        application = serializer.save()
        return Response(
            {"message": "Application submitted — our team will review it shortly.",
             "application": CafePartnerApplicationSerializer(application).data},
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────────────────────────────────────
# AUTHENTICATED (dating-app users)
# ─────────────────────────────────────────────────────────────────────────────

class BookCafeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            cafe = Cafe.objects.get(pk=pk, is_verified=True, active=True)
        except Cafe.DoesNotExist:
            return Response({"error": "Cafe not found"}, status=status.HTTP_404_NOT_FOUND)

        if not cafe.has_table_booking:
            return Response({"error": "This cafe doesn't support table booking"}, status=status.HTTP_400_BAD_REQUEST)

        match_id = request.data.get("match_id")  # optional — omit for a solo booking
        date_str = request.data.get("date")
        time_str = request.data.get("time_slot")
        party_size = request.data.get("party_size", 2)

        if not date_str or not time_str:
            return Response(
                {"error": "date and time_slot are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        me = request.user.username.lower()
        match = None
        other_email = None

        if match_id:
            try:
                match = Match.objects.select_related("chat").get(
                    Q(user_a=me) | Q(user_b=me), id=match_id
                )
            except Match.DoesNotExist:
                return Response(
                    {"error": "You can only book a date with one of your matches"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            other_email = match.user_b if match.user_a == me else match.user_a

        try:
            booking_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            time_slot = datetime.strptime(time_str, "%H:%M").time()
        except ValueError:
            return Response({"error": "Invalid date/time format"}, status=status.HTTP_400_BAD_REQUEST)

        if booking_date < timezone.localdate():
            return Response({"error": "Cannot book a table in the past"}, status=status.HTTP_400_BAD_REQUEST)

        if not (cafe.opening_time <= time_slot < cafe.closing_time):
            return Response({"error": "Selected time is outside opening hours"}, status=status.HTTP_400_BAD_REQUEST)

        existing_count = Booking.objects.filter(
            cafe=cafe, date=booking_date, time_slot=time_slot, status="confirmed"
        ).count()
        if existing_count >= cafe.total_tables:
            return Response({"error": "No tables available for that time"}, status=status.HTTP_409_CONFLICT)

        booking = Booking.objects.create(
            cafe=cafe,
            match=match,
            booking_type="date" if match else "solo",
            discount_percent=Booking.DATE_BOOKING_DISCOUNT_PERCENT if match else 0,
            booked_by=me,
            date=booking_date,
            time_slot=time_slot,
            party_size=party_size,
        )

        if match:
            Notification.objects.bulk_create([
                Notification(user=me, type="BOOKING_CONFIRMED", match=match, chat_id=match.chat_id),
                Notification(user=other_email, type="BOOKING_CONFIRMED", match=match, chat_id=match.chat_id),
            ])
            for email in (me, other_email):
                notify_user(email, {
                    "type": "BOOKING_CONFIRMED",
                    "cafe_name": cafe.name,
                    "date": date_str,
                    "time_slot": time_str,
                    "match_id": match.id,
                })

        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class MyBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user.username.lower()
        my_match_ids = Match.objects.filter(Q(user_a=me) | Q(user_b=me)).values_list("id", flat=True)
        bookings = Booking.objects.filter(
            Q(booked_by=me) | Q(match_id__in=my_match_ids)
        ).select_related("cafe").distinct()
        return Response(BookingSerializer(bookings, many=True).data)


class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        me = request.user.username.lower()
        try:
            booking = Booking.objects.select_related("match", "cafe").get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        is_participant = booking.booked_by == me or (
            booking.match and me in (booking.match.user_a, booking.match.user_b)
        )
        if not is_participant:
            return Response({"error": "Not your booking"}, status=status.HTTP_403_FORBIDDEN)

        if booking.status != "confirmed":
            return Response({"error": "Booking is already cancelled or completed"}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "cancelled"
        booking.save(update_fields=["status"])

        if booking.match:
            other_email = booking.match.user_b if booking.match.user_a == me else booking.match.user_a
            Notification.objects.create(
                user=other_email, type="BOOKING_CANCELLED", match=booking.match, chat_id=booking.match.chat_id
            )
            notify_user(other_email, {
                "type": "BOOKING_CANCELLED",
                "cafe_name": booking.cafe.name,
                "date": str(booking.date),
            })

        return Response(BookingSerializer(booking).data)


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN
# ─────────────────────────────────────────────────────────────────────────────

class AdminCafeViewSet(viewsets.ModelViewSet):
    permission_classes = [HasSectionPermission]
    serializer_class = CafeAdminSerializer
    queryset = Cafe.objects.all()
    section_id = "cafes"
    required_level = "view"

    def get_queryset(self):
        queryset = Cafe.objects.all()
        active = self.request.query_params.get("active")
        if active is not None:
            queryset = queryset.filter(active=active.lower() == "true")
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(area__icontains=search))
        return queryset.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        self.required_level = "edit"
        self.check_permissions(request)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        self.required_level = "edit"
        self.check_permissions(request)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self.required_level = "edit"
        self.check_permissions(request)
        return super().destroy(request, *args, **kwargs)


class AdminCafePartnerApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [HasSectionPermission]
    serializer_class = CafePartnerApplicationSerializer
    queryset = CafePartnerApplication.objects.all()
    section_id = "cafes"
    required_level = "view"

    def get_queryset(self):
        queryset = CafePartnerApplication.objects.all()
        status_filter = self.request.query_params.get("status")
        if status_filter and status_filter != "all":
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by("-created_at")


class ApproveCafeApplicationView(APIView):
    permission_classes = [HasSectionPermission]
    section_id = "cafes"
    required_level = "edit"

    def post(self, request, pk):
        try:
            application = CafePartnerApplication.objects.get(pk=pk)
        except CafePartnerApplication.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)

        if application.status != "pending":
            return Response({"error": "Application already reviewed"}, status=status.HTTP_400_BAD_REQUEST)

        cafe = Cafe.objects.create(
            name=application.business_name,
            cuisine=application.cuisine,
            description=application.description,
            area=application.area,
            address=application.address,
            price_for_two=application.price_for_two,
            pure_veg=application.pure_veg,
            serves_alcohol=application.serves_alcohol,
            rooftop=application.rooftop,
            has_table_booking=application.has_table_booking,
            partner_name=application.contact_name,
            partner_email=application.contact_email,
            partner_phone=application.contact_phone,
            is_verified=True,
            active=True,
        )

        application.status = "approved"
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.resulting_cafe = cafe
        application.admin_notes = request.data.get("admin_notes", "")
        application.save()

        return Response({
            "message": "Application approved and cafe listed",
            "application": CafePartnerApplicationSerializer(application).data,
            "cafe": CafeAdminSerializer(cafe).data,
        })


class RejectCafeApplicationView(APIView):
    permission_classes = [HasSectionPermission]
    section_id = "cafes"
    required_level = "edit"

    def post(self, request, pk):
        try:
            application = CafePartnerApplication.objects.get(pk=pk)
        except CafePartnerApplication.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)

        if application.status != "pending":
            return Response({"error": "Application already reviewed"}, status=status.HTTP_400_BAD_REQUEST)

        application.status = "rejected"
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.admin_notes = request.data.get("admin_notes", "")
        application.save()

        return Response({
            "message": "Application rejected",
            "application": CafePartnerApplicationSerializer(application).data,
        })


class AdminBookingViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [HasSectionPermission]
    serializer_class = BookingSerializer
    queryset = Booking.objects.all()
    section_id = "cafes"
    required_level = "view"

    def get_queryset(self):
        queryset = Booking.objects.select_related("cafe").all()
        status_filter = self.request.query_params.get("status")
        if status_filter and status_filter != "all":
            queryset = queryset.filter(status=status_filter)
        cafe_id = self.request.query_params.get("cafe_id")
        if cafe_id:
            queryset = queryset.filter(cafe_id=cafe_id)
        return queryset.order_by("-date", "-time_slot")
