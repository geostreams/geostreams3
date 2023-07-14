from django.urls import include, path
from .views import login_view, oidc_callback

urlpatterns = [
    path('callback/', oidc_callback, name='oidc_callback'),
    path('', include('mozilla_django_oidc.urls')),
    path('login/', login_view, name='login'),
]