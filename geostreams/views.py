from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import SensorsSerializer
from .models import Sensors
from rest_framework import generics


class SensorsViewSet(generics.ListCreateAPIView):
    queryset = Sensors.objects.all()
    serializer_class = SensorsSerializer
    permission_classes = [IsAuthenticated]