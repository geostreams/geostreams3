from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from mozilla_django_oidc.auth import OIDCAuthenticationBackend


# Create your views here.

# Login View
def login_view(request):
    return render(request, 'login.html')


def oidc_callback(request):
    print(request)
    oidc_backend = OIDCAuthenticationBackend()
    user = oidc_backend.authenticate(request=request)
    print(user)
    if user is not None:
        login(request, user)
        # Redirect to a desired page after successful authentication
        return redirect('login')
    else:
        # Handle authentication failure
        return redirect('login')
