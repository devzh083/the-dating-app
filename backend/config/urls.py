from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from admin_panel.views import (
    public_premium_plans, 
    public_premium_features,
    public_expert_tips,
    public_footer_data,
    ValidatePromoCodeView, 
    RedeemPromoCodeView,   
    ApprovedReviewsView,  
    SubmitReviewView, 
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # ==========================================
    # ✅ PUBLIC ENDPOINTS (no auth required or basic auth only)
    # ==========================================
    
    # ✅ Promo Code Endpoints (with multi-auth support: JWT + Token + Session)
    path('api/promo/validate/', ValidatePromoCodeView.as_view(), name='validate-promo-code'),
    path('api/promo/redeem/', RedeemPromoCodeView.as_view(), name='redeem-promo-code'),
    
    # Premium & Features
    path('api/premium/plans/', public_premium_plans, name='public-premium-plans'),
    path('api/premium/features/', public_premium_features, name='public-premium-features'),
    path('api/expert-tips/', public_expert_tips, name='public-expert-tips'),
    
    # Reviews (public endpoints)
    path('api/reviews/approved/', ApprovedReviewsView.as_view(), name='public-approved-reviews'),
    path('api/reviews/submit/', SubmitReviewView.as_view(), name='public-submit-review'),    

    # Footer
    path('api/footer/', public_footer_data, name='public-footer-data'), 
    
    # ==========================================
    # APP-SPECIFIC API ROUTES
    # ==========================================
    
    # Registered before login.urls: login.urls has a catch-all
    # `profile/<path:email>/` route under the same `api/` prefix, which would
    # otherwise swallow requests meant for these fixed profiles.urls paths.
    path('api/profile/', include('profiles.urls')),

    # Cafes/bookings (public listing, user booking, admin CRUD)
    path('api/', include('cafes.urls')),

    # All login app APIs under /api/
    path("api/", include("login.urls")),

    # Admin panel (admin-only endpoints)
    path('api/admin/', include('admin_panel.urls')),  

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)