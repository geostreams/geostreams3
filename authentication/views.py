from django.shortcuts import render
from django.shortcuts import render
from mozilla_django_oidc.views import OIDCAuthenticationCallbackView


# Create your views here.

# Login View
def login_view(request):
    return render(request, 'login.html')


