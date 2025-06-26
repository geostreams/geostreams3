from rest_framework.response import Response
from rest_framework import status
from ..models import Sensor
from ..serializers import SensorSerializer, GeoJSONSensorSerializer
from .auth_base import AuthEnforcedModelViewSet
from rest_framework.decorators import action
from django.contrib.gis.geos import Point, Polygon, GEOSGeometry
from django.contrib.gis.measure import D


class SensorsViewSet(AuthEnforcedModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

    # permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Create new sensor."""
        serializer = SensorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        response = {"message": serializer.errors}
        return Response(response, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        queryset = Sensor.objects.all().prefetch_related("streams")
        name_filter = self.request.query_params.get("name", None)
        source_filter = self.request.query_params.get("source", None)

        if name_filter:
            queryset = queryset.filter(name=name_filter)

        if source_filter:
            queryset = queryset.filter(source=source_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        if not queryset:
            return Response(
                {"message": "No sensors found"}, status=status.HTTP_404_NOT_FOUND
            )
        # Check if format parameter is provided
        type_param = request.query_params.get("type", "").lower()

        if type_param == "geojson":
            # Use GeoJSON serializer - returns array of GeoJSON Features
            serializer = GeoJSONSensorSerializer(queryset, many=True)
            return Response(serializer.data)
        else:
            # Return data in default format
            serializer = SensorSerializer(queryset, many=True)
            return Response({"sensors": serializer.data})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            sensor_id = instance.id
            instance.delete()
            response = {"message": f"Sensor {sensor_id} deleted successfully"}
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            response = {"message": e}
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

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
