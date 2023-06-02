from django.urls import include,path
from rest_framework.authtoken import views as auth_views
from rest_framework import routers
from .views import SensorsViewSet, ParametersViewSet

router = routers.DefaultRouter()
router.register(r'sensors', SensorsViewSet, basename='sensors')
router.register(r'parameters', ParametersViewSet, basename='parameters')

urlpatterns = [
    path("api-token-auth/", auth_views.obtain_auth_token, name='api-token-auth'),
    path("", include(router.urls)),
    path('parameters/delete_by_name/<str:name>/', ParametersViewSet.as_view({'delete': 'delete_by_name'}),
         name='delete_by_name'),
]
