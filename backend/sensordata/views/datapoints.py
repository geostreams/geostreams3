from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from collections import defaultdict

import json

from dateutil import parser
from django.db import connection

from ..models import Datapoint, Stream, Parameter, Sensor
from ..serializers import DatapointSerializer
from .auth_base import AuthEnforcedModelViewSet
from ..utils.pagination import parse_limit_offset, apply_limit_offset


class DatapointsViewSet(AuthEnforcedModelViewSet):
    """View all datapoints."""

    queryset = Datapoint.objects.all()
    serializer_class = DatapointSerializer

    def get_queryset(self):
        return (
            Datapoint.objects.select_related("stream__sensor", "parameter")
            .prefetch_related("stream__sensor__streams")
            .order_by("id")
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        total_count = queryset.count()
        if total_count == 0:
            return Response(
                {"message": "No datapoints found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            limit, offset = parse_limit_offset(request.query_params, default_limit=100)
        except ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)

        paginated_queryset = apply_limit_offset(queryset, limit, offset)
        serializer = self.get_serializer(paginated_queryset, many=True)
        return Response(
            {
                "datapoints": serializer.data,
                "pagination": {
                    "count": total_count,
                    "limit": limit,
                    "offset": offset,
                    "returned": len(serializer.data),
                },
            }
        )

    def _parse_datapoint_parameters(self, datapoint):
        """
        Take a single JSON post of datapoint data (with multiple parameters) and split it into
        multiple datapoints with one parameter each, and return the list of datapoints.
        Raises ValueError if parameter doesn't exist.
        """
        datapoints = []
        datapoint_template = {
            "time": datapoint["time"],
            "stream": datapoint["stream"],
        }
        datapoints_data = (
            json.loads(datapoint["data"])
            if type(datapoint["data"]) is str
            else datapoint["data"]
        )
        stream = Stream.objects.get(id=datapoint["stream"])

        # this is splitting the parameters
        for key, value in datapoints_data.items():
            try:
                datapoint = datapoint_template.copy()
                # Check if parameter in streams or in parameters
                # If parameter exists but not in stream, add it to stream
                if key.strip() not in stream.parameters:
                    if Parameter.objects.filter(name=key.strip()).exists():
                        stream.parameters.append(key.strip())
                        stream.save()
                    else:
                        raise ValueError(f"Parameter {key} does not exist")

                datapoint["parameter"] = Parameter.objects.get(name=key.strip()).id
                datapoint["value"] = value
                datapoints.append(datapoint)
            except Parameter.DoesNotExist:
                raise ValueError(f"Parameter {key} does not exist")
        return datapoints

    def create(self, request, *args, **kwargs):
        """Create new datapoint."""
        data = self.request.data

        # Convert JSON to datapoint array
        is_many = isinstance(data, list)
        new_datapoints = []

        try:
            if not is_many:
                new_datapoints += self._parse_datapoint_parameters(data)
            else:
                # Use map for more efficient processing of list
                parsed_datapoints = list(map(self._parse_datapoint_parameters, data))
                # Flatten the list of lists
                for dp_list in parsed_datapoints:
                    new_datapoints += dp_list
        except ValueError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Determine earliest/latest time per stream
        stream_times = {}
        for dp in new_datapoints:
            stream = dp["stream"]
            time = parser.parse(dp["time"])  # Parse once and reuse
            if stream not in stream_times:
                stream_times[stream] = {"earliest": time, "latest": time}
            else:
                stream_times[stream]["earliest"] = min(
                    stream_times[stream]["earliest"], time
                )
                stream_times[stream]["latest"] = max(
                    stream_times[stream]["latest"], time
                )

        datapoint_serializer = DatapointSerializer(data=new_datapoints, many=True)
        if datapoint_serializer.is_valid():
            datapoint_serializer.save()
            # Update start_time and end_time in streams
            # Fetch streams in bulk
            stream_ids = stream_times.keys()
            streams = Stream.objects.filter(id__in=stream_ids)

            # Update start_time and end_time for each stream
            for stream in streams:
                stream_id = stream.id
                earliest_time = stream_times[stream_id]["earliest"]
                latest_time = stream_times[stream_id]["latest"]
                if stream.start_time is None or stream.start_time > earliest_time:
                    stream.start_time = earliest_time
                if stream.end_time is None or stream.end_time < latest_time:
                    stream.end_time = latest_time

            # Save all streams in bulk
            Stream.objects.bulk_update(streams, ["start_time", "end_time"])

            return Response(
                {"message": "Datapoint(s) created successfully"},
                status=status.HTTP_201_CREATED,
            )
        else:
            response = {"message": datapoint_serializer.errors}
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["GET"])
    def get_values(self, request):
        """Get hourly average datapoints by parameter."""
        sensor_id = request.GET.get("sensor_id")
        parameter = request.GET.getlist("parameter")
        since = request.GET.get("since")
        until = request.GET.get("until")

        return DatapointsViewSet.get_datapoint_values(
            sensor_id, parameter, since, until
        )

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

    @action(detail=False, methods=["POST"])
    def refresh_aggregates(self, request):
        time_period = request.data.get("time_period", None)
        return self.refresh_continuous_aggregates(time_period)

    @staticmethod
    def get_datapoint_values(sensor_id, parameter, since=None, until=None):
        if sensor_id is None:
            return Response(
                {"message": "Sensor ID must be provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if parameter is None:
            return Response(
                {"message": "Parameter must be provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            sensor_id = int(sensor_id)
        except ValueError:
            return Response(
                {"message": "Sensor ID must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate sensor_id is valid
        if not Sensor.objects.filter(id=sensor_id).exists():
            return Response(
                {"message": "Sensor ID does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate parameter is valid
        if not Parameter.objects.filter(name=parameter).exists():
            return Response(
                {"message": "Parameter does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        query = """
                    SELECT
                        value
                    FROM
                        datapoints
                    RIGHT JOIN
                        parameters ON datapoints.parameter_id = parameters.id
                    LEFT JOIN
                        streams ON datapoints.stream_id = streams.id
                    WHERE
                        streams.sensor_id = {sensor_id}
                        AND
                        parameters.name = {parameter}
                    """

        if since:
            query += "AND time >= '{since}'::timestamp ".format(since=since)
        if until:
            query += "AND time <= '{until}'::timestamp ".format(until=until)

        query += " order by time asc;"
        query = query.format(sensor_id=sensor_id, parameter=parameter)
        with connection.cursor() as cursor:
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # More efficient list comprehension
        data = [datapoint["value"] for datapoint in results]

        return Response(data, status=status.HTTP_200_OK)

    @staticmethod
    def get_time_period_binned_datapoint(
        sensor_id, time_period, parameter=None, since=None, until=None
    ):
        # Check if sensor id is valid
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

        # Validate sensor_id is valid
        if not Sensor.objects.filter(id=sensor_id).exists():
            return Response(
                {"message": "Sensor ID does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if time_period == "hourly":
            query = """
                    SELECT
                        parameters.name AS parameter,
                        streams.id as stream_id,
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
                        streams.id as stream_id,
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
                    streams.id as stream_id,
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
                    streams.id as stream_id,
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

        # Trunaction is necessary only for since because of the nature of the continuous aggregates.
        # The aggregates start from the beginning of earliest datapoint in the stream.
        # So we need to truncate the since to the nearest unit of the time period.
        trunc_map = {
            "hourly": "hour",
            "daily": "day",
            "monthly": "month",
            "yearly": "year",
        }
        trunc_unit = trunc_map[time_period]
        if since:
            query += "AND bucket >= date_trunc('{trunc_unit}', '{since}'::timestamp) ".format(
                trunc_unit=trunc_unit, since=since
            )
        if until:
            query += "AND bucket <= '{until}'::timestamp ".format(until=until)

        query += "ORDER BY bucket ASC;"
        query = query.format(sensor_id=sensor_id)
        with connection.cursor() as cursor:
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # More efficient grouping using defaultdict
        # since it eliminates the need for checking if the label is in the dictionary
        data = defaultdict(list)
        for datapoint in results:
            label = datapoint.pop("parameter")  # Extract and remove in one operation
            data[label].append(datapoint)
        data = dict(data)  # Convert back to regular dict for consistent API

        # Single query to get both sensor name and stream info
        try:
            sensor = (
                Sensor.objects.select_related()
                .prefetch_related("streams")
                .get(id=sensor_id)
            )
            sensor_name = sensor.name
            stream_dict = {stream.id: stream.name for stream in sensor.streams.all()}
        except Sensor.DoesNotExist:
            return Response(
                {"message": "Sensor ID does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response = {
            "sensor_name": sensor_name,
            "streams": stream_dict,
            "properties": data,
        }

        return Response(response, status=status.HTTP_200_OK)

    @staticmethod
    def get_time_period_binned_small_datapoint(
        sensor_id, time_period, parameter=None, since=None, until=None
    ):
        # Check if sensor id is valid
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

        # Validate sensor_id is valid
        if not Sensor.objects.filter(id=sensor_id).exists():
            return Response(
                {"message": "Sensor ID does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        query = ""
        if time_period == "hourly":
            query = """
                    SELECT
                        parameters.name AS parameter,
                        streams.id as stream_id,
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
                        streams.id as stream_id,
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
                    streams.id as stream_id,
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
                    streams.id as stream_id,
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

        query += "ORDER BY bucket ASC;"
        query = query.format(sensor_id=sensor_id)
        with connection.cursor() as cursor:
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # More efficient grouping using defaultdict and optimized stream collection
        data = defaultdict(list)
        stream_ids = set()  # Use set to collect unique stream IDs

        for datapoint in results:
            stream_ids.add(datapoint["stream_id"])  # Collect unique stream IDs
            label = datapoint.pop("parameter")  # Extract and remove in one operation
            data[label].append(datapoint)

        data = dict(data)  # Convert back to regular dict for consistent API

        # Get stream names by filtering streams by sensor_id
        stream_dict = {
            stream.id: stream.name
            for stream in Stream.objects.filter(sensor_id=sensor_id)
        }

        response = {
            "sensor_name": Sensor.objects.get(id=sensor_id).name,
            "streams": stream_dict,
            "properties": data,
        }

        return Response(response, status=status.HTTP_200_OK)

    def refresh_continuous_aggregates(self, time_period):
        """Refresh the continuous aggregates for the given time period to reflect the latest data."""
        # Get start_time and end_time for datapoints
        try:
            query = ""
            if time_period == "hour":
                query = """
                        CALL
                            refresh_continuous_aggregate('hourly_sensor_data', NULL, NULL)
                            """
            elif time_period == "day":
                query = """
                        CALL
                            refresh_continuous_aggregate('daily_sensor_data', NULL, NULL)
                        """
            elif time_period == "month":
                query = """
                        CALL
                            refresh_continuous_aggregate('monthly_sensor_data', NULL, NULL)
                        """
            elif time_period == "year":
                query = """
                        CALL
                            refresh_continuous_aggregate('yearly_sensor_data', NULL, NULL)
                        """
            elif time_period == "all":
                query = [
                    """
                        CALL
                            refresh_continuous_aggregate('hourly_sensor_data', NULL, NULL)
                    """,
                    """
                        CALL
                            refresh_continuous_aggregate('daily_sensor_data', NULL, NULL)
                    """,
                    """
                        CALL
                            refresh_continuous_aggregate('monthly_sensor_data', NULL, NULL)
                    """,
                    """
                        CALL
                            refresh_continuous_aggregate('yearly_sensor_data', NULL, NULL)
                    """,
                ]

            else:
                return Response(
                    {"message": "Invalid time period provided"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with connection.cursor() as cursor:
                if isinstance(query, list):
                    for q in query:
                        cursor.execute(q)
                else:
                    cursor.execute(query)

            return Response(
                {"message": "Cache refreshed successfully"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({"message": e}, status=status.HTTP_400_BAD_REQUEST)
