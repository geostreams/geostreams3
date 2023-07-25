from django.urls import include, path
from rest_framework.authtoken import views as auth_views
from rest_framework.routers import DefaultRouter

from .views import CategoriesViewSet, ParametersViewSet, SensorsViewSet, StreamsViewSet, DatapointsViewSet, \
    DatapointsRecentHourly, DatapointsRecentDaily, DatapointsRecentWeekly, \
    DatapointsRecentMonthly, DatapointsRecentYearly


router = DefaultRouter()
router.register('categories', CategoriesViewSet, basename='categories')
router.register('parameters', ParametersViewSet, basename='parameters')

router.register('sensors', SensorsViewSet, basename='sensors')
router.register('streams', StreamsViewSet, basename='streams')
router.register('datapoints', DatapointsViewSet, basename='sensordata')

router.register('cache/hour', DatapointsRecentHourly, basename='sensordata')
router.register('cache/day', DatapointsRecentDaily, basename='sensordata')
router.register('cache/week', DatapointsRecentWeekly, basename='sensordata')
router.register('cache/month', DatapointsRecentMonthly, basename='sensordata')
router.register('cache/year', DatapointsRecentYearly, basename='sensordata')


urlpatterns = [
    path("", include(router.urls)),
    path('parameters/delete_by_name/<str:name>/', ParametersViewSet.as_view({'delete': 'delete_by_name'}),
         name='delete_by_name'),
]
