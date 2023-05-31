from rest_framework.permissions import IsAuthenticated
from .serializers import SensorsSerializer, StreamsSerializer, ParametersSerializer
from .models import Sensors, Streams, Parameters
from rest_framework import viewsets


class SensorsViewSet(viewsets.ModelViewSet):
    queryset = Sensors.objects.all()
    serializer_class = SensorsSerializer
    permission_classes = [IsAuthenticated]


class StreamsViewSet(viewsets.ModelViewSet):
    queryset = Streams.objects.all()
    serializer_class = StreamsSerializer
    permission_classes = [IsAuthenticated]


class ParametersViewSet(viewsets.ModelViewSet):
    queryset = Parameters.objects.all()
    serializer_class = ParametersSerializer
    permission_classes = [IsAuthenticated]
