from rest_framework.decorators import api_view, permission_classes

from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.gis.geos import Point, Polygon
from django.contrib.gis.measure import D
from ..models import Sensor
from ..serializers import SensorSerializer


@api_view(["POST"])  # Switch to POST to accept JSON payload
@permission_classes([AllowAny])  # Allow any user to access this endpoint
def get_sensors_in_shape(request):
    """
    Get sensors in shape. The shape can be a circle or a polygon.

    Parameters (in the JSON body):
    - shape: str - The shape of the area to get sensors from. Can be either 'circle' or 'polygon'.
    - coordinates: list of tuples - The coordinates of the shape if it is a polygon,
                   or the center of the circle. Format of each tuple: (longitude, latitude).
    - radius: float - The radius of the circle (required if shape is 'circle').
    """
    # Get the shape and coordinates from the request body
    shape = request.data.get("shape", None)
    coordinates = request.data.get("coordinates", None)

    try:
        # Validate input
        if not shape or not coordinates:
            return Response(
                {"message": "Please provide both shape and coordinates."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if the shape is a circle
        if shape == "circle":
            radius = request.data.get("radius", None)
            if not radius:
                return Response(
                    {"message": "Please provide radius for circle."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Ensure coordinates contain a single point (latitude, longitude)
            if len(coordinates) != 1 or len(coordinates[0]) != 2:
                return Response(
                    {
                        "message": "Invalid coordinates for circle. Provide a single point."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Using GIS Query to get sensors in circle
            radius = D(km=float(radius))
            lon, lat = coordinates[0]  # Expecting a single coordinate pair
            center = Point(lon, lat, srid=4326)  # Explicitly set SRID for WGS84
            sensors = Sensor.objects.filter(geog__distance_lte=(center, radius))

        elif shape == "polygon":
            # Ensure coordinates form a valid polygon (at least 3 points)
            if len(coordinates) < 3:
                return Response(
                    {"message": "A polygon requires at least 3 coordinates."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Ensure the last point is the same as the first point to close the polygon
            if coordinates[0] != coordinates[-1]:
                coordinates.append(coordinates[0])

            # Create a polygon from the coordinates
            polygon = Polygon(coordinates, srid=4326)
            sensors = Sensor.objects.filter(geog__intersects=polygon)

        else:
            return Response(
                {
                    "message": "Invalid shape. Please provide either 'circle' or 'polygon'."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Serialize the sensors
    serializer = SensorSerializer(sensors, many=True)
    return Response({"sensors": serializer.data}, status=status.HTTP_200_OK)
