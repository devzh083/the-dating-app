from django.conf import settings
from django.db import models
from admin_panel.models import PremiumPlan


class Like(models.Model):
    from_email = models.EmailField()
    to_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("from_email", "to_email")

class Chat(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    last_message = models.TextField(null=True, blank=True)
    last_message_at = models.DateTimeField(null=True, blank=True)


class ChatParticipant(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    email = models.EmailField()

    class Meta:
        unique_together = ("chat", "email")

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    sender = models.EmailField()
    receiver = models.EmailField()
    content = models.TextField()
    type = models.CharField(max_length=20, default="text")
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

class Match(models.Model):
    user_a = models.EmailField()
    user_b = models.EmailField()
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default="active")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user_a", "user_b")

class BlockedUser(models.Model):
    blocker = models.EmailField(db_index=True)
    blocked = models.EmailField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("blocker", "blocked")


class Payment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plan = models.ForeignKey(PremiumPlan, on_delete=models.PROTECT)
    razorpay_order_id = models.CharField(max_length=100)
    razorpay_payment_id = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    user = models.EmailField()  # receiver
    type = models.CharField(max_length=50)
    match = models.ForeignKey(
        Match,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    chat_id = models.IntegerField(null=True, blank=True)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]