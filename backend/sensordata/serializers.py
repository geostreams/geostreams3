from django.contrib.gis.geos import GEOSGeometry
from rest_framework import serializers
import json
import itertools
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
    # These are now handled by the queryset annotation, no SerializerMethodField needed
    min_start_time = serializers.DateTimeField(read_only=True)
    max_end_time = serializers.DateTimeField(read_only=True)
    parameters = serializers.SerializerMethodField()

    class Meta:
        model = Sensor
        fields = [
            "id",
            "name",
            "source",
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

    def get_parameters(self, obj):
        # Get all the different parameters from all streams associated with this sensor
        all_parameters = getattr(obj, "all_parameters", None)
        if all_parameters:
            # Flatten the nested arrays and remove duplicates using itertools.chain
            return list(
                set(itertools.chain.from_iterable(filter(None, all_parameters)))
            )
        return []

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


class GeoJSONSensorSerializer(serializers.ModelSerializer):
    """Serializer that formats a single sensor as a GeoJSON Feature."""

    type = serializers.SerializerMethodField()
    geometry = serializers.SerializerMethodField()
    properties = serializers.SerializerMethodField()

    class Meta:
        model = Sensor
        fields = ["type", "geometry", "properties"]

    def get_type(self, obj):
        return obj.geotype

    def get_geometry(self, obj):
        # Convert the GEOSGeometry object to a GeoJSON dict
        # The geometry type will be determined by the actual geometry (Point, Polygon, etc.)
        return json.loads(obj.geog.geojson) if obj.geog else None

    def get_properties(self, obj):
        # Use the annotated values from the queryset instead of making separate queries
        min_start_time = getattr(obj, "min_start_time", None)
        max_end_time = getattr(obj, "max_end_time", None)

        # Use the annotated parameters from the queryset instead of making separate queries
        all_parameters = getattr(obj, "all_parameters", None)
        if all_parameters:
            # Flatten the nested arrays and remove duplicates using itertools.chain
            unique_params = list(
                set(itertools.chain.from_iterable(filter(None, all_parameters)))
            )
        else:
            unique_params = []

        return {
            "id": obj.id,
            "name": obj.name,
            "source": obj.source,
            "created": obj.created,
            "properties": obj.properties,
            "parameters": unique_params,
            "min_start_time": min_start_time,
            "max_end_time": max_end_time,
        }
