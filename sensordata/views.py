from datetime import timedelta
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import SensorSerializer, ParameterSerializer, DatapointSerializer
from .models import Sensor, Parameter, Datapoint
from .serializers import DatapointSerializer, DatapointBinSerializer


class ParametersViewSet(viewsets.ModelViewSet):
    queryset = Parameter.objects.all()
    serializer_class = ParameterSerializer
    permission_classes = [IsAuthenticated]

    def delete_by_name(self, name):
        print("Look here")
        print(name)
        self.queryset.filter(name=name).delete()
        return Response({'message': 'Parameter' + str(name) + ' deleted successfully!'})


class SensorsViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    permission_classes = [IsAuthenticated]


class DatapointsViewSet(viewsets.ModelViewSet):
    queryset = Datapoint.objects.all()
    serializer_class = DatapointSerializer


class DatapointsRecentHourly(viewsets.ModelViewSet):
    date_range = (timezone.now() - timedelta(hours=2), timezone.now())
    queryset = Datapoint.timescale.time_bucket('time', '1 day')
    serializer_class = DatapointBinSerializer


class DatapointsDynamicExample(viewsets.ModelViewSet):
    var = "nitrogen"
    queryset = (Datapoint.timescale.filter(Q(**{"data__%s__lte" % var: 1 })))
    queryset = queryset.filter(Q(**{"data__phosphorus__gte": 1 }))
    serializer_class = DatapointSerializer
