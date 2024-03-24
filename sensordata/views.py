from django.db import connection
from rest_framework.decorators import action
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
import json

# from rest_framework.permissions import IsAuthenticated

from .models import (
    Sensor,
    Stream,
    Parameter,
    Datapoint,
    Category,
    Visualization,
    ParameterCategory,
)
from .serializers import (
    SensorSerializer,
    ParameterSerializer,
    StreamSerializer,
    CategorySerializer,
    DatapointSerializer,
    VisualizationSerializer,
    ParameterCategorySerializer,
)


class ParametersViewSet(viewsets.ModelViewSet):
    queryset = Parameter.objects.all()
    serializer_class = ParameterSerializer

    # Overwrite get queryset to allow filtering by name
    def get_queryset(self):
        queryset = Parameter.objects.all()
        name_filter = self.request.query_params.get("name", None)

        if name_filter:
            queryset = queryset.filter(name=name_filter)

        return queryset

    # Serialize listing of parameters
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # Check if queryset is empty
        if not queryset:
            return Response(
                {"message": "No parameters found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if name query parameter is provided and return only that parameter
        # and its mappings and categories
        if self.request.query_params.get("name", None):
            param_serializer = ParameterSerializer(queryset[0])
            mapping_serialized = ParameterCategorySerializer(
                ParameterCategory.objects.filter(parameter=queryset[0]), many=True
            )
            category_serialized = CategorySerializer(
                Category.objects.filter(
                    id__in=[
                        param_category.category.id
                        for param_category in ParameterCategory.objects.filter(
                            parameter=queryset[0]
                        )
                    ]
                ),
                many=True,
            )

            return Response(
                {
                    "parameter": param_serializer.data,
                    "mappings": mapping_serialized.data,
                    "categories": category_serialized.data,
                }
            )

        param_serializer = ParameterSerializer(queryset, many=True)
        category_serialized = CategorySerializer(Category.objects.all(), many=True)
        mapping_serialized = ParameterCategorySerializer(
            ParameterCategory.objects.all(), many=True
        )
        return Response(
            {
                "parameters": param_serializer.data,
                "categories": category_serialized.data,
                "mappings": mapping_serialized.data,
            }
        )

    # Overwrite create to allow adding visualization by name
    def create(self, request, *args, **kwargs):
        """Create a Parameter with Visualization and Category names."""
        visualization_name = request.data.get("visualization")
        category_name = request.data.get("category")
        parameter_data = request.data.copy()

        # Check for Visualization existence
        if visualization_name:
            try:
                visualization = Visualization.objects.get(name=visualization_name)
                parameter_data["visualization"] = visualization.id
            except Visualization.DoesNotExist:
                return Response(
                    {"message": "Visualization does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"message": "Visualization must be provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check for Category existence
        if category_name:
            try:
                category = Category.objects.get(name=category_name)
            except Category.DoesNotExist:
                return Response(
                    {"message": "Category does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"message": "Category must be provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Now that we have ensured both Visualization and Category
        # exist, proceed with Parameter creation
        serializer = self.get_serializer(data=parameter_data)
        serializer.is_valid(raise_exception=True)
        parameter = serializer.save()

        # Since category_name is provided and exists, link Parameter and Category
        ParameterCategory.objects.create(parameter=parameter, category=category)

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    # TODO: Need to modify update to possibly update the mapping as well
    def update(self, request, *args, **kwargs):
        """Update a Parameter, and optionally its Visualization and Category, by name"""
        instance = self.get_object()
        visualization_name = request.data.get("visualization")
        print(visualization_name)
        category_name = request.data.get("category")
        parameter_data = request.data.copy()

        if visualization_name:
            try:
                visualization = Visualization.objects.get(name=visualization_name)
                parameter_data.pop("visualization")
                instance.visualization = visualization
            except Visualization.DoesNotExist:
                return Response(
                    {"message": "Visualization does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Check if category is provided
        if category_name:
            try:
                category = Category.objects.get(name=category_name)
                # Check if parameter is already mapped to a category
                if ParameterCategory.objects.filter(
                    parameter=self.get_object()
                ).exists():
                    # Update the mapping
                    ParameterCategory.objects.filter(
                        parameter=self.get_object()
                    ).update(category=category)
            except Category.DoesNotExist:
                return Response(
                    {"message": "Category does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        partial = kwargs.pop("partial", True)
        serializer = self.get_serializer(instance, data=parameter_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    # TODO: Need to modify delete to delete the mapping as well
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Check if parameter is mapped to a category
        if ParameterCategory.objects.filter(parameter=instance).exists():
            # Delete the mapping
            ParameterCategory.objects.filter(parameter=instance).delete()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoriesViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    # permission_classes = [IsAuthenticated]


class VisualizationsViewSet(viewsets.ModelViewSet):
    queryset = Visualization.objects.all()
    serializer_class = VisualizationSerializer

    # permission_classes = [IsAuthenticated]

    # Delete visualization by name
    @action(detail=False, methods=["DELETE"])
    def delete_by_name(self, request):
        """Delete a visualization by its name."""
        visualization_name = request.query_params.get("name")
        if not visualization_name:
            return Response(
                {"message": "Visualization name must be provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            visualization = Visualization.objects.get(name=visualization_name)
            visualization.delete()
            return Response(
                {"message": "Visualization deleted successfully"},
                status=status.HTTP_200_OK,
            )
        except Visualization.DoesNotExist:
            return Response(
                {"message": "Visualization not found"}, status=status.HTTP_404_NOT_FOUND
            )


class SensorsViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

    # permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Create new sensor."""
        name = request.data.get("name")
        geog = request.data.get("geog")
        parameters = request.data.get("parameters")
        properties = request.data.get("properties")
        min_start_time = request.data.get("min_start_time")
        max_end_time = request.data.get("max_end_time")
        # Create sensor
        new_sensor = Sensor.objects.create(
            name=name,
            geog=geog,
            parameters=parameters,
            properties=properties,
            min_start_time=min_start_time,
            max_end_time=max_end_time,
        )
        new_sensor.save()

        serialized_sensor = SensorSerializer(new_sensor)
        return Response(serialized_sensor.data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        queryset = Sensor.objects.all()
        name_filter = self.request.query_params.get("name", None)

        if name_filter:
            queryset = queryset.filter(name=name_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset:
            return Response(
                {"message": "No sensors found"}, status=status.HTTP_404_NOT_FOUND
            )

        if self.request.query_params.get("name", None):
            serializer = SensorSerializer(queryset[0])
            return Response({"sensor": serializer.data})
        serializer = SensorSerializer(queryset, many=True)
        return Response({"sensors": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"sensor": serializer.data})


class StreamsViewSet(viewsets.ModelViewSet):
    queryset = Stream.objects.all()
    serializer_class = StreamSerializer

    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Stream.objects.all()
        name_filter = self.request.query_params.get("name", None)

        if name_filter:
            queryset = queryset.filter(name=name_filter)

        return queryset


class DatapointsViewSet(viewsets.ModelViewSet):
    """View all datapoints."""

    queryset = Datapoint.objects.all()
    serializer_class = DatapointSerializer

    def create(self, request, *args, **kwargs):
        """Create new datapoint."""
        data = self.request.data
        datapoints = []
        datapoint_data = {
            "geog": data["geog"],
            "time": data["time"],
            "end_time": data["end_time"],
            "stream": Stream.objects.get(id=data["stream"]).id,
        }
        datapoints_data = (
            json.loads(data["data"]) if type(data["data"]) is str else data["data"]
        )

        for key, value in datapoints_data.items():
            try:
                datapoint = datapoint_data.copy()
                datapoint["parameter"] = Parameter.objects.get(name=key.strip()).id
                datapoint["value"] = value
                datapoints.append(datapoint)
            except Parameter.DoesNotExist:
                print("Parameter does not exist-", key.strip())
                continue

        datapoint_serializer = DatapointSerializer(data=datapoints, many=True)
        if datapoint_serializer.is_valid():
            datapoint_serializer.save()
            response = {"message": "Datapoint created successfully"}
            return Response(response, status=status.HTTP_201_CREATED)
        else:
            response = {"message": datapoint_serializer.errors}
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["GET"])
    def get_hourly_average_datapoints_by_parameter(self, request):
        """Get hourly average datapoints by parameter."""
        sensor_id = request.GET.get("sensor_id")
        parameter = request.GET.getlist("parameter")
        since = request.GET.get("since")
        until = request.GET.get("until")
        shortened = request.GET.get("shortened")
        if shortened == "true":
            return DatapointsViewSet.get_time_period_binned_small_datapoint(
                sensor_id, "hourly", parameter, since, until
            )

        return DatapointsViewSet.get_time_period_binned_datapoint(
            sensor_id, "hourly", parameter, since, until
        )

    @action(detail=False, methods=["GET"])
    def get_daily_average_datapoints_by_parameter(self, request):
        """Get daily average datapoints by parameter."""
        sensor_id = request.GET.get("sensor_id")
        parameter = request.GET.getlist("parameter")
        since = request.GET.get("since")
        until = request.GET.get("until")
        shortened = request.GET.get("shortened")
        if shortened == "true":
            return DatapointsViewSet.get_time_period_binned_small_datapoint(
                sensor_id, "daily", parameter, since, until
            )

        return DatapointsViewSet.get_time_period_binned_datapoint(
            sensor_id, "daily", parameter, since, until
        )

    @action(detail=False, methods=["GET"])
    def get_monthly_average_datapoints_by_parameter(self, request):
        """Get monthly average datapoints by parameter."""
        sensor_id = request.GET.get("sensor_id")
        parameter = request.GET.getlist("parameter")
        since = request.GET.get("since")
        until = request.GET.get("until")
        shortened = request.GET.get("shortened")
        if shortened == "true":
            return DatapointsViewSet.get_time_period_binned_small_datapoint(
                sensor_id, "monthly", parameter, since, until
            )

        return DatapointsViewSet.get_time_period_binned_datapoint(
            sensor_id, "monthly", parameter, since, until
        )

    @action(detail=False, methods=["GET"])
    def get_yearly_average_datapoints_by_parameter(self, request):
        """Get yearly average datapoints by parameter."""
        sensor_id = request.GET.get("sensor_id")
        parameter = request.GET.getlist("parameter")
        since = request.GET.get("since")
        until = request.GET.get("until")
        shortened = request.GET.get("shortened")
        if shortened == "true":
            return DatapointsViewSet.get_time_period_binned_small_datapoint(
                sensor_id, "yearly", parameter, since, until
            )

        return DatapointsViewSet.get_time_period_binned_datapoint(
            sensor_id, "yearly", parameter, since, until
        )

    @staticmethod
    def get_time_period_binned_datapoint(
        sensor_id, time_period, parameter=None, since=None, until=None
    ):
        # TODO: Check sensor_id is valid, and also if parameter is valid
        if sensor_id is None:
            return Response(
                {"message": "Sensor ID must be provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            sensor_id = int(sensor_id)
        except ValueError:
            return Response(
                {"message": "Sensor ID must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if time_period == "hourly":
            query = """
                    SELECT
                        parameters.name AS parameter,
                        average,
                        count,
                        bucket AS date,
                        DATE(bucket) AS label,
                        EXTRACT(YEAR FROM bucket) AS year,
                        EXTRACT(MONTH FROM bucket) AS month,
                        EXTRACT(DAY FROM bucket) AS day,
                        EXTRACT(HOUR FROM bucket) AS hour
                    FROM
                        hourly_sensor_data
                    RIGHT JOIN
                        parameters ON hourly_sensor_data.parameter_id = parameters.id
                    LEFT JOIN
                        streams ON hourly_sensor_data.stream_id = streams.id
                    WHERE
                        streams.sensor_id = {sensor_id}
                    """
        elif time_period == "daily":
            query = """
                    SELECT
                        parameters.name AS parameter,
                        average,
                        count,
                        bucket AS date,
                        DATE(bucket) AS label,
                        EXTRACT(YEAR FROM bucket) AS year,
                        EXTRACT(MONTH FROM bucket) AS month,
                        EXTRACT(DAY FROM bucket) AS day
                    FROM
                        daily_sensor_data
                    RIGHT JOIN
                        parameters ON daily_sensor_data.parameter_id = parameters.id
                    LEFT JOIN
                        streams ON daily_sensor_data.stream_id = streams.id
                    WHERE
                        streams.sensor_id = {sensor_id}
                    """
        elif time_period == "monthly":
            query = """
                    SELECT
                    parameters.name AS parameter,
                    average,
                    count,
                    bucket AS date,
                    DATE(bucket) AS label,
                    EXTRACT(YEAR FROM bucket) AS year,
                    EXTRACT(MONTH FROM bucket) AS month
                    FROM monthly_sensor_data
                    RIGHT JOIN
                    parameters ON monthly_sensor_data.parameter_id = parameters.id
                    LEFT JOIN
                    streams ON monthly_sensor_data.stream_id = streams.id
                    WHERE
                    streams.sensor_id = {sensor_id}
                    """
        elif time_period == "yearly":
            query = """
                    SELECT
                    parameters.name AS parameter,
                    average,
                    count,
                    bucket AS date,
                    DATE(bucket) AS label,
                    EXTRACT(YEAR FROM bucket) AS year
                    FROM yearly_sensor_data
                    RIGHT JOIN
                    parameters ON yearly_sensor_data.parameter_id = parameters.id
                    LEFT JOIN
                    streams ON yearly_sensor_data.stream_id = streams.id
                    WHERE
                    streams.sensor_id = {sensor_id}
                    """

        if len(parameter):
            # Check if list of parameters is valid
            if len(parameter) != len(Parameter.objects.filter(name__in=parameter)):
                return Response(
                    {"message": "Parameter does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            parameter_list = ",".join(["'" + param + "'" for param in parameter])
            query += "AND parameters.name IN ({parameter_list}) ".format(
                parameter_list=parameter_list
            )

        if since:
            query += "AND bucket >= '{since}'::timestamp ".format(since=since)
        if until:
            query += "AND bucket <= '{until}'::timestamp ".format(until=until)

        query += ";"
        query = query.format(sensor_id=sensor_id)
        with connection.cursor() as cursor:
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        data = {}
        for datapoint in results:
            label = datapoint["parameter"]
            if label not in data:
                data[label] = []
            del datapoint["parameter"]  # Remove 'label' key
            data[label].append(datapoint)

        response = {
            "sensor_name": Sensor.objects.get(id=sensor_id).name,
            "properties": data,
        }

        return Response(response, status=status.HTTP_200_OK)

    @staticmethod
    def get_time_period_binned_small_datapoint(
        sensor_id, time_period, parameter=None, since=None, until=None
    ):
        # TODO: Check sensor_id is valid, and also if parameter is valid
        if sensor_id is None:
            return Response(
                {"message": "Sensor ID must be provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if sensor_id.isdigit() is False:
            return Response(
                {"message": "Sensor ID must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        query = ""
        if time_period == "hourly":
            query = """
                    SELECT
                        parameters.name AS parameter,
                        average,
                        count,
                        bucket AS date,
                        DATE(bucket) AS label
                    FROM
                        hourly_sensor_data
                    RIGHT JOIN
                        parameters ON hourly_sensor_data.parameter_id = parameters.id
                    LEFT JOIN
                        streams ON hourly_sensor_data.stream_id = streams.id
                    WHERE
                        streams.sensor_id = {sensor_id}
                    """
        elif time_period == "daily":
            query = """
                    SELECT
                        parameters.name AS parameter,
                        average,
                        count,
                        bucket AS date,
                        DATE(bucket) AS label
                    FROM
                        daily_sensor_data
                    RIGHT JOIN
                        parameters ON daily_sensor_data.parameter_id = parameters.id
                    LEFT JOIN
                        streams ON daily_sensor_data.stream_id = streams.id
                    WHERE
                        streams.sensor_id = {sensor_id}
                    """
        elif time_period == "monthly":
            query = """
                    SELECT
                    parameters.name AS parameter,
                    average,
                    count,
                    bucket AS date,
                    DATE(bucket) AS label
                    FROM monthly_sensor_data
                    RIGHT JOIN
                    parameters ON monthly_sensor_data.parameter_id = parameters.id
                    LEFT JOIN
                    streams ON monthly_sensor_data.stream_id = streams.id
                    WHERE
                    streams.sensor_id = {sensor_id}
                    """
        elif time_period == "yearly":
            query = """
                    SELECT
                    parameters.name AS parameter,
                    average,
                    count,
                    bucket AS date,
                    DATE(bucket) AS label
                    FROM yearly_sensor_data
                    RIGHT JOIN
                    parameters ON yearly_sensor_data.parameter_id = parameters.id
                    LEFT JOIN
                    streams ON yearly_sensor_data.stream_id = streams.id
                    WHERE
                    streams.sensor_id = {sensor_id}
                    """

        if len(parameter):
            # Check if list of parameters is valid
            if len(parameter) != len(Parameter.objects.filter(name__in=parameter)):
                return Response(
                    {"message": "Parameter does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            parameter_list = ",".join(["'" + param + "'" for param in parameter])
            query += "AND parameters.name IN ({parameter_list}) ".format(
                parameter_list=parameter_list
            )

        if since:
            query += "AND bucket >= '{since}'::timestamp ".format(since=since)
        if until:
            query += "AND bucket <= '{until}'::timestamp ".format(until=until)

        query += ";"
        query = query.format(sensor_id=sensor_id)
        with connection.cursor() as cursor:
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        response = {}
        for datapoint in results:
            label = datapoint["parameter"]
            if label not in response:
                response[label] = []
            del datapoint["parameter"]  # Remove 'label' key
            response[label].append(datapoint)
        return Response(response, status=status.HTTP_200_OK)
