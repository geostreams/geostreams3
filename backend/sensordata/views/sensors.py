from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from ..models import Sensor
from ..serializers import SensorSerializer, GeoJSONSensorSerializer
from .auth_base import AuthEnforcedModelViewSet
from rest_framework.decorators import action
from django.contrib.gis.geos import Point, Polygon, GEOSGeometry
from django.contrib.gis.measure import D
from django.db.models import Min, Max


class SensorsViewSet(AuthEnforcedModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

    # permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Create new sensor."""
        payload = request.data
        is_many = isinstance(payload, list)

        if is_many and not payload:
            return Response(
                {"message": "At least one sensor payload is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = SensorSerializer(data=payload, many=is_many)
        # Validate the data using the serializer
        if not serializer.is_valid():
            response = {"message": serializer.errors}
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        # The transaction.atomic() block ensures that all sensors in the batch are saved atomically as a unit;
        # if any save fails, the entire batch is rolled back.
        with transaction.atomic():
            serializer.save()

        serialized_data = serializer.data
        sensors_payload = serialized_data if is_many else [serialized_data]
        message = (
            "Sensors created successfully" if is_many else "Sensor created successfully"
        )

        response = {
            "message": message,
            "sensors": sensors_payload,
            "count": len(sensors_payload),
        }
        return Response(response, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        queryset = (
            Sensor.objects.all()
            .prefetch_related("streams")
            .annotate(
                min_start_time=Min("streams__start_time"),
                max_end_time=Max("streams__end_time"),
            )
        )
        name_filter = self.request.query_params.get("name", None)
        source_filter = self.request.query_params.get("source", None)

        if name_filter:
            queryset = queryset.filter(name=name_filter)

        if source_filter:
            queryset = queryset.filter(source=source_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        source_filters = request.query_params.getlist("source")
        if not source_filters:
            raw_source = request.query_params.get("source")
            if raw_source:
                source_filters = [
                    source.strip() for source in raw_source.split(",") if source.strip()
                ]
        if source_filters:
            queryset = queryset.filter(source__in=source_filters)

        if not queryset:
            return Response(
                {"message": "No sensors found"}, status=status.HTTP_404_NOT_FOUND
            )
        # Check if format parameter is provided
        type_param = request.query_params.get("type", "").lower()

        if type_param == "geojson":
            # Wrap array of GeoJSON Features in a proper GeoJSON FeatureCollection
            serializer = GeoJSONSensorSerializer(queryset, many=True)
            geojson_response = {
                "type": "FeatureCollection",
                "features": serializer.data,
            }
            return Response(geojson_response)
        else:
            # Return data in default format
            serializer = SensorSerializer(queryset, many=True)
            return Response({"sensors": serializer.data})

    def list_sources(self, request, *args, **kwargs):
        """Return a sorted list of unique sensor sources."""
        queryset = Sensor.objects.exclude(source__isnull=True).exclude(source__exact="")

        if not queryset.exists():
            return Response(
                {"sources": [], "message": "No sensor sources available"},
                status=status.HTTP_200_OK,
            )

        sources = (
            queryset.values_list("source", flat=True).distinct().order_by("source")
        )
        return Response({"sources": list(sources)}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        sensor = self.get_object()
        sensor_id = sensor.id
        try:
            sensor.delete()
        except Exception as exc:
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {"message": f"Sensor {sensor_id} deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )

    # Custom method to get sensors in shape
    @action(detail=False, methods=["get"], url_path="sensors_in_shape")
    def get_sensors_in_shape(self, request):
        """
        Get sensors in shape. The shape can be a circle or a polygon.

        Query Parameters:
        - shape: str - The shape of the area to get sensors from. Can be either 'circle' or 'polygon'.
        - wkt: str - The Well-Known Text (WKT) representation of the shape, point if circle, polygon if polygon.
        - buffer: float - (Optional) The buffer size in kilometers. For circles, this is the radius. For polygons,
                         this is the width of the buffer around the polygon. Default is 0.
        """
        shape = request.GET.get("shape")
        wkt = request.GET.get("wkt")
        buffer = request.GET.get("buffer", "0")  # Default to "0" if not provided

        try:
            if not shape or not wkt:
                return Response(
                    {"message": "Please provide both shape and WKT."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            buffer_distance = D(km=float(buffer))
            geometry = GEOSGeometry(wkt, srid=4326)

            if shape == "circle":
                if not isinstance(geometry, Point):
                    return Response(
                        {"message": "Invalid WKT for circle. Provide a POINT."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if buffer_distance.km > 0:
                    sensors = Sensor.objects.filter(
                        geog__distance_lte=(geometry, buffer_distance)
                    )
                else:
                    sensors = Sensor.objects.filter(geog=geometry)

            elif shape == "polygon":
                if not isinstance(geometry, Polygon):
                    return Response(
                        {"message": "Invalid WKT. Provide a POLYGON."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if buffer_distance.km > 0:
                    buffered_geometry = geometry.buffer(
                        buffer_distance.m
                    )  # buffer() uses meters
                    sensors = Sensor.objects.filter(geog__intersects=buffered_geometry)
                else:
                    sensors = Sensor.objects.filter(geog__intersects=geometry)

            else:
                return Response(
                    {
                        "message": "Invalid shape. Please provide either 'circle' or 'polygon'."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except ValueError as e:
            return Response(
                {"message": f"Invalid buffer value: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SensorSerializer(sensors, many=True)
        return Response({"sensors": serializer.data}, status=status.HTTP_200_OK)
