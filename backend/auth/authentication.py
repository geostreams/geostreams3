from keycloak import KeycloakOpenID
from keycloak.exceptions import KeycloakError
from rest_framework import authentication, exceptions
from django.conf import settings


def get_or_create_user(userinfo):
    """
    Map Keycloak userinfo to a Django User object.
    """
    from django.contrib.auth.models import User

    # Example: get or create a user by username (which could be email or Keycloak user ID)
    user, _ = User.objects.get_or_create(username=userinfo["preferred_username"])
    return user


class KeycloakAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        try:
            # Extract the token from the "Bearer <token>" format
            token = auth_header.split(" ")[1]
        except IndexError:
            raise exceptions.AuthenticationFailed(
                "Invalid token header. No credentials provided."
            )

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
                raise exceptions.AuthenticationFailed("Token is not active")
        except KeycloakError as e:
            raise exceptions.AuthenticationFailed(f"Token validation failed: {str(e)}")

        # Retrieve user information
        userinfo = keycloak_openid.userinfo(token)

        # map this user to a Django User object
        user = get_or_create_user(userinfo)

        return user, token
