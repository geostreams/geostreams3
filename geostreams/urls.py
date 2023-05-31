from django.urls import include,path
from rest_framework.authtoken import views as auth_views
from rest_framework import routers
from .views import SensorsViewSet, StreamsViewSet, ParametersViewSet

router = routers.DefaultRouter()
router.register(r'sensors', SensorsViewSet, basename='sensors')
router.register(r'streams', StreamsViewSet, basename='streams')
router.register(r'parameters', ParametersViewSet, basename='parameters')

urlpatterns = [
    path("api-token-auth/", auth_views.obtain_auth_token, name='api-token-auth'),
    path("", include(router.urls))
]
