# ============================================
# profiles/views.py
# ============================================
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import uuid
import os
from .models import UserProfile
from .serializers import UserProfileSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    GET: Retrieve the authenticated user's profile
    """
    try:
        profile = UserProfile.objects.get(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response(
            {
                "detail": "Profile not found. Please complete onboarding.",
                "profile_exists": False
            },
            status=status.HTTP_404_NOT_FOUND
        )


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import UserProfile
from .serializers import UserProfileSerializer


@api_view(['POST', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def create_or_update_profile(request):
    """
    POST  : Create profile for authenticated user
    PUT   : Full update
    PATCH : Partial update
    """

    data = request.data.copy()

    # Handle camelCase → snake_case
    if 'socialAccounts' in data:
        data['social_accounts'] = data.pop('socialAccounts')

    try:
        # Existing profile
        profile = UserProfile.objects.get(user=request.user)
        serializer = UserProfileSerializer(
            profile,
            data=data,
            partial=(request.method == 'PATCH')
        )
        is_create = False

    except UserProfile.DoesNotExist:
        # New profile
        serializer = UserProfileSerializer(data=data)
        is_create = True

    if serializer.is_valid():
        # 🔐 Enforce authenticated ownership + email binding
        saved_profile = serializer.save(
            user=request.user,
            email=request.data.get("email")  # <-- CRITICAL
        )

        return Response(
            {
                "message": "Profile saved successfully",
                "profile": UserProfileSerializer(saved_profile).data
            },
            status=status.HTTP_201_CREATED if is_create else status.HTTP_200_OK
        )

    return Response(
        {
            "detail": "Invalid data",
            "errors": serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile(request):
    """
    DELETE: Remove the authenticated user's profile
    """
    try:
        profile = UserProfile.objects.get(user=request.user)
        profile.delete()
        return Response(
            {"message": "Profile deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    except UserProfile.DoesNotExist:
        return Response(
            {"detail": "Profile not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_status(request):
    """
    Check if the authenticated user has a complete profile
    """
    try:
        profile = UserProfile.objects.get(user=request.user)
        return Response({
            "profile_exists": True,
            "profile_complete": profile.is_complete,
            "profile": UserProfileSerializer(profile).data
        })
    except UserProfile.DoesNotExist:
        return Response({
            "profile_exists": False,
            "profile_complete": False,
            "profile": None
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_photo(request):
    """
    Upload a photo for the authenticated user's profile
    """
    try:
        if 'photo' not in request.FILES:
            return Response(
                {"detail": "No photo provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        photo = request.FILES['photo']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if photo.content_type not in allowed_types:
            return Response(
                {"detail": "Invalid file type. Only JPEG, PNG, and WebP are allowed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 5MB)
        if photo.size > 5 * 1024 * 1024:
            return Response(
                {"detail": "File too large. Maximum size is 5MB."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate unique filename
        ext = os.path.splitext(photo.name)[1]
        filename = f"profile_photos/{request.user.id}/{uuid.uuid4()}{ext}"
        
        # Save file
        path = default_storage.save(filename, ContentFile(photo.read()))
        
        # Get URL
        url = request.build_absolute_uri(default_storage.url(path))
        
        return Response(
            {
                "success": True,
                "url": url,
                "filename": filename
            },
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )