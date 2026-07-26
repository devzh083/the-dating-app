from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date


class UserProfile(models.Model):
    # ------------------------------------------------------------------
    # Identity (Single source of truth)
    # ------------------------------------------------------------------
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
        primary_key=True
    )

    # Cached email (NON-authoritative, read-only mirror)
    email = models.EmailField(null=True, blank=True, unique=True)


    # ------------------------------------------------------------------
    # Step 1: Basic Info
    # ------------------------------------------------------------------
    first_name = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    gender = models.CharField(max_length=50, blank=True)
    show_gender = models.BooleanField(default=True)

    interested_in = models.JSONField(default=list, blank=True)

    # ------------------------------------------------------------------
    # Step 2: Distance
    # ------------------------------------------------------------------
    distance = models.IntegerField(default=25)
    strict_distance = models.BooleanField(default=False)

    # ------------------------------------------------------------------
    # Step 3: Lifestyle
    # ------------------------------------------------------------------
    drinking = models.CharField(max_length=50, blank=True)
    smoking = models.CharField(max_length=50, blank=True)
    workout = models.CharField(max_length=50, blank=True)
    pets = models.CharField(max_length=50, blank=True)

    # ------------------------------------------------------------------
    # Step 4: Communication
    # ------------------------------------------------------------------
    communication_style = models.JSONField(default=list, blank=True)
    response_pace = models.CharField(max_length=100, blank=True)

    # ------------------------------------------------------------------
    # Step 5: Interests
    # ------------------------------------------------------------------
    interests = models.JSONField(default=list, blank=True)

    # ------------------------------------------------------------------
    # Step 6: Location
    # ------------------------------------------------------------------
    location = models.CharField(max_length=200, blank=True)
    use_current_location = models.BooleanField(default=False)

    # ------------------------------------------------------------------
    # Step 7: Photos
    # ------------------------------------------------------------------
    photos = models.JSONField(default=list, blank=True)

    # ------------------------------------------------------------------
    # Step 8: Bio
    # ------------------------------------------------------------------
    bio = models.TextField(max_length=500, blank=True)
    conversation_starter = models.CharField(max_length=300, blank=True)

    # ------------------------------------------------------------------
    # Step 9: Social Accounts
    # ------------------------------------------------------------------
    social_accounts = models.JSONField(default=dict, blank=True)

    # ------------------------------------------------------------------
    # Admin / System Fields
    # ------------------------------------------------------------------
    STATUS_CHOICES = [
        ("online", "Online"),
        ("away", "Away"),
        ("offline", "Offline"),
    ]

    ACCOUNT_STATUS_CHOICES = [
        ("active", "Active"),
        ("suspended", "Suspended"),
        ("banned", "Banned"),
        ("pending", "Pending"),
    ]

    phone = models.CharField(max_length=20, blank=True)
    age = models.IntegerField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="offline"
    )

    account_status = models.CharField(
        max_length=20,
        choices=ACCOUNT_STATUS_CHOICES,
        default="active"
    )

    join_date = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(default=timezone.now)
    active_time = models.IntegerField(default=0)

    matches = models.IntegerField(default=0)
    messages = models.IntegerField(default=0)
    photo_count = models.IntegerField(default=0)
    reports = models.IntegerField(default=0)

    profile_complete = models.BooleanField(default=False)
    verified = models.BooleanField(default=False)
    premium = models.BooleanField(default=False)

    # Email verification (OTP-based login gate) — distinct from `verified`
    # above, which is an admin-granted identity/photo verification badge.
    email_verified = models.BooleanField(default=False)

    # Onboarding progress tracking
    onboarding_step = models.IntegerField(default=0)
    completion_percentage = models.FloatField(default=0.0)

    # ------------------------------------------------------------------
    # Metadata
    # ------------------------------------------------------------------
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_complete = models.BooleanField(default=False)

    # ------------------------------------------------------------------
    # Meta
    # ------------------------------------------------------------------
    class Meta:
        db_table = "user_profiles"
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                name="one_profile_per_user"
            )
        ]

    # ------------------------------------------------------------------
    # String representation
    # ------------------------------------------------------------------
    def __str__(self):
        return f"{self.user.username}'s Profile"

    # ------------------------------------------------------------------
    # Save override (CRITICAL LOGIC)
    # ------------------------------------------------------------------
    def save(self, *args, **kwargs):
        # ------------------------------------------------------------------
        # 1. Sync cached email from User (single source of truth)
        # ------------------------------------------------------------------
        if self.user and self.user.email:
            self.email = self.user.email.lower().strip()

        # ------------------------------------------------------------------
        # 2. Ensure social_accounts is always a dict
        # ------------------------------------------------------------------
        if self.social_accounts is None:
            self.social_accounts = {}

        # ------------------------------------------------------------------
        # 3. Calculate age from DOB
        # ------------------------------------------------------------------
        if self.date_of_birth:
            today = date.today()
            self.age = (
                today.year
                - self.date_of_birth.year
                - (
                    (today.month, today.day)
                    < (self.date_of_birth.month, self.date_of_birth.day)
                )
            )

        # ------------------------------------------------------------------
        # 4. Update photo count
        # ------------------------------------------------------------------
        if isinstance(self.photos, list):
            self.photo_count = len(self.photos)

        # ------------------------------------------------------------------
        # 5. Auto-check profile completeness
        # ------------------------------------------------------------------
        self.is_complete = all([
            bool(self.first_name),
            bool(self.date_of_birth),
            bool(self.gender),
            bool(self.location),
            bool(self.photos) and isinstance(self.photos, list)
        ])

        self.profile_complete = self.is_complete

        super().save(*args, **kwargs)
