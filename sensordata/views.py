from datetime import timedelta
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Sensor, Stream, Parameter, Datapoint, Category
from .serializers import SensorSerializer, ParameterSerializer, StreamSerializer, DatapointSerializer, \
    DatapointBinSerializer, CategorySerializer


class ParametersViewSet(viewsets.ModelViewSet):
    queryset = Parameter.objects.all()
    serializer_class = ParameterSerializer

    def delete_by_name(self, name):
        print("Look here")
        print(name)
        self.queryset.filter(name=name).delete()
        return Response({'message': 'Parameter' + str(name) + ' deleted successfully!'})


class CategoriesViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    # permission_classes = [IsAuthenticated]


class SensorsViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    # permission_classes = [IsAuthenticated]


class StreamsViewSet(viewsets.ModelViewSet):
    queryset = Stream.objects.all()
    serializer_class = StreamSerializer
    # permission_classes = [IsAuthenticated]


class DatapointsViewSet(viewsets.ModelViewSet):
    queryset = Datapoint.objects.all()
    serializer_class = DatapointSerializer


class DatapointsRecentHourly(viewsets.ModelViewSet):
    date_range = (timezone.now() - timedelta(hours=2), timezone.now())
    queryset = Datapoint.timescale.time_bucket('time', '1 day')
    serializer_class = DatapointBinSerializer


class DatapointsDynamicExample(viewsets.ModelViewSet):
    var = "nitrogen"
    queryset = (Datapoint.timescale.filter(Q(**{"data__%s__lte" % var: 1})))
    queryset = queryset.filter(Q(**{"data__phosphorus__gte": 1}))
    serializer_class = DatapointSerializer
