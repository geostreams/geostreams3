from django.contrib.gis.geos import GEOSGeometry
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

    class Meta:
        model = Sensor
        fields = [
            "id",
            "name",
            "created",
            "geometry",
            "properties",
            "parameters",
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


class StreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stream
        fields = "__all__"


class DatapointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Datapoint
        fields = "__all__"
