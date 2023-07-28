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
    CategorySerializer, DatapointHourlyBinSerializer, DatapointDailyBinSerializer, \
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
        sensor_id = request.GET.get('sensor_id')
        parameter = request.GET.getlist('parameter')
        if not parameter:  
            parameter = request.GET.get('parameter', None)
        return DatapointsViewSet.get_time_period_binned_datapoint(sensor_id, parameter, '1 hour',
                                                                  DatapointHourlyBinSerializer)

    @action(detail=False, methods=['GET'])
    def get_daily_average_datapoints_by_parameter(self, request):
        """Get daily average datapoints by parameter."""
        sensor_id = request.GET.get('sensor_id')
        parameter = request.GET.getlist('parameter')
        if not parameter:  
            parameter = request.GET.get('parameter', None)
        return DatapointsViewSet.get_time_period_binned_datapoint(sensor_id, parameter, '1 day',
                                                                  DatapointDailyBinSerializer)

    @action(detail=False, methods=['GET'])
    def get_monthly_average_datapoints_by_parameter(self, request):
        """Get monthly average datapoints by parameter."""
        parameter = request.GET.getlist('parameter')
        if not parameter:  
            parameter = request.GET.get('parameter', None)
        sensor_id = request.GET.get('sensor_id')
        return DatapointsViewSet.get_time_period_binned_datapoint(sensor_id, parameter, '1 month',
                                                                  DatapointMonthlyBinSerializer)

    @action(detail=False, methods=['GET'])
    def get_yearly_average_datapoints_by_parameter(self, request):
        """Get yearly average datapoints by parameter."""
        sensor_id = request.GET.get('sensor_id')
        parameter = request.GET.getlist('parameter')
        if not parameter:  
            parameter = request.GET.get('parameter', None)
        return DatapointsViewSet.get_time_period_binned_datapoint(sensor_id, parameter, '1 year',
                                                                  DatapointYearlyBinSerializer)

    class DatapointsDynamicExample(viewsets.ModelViewSet):
        """Simple example of filter query with N value <= 1 and P value >= 1."""
        var = "nitrogen"
        queryset = (Datapoint.timescale.filter(Q(**{"data__%s__lte" % var: 1})))
        queryset = queryset.filter(Q(**{"data__phosphorus__gte": 1}))
        serializer_class = DatapointSerializer

    @staticmethod
    def get_time_period_binned_datapoint(sensor_id, parameter, time_period, time_period_serializer):
        """Helper function to get datapoints binned by a timeperiod"""
        if sensor_id is None:
            return Response({"message": "Sensor ID is needed"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            sensor = Sensor.objects.get(id=sensor_id)
        except Sensor.DoesNotExist:
            return Response({"message": "Sensor does not exist"}, status=status.HTTP_404_NOT_FOUND)
        parameters = sensor.parameters
        properties = []
        if parameter is not None:
            if type(parameter) is str:
                if parameter not in parameters:
                    return Response({"message": "Sensor does not have parameter"}, status=status.HTTP_400_BAD_REQUEST)
                filter_param = param_to_data_key(parameter)
                query = Datapoint.timescale.time_bucket('time', time_period) \
                    .filter(stream__sensor__id=sensor_id) \
                    .annotate(average=Avg(Cast(filter_param, output_field=FloatField()))) \
                    .annotate(count=Count(filter_param)) \
                    .annotate(date=F('bucket')) \
                    .annotate(year=ExtractYear('bucket')) \
                    .annotate(label=Concat(
                    Cast(ExtractYear('bucket'), output_field=CharField()),
                    Value('-'),
                    Right(Concat(Value('00'), Cast(ExtractMonth('bucket'), output_field=CharField())), 2)
                )) \
                    .annotate(parameter=Value(parameter, output_field=CharField()))
                query = DatapointsViewSet.query_add_ons(time_period, query)
                properties.append({parameter: time_period_serializer(query, many=True).data})
            elif type(parameter) is list:
                queries = []
                properties = []
                for parameter in parameter:
                    if parameter not in parameters:
                        return Response({"message": "Parameter " + str(parameter) + " does not exist"},
                                        status=status.HTTP_400_BAD_REQUEST)
                    filter_param = param_to_data_key(parameter)
                    query = Datapoint.timescale.time_bucket('time', time_period) \
                        .filter(stream__sensor__id=sensor_id) \
                        .annotate(average=Avg(Cast(filter_param, output_field=FloatField()))) \
                        .annotate(count=Count(filter_param)) \
                        .annotate(date=F('bucket')) \
                        .annotate(year=ExtractYear('bucket')) \
                        .annotate(label=Concat(
                        Cast(ExtractYear('bucket'), output_field=CharField()),
                        Value('-'),
                        Right(Concat(Value('00'), Cast(ExtractMonth('bucket'), output_field=CharField())), 2)
                    )) \
                        .annotate(parameter=Value(parameter, output_field=CharField()))
                    query = DatapointsViewSet.query_add_ons(time_period, query)
                    properties.append({parameter: time_period_serializer(query, many=True).data})
        else:
            queries = []
            properties = []
            for parameter in parameters:
                filter_param = param_to_data_key(parameter)
                query = Datapoint.timescale.time_bucket('time', time_period) \
                    .filter(stream__sensor__id=sensor_id) \
                    .annotate(average=Avg(Cast(filter_param, output_field=FloatField()))) \
                    .annotate(count=Count(filter_param)) \
                    .annotate(date=F('bucket')) \
                    .annotate(year=ExtractYear('bucket')) \
                    .annotate(parameter=Value(parameter, output_field=CharField())) \
                    .annotate(label=Concat(
                    Cast(ExtractYear('bucket'), output_field=CharField()),
                    Value('-'),
                    Right(Concat(Value('00'), Cast(ExtractMonth('bucket'), output_field=CharField())), 2)
                ))

                query = DatapointsViewSet.query_add_ons(time_period, query)
                properties.append({parameter: time_period_serializer(query, many=True).data})

        response = {"sensor_name": sensor.name,
                    "properties": properties}
        return Response(response, status=status.HTTP_200_OK)

    @staticmethod
    def query_add_ons(time_period, query):
        """Helper function to add extra annotations to the query"""
        if time_period != '1 year':
            query = query.annotate(month=ExtractMonth('bucket'))
        if time_period != '1 year' and time_period != '1 month':
            query = query.annotate(day=ExtractDay('bucket'))
        if time_period == '1 hour':
            query = query.annotate(hour=ExtractHour('bucket'))
        return query
