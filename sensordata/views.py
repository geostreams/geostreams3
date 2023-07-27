from datetime import timedelta
from django.db.models import F, Q, Value, Avg, Count, FloatField, CharField
from django.db.models.functions import Cast, Concat, Right, ExtractYear, ExtractMonth, ExtractDay, ExtractHour
from rest_framework.decorators import action
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from itertools import chain

from .models import Sensor, Stream, Parameter, Datapoint, Category
from .serializers import SensorSerializer, ParameterSerializer, StreamSerializer, DatapointSerializer, \
    CategorySerializer, DatapointHourlyBinSerializer, DatapointDailyBinSerializer, DatapointWeeklyBinSerializer, \
    DatapointMonthlyBinSerializer, DatapointYearlyBinSerializer


# Helper functions
def param_to_data_key(param):
    return 'data__%s' % param


class ParametersViewSet(viewsets.ModelViewSet):
    queryset = Parameter.objects.all()
    serializer_class = ParameterSerializer

    @action(detail=False, methods=['DELETE'])
    def delete_by_name(self, request):
        name = request.data.get('name')
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

    @action(detail=False, methods=['GET'])
    def get_hourly_average_datapoints_by_parameter(self, request):
        """Get hourly average datapoints by parameter."""
        parameter = request.data.get('parameter')
        queryset = Datapoint.timescale.time_bucket('time', '1 hour') \
            .annotate(average=Avg(Cast(param_to_data_key(parameter), output_field=FloatField()))) \
            .annotate(count=Count(param_to_data_key(parameter))) \
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
        serializer = DatapointHourlyBinSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def get_daily_average_datapoints_by_parameter(self, request):
        """Get daily average datapoints by parameter."""
        parameter = request.data.get('parameter')
        queryset = Datapoint.timescale.time_bucket('time', '1 day') \
            .annotate(average=Avg(Cast(param_to_data_key(parameter), output_field=FloatField()))) \
            .annotate(count=Count(param_to_data_key(parameter))) \
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
        serializer = DatapointDailyBinSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def get_weekly_average_datapoints_by_parameter(self, request):
        """Get daily average datapoints by parameter."""
        parameter = request.data.get('parameter')
        queryset = Datapoint.timescale.time_bucket('time', '1 week') \
            .annotate(average=Avg(Cast(param_to_data_key(parameter), output_field=FloatField()))) \
            .annotate(count=Count(param_to_data_key(parameter))) \
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
        serializer = DatapointWeeklyBinSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def get_monthly_average_datapoints_by_parameter(self, request):
        """Get daily average datapoints by parameter."""
        parameter = request.data.get('parameter')
        sensor_id = request.data.get('sensor_id')
        parameters = Sensor.objects.get(id=sensor_id).parameters
        if sensor_id is None:
            return Response({"message": "Sensor ID is needed"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            sensor = Sensor.objects.get(id=sensor_id)
        except Sensor.DoesNotExist:
            return Response({"message": "Sensor does not exist"}, status=status.HTTP_404_NOT_FOUND)
        # TODO we can have parameter as a list of parameters or a single parameter
        if parameter is not None:
            if type(parameter) is str:
                if parameter not in parameters:
                    return Response({"message": "Parameter does not exist"}, status=status.HTTP_400_BAD_REQUEST)
                query = Datapoint.timescale.time_bucket('time', '1 month') \
                    .filter(stream__sensor__id=sensor_id) \
                    .annotate(average=Avg(Cast(param_to_data_key(parameter), output_field=FloatField()))) \
                    .annotate(count=Count(param_to_data_key(parameter))) \
                    .annotate(date=F('bucket')) \
                    .annotate(year=ExtractYear('bucket')) \
                    .annotate(month=ExtractMonth('bucket')) \
                    .annotate(label=Concat(
                    Cast(ExtractYear('bucket'), output_field=CharField()),
                    Value('-'),
                    Right(Concat(Value('00'), Cast(ExtractMonth('bucket'), output_field=CharField())), 2)
                )) \
                    .annotate(parameter=Value(parameter, output_field=CharField()))
            elif type(parameter) is list:
                queries = []
                for param in parameter:
                    if param not in parameters:
                        return Response({"message": "Parameter " + str(param) + " does not exist"},
                                        status=status.HTTP_400_BAD_REQUEST)
                    filter_param = 'data__%s' % param
                    query = Datapoint.timescale.time_bucket('time', '1 month') \
                        .filter(stream__sensor__id=sensor_id) \
                        .annotate(average=Avg(Cast(filter_param, output_field=FloatField()))) \
                        .annotate(count=Count(filter_param)) \
                        .annotate(date=F('bucket')) \
                        .annotate(year=ExtractYear('bucket')) \
                        .annotate(month=ExtractMonth('bucket')) \
                        .annotate(label=Concat(
                        Cast(ExtractYear('bucket'), output_field=CharField()),
                        Value('-'),
                        Right(Concat(Value('00'), Cast(ExtractMonth('bucket'), output_field=CharField())), 2)
                    )) \
                        .annotate(parameter=Value(param, output_field=CharField()))
                    queries.append(query)
                query = list(chain(*queries))
        else:
            queries = []

            for parameter in parameters:
                filter_param = param_to_data_key(parameter)
                query = Datapoint.timescale.time_bucket('time', '1 month') \
                    .filter(stream__sensor__id=sensor_id) \
                    .annotate(average=Avg(Cast(filter_param, output_field=FloatField()))) \
                    .annotate(count=Count(filter_param)) \
                    .annotate(date=F('bucket')) \
                    .annotate(year=ExtractYear('bucket')) \
                    .annotate(month=ExtractMonth('bucket')) \
                    .annotate(label=Concat(
                    Cast(ExtractYear('bucket'), output_field=CharField()),
                    Value('-'),
                    Right(Concat(Value('00'), Cast(ExtractMonth('bucket'), output_field=CharField())), 2)
                )) \
                    .annotate(parameter=Value(parameter, output_field=CharField()))
                queries.append(query)
            query = list(chain(*queries))
        response = {"sensor_name": sensor.name,
                    "properties": DatapointMonthlyBinSerializer(query, many=True).data}
        return Response(response, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def get_yearly_average_datapoints_by_parameter(self, request):
        """Get daily average datapoints by parameter."""
        parameter = request.data.get('parameter')
        queryset = Datapoint.timescale.time_bucket('time', '1 year') \
            .annotate(average=Avg(Cast(param_to_data_key(parameter), output_field=FloatField()))) \
            .annotate(count=Count(param_to_data_key(parameter))) \
            .annotate(date=F('bucket')) \
            .annotate(year=ExtractYear('bucket')) \
            .annotate(label=Cast(ExtractYear('bucket'), output_field=CharField()))
        serializer = DatapointYearlyBinSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DatapointsDynamicExample(viewsets.ModelViewSet):
    """Simple example of filter query with N value <= 1 and P value >= 1."""
    var = "nitrogen"
    queryset = (Datapoint.timescale.filter(Q(**{"data__%s__lte" % var: 1})))
    queryset = queryset.filter(Q(**{"data__phosphorus__gte": 1}))
    serializer_class = DatapointSerializer
