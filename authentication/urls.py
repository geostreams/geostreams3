from django.urls import include, path
from .views import login_view

urlpatterns = [
    path('', include('mozilla_django_oidc.urls')),
    path('login/', login_view, name='login'),
]