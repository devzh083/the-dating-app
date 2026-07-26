from django.urls import path
from . import views

urlpatterns = [
    # ========== AUTHENTICATION ==========
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("google-login/", views.GoogleLoginView.as_view(), name="google-login"),
    path("google-callback/", views.GoogleCallbackView.as_view(), name="google-callback"),

    # Look up another user's profile by email (used by the match modal)
    path("profile/<path:email>/", views.ProfileDetailView.as_view(), name="profile-detail"),

    # Photo upload
    path("photos/upload/", views.PhotoUploadView.as_view(), name="photo-upload"),

    # Auth status (existing vs new user)
    path("auth/status/", views.AuthStatusView.as_view(), name="auth-status"),

    # Account deletion (self-service, cascades all user data)
    path("account/delete/", views.DeleteAccountView.as_view(), name="account-delete"),

    # OTP login
    path("login/send-otp/", views.SendLoginOTPView.as_view(), name="send-login-otp"),
    path("login/verify-otp/", views.VerifyLoginOTPView.as_view(), name="verify-login-otp"),

    # ========== MATCHING ==========
    path("matches/", views.MatchRecommendationsView.as_view(), name="matches"),
    path("like/", views.LikeProfileView.as_view()),

    path("chats/matched/", views.MatchedChatsView.as_view(), name="matched-chats"),

    path("chats/<str:chat_id>/messages/", views.ChatMessagesView.as_view()),
    path("chats/<str:chat_id>/send/", views.SendChatMessageView.as_view()),
    path("chats/<str:chat_id>/read/", views.MarkChatReadView.as_view()),

    path("users/block/", views.BlockUserView.as_view()),
    path("users/unblock/", views.UnblockUserView.as_view()),

    path('reports/', views.CreateUserReportView.as_view(), name='create-report'),

    path("create-order/", views.CreateOrderView.as_view()),
    path("verify-payment/", views.VerifyPaymentView.as_view()),

    path(
        "notifications/",
        views.NotificationListView.as_view(),
        name="notification-list",
    ),
    path(
        "notifications/read/",
        views.MarkNotificationReadView.as_view(),
        name="notification-read",
    ),
    path(
        "notifications/read-all/",
        views.MarkAllNotificationsReadView.as_view(),
        name="notification-read-all",
    ),
    path(
        "notifications/unread-count/",
        views.UnreadNotificationCountView.as_view(),
        name="notification-unread-count",
    ),

]
