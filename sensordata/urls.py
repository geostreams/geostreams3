from django.urls import include, path
from rest_framework.authtoken import views as auth_views
from rest_framework.routers import DefaultRouter

from .views import CategoriesViewSet, ParametersViewSet, SensorsViewSet, StreamsViewSet, DatapointsViewSet

router = DefaultRouter()
router.register('categories', CategoriesViewSet, basename='categories')
router.register('parameters', ParametersViewSet, basename='parameters')

router.register('sensors', SensorsViewSet, basename='sensors')
router.register('streams', StreamsViewSet, basename='streams')
router.register('datapoints', DatapointsViewSet, basename='sensordata')


urlpatterns = [
    path("", include(router.urls)),
    path('parameters/delete_by_name/<str:name>/', ParametersViewSet.as_view({'delete': 'delete_by_name'}),
         name='delete_by_name'),
    path('cache/hour/<str:parameter>/',
         DatapointsViewSet.as_view({'get': 'get_hourly_average_datapoints_by_parameter'}),
         name='get_hourly_average_datapoints_by_parameter'),
    path('cache/daily/<str:parameter>/',
         DatapointsViewSet.as_view({'get': 'get_daily_average_datapoints_by_parameter'}),
         name='get_daily_average_datapoints_by_parameter'),
    path('cache/weekly/<str:parameter>/',
         DatapointsViewSet.as_view({'get': 'get_weekly_average_datapoints_by_parameter'}),
         name='get_weekly_average_datapoints_by_parameter'),
    path('cache/monthly/<str:parameter>/',
         DatapointsViewSet.as_view({'get': 'get_monthly_average_datapoints_by_parameter'}),
         name='get_monthly_average_datapoints_by_parameter'),
    path('cache/yearly/<str:parameter>/',
         DatapointsViewSet.as_view({'get': 'get_yearly_average_datapoints_by_parameter'}),
         name='get_yearly_average_datapoints_by_parameter'),
]
