from datetime import timedelta
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.response import Response

from .models import Datapoint
from .serializers import DatapointSerializer


class DatapointsViewSet(viewsets.ModelViewSet):
    queryset = Datapoint.objects.all()
    serializer_class = DatapointSerializer

class DatapointsRecentHourly(viewsets.ModelViewSet):
    date_range = (timezone.now() - timedelta(hours=2), timezone.now())
    queryset = Datapoint.timescale.time_bucket('time', '1 day')

    #var = "nitrogen"
    #queryset = (Datapoint.timescale.filter(Q(**{"data__%s__lte" % var: 1 })))
    #queryset = queryset.filter(Q(**{"data__phosphorus__gte": 1 }))

    serializer_class = DatapointSerializer
