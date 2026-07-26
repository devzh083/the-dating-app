from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from login.models import Match, Chat, ChatParticipant
from cafes.models import Cafe, Booking


def make_match(user_a_email, user_b_email):
    chat = Chat.objects.create()
    ChatParticipant.objects.bulk_create([
        ChatParticipant(chat=chat, email=user_a_email),
        ChatParticipant(chat=chat, email=user_b_email),
    ])
    return Match.objects.create(user_a=user_a_email, user_b=user_b_email, chat=chat)


class CafeBookingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_a = User.objects.create_user(
            username="a@example.com", email="a@example.com", password="pw12345678"
        )
        self.user_b = User.objects.create_user(
            username="b@example.com", email="b@example.com", password="pw12345678"
        )
        self.user_c = User.objects.create_user(
            username="c@example.com", email="c@example.com", password="pw12345678"
        )
        self.match = make_match("a@example.com", "b@example.com")

        self.cafe = Cafe.objects.create(
            name="Test Cafe", area="Test Area", price_for_two=1000,
            is_verified=True, active=True, total_tables=2,
            opening_time="11:00", closing_time="22:00",
        )
        self.tomorrow = (date.today() + timedelta(days=1)).isoformat()

    def _token(self, username):
        resp = self.client.post(
            "/api/login/", {"username": username, "password": "pw12345678"}, format="json"
        )
        return resp.data["access"]

    def test_solo_booking_has_no_discount(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('a@example.com')}")
        resp = self.client.post(
            f"/api/cafes/{self.cafe.id}/book/",
            {"date": self.tomorrow, "time_slot": "19:00", "party_size": 2},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["booking_type"], "solo")
        self.assertEqual(resp.data["discount_percent"], 0)
        self.assertIsNone(resp.data["match"])

    def test_date_booking_with_match_gets_discount(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('a@example.com')}")
        resp = self.client.post(
            f"/api/cafes/{self.cafe.id}/book/",
            {"match_id": self.match.id, "date": self.tomorrow, "time_slot": "19:00", "party_size": 2},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["booking_type"], "date")
        self.assertEqual(resp.data["discount_percent"], Booking.DATE_BOOKING_DISCOUNT_PERCENT)
        self.assertEqual(resp.data["discounted_price_for_two"], 800)  # 1000 - 20%

    def test_cannot_book_a_date_with_a_stranger(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('c@example.com')}")
        resp = self.client.post(
            f"/api/cafes/{self.cafe.id}/book/",
            {"match_id": self.match.id, "date": self.tomorrow, "time_slot": "19:00", "party_size": 2},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_availability_decrements_and_blocks_when_full(self):
        # Cafe has 2 tables — book both, third should be rejected.
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('a@example.com')}")
        self.client.post(
            f"/api/cafes/{self.cafe.id}/book/",
            {"date": self.tomorrow, "time_slot": "19:00", "party_size": 2},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('b@example.com')}")
        self.client.post(
            f"/api/cafes/{self.cafe.id}/book/",
            {"date": self.tomorrow, "time_slot": "19:00", "party_size": 2},
            format="json",
        )

        avail = self.client.get(f"/api/cafes/{self.cafe.id}/availability/?date={self.tomorrow}")
        slot_19 = next(s for s in avail.data["slots"] if s["time"] == "19:00")
        self.assertEqual(slot_19["remaining"], 0)
        self.assertFalse(slot_19["available"])

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('c@example.com')}")
        resp = self.client.post(
            f"/api/cafes/{self.cafe.id}/book/",
            {"date": self.tomorrow, "time_slot": "19:00", "party_size": 2},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_either_matched_user_can_cancel_a_date_booking(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('a@example.com')}")
        booking_resp = self.client.post(
            f"/api/cafes/{self.cafe.id}/book/",
            {"match_id": self.match.id, "date": self.tomorrow, "time_slot": "19:00", "party_size": 2},
            format="json",
        )
        booking_id = booking_resp.data["id"]

        # Bob (the other match participant, who didn't make the booking) cancels it.
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('b@example.com')}")
        cancel_resp = self.client.post(f"/api/bookings/{booking_id}/cancel/")
        self.assertEqual(cancel_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(cancel_resp.data["status"], "cancelled")

    def test_stranger_cannot_cancel_someone_elses_booking(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('a@example.com')}")
        booking_resp = self.client.post(
            f"/api/cafes/{self.cafe.id}/book/",
            {"date": self.tomorrow, "time_slot": "19:00", "party_size": 2},
            format="json",
        )
        booking_id = booking_resp.data["id"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('c@example.com')}")
        resp = self.client.post(f"/api/bookings/{booking_id}/cancel/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
