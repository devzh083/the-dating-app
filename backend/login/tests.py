import hashlib
import hmac

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from admin_panel.models import PremiumPlan
from profiles.models import UserProfile
from login.models import Like, Match
from login.views import profile_similarity


class RegisterLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_creates_user_with_populated_profile(self):
        resp = self.client.post(
            "/api/register/",
            {"username": "alice@example.com", "password": "TestPass123!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="alice@example.com")
        self.assertEqual(user.email, "alice@example.com")

        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.email, "alice@example.com")
        self.assertFalse(profile.email_verified)

    def test_login_requires_otp_for_unverified_email(self):
        self.client.post(
            "/api/register/",
            {"username": "bob@example.com", "password": "TestPass123!"},
            format="json",
        )
        resp = self.client.post(
            "/api/login/",
            {"username": "bob@example.com", "password": "TestPass123!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(resp.data["user"]["is_verified"])

    def test_login_reports_verified_once_email_verified(self):
        self.client.post(
            "/api/register/",
            {"username": "carol@example.com", "password": "TestPass123!"},
            format="json",
        )
        user = User.objects.get(username="carol@example.com")
        UserProfile.objects.filter(user=user).update(email_verified=True)

        resp = self.client.post(
            "/api/login/",
            {"username": "carol@example.com", "password": "TestPass123!"},
            format="json",
        )
        self.assertTrue(resp.data["user"]["is_verified"])

    def test_login_rejects_wrong_password(self):
        self.client.post(
            "/api/register/",
            {"username": "dave@example.com", "password": "TestPass123!"},
            format="json",
        )
        resp = self.client.post(
            "/api/login/",
            {"username": "dave@example.com", "password": "WrongPassword!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class LikeAndMatchTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_a = User.objects.create_user(
            username="a@example.com", email="a@example.com", password="pw12345678"
        )
        self.user_b = User.objects.create_user(
            username="b@example.com", email="b@example.com", password="pw12345678"
        )

    def _login(self, username):
        resp = self.client.post(
            "/api/login/", {"username": username, "password": "pw12345678"}, format="json"
        )
        return resp.data["access"]

    def test_mutual_like_creates_match(self):
        token_a = self._login("a@example.com")
        token_b = self._login("b@example.com")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_a}")
        resp = self.client.post("/api/like/", {"to_email": "b@example.com"}, format="json")
        self.assertEqual(resp.data["status"], "liked")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_b}")
        resp = self.client.post("/api/like/", {"to_email": "a@example.com"}, format="json")
        self.assertEqual(resp.data["status"], "matched")

        self.assertTrue(
            Match.objects.filter(user_a="a@example.com", user_b="b@example.com").exists()
        )

    def test_like_cannot_be_spoofed_as_another_user(self):
        """Regression test: from_email must come from the authenticated session,
        not client-supplied data — otherwise anyone could like on someone else's behalf."""
        token_a = self._login("a@example.com")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_a}")

        # Attacker (logged in as user_a) tries to impersonate user_b's like.
        self.client.post(
            "/api/like/",
            {"to_email": "a@example.com", "from_email": "b@example.com"},
            format="json",
        )

        # The like must be recorded as coming from user_a (the real
        # authenticated user), not from the spoofed from_email.
        self.assertFalse(Like.objects.filter(from_email="b@example.com").exists())

    def test_cannot_like_self(self):
        token_a = self._login("a@example.com")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_a}")
        resp = self.client.post("/api/like/", {"to_email": "a@example.com"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class ProfileSimilarityTests(TestCase):
    def test_identical_profiles_score_highest(self):
        profile = {
            "sexual_orientation": ["man"],
            "relationship_goals": ["long-term"],
            "preferred_connect": ["texting"],
            "response_pace": "fast",
            "drinking": "socially",
            "smoking": "never",
            "workout": "often",
            "pets": "loves",
            "interests": ["music", "travel"],
        }
        score = profile_similarity(profile, profile, None, None)
        # Without distance data the distance_soft weight (5%) isn't applied at
        # all, so a perfect match on everything else caps at 0.95, not 1.0.
        self.assertAlmostEqual(score, 0.95, places=5)

    def test_completely_different_profiles_score_lower(self):
        a = {
            "sexual_orientation": ["man"], "relationship_goals": ["long-term"],
            "preferred_connect": ["texting"], "response_pace": "fast",
            "drinking": "socially", "smoking": "never", "workout": "often", "pets": "loves",
            "interests": ["music"],
        }
        b = {
            "sexual_orientation": ["woman"], "relationship_goals": ["casual"],
            "preferred_connect": ["calls"], "response_pace": "slow",
            "drinking": "never", "smoking": "regularly", "workout": "never", "pets": "allergic",
            "interests": ["sports"],
        }
        score = profile_similarity(a, b, None, None)
        self.assertLess(score, 0.3)


class PaymentSignatureTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="payer@example.com", email="payer@example.com", password="pw12345678"
        )
        self.plan = PremiumPlan.objects.create(
            plan_id="monthly", name="Monthly", duration="1 Month",
            plan_type="monthly", price=299,
        )
        resp = self.client.post(
            "/api/login/", {"username": "payer@example.com", "password": "pw12345678"}, format="json"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")

    def _sign(self, order_id, payment_id):
        from django.conf import settings
        body = f"{order_id}|{payment_id}"
        return hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(), body.encode(), hashlib.sha256
        ).hexdigest()

    def test_valid_signature_activates_premium(self):
        signature = self._sign("order_123", "pay_123")
        resp = self.client.post(
            "/api/verify-payment/",
            {
                "razorpay_order_id": "order_123",
                "razorpay_payment_id": "pay_123",
                "razorpay_signature": signature,
                "plan_id": "monthly",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(UserProfile.objects.get(user=self.user).premium)

    def test_invalid_signature_is_rejected(self):
        resp = self.client.post(
            "/api/verify-payment/",
            {
                "razorpay_order_id": "order_123",
                "razorpay_payment_id": "pay_123",
                "razorpay_signature": "not-the-real-signature",
                "plan_id": "monthly",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(UserProfile.objects.get(user=self.user).premium)


class DeleteAccountTests(TestCase):
    def test_delete_account_removes_user_and_shared_match_data(self):
        client = APIClient()
        User.objects.create_user(username="x@example.com", email="x@example.com", password="pw12345678")
        User.objects.create_user(username="y@example.com", email="y@example.com", password="pw12345678")

        token_x = client.post(
            "/api/login/", {"username": "x@example.com", "password": "pw12345678"}, format="json"
        ).data["access"]
        token_y = client.post(
            "/api/login/", {"username": "y@example.com", "password": "pw12345678"}, format="json"
        ).data["access"]

        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_x}")
        client.post("/api/like/", {"to_email": "y@example.com"}, format="json")
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_y}")
        client.post("/api/like/", {"to_email": "x@example.com"}, format="json")

        self.assertTrue(Match.objects.filter(user_a="x@example.com", user_b="y@example.com").exists())

        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_x}")
        resp = client.post("/api/account/delete/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        self.assertFalse(User.objects.filter(username="x@example.com").exists())
        self.assertFalse(Match.objects.filter(user_a="x@example.com", user_b="y@example.com").exists())

        # y's account survives, just without the now-deleted match/chat.
        self.assertTrue(User.objects.filter(username="y@example.com").exists())
