from django.urls import include, path
from rest_framework.authtoken import views as auth_views
from rest_framework.routers import DefaultRouter

from .views import ParametersViewSet, SensorsViewSet, DatapointsViewSet, DatapointsRecentHourly, DatapointsDynamicExample

router = DefaultRouter()
router.register(r'parameters', ParametersViewSet, basename='parameters')
router.register(r'sensors', SensorsViewSet, basename='sensors')
router.register('datapoints', DatapointsViewSet, basename='sensordata')
router.register('datapointsh', DatapointsRecentHourly, basename='sensordata')
router.register('datapointse', DatapointsDynamicExample, basename='sensordata')

#urlpatterns = router.urls
urlpatterns = [
    path("api-token-auth/", auth_views.obtain_auth_token, name='api-token-auth'),
    path("", include(router.urls)),
    path('parameters/delete_by_name/<str:name>/', ParametersViewSet.as_view({'delete': 'delete_by_name'}),
         name='delete_by_name'),
]
