from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoriesViewSet,
    ParametersViewSet,
    SensorsViewSet,
    StreamsViewSet,
    DatapointsViewSet,
    VisualizationsViewSet,
)

router = DefaultRouter()
router.register("categories", CategoriesViewSet, basename="categories")
router.register("parameters", ParametersViewSet, basename="parameters")

router.register("sensors", SensorsViewSet, basename="sensors")
router.register("streams", StreamsViewSet, basename="streams")
router.register("datapoints", DatapointsViewSet, basename="sensordata")
router.register("visualizations", VisualizationsViewSet, basename="visualizations")


urlpatterns = [
    path("", include(router.urls)),
    path(
        "cache/hour/",
        DatapointsViewSet.as_view(
            {"get": "get_hourly_average_datapoints_by_parameter"}
        ),
        name="get_hourly_average_datapoints_by_parameter",
    ),
    path(
        "cache/day/",
        DatapointsViewSet.as_view({"get": "get_daily_average_datapoints_by_parameter"}),
        name="get_daily_average_datapoints_by_parameter",
    ),
    path(
        "cache/month/",
        DatapointsViewSet.as_view(
            {"get": "get_monthly_average_datapoints_by_parameter"}
        ),
        name="get_monthly_average_datapoints_by_parameter",
    ),
    path(
        "cache/year/",
        DatapointsViewSet.as_view(
            {"get": "get_yearly_average_datapoints_by_parameter"}
        ),
        name="get_yearly_average_datapoints_by_parameter",
    ),
    path(
        "cache/refresh",
        DatapointsViewSet.as_view({"get": "refresh_cache"}),
        name="refresh_cache",
    ),
]
