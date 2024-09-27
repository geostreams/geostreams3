from rest_framework.response import Response
from rest_framework import status
from ..models import Sensor
from ..serializers import SensorSerializer
from .auth_base import AuthEnforcedModelViewSet


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
        queryset = Sensor.objects.all()
        name_filter = self.request.query_params.get("name", None)

        if name_filter:
            queryset = queryset.filter(name=name_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset:
            return Response(
                {"message": "No sensors found"}, status=status.HTTP_404_NOT_FOUND
            )

        if self.request.query_params.get("name", None):
            serializer = SensorSerializer(queryset[0])
            return Response({"sensor": serializer.data})
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
