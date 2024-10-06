from django.contrib.gis.geos import GEOSGeometry
from django.db.models import Min, Max
from rest_framework import serializers
import json
from .models import (
    Category,
    ParameterCategory,
    Parameter,
    Sensor,
    Stream,
    Datapoint,
    Visualization,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class VisualizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visualization
        fields = "__all__"


class ParameterCategorySerializer(serializers.ModelSerializer):
    parameter_id = serializers.IntegerField(source="parameter.id", read_only=True)
    category_id = serializers.IntegerField(source="category.id", read_only=True)

    class Meta:
        model = ParameterCategory
        fields = ("id", "parameter_id", "category_id")


class ParameterSerializer(serializers.ModelSerializer):
    # Showing the name of the visualization instead of the id
    visualization = serializers.CharField(source="visualization.name", read_only=True)

    class Meta:
        model = Parameter
        fields = "__all__"


class SensorSerializer(serializers.ModelSerializer):
    geometry = serializers.SerializerMethodField()
    min_start_time = serializers.SerializerMethodField()
    max_end_time = serializers.SerializerMethodField()
    parameters = serializers.SerializerMethodField()

    class Meta:
        model = Sensor
        fields = [
            "id",
            "name",
            "geotype",
            "created",
            "geometry",
            "properties",
            "parameters",
            "min_start_time",
            "max_end_time",
        ]

    def get_geometry(self, obj):
        # Convert the GEOSGeometry object to a GeoJSON dict and stores it in the 'geometry' field
        return json.loads(obj.geog.geojson) if obj.geog else None

    def get_min_start_time(self, obj):
        # Gets the earliest start_time from all streams associated with this sensor
        return obj.streams.aggregate(min_start_time=Min("start_time"))["min_start_time"]

    def get_max_end_time(self, obj):
        # Gets the latest end_time from all streams associated with this sensor
        return obj.streams.aggregate(max_end_time=Max("end_time"))["max_end_time"]

    def get_parameters(self, obj):
        # Gets all parameters from streams associated with this sensor
        all_params = obj.streams.values_list("parameters", flat=True).distinct()
        return list(set(param for params in all_params for param in params))

    def to_internal_value(self, data):
        # Copy data to avoid mutating the input
        mutable_data = data.copy()

        # Extract and remove 'geometry' to handle it separately
        geojson = mutable_data.pop("geometry", None)

        # Let DRF process the rest of the fields
        validated_data = super().to_internal_value(mutable_data)

        if geojson:
            # TODO: SRID should be configurable as a setting
            geos_geom = GEOSGeometry(json.dumps(geojson), srid=4326)
            validated_data["geog"] = geos_geom

        return validated_data


class StreamSerializer(serializers.ModelSerializer):
    geometry = serializers.SerializerMethodField()

    class Meta:
        model = Stream
        fields = [
            "id",
            "sensor",
            "name",
            "geotype",
            "created",
            "parameters",
            "properties",
            "start_time",
            "end_time",
            "geometry",
        ]

    def get_geometry(self, obj):
        return json.loads(obj.geog.geojson) if obj.geog else None

    def to_internal_value(self, data):
        # Copy data to avoid mutating the input
        mutable_data = data.copy()

        # Extract and remove 'geometry' to handle it separately
        geojson = mutable_data.pop("geometry", None)

        # Let DRF process the rest of the fields
        validated_data = super().to_internal_value(mutable_data)

        if geojson:
            # TODO: SRID should be configurable as a setting
            geos_geom = GEOSGeometry(json.dumps(geojson), srid=4326)
            validated_data["geog"] = geos_geom

        return validated_data


class DatapointSerializer(serializers.ModelSerializer):
    sensor_id = serializers.IntegerField(source="stream.sensor.id", read_only=True)
    sensor_name = serializers.CharField(source="stream.sensor.name", read_only=True)

    class Meta:
        model = Datapoint
        fields = [
            "id",
            "created",
            "stream",
            "sensor_id",
            "sensor_name",
            "type",
            "time",
            "parameter",
            "value",
        ]
