from keycloak import KeycloakOpenID
import jwt
from django.conf import settings
from django.contrib.auth.hashers import make_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import APIKey
import secrets
from .authentication import KeycloakAuthentication

keycloak_openid = KeycloakOpenID(
    server_url=settings.KEYCLOAK_SERVER_URL,
    client_id=settings.KEYCLOAK_CLIENT_ID,
    realm_name=settings.KEYCLOAK_REALM,
    client_secret_key=settings.KEYCLOAK_CLIENT_SECRET,
)


class KeycloakLoginView(APIView):
    """
    API to authenticate a user and return a token
    """

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        try:
            token = keycloak_openid.token(username, password)
            return Response({"token": token}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """
    API to return user profile information
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [KeycloakAuthentication]

    def get(self, request):
        user_info = keycloak_openid.userinfo(request.auth)
        return Response(
            {
                "username": user_info.get("preferred_username"),
                "email": user_info.get("email"),
                "first_name": user_info.get("given_name"),
                "last_name": user_info.get("family_name"),
            },
            status=status.HTTP_200_OK,
        )


class GenerateAPIKeyView(APIView):
    """
    API to create a new API key for the user
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [KeycloakAuthentication]

    def post(self, request):
        user = request.user

        # Delete the existing API key if it exists
        APIKey.objects.filter(user=user).delete()

        # Generate a new raw key and hash it before saving
        raw_key = secrets.token_urlsafe(32)

        # Include the user's username in a JWT token with the raw key
        token = jwt.encode(
            {"username": user.username, "api_key": raw_key},
            settings.SECRET_KEY,
            algorithm="HS256",
        )

        hashed_key = make_password(raw_key)

        # Save API key to the database
        APIKey.objects.create(user=user, key=hashed_key)

        # Return the unhashed key to the user
        return Response({"key": token}, status=201)


# TODO - This is a proof of concept API, please remove
class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "message": "This is a protected view accessible only to authenticated users."
            }
        )
