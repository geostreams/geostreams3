from django.urls import path
from .views import KeycloakLoginView, ProtectedView, GenerateAPIKeyView, UserProfileView

urlpatterns = [
    path("login/", KeycloakLoginView.as_view(), name="keycloak_login"),
    path("protected/", ProtectedView.as_view(), name="protected_view"),
    path("userprofile/", UserProfileView.as_view(), name="user-profile"),
    path("generate-api-key/", GenerateAPIKeyView.as_view(), name="generate-api-key"),
]
