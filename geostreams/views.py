from rest_framework.permissions import IsAuthenticated
from .serializers import SensorsSerializer
from .models import Sensors
from rest_framework import viewsets


class SensorsViewSet(viewsets.ModelViewSet):
    queryset = Sensors.objects.all()
    serializer_class = SensorsSerializer
    permission_classes = [IsAuthenticated]