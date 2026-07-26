from decimal import Decimal
import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser

from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.shortcuts import redirect
from django.core.mail import send_mail
from django.core.cache import cache
from .models import Match, Like, Notification, Payment, Chat
from cafes.models import Booking

import hmac
import hashlib
from django.conf import settings
from django.db import transaction

import urllib.parse
import requests
import random
from django.db.models import Q
import string

from math import radians, sin, cos, asin, sqrt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from admin_panel.models import PremiumPlan, PromoCode, UserReport
from login.serializers import CreateUserReportSerializer, NotificationSerializer
from login.models import Match

from .models import BlockedUser

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


from .ws import notify_user

from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from login.mysql_managers import MySQLChatManager, MySQLLikeManager, MySQLMatchManager
from profiles.models import UserProfile
from profiles.serializers import UserProfileSerializer
from django.db.models import Q
from .razorpay_client import client


from .models_photos import UserPhoto  # <-- your ImageField model

User = get_user_model()

# ---------- HELPER: Fetch Premium Status from SQL ----------
def get_premium_status(user):
    """
    Helper to safely fetch premium status from the SQL UserProfile table.
    This bridges the gap between the profile data and SQL billing status.
    """
    if not user or not user.is_authenticated:
        return False
    try:
        profile = UserProfile.objects.get(user=user)
        return profile.premium
    except UserProfile.DoesNotExist:
        return False

# ---------- OTP helpers ----------
def generate_otp(length=6):
    digits = string.digits
    return "".join(random.choice(digits) for _ in range(length))


def send_otp_email(email, otp):
    subject = f"The Dating App: your sign-in code"
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER)
    
    # Format OTP digits with spaces (e.g., "1234" becomes "1 2 3 4")
    otp_digits = ' '.join(list(str(otp)))
    
    # ---------------- HTML TEMPLATE (Netflix-style) ----------------
    # Clean, minimal design with focus on the OTP code
    # Uses your brand colors: #0095E0 (Blue) -> #00C98B (Teal)
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Sign-In Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif; background-color: #ffffff;">
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; width: 100%;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto;">
                        
                        <tr>
                            <td style="padding: 0 0 30px 0; text-align: left;">
                                <h1 style="margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(90deg, #0095E0 0%, #00C98B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                                    The Dating App
                                </h1>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 0 0 30px 0;">
                                <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 700; line-height: 1.3;">
                                    Enter this code to sign in
                                </h2>
                                
                                <div style="margin: 30px 0; text-align: left;">
                                    <span style="display: inline-block; color: #000000; font-size: 48px; font-weight: 700; letter-spacing: 12px; padding: 20px 0;">
                                        {otp_digits}
                                    </span>
                                </div>

                                <p style="margin: 0 0 20px 0; color: #000000; font-size: 16px; line-height: 1.5;">
                                    Enter the code above on your device to sign in to The Dating App.
                                </p>

                                <p style="margin: 0 0 20px 0; color: #000000; font-size: 16px; line-height: 1.5;">
                                    This code will expire in <strong>5 minutes</strong>.
                                </p>

                                <p style="margin: 0 0 20px 0; color: #737373; font-size: 14px; line-height: 1.5;">
                                    If you didn't send this request, you can ignore this email or review your recent device activity.
                                </p>

                                <p style="margin: 0; color: #737373; font-size: 14px; line-height: 1.5;">
                                    To help security, please don't share this code with anyone.
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 20px 0 40px 0;">
                                <p style="margin: 0; color: #000000; font-size: 16px; font-weight: 600;">
                                    The Dating App team
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 20px 0 0 0; border-top: 1px solid #e6e6e6;">
                                <p style="margin: 0 0 15px 0; color: #737373; font-size: 13px; line-height: 1.6;">
                                    <a href="#" style="color: #0095E0; text-decoration: none;">Help Centre</a> | 
                                    <a href="#" style="color: #0095E0; text-decoration: none;">Terms of Use</a> | 
                                    <a href="#" style="color: #0095E0; text-decoration: none;">Privacy</a>
                                </p>
                                
                                <p style="margin: 0; color: #737373; font-size: 11px; line-height: 1.5;">
                                    This message was emailed to {email} by The Dating App.
                                </p>
                                
                                <p style="margin: 10px 0 0 0; color: #737373; font-size: 11px; line-height: 1.5;">
                                    Made with ❤️ in Hyderabad
                                </p>
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    # Create plain text version for older email clients
    plain_message = f"""
The Dating App

Enter this code to sign in

{otp_digits}

Enter the code above on your device to sign in to The Dating App.

This code will expire in 5 minutes.

If you didn't send this request, you can ignore this email or review your recent device activity.

To help security, please don't share this code with anyone.

The Dating App team

---
Help Centre | Terms of Use | Privacy

This message was emailed to {email} by The Dating App.
Made with ❤️ in Hyderabad
    """.strip()

    # Send the email
    send_mail(
        subject=subject,
        message=plain_message,
        from_email=from_email,
        recipient_list=[email],
        html_message=html_message
    )

    # Cache the OTP
    cache.set(f"login_otp_{email}", otp, timeout=300)

def is_blocked(sender, receiver):
    return BlockedUser.objects.filter(
        blocker=receiver,
        blocked=sender
    ).exists()


# ---------- Auth / Profile Views ----------


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"detail": "Username and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # `email` is set on the Django User (not just passed to UserProfile)
        # so UserProfile.save()'s own sync logic keeps `UserProfile.email`
        # populated on every future save, regardless of what any given
        # profile-update payload does or doesn't include.
        user = User.objects.create_user(username=username, email=username, password=password)

        UserProfile.objects.get_or_create(user=user, defaults={"email": username})

        return Response(
            {
                "message": "User created successfully",
                "user_id": user.id,
                "username": user.username,
                "is_verified": False,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    Normal username+password login (no OTP).
    Staff users should use /api/admin/login/ instead.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"detail": "Username and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # 🔥 NEW: If user is staff, they should use admin login endpoint
        if user.is_staff:
            return Response(
                {"detail": "Staff users must use admin login endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        email = user.username
        profile_obj, _ = UserProfile.objects.get_or_create(user=user, defaults={"email": email})
        profile = UserProfileSerializer(profile_obj).data

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": email,
                    "is_verified": profile_obj.email_verified,
                    "profile": profile,
                },
            },
            status=status.HTTP_200_OK,
        )


class ProfileDetailView(APIView):
    """Look up another user's profile by email (e.g. for the match modal)."""

    permission_classes = [AllowAny]

    def get(self, request, email):
        try:
            profile_obj = UserProfile.objects.get(email=email.lower())
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile = UserProfileSerializer(profile_obj).data
        return Response(profile, status=status.HTTP_200_OK)


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_CALLBACK_URL,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        url = f"{base_url}?{urllib.parse.urlencode(params)}"
        return Response({"auth_url": url}, status=status.HTTP_200_OK)


class GoogleCallbackView(APIView):
    """
    Handles Google OAuth callback, updates Firestore user,
    and redirects to frontend with JWT tokens.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_no_code")

        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_CALLBACK_URL,
            "grant_type": "authorization_code",
        }
        token_res = requests.post(token_url, data=token_data)
        token_json = token_res.json()
        google_access_token = token_json.get("access_token")
        if not google_access_token:
            return redirect(
                f"{settings.FRONTEND_URL}/login?error=oauth_no_tokens"
            )

        userinfo_res = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {google_access_token}"},
        )
        userinfo = userinfo_res.json()
        email = userinfo.get("email")
        name = userinfo.get("name")
        google_user_id = userinfo.get("sub")

        if not email:
            return redirect(
                f"{settings.FRONTEND_URL}/login?error=oauth_no_email"
            )

        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                "email": email,
                "first_name": name.split()[0] if name else "",
                "last_name": " ".join(name.split()[1:]) if name else "",
            },
        )

        # Google already verified this email address
        UserProfile.objects.update_or_create(
            user=user, defaults={"email": email, "email_verified": True}
        )

        refresh = RefreshToken.for_user(user)
        access_token_jwt = str(refresh.access_token)
        refresh_token_jwt = str(refresh)

        redirect_url = (
            f"{settings.FRONTEND_HOME_URL}"
            f"?access_token={urllib.parse.quote(access_token_jwt)}"
            f"&refresh_token={urllib.parse.quote(refresh_token_jwt)}"
            f"&email={urllib.parse.quote(email)}"
            f"&name={urllib.parse.quote(name or '')}"
            f"&google_id={urllib.parse.quote(google_user_id or '')}"
            f"&is_new_user={created}"
        )
        return redirect(redirect_url)


class AuthStatusView(APIView):
    """
    Returns whether the authenticated user already has a profile.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = request.user.username
        profile_obj = UserProfile.objects.filter(user=request.user).first()

        has_profile = bool(profile_obj and profile_obj.first_name)
        profile = UserProfileSerializer(profile_obj).data if profile_obj else {}

        return Response(
            {
                "email": email,
                "profile_exists": has_profile,
                "has_profile": has_profile,
                "is_verified": profile_obj.email_verified if profile_obj else False,
                "profile": profile,
            },
            status=status.HTTP_200_OK,
        )


# ---------- Photo Upload View ----------


class PhotoUploadView(APIView):
    """
    Accepts a multipart image file, stores it via MEDIA_ROOT/Cloudinary,
    and appends the public URL to the user's UserProfile.photos array.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response(
                {"detail": "No file uploaded"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        photo = UserPhoto.objects.create(user=request.user, image=file_obj)

        # Build absolute URL to serve in frontend: http://host/media/uploads/...
        url = request.build_absolute_uri(photo.url)

        profile_obj, _ = UserProfile.objects.get_or_create(
            user=request.user, defaults={"email": request.user.username}
        )
        photos = profile_obj.photos or []
        photos.append(url)
        profile_obj.photos = photos
        profile_obj.save()

        return Response({"url": url}, status=status.HTTP_201_CREATED)


# ---------- OTP Email Verification Endpoints ----------


class SendLoginOTPView(APIView):
    """
    Step 1: client sends { "username": "<email>" }
    Sends OTP to email if user exists and not verified.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        if not username:
            return Response(
                {"detail": "Username (email) required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile_obj = UserProfile.objects.filter(user=user).first()
        if profile_obj and profile_obj.email_verified:
            return Response(
                {"detail": "Email already verified. Use normal login."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp = generate_otp()
        send_otp_email(username, otp)

        return Response(
            {"message": "OTP sent to email"},
            status=status.HTTP_200_OK,
        )


class VerifyEmailOTPView(APIView):
    """
    Verify email after registration - marks user as verified
    """

    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        otp = request.data.get("otp")

        if not username or not otp:
            return Response(
                {"detail": "Username (email) and OTP are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cache_key = f"login_otp_{username}"
        saved_otp = cache.get(cache_key)

        if not saved_otp:
            return Response(
                {"detail": "OTP expired or not found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if str(saved_otp) != str(otp):
            return Response(
                {"detail": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cache.delete(cache_key)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        UserProfile.objects.update_or_create(
            user=user, defaults={"email": username, "email_verified": True}
        )

        return Response(
            {
                "message": "Email verified successfully",
                "user_id": user.id,
                "is_verified": True,
            },
            status=status.HTTP_200_OK,
        )


class VerifyLoginOTPView(APIView):
    """
    Step 2: client sends { "username": "<email>", "otp": "123456" }
    If OTP matches, returns JWT tokens and user data (for unverified users).
    """

    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        otp = request.data.get("otp")

        if not username or not otp:
            return Response(
                {"detail": "Username (email) and OTP are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cache_key = f"login_otp_{username}"
        saved_otp = cache.get(cache_key)

        if not saved_otp:
            return Response(
                {"detail": "OTP expired or not found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if str(saved_otp) != str(otp):
            return Response(
                {"detail": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cache.delete(cache_key)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile_obj = UserProfile.objects.filter(user=user).first()
        if profile_obj and profile_obj.email_verified:
            return Response(
                {"detail": "Email already verified. Use normal login."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = user.username
        profile_obj, _ = UserProfile.objects.update_or_create(
            user=user, defaults={"email": email, "email_verified": True}
        )

        refresh = RefreshToken.for_user(user)
        profile = UserProfileSerializer(profile_obj).data

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": email,
                    "is_verified": True,
                    "profile": profile,
                },
            },
            status=status.HTTP_200_OK,
        )

# views.py


# ----------------- helpers ----------------- #

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return R * c


def list_overlap(a, b):
    a = a or []
    b = b or []
    if not a or not b:
        return 0.0
    sa, sb = set(a), set(b)
    inter = len(sa & sb)
    union = len(sa | sb)
    return inter / union


def categorical_exact(a, b):
    return 1.0 if a and b and a == b else 0.0


def distance_similarity_km(distance_km, hard_limit_km):
    if not hard_limit_km or hard_limit_km <= 0:
        return 0.0
    return max(0.0, 1.0 - distance_km / hard_limit_km)


WEIGHTS = {
    "sexual_orientation": 0.30,
    "relationship_goals": 0.25,
    "communication":      0.15,
    "lifestyle":          0.15,
    "interests":          0.10,
    "distance_soft":      0.05,
}


def normalize_gender(label: str | None) -> str | None:
    if not label:
        return None

    label = label.lower().strip()

    if label in ("male", "man", "m"):
        return "man"

    if label in ("female", "woman", "f"):
        return "woman"

    return None  # reject invalid values


def normalize_interested_in(values):
    # Firestore: ["Men"] / ["Women"]
    out = []
    for v in values or []:
        v = v.lower()
        if v.startswith("men") or v.startswith("man"):
            out.append("man")
        elif v.startswith("women") or v.startswith("woman"):
            out.append("woman")
    return out


def normalize_mysql_profile(profile: UserProfile) -> dict:
    return {
        "email": profile.user.email or profile.user.username,
        "gender": normalize_gender(profile.gender),

        # lifestyle
        "drinking": profile.drinking,
        "smoking": profile.smoking,
        "workout": profile.workout,
        "pets": profile.pets,

        # communication
        "preferred_connect": profile.communication_style or [],
        "response_pace": profile.response_pace,

        # interests
        "interests": profile.interests or [],

        # distance
        "max_distance_km": profile.distance,

        # geo (future)
        "lat": None,
        "lng": None,
    }



def profile_similarity(u, v, distance_km, max_dist_km):
    s_orientation = list_overlap(u.get("sexual_orientation"), v.get("sexual_orientation"))
    s_goals = list_overlap(u.get("relationship_goals"), v.get("relationship_goals"))

    s_comm_pref = list_overlap(u.get("preferred_connect"), v.get("preferred_connect"))
    s_comm_pace = categorical_exact(u.get("response_pace"), v.get("response_pace"))
    s_comm = 0.7 * s_comm_pref + 0.3 * s_comm_pace

    s_lifestyle = (
        0.25 * categorical_exact(u.get("drinking"), v.get("drinking")) +
        0.25 * categorical_exact(u.get("smoking"), v.get("smoking")) +
        0.25 * categorical_exact(u.get("workout"), v.get("workout")) +
        0.25 * categorical_exact(u.get("pets"), v.get("pets"))
    )

    s_interests = list_overlap(u.get("interests"), v.get("interests"))

    # if no coords, ignore distance in score
    if distance_km is None or max_dist_km is None:
        s_dist = 0.0
        dist_weight = 0.0
    else:
        s_dist = distance_similarity_km(distance_km, max_dist_km)
        dist_weight = WEIGHTS["distance_soft"]

    base = (
        WEIGHTS["sexual_orientation"] * s_orientation +
        WEIGHTS["relationship_goals"] * s_goals +
        WEIGHTS["communication"]      * s_comm +
        WEIGHTS["lifestyle"]          * s_lifestyle +
        WEIGHTS["interests"]          * s_interests
    )
    return base + dist_weight * s_dist

def serialize_profile(profile: UserProfile) -> dict:
    return {
        "id": profile.user.id,
        "email": profile.user.email,
        "username": profile.user.username,
        "first_name": profile.first_name,
        "age": profile.age,
        "gender": profile.gender,
        "distance": profile.distance,
        "lifestyle": {
            "drinking": profile.drinking,
            "smoking": profile.smoking,
            "workout": profile.workout,
            "pets": profile.pets,
        },
        "communication": {
            "style": profile.communication_style,
            "response_pace": profile.response_pace,
        },
        "interests": profile.interests,
        "location": profile.location,
        "photos": profile.photos,
        "bio": profile.bio,
        "conversation_starter": profile.conversation_starter,
        "verified": profile.verified,
        "premium": profile.premium,
        "last_active": profile.last_active,
    }


class MatchRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # ----------------------------------
        # 1. Identify current user
        # ----------------------------------
        email = (request.user.email or request.user.username).lower()

        try:
            me_profile = UserProfile.objects.select_related("user").get(
                Q(user__email=email) | Q(user__username=email)
            )
        except UserProfile.DoesNotExist:
            return Response({"detail": "Profile not found"}, status=404)

        # ----------------------------------
        # 2. Gender preference
        # ----------------------------------
        my_gender = normalize_gender(me_profile.gender)

        if my_gender == "man":
            target_gender_db = "Woman"
        elif my_gender == "woman":
            target_gender_db = "Man"
        else:
            return Response({"detail": "Invalid gender"}, status=400)

        # ----------------------------------
        # 3. Fetch MATCHED users
        # ----------------------------------
        matched_qs = Match.objects.filter(
            Q(user_a=email) | Q(user_b=email),
            status="active"
        ).values_list("user_a", "user_b")

        matched_emails = set()
        for a, b in matched_qs:
            matched_emails.add(a.lower())
            matched_emails.add(b.lower())

        matched_emails.discard(email)

        # ----------------------------------
        # 4. Fetch LIKED users
        # ----------------------------------
        liked_emails = set(
            Like.objects.filter(from_email=email)
            .values_list("to_email", flat=True)
        )

        # ----------------------------------
        # 5. Fetch BLOCKED users
        # ----------------------------------
        blocked_emails = set(
            BlockedUser.objects.filter(blocker=email)
            .values_list("blocked", flat=True)
        )

        # ----------------------------------
        # 6. Build candidate queryset
        # ----------------------------------
        others = (
            UserProfile.objects
            .select_related("user")
            .filter(
                gender=target_gender_db,
                account_status="active"
            )
            .exclude(user=me_profile.user)
            .exclude(
                Q(user__email__in=matched_emails) |
                Q(user__username__in=matched_emails)
            )
            .exclude(
                Q(user__email__in=liked_emails) |
                Q(user__username__in=liked_emails)
            )
            .exclude(
                Q(user__email__in=blocked_emails) |
                Q(user__username__in=blocked_emails)
            )
        )

        # ----------------------------------
        # 7. Similarity scoring
        # ----------------------------------
        me_data = serialize_profile(me_profile)
        results = []

        for other_profile in others:
            other_data = serialize_profile(other_profile)

            similarity = profile_similarity(
                me_data,
                other_data,
                None,
                None
            )

            results.append({
                "similarity": round(similarity * 100, 1),
                "profile": other_data
            })

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return Response(results)


logger = logging.getLogger(__name__)




class LikeProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Derived from the authenticated session, not client input — a
        # client-supplied from_email would let anyone spoof likes as any user.
        from_email = request.user.username.lower()
        to_email = request.data.get("to_email")

        # -------------------------
        # Validation
        # -------------------------
        if not to_email:
            return Response(
                {"error": "to_email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        to_email = to_email.lower()

        if from_email == to_email:
            return Response(
                {"error": "You cannot like yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------
        # Send like (MySQL)
        # -------------------------
        result = MySQLLikeManager.send_like(
            from_email=from_email,
            to_email=to_email
        )

        # -------------------------
        # MATCH CREATED
        # -------------------------
        if result.get("status") == "matched":
            match_data = result.get("match")

            with transaction.atomic():
                match = Match.objects.select_for_update().get(
                    id=match_data["match_id"]
                )

                Notification.objects.bulk_create([
                    Notification(
                        user=from_email,
                        type="MATCH_CREATED",
                        match=match,
                        chat_id=match.chat_id
                    ),
                    Notification(
                        user=to_email,
                        type="MATCH_CREATED",
                        match=match,
                        chat_id=match.chat_id
                    )
                ])

            # Realtime push
            notify_user(from_email, {
                "type": "MATCH_CREATED",
                "match_id": match.id,
                "chat_id": match.chat_id,
                "me": from_email,
                "other": to_email
            })

            notify_user(to_email, {
                "type": "MATCH_CREATED",
                "match_id": match.id,
                "chat_id": match.chat_id,
                "me": to_email,
                "other": from_email
            })

            return Response(
                {
                    "status": "matched",
                    "match_id": match.id,
                    "chat_id": match.chat_id
                },
                status=status.HTTP_200_OK
            )

        # -------------------------
        # Like sent, no match yet
        # -------------------------
        return Response(
            {
                "status": result.get("status", "liked"),
                "message": "Like sent successfully"
            },
            status=status.HTTP_200_OK
        )


class MatchedChatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Use email consistently (matches Match.user_a / user_b)
        my_email = request.user.email.lower()

        matches = (
            Match.objects
            .filter(Q(user_a=my_email) | Q(user_b=my_email))
            .select_related("chat")
        )

        chats = []

        for match in matches:
            # Determine the other user's email
            other_email = (
                match.user_b if match.user_a == my_email else match.user_a
            )

            # -----------------------------
            # Block checks
            # -----------------------------
            is_blocked_by_me = BlockedUser.objects.filter(
                blocker=my_email,
                blocked=other_email
            ).exists()

            is_blocked_me = BlockedUser.objects.filter(
                blocker=other_email,
                blocked=my_email
            ).exists()

            # -----------------------------
            # Fetch profile from DB (profiles app)
            # -----------------------------
            profile = (
                UserProfile.objects
                .filter(email__iexact=other_email)
                .first()
            )


            chats.append({
                "chat_id": match.chat.id if match.chat else None,
                "match_id": match.id,
                "status": match.status,
                "created_at": match.created_at.isoformat(),

                "user_email": my_email,
                "email": other_email,

                # ✅ Django model attribute access (NOT .get)
                "first_name": profile.first_name if profile else None,

                # ✅ ImageField / FileField safe access
                # "profile_photo": (
                #     profile.profile_photo.url
                #     if profile and profile.profile_photo
                #     else None
                # ),

                "blocked_by_me": is_blocked_by_me,
                "blocked_me": is_blocked_me,
            })

        return Response(chats, status=status.HTTP_200_OK)


class ChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        user_email = request.user.username.lower()

        chat = MySQLChatManager.get_chat(chat_id)
        if not chat:
            return Response(
                {"detail": "Chat not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if user_email not in chat["participants"]:
            return Response(
                {"detail": "Forbidden"},
                status=status.HTTP_403_FORBIDDEN
            )

        messages = MySQLChatManager.get_messages(chat_id)

        return Response(messages, status=status.HTTP_200_OK)


class SendChatMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        sender = request.user.username.lower()
        content = request.data.get("content", "").strip()

        if not content:
            return Response(
                {"detail": "Message content cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST
            )

        chat = MySQLChatManager.get_chat(chat_id)
        if not chat or sender not in chat["participants"]:
            return Response(
                {"detail": "Forbidden"},
                status=status.HTTP_403_FORBIDDEN
            )

        receiver = next(e for e in chat["participants"] if e != sender)

        # 🚫 BLOCK CHECK — ABSOLUTE GATE
        if BlockedUser.objects.filter(
            Q(blocker=receiver, blocked=sender) |
            Q(blocker=sender, blocked=receiver)
        ).exists():
            return Response(
                {
                    "detail": "You cannot send messages to this user",
                    "blocked": True
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # 🔒 NO CODE ABOVE THIS LINE MUST HAVE SIDE EFFECTS

        # ✅ Safe to persist
        MySQLChatManager.add_message(
            chat_id=chat_id,
            sender=sender,
            receiver=receiver,
            content=content
        )

        # ✅ Safe to broadcast
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{chat_id}",
            {
                "type": "chat.message",
                "message": {
                    "sender": sender,
                    "receiver": receiver,
                    "content": content,
                }
            }
        )

        return Response({"status": "sent"}, status=status.HTTP_201_CREATED)


class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        blocker = request.user.username.lower()
        blocked = request.data.get("email")

        if not blocked:
            return Response(
                {"detail": "Blocked email required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        BlockedUser.objects.get_or_create(
            blocker=blocker,
            blocked=blocked.lower()
        )

        return Response({"status": "blocked"}, status=status.HTTP_200_OK)


class UnblockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        blocker = request.user.username.lower()
        blocked = request.data.get("email")

        BlockedUser.objects.filter(
            blocker=blocker,
            blocked=blocked.lower()
        ).delete()

        return Response({"status": "unblocked"}, status=status.HTTP_200_OK)


class MarkChatReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        user_email = request.user.username.lower()

        chat = MySQLChatManager.get_chat(chat_id)
        if not chat or user_email not in chat["participants"]:
            return Response(
                {"detail": "Forbidden"},
                status=status.HTTP_403_FORBIDDEN
            )

        MySQLChatManager.mark_read(
            chat_id=chat_id,
            receiver_email=user_email
        )

        return Response({"status": "ok"}, status=status.HTTP_200_OK)


class CreateUserReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateUserReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        chat_id = serializer.validated_data["chat_id"]

        match = Match.objects.filter(chat_id=chat_id).first()
        if not match:
            return Response(
                {"error": "Invalid chat"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # identify reported user via email
        if request.user.email == match.user_a:
            reported_email = match.user_b
        elif request.user.email == match.user_b:
            reported_email = match.user_a
        else:
            return Response(
                {"error": "You are not part of this chat"},
                status=status.HTTP_403_FORBIDDEN
            )

        reported_user = User.objects.get(email=reported_email)

        if reported_user == request.user:
            return Response(
                {"error": "You cannot report yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if UserReport.objects.filter(
            reporter=request.user,
            reported_user=reported_user,
            status="pending"
        ).exists():
            return Response(
                {"error": "You already reported this user"},
                status=status.HTTP_400_BAD_REQUEST
            )

        UserReport.objects.create(
            reporter=request.user,
            reported_user=reported_user,
            reason=serializer.validated_data["reason"],
            description=serializer.validated_data.get("description", "")
        )

        return Response(
            {"message": "Report submitted successfully"},
            status=status.HTTP_201_CREATED
        )


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        promo_code = request.data.get("promo_code")  # optional

        if not plan_id:
            return Response({"error": "plan_id required"}, status=400)

        plan = PremiumPlan.objects.filter(
            plan_id=plan_id,
            active=True
        ).first()

        if not plan:
            return Response({"error": "Invalid plan"}, status=400)

        amount = Decimal(plan.price)

        # 🔐 Promo logic (optional)
        if promo_code:
            promo = PromoCode.objects.filter(
                code=promo_code,
                active=True
            ).first()
            if promo:
                amount = promo.apply_discount(amount)

        order = client.order.create({
            "amount": int(amount * 100),  # paise
            "currency": "INR",
            "payment_capture": 1
        })

        return Response({
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": "INR",
            "razorpay_key": settings.RAZORPAY_KEY_ID,
            "plan_name": plan.name
        })


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data

        order_id = data.get("razorpay_order_id")
        payment_id = data.get("razorpay_payment_id")
        signature = data.get("razorpay_signature")

        body = f"{order_id}|{payment_id}"

        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()

        if expected_signature != signature:
            return Response({"error": "Invalid signature"}, status=400)

        # Activate premium in SQL (The source of truth)
        try:
            profile = UserProfile.objects.get(user=request.user)
            profile.premium = True
            profile.save()
        except UserProfile.DoesNotExist:
            pass  # Should generally not happen for authenticated users

        Payment.objects.create(
            user=request.user,
            plan=PremiumPlan.objects.get(plan_id=request.data.get("plan_id", "")),
            razorpay_order_id=order_id,
            razorpay_payment_id=payment_id,
            amount=0,  # optional
            status="SUCCESS"
        )

        return Response({"status": "success"})


# ✅✅✅ NEW NOTIFICATIONS VIEW ✅✅✅
class UserNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Get current user email
        user_email = request.user.email.lower()
        if not user_email:
            user_email = request.user.username.lower()

        # 2. Fetch ALL Matches where user is either A or B
        matches = Match.objects.filter(
            Q(user_a=user_email) | Q(user_b=user_email)
        ).order_by('-created_at')

        notifications = []

        for match in matches:
            # Determine the "other" person
            other_email = match.user_b if match.user_a == user_email else match.user_a
            
            # Fetch their profile details (name)
            other_profile = UserProfile.objects.filter(email=other_email).first()

            # Fallback name if profile is missing
            display_name = (other_profile.first_name if other_profile else None) or other_email.split('@')[0]
            
            notifications.append({
                "id": match.id,
                "type": "match",
                "user": display_name,
                "text": "It's a match! Start chatting now.",
                "created_at": match.created_at, 
                "chat_id": match.chat.id if match.chat else None
            })

        return Response(notifications, status=status.HTTP_200_OK)

class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notification_id = request.data.get("notification_id")
        email = request.user.email.lower()

        Notification.objects.filter(
            id=notification_id,
            user=email
        ).update(is_read=True)

        return Response({"status": "ok"}, status=200)

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = request.user.email.lower()

        notifications = Notification.objects.filter(
            user=email,
            is_read=False
        )

        return Response(NotificationSerializer(notifications, many=True).data)

class UnreadNotificationCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = request.user.email.lower()

        count = Notification.objects.filter(
            user=email,
            is_read=False
        ).count()

        return Response({"unread_count": count})

class MarkAllNotificationsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.user.email.lower()

        Notification.objects.filter(user=email, is_read=False).update(is_read=True)


class DeleteAccountView(APIView):
    """
    Permanently deletes the authenticated user's account and all associated
    data. Most dating-domain models (Like, BlockedUser, Match/Chat/Message,
    Notification) key off the user's email rather than a User FK, so they
    aren't reached by Django's cascade delete on User — they're cleaned up
    here explicitly. UserProfile, Payment, Review, UserReport, etc. do have
    real FKs to User and are cascaded automatically by user.delete().
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        email = user.username.lower()

        Like.objects.filter(Q(from_email=email) | Q(to_email=email)).delete()
        BlockedUser.objects.filter(Q(blocker=email) | Q(blocked=email)).delete()
        Notification.objects.filter(user=email).delete()

        # Deleting the Chat cascades to its Match, ChatParticipant, and
        # Message rows (and anything that FKs to that Match, e.g. Bookings).
        my_match_chat_ids = Match.objects.filter(
            Q(user_a=email) | Q(user_b=email)
        ).values_list("chat_id", flat=True)
        Chat.objects.filter(id__in=list(my_match_chat_ids)).delete()

        # Solo cafe bookings aren't tied to a Match, so they survive the step
        # above and need to be removed directly.
        Booking.objects.filter(booked_by=email).delete()

        user.delete()

        return Response({"message": "Account and all associated data deleted"}, status=status.HTTP_200_OK)

        return Response({"status": "all_read"})
