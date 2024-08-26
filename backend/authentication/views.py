from keycloak import KeycloakOpenID
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import APIKey
from .authentication import APIKeyAuthentication

keycloak_openid = KeycloakOpenID(
    server_url=settings.KEYCLOAK_SERVER_URL,
    client_id=settings.KEYCLOAK_CLIENT_ID,
    realm_name=settings.KEYCLOAK_REALM,
    client_secret_key=settings.KEYCLOAK_CLIENT_SECRET,
)


class KeycloakLoginView(APIView):
    """
    View for a login API using keycloak
    """

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        try:
            token = keycloak_openid.token(username, password)
            return Response({"token": token}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GenerateAPIKeyView(APIView):
    """
    API to create API keys for logged in Users so they can use update APIS
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        api_key, created = APIKey.objects.get_or_create(user=request.user)
        if not created:
            # Optionally handle the case where the user already has an API key
            return Response(
                {"key": api_key.key, "message": "Existing key returned"}, status=200
            )

        return Response({"key": api_key.key}, status=201)


# TODO - This is a proof of concept API, please remove
class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [APIKeyAuthentication]

    def get(self, request):
        return Response(
            {
                "message": "This is a protected view accessible only to authenticated users."
            }
        )
