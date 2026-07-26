from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CafeListView,
    CafeDetailView,
    CafeAvailabilityView,
    CafePartnerApplyView,
    BookCafeView,
    MyBookingsView,
    CancelBookingView,
    AdminCafeViewSet,
    AdminCafePartnerApplicationViewSet,
    ApproveCafeApplicationView,
    RejectCafeApplicationView,
    AdminBookingViewSet,
)

router = DefaultRouter()
router.register(r"admin/cafes", AdminCafeViewSet, basename="admin-cafes")
router.register(r"admin/cafe-applications", AdminCafePartnerApplicationViewSet, basename="admin-cafe-applications")
router.register(r"admin/cafe-bookings", AdminBookingViewSet, basename="admin-cafe-bookings")

urlpatterns = [
    # Public
    path("cafes/", CafeListView.as_view(), name="cafe-list"),
    path("cafes/apply/", CafePartnerApplyView.as_view(), name="cafe-partner-apply"),
    path("cafes/<int:pk>/", CafeDetailView.as_view(), name="cafe-detail"),
    path("cafes/<int:pk>/availability/", CafeAvailabilityView.as_view(), name="cafe-availability"),

    # Authenticated (dating-app users)
    path("cafes/<int:pk>/book/", BookCafeView.as_view(), name="cafe-book"),
    path("bookings/mine/", MyBookingsView.as_view(), name="bookings-mine"),
    path("bookings/<int:pk>/cancel/", CancelBookingView.as_view(), name="booking-cancel"),

    # Admin
    path("admin/cafe-applications/<int:pk>/approve/", ApproveCafeApplicationView.as_view(), name="cafe-application-approve"),
    path("admin/cafe-applications/<int:pk>/reject/", RejectCafeApplicationView.as_view(), name="cafe-application-reject"),
    path("", include(router.urls)),
]
