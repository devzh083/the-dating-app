from rest_framework import serializers
from .models import Match, Message, Notification
from admin_panel.models import UserReport
from django.contrib.auth.models import User

class MatchSerializer(serializers.ModelSerializer):
    partner = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['id', 'partner', 'created_at']

    def get_partner(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        
        # Find the other user in the match
        partner = obj.users.exclude(id=request.user.id).first()
        
        if partner and hasattr(partner, 'profile'):
            # Safe access to profile data
            photos = partner.profile.photos
            photo_url = None
            
            if photos and isinstance(photos, list) and len(photos) > 0:
                photo_url = photos[0]
            elif photos and isinstance(photos, str):
                photo_url = photos

            return {
                'id': partner.id,
                'name': partner.profile.first_name,
                'photo': photo_url,
                'bio': partner.profile.bio
            }
        return None

class MessageSerializer(serializers.ModelSerializer):
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'is_me', 'is_read']

    def get_is_me(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.sender == request.user
        return False
    
class CreateUserReportSerializer(serializers.Serializer):
    chat_id = serializers.IntegerField()
    reason = serializers.CharField()
    description = serializers.CharField(required=False)



class NotificationSerializer(serializers.ModelSerializer):
    match_id = serializers.IntegerField(source="match.id", read_only=True)
    other_user = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "match_id",
            "chat_id",
            "other_user",
            "is_read",
            "created_at",
        ]

    def get_other_user(self, obj):
        request = self.context.get("request")

        if not request or not obj.match:
            return None

        email = request.user.email.lower()

        if obj.match.user_a == email:
            return obj.match.user_b
        return obj.match.user_a
