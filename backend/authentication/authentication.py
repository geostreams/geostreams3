from keycloak import KeycloakOpenID
from keycloak.exceptions import KeycloakError
import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import APIKey
from django.contrib.auth.models import User
from django.conf import settings


def get_or_create_user(userinfo):
    """
    Map Keycloak userinfo to a Django User object.
    """
    from django.contrib.auth.models import User

    # Example: get or create a user by username (which could be email or Keycloak user ID)
    user, _ = User.objects.get_or_create(username=userinfo["preferred_username"])
    return user


class KeycloakAuthentication(BaseAuthentication):
    """
    Custom authentication that uses keycloak plug in to authenticate. It also creates a
    Django user on first login to link a django user model to the one present in keycloak
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        parts = auth_header.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            # Not a Bearer token, try APIKeyAuthentication
            return None
        token = parts[1]

        # Peek at the iss claim without verifying the signature to avoid a Keycloak network call
        try:
            unverified = jwt.decode(token, options={"verify_signature": False})
        except jwt.DecodeError:
            return None

        if not unverified.get("iss", "").startswith(settings.KEYCLOAK_SERVER_URL):
            return None

        keycloak_openid = KeycloakOpenID(
            server_url=settings.KEYCLOAK_SERVER_URL,
            client_id=settings.KEYCLOAK_CLIENT_ID,
            realm_name=settings.KEYCLOAK_REALM,
            client_secret_key=settings.KEYCLOAK_CLIENT_SECRET,
        )

        try:
            # Validate the token
            token_info = keycloak_openid.introspect(token)
            if not token_info["active"]:
                raise AuthenticationFailed("Token is not active")
        except KeycloakError as e:
            raise AuthenticationFailed(f"Token validation failed: {str(e)}")

        # Retrieve user information
        userinfo = keycloak_openid.userinfo(token)

        # map this user to a Django User object
        user = get_or_create_user(userinfo)

        return user, token


class APIKeyAuthentication(BaseAuthentication):
    def authenticate(self, request):
        jwt_token = request.headers.get("Authorization")
        if not jwt_token:
            return None

        # Decode the JWT token and also checks if it has expired
        try:
            payload = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token")

        # Extract the API key and username from the payload
        username = payload.get("username")
        api_key = payload.get("api_key")

        try:
            # Get the user object based on the provided username
            user = User.objects.get(username=username)

            # Get the APIKey object associated with this user
            key = APIKey.objects.get(user=user)

            # Check if the provided API key matches the stored (hashed) key
            if not key.check_key(api_key):
                raise AuthenticationFailed("Invalid API key")

        except User.DoesNotExist:
            raise AuthenticationFailed("No such user")
        except APIKey.DoesNotExist:
            raise AuthenticationFailed("Invalid API key")

        return key.user, None
