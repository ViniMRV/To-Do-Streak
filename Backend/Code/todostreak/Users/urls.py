from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

app_name = "users"

urlpatterns = [
    path("register/", views.RegisterUserView.as_view(), name="register"),
    path("activate/<str:token>/", views.ActivateUserView.as_view(), name="activate"),
    path("login/", views.LoginUserView.as_view(), name="login"),
    path("me/", views.UserMeView.as_view(), name="me"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", views.LogoutUserView.as_view(), name="logout"),
    path("password-reset/", views.UserPasswordResetView.as_view(), name="password_reset"),
    path("password-reset-confirm/<str:uidb64>/<str:token>/", views.UserPasswordResetConfirmView.as_view(), name="password_reset_confirm"),
]
