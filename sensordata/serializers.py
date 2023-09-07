from rest_framework import serializers
from .models import Category, ParameterCategory, Parameter, Sensor, Stream, Datapoint


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ParameterCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ParameterCategory
        fields = '__all__'


class ParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameter
        fields = '__all__'


class SensorSerializer(serializers.ModelSerializer):
    geotype = serializers.SerializerMethodField()
    geometry = serializers.SerializerMethodField()

    class Meta:
        model = Sensor
        fields = [
            'id',
            'name',
            'created',
            'geotype',
            'geometry',
            'properties',
            'min_start_time',
            'max_end_time',
            'parameters'
        ]


    # TODO: Need to change this to be more dynamic, for now just hardcode
    def get_geotype(self, obj):
        return "Feature"

    def get_geometry(self, obj):
        return {
            "type": "Point",
            "coordinates": [obj.geog.x, obj.geog.y, obj.geog.z]
        }


class StreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stream
        fields = '__all__'


class DatapointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Datapoint
        fields = '__all__'
