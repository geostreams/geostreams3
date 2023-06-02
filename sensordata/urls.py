from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DatapointsViewSet, DatapointsRecentHourly

router = DefaultRouter()
router.register('datapoints', DatapointsViewSet, basename='sensordata')
router.register('datapointsh', DatapointsRecentHourly, basename='sensordata')
urlpatterns = router.urls
