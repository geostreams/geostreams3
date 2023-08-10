from django.http import HttpResponseRedirect
from keycloak import KeycloakOpenID
from django.conf import settings
# Create your views here.

def login_view(request):
    keycloak_openid = KeycloakOpenID(
        server_url=settings.KEYCLOAK_BASE_URL,
        client_id=settings.KEYCLOAK_CLIENT_ID,
        realm_name=settings.KEYCLOAK_REALM
    )
    # Redirect the user to the Keycloak provider for authentication
    auth_url = keycloak_openid.auth_url('http://localhost:9007/auth/callback')
    return HttpResponseRedirect(auth_url)

def callback_view(request):
    code = request.GET.get('code')
    keycloak_openid = KeycloakOpenID(
        server_url=settings.KEYCLOAK_BASE_URL,
        client_id=settings.KEYCLOAK_CLIENT_ID,
        realm_name=settings.KEYCLOAK_REALM
    )

    # Exchange the authorization code for a token
    token_response = keycloak_openid.token(code)
    access_token = token_response.get('access_token')

    # Get the user's information
    userinfo = keycloak_openid.userinfo(access_token)