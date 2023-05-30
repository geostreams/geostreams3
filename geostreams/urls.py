from django.urls import path
from rest_framework.authtoken import views as auth_views
from geostreams.views import SensorsViewSet

urlpatterns = [
    path('api-token-auth/', auth_views.obtain_auth_token, name='api-token-auth'),
    path("sensors/", SensorsViewSet.as_view(), name="sensors-list")
]
