from datetime import timedelta
from django.db.models import F, Q, Value, Avg, Count, FloatField, CharField
from django.db.models.functions import Cast, Concat, Right, ExtractYear, ExtractMonth, ExtractDay, ExtractHour
from rest_framework.decorators import action
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Sensor, Stream, Parameter, Datapoint, Category
from .serializers import SensorSerializer, ParameterSerializer, StreamSerializer, DatapointSerializer, \
    CategorySerializer, DatapointHourlyBinSerializer, DatapointDailyBinSerializer, DatapointWeeklyBinSerializer, \
    DatapointMonthlyBinSerializer, DatapointYearlyBinSerializer


class ParametersViewSet(viewsets.ModelViewSet):
    queryset = Parameter.objects.all()
    serializer_class = ParameterSerializer

    @action(detail=True, methods=['DELETE'])
    def delete_by_name(self,request, name):
        try:
            parameter = Parameter.objects.get(name=name)
            serializer = ParameterSerializer(parameter)
            parameter.delete()
            return Response(serializer.data, status=status.HTTP_204_NO_CONTENT)
        except Parameter.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


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
    """View all datapoints."""
    queryset = Datapoint.objects.all()
    serializer_class = DatapointSerializer


class DatapointsRecentHourly(viewsets.ModelViewSet):
    # TODO: Make this into parameter + start/end time
    var = "nitrogen"

    queryset = Datapoint.timescale.time_bucket('time', '1 hour') \
        .annotate(average=Avg(Cast('data__%s' % var, output_field=FloatField()))) \
        .annotate(count=Count('data__%s' % var)) \
        .annotate(date=F('bucket')) \
        .annotate(year=ExtractYear('bucket')) \
        .annotate(month=ExtractMonth('bucket')) \
        .annotate(day=ExtractDay('bucket')) \
        .annotate(hour=ExtractHour('bucket')) \
        .annotate(label=Concat(
        Cast(ExtractYear('bucket'), output_field=CharField()),
        Value('-'),
        Right(Concat(Value('00'), Cast(ExtractMonth('bucket'), output_field=CharField())), 2),
        Value('-'),
        Right(Concat(Value('00'), Cast(ExtractDay('bucket'), output_field=CharField())), 2),
        Value(' '),
        Right(Concat(Value('00'), Cast(ExtractHour('bucket'), output_field=CharField())), 2)
    ))
    serializer_class = DatapointHourlyBinSerializer


class DatapointsRecentDaily(viewsets.ModelViewSet):
    # TODO: Make this into parameter + start/end time
    var = "nitrogen"

    queryset = Datapoint.timescale.time_bucket('time', '1 day') \
        .annotate(average=Avg(Cast('data__%s' % var, output_field=FloatField()))) \
        .annotate(count=Count('data__%s' % var)) \
        .annotate(date=F('bucket')) \
        .annotate(year=ExtractYear('bucket')) \
        .annotate(month=ExtractMonth('bucket')) \
        .annotate(day=ExtractDay('bucket')) \
        .annotate(label=Concat(
        Cast(ExtractYear('bucket'), output_field=CharField()),
        Value('-'),
        Right(Concat(Value('00'), Cast(ExtractMonth('bucket'), output_field=CharField())), 2),
        Value('-'),
        Right(Concat(Value('00'), Cast(ExtractDay('bucket'), output_field=CharField())), 2)
    ))
    serializer_class = DatapointDailyBinSerializer


class DatapointsRecentWeekly(viewsets.ModelViewSet):
    # TODO: Make this into parameter + start/end time
    var = "nitrogen"

    queryset = Datapoint.timescale.time_bucket('time', '1 week') \
        .annotate(average=Avg(Cast('data__%s' % var, output_field=FloatField()))) \
        .annotate(count=Count('data__%s' % var)) \
        .annotate(date=F('bucket')) \
        .annotate(year=ExtractYear('bucket')) \
        .annotate(month=ExtractMonth('bucket')) \
        .annotate(day=ExtractDay('bucket')) \
        .annotate(label=Concat(
        Cast(ExtractYear('bucket'), output_field=CharField()),
        Value('-'),
        Right(Concat(Value('00'), Cast(ExtractMonth('bucket'), output_field=CharField())), 2),
        Value('-'),
        Right(Concat(Value('00'), Cast(ExtractDay('bucket'), output_field=CharField())), 2)
    ))
    serializer_class = DatapointWeeklyBinSerializer


class DatapointsRecentMonthly(viewsets.ModelViewSet):
    # TODO: Make this into parameter + start/end time
    var = "nitrogen"

    queryset = Datapoint.timescale.time_bucket('time', '1 month') \
        .annotate(average=Avg(Cast('data__%s' % var, output_field=FloatField()))) \
        .annotate(count=Count('data__%s' % var)) \
        .annotate(date=F('bucket')) \
        .annotate(year=ExtractYear('bucket')) \
        .annotate(month=ExtractMonth('bucket')) \
        .annotate(label=Concat(
        Cast(ExtractYear('bucket'), output_field=CharField()),
        Value('-'),
        Right(Concat(Value('00'), Cast(ExtractMonth('bucket'), output_field=CharField())), 2)
    ))
    serializer_class = DatapointMonthlyBinSerializer


class DatapointsRecentYearly(viewsets.ModelViewSet):
    # TODO: Make this into parameter + start/end time
    var = "nitrogen"

    queryset = Datapoint.timescale.time_bucket('time', '1 year') \
        .annotate(average=Avg(Cast('data__%s' % var, output_field=FloatField()))) \
        .annotate(count=Count('data__%s' % var)) \
        .annotate(date=F('bucket')) \
        .annotate(year=ExtractYear('bucket')) \
        .annotate(label=Cast(ExtractYear('bucket'), output_field=CharField()))
    serializer_class = DatapointYearlyBinSerializer


class DatapointsDynamicExample(viewsets.ModelViewSet):
    """Simple example of filter query with N value <= 1 and P value >= 1."""
    var = "nitrogen"
    queryset = (Datapoint.timescale.filter(Q(**{"data__%s__lte" % var: 1})))
    queryset = queryset.filter(Q(**{"data__phosphorus__gte": 1}))
    serializer_class = DatapointSerializer
