from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework.response import Response
from .serializers import SensorsSerializer, ParametersSerializer, DatapointsSerializer
from .models import Sensors, Parameters, Datapoints


class SensorsViewSet(viewsets.ModelViewSet):
    queryset = Sensors.objects.all()
    serializer_class = SensorsSerializer
    permission_classes = [IsAuthenticated]


class DatapointsViewSet(viewsets.ModelViewSet):
    queryset = Datapoints.objects.all()
    serializer_class = DatapointsSerializer


class ParametersViewSet(viewsets.ModelViewSet):
    queryset = Parameters.objects.all()
    serializer_class = ParametersSerializer
    permission_classes = [IsAuthenticated]

    def delete_by_name(self, name):
        print("Look here")
        print(name)
        self.queryset.filter(name=name).delete()
        return Response({'message': 'Parameter' + str(name) + ' deleted successfully!'})
