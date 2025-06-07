from django.urls import path
from .views import KeycloakLoginView, GenerateAPIKeyView, UserProfileView

urlpatterns = [
    path("login/", KeycloakLoginView.as_view(), name="keycloak_login"),
    path("userprofile/", UserProfileView.as_view(), name="user-profile"),
    path("generate-api-key/", GenerateAPIKeyView.as_view(), name="generate-api-key"),
    # path("protected/", ProtectedView.as_view(), name="protected"),
]
