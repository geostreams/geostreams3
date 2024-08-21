from django.urls import path
from .views import KeycloakLoginView, KeycloakSignupView, ProtectedView

urlpatterns = [
    path("login/", KeycloakLoginView.as_view(), name="keycloak_login"),
    path("signup/", KeycloakSignupView.as_view(), name="keycloak_signup"),
    path("protected/", ProtectedView.as_view(), name="protected_view"),
]
