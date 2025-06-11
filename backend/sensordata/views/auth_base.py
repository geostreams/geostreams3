from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings


# Base class for viewsets that enforces authentication for POST and DELETE requests
class AuthEnforcedModelViewSet(viewsets.ModelViewSet):
    """
    A base ModelViewSet that enforces authentication for POST and DELETE requests.
    GET requests are allowed without authentication.
    """

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        POST and DELETE requests require the user to be authenticated,
        while GET requests are open to any user (AllowAny).

        Can be disabled entirely by setting DISABLE_AUTH=True in settings.
        """
        # Check if authentication is disabled via environment variable
        if getattr(settings, "DISABLE_AUTH", False):
            self.permission_classes = [AllowAny]
        elif self.request.method in ["POST", "DELETE"]:
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [AllowAny]
        return super().get_permissions()
