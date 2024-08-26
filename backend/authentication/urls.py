from django.urls import path
from .views import KeycloakLoginView, ProtectedView, GenerateAPIKeyView

urlpatterns = [
    path("login/", KeycloakLoginView.as_view(), name="keycloak_login"),
    path("protected/", ProtectedView.as_view(), name="protected_view"),
    path("generate-api-key/", GenerateAPIKeyView.as_view(), name="generate-api-key"),
]
