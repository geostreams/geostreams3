from rest_framework import serializers
from .models import Category, ParameterCategory, Parameter, Sensor, Stream, Datapoint, \
    DatapointBin, DatapointHourlyBin, DatapointDailyBin, DatapointWeeklyBin, DatapointMonthlyBin, DatapointYearlyBin


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
    class Meta:
        model = Sensor
        fields = '__all__'


class StreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stream
        fields = '__all__'


class DatapointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Datapoint
        fields = '__all__'


class DatapointBinSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatapointBin
        fields = '__all__'


class DatapointHourlyBinSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatapointHourlyBin
        fields = '__all__'


class DatapointDailyBinSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatapointDailyBin
        fields = '__all__'


class DatapointWeeklyBinSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatapointWeeklyBin
        fields = '__all__'


class DatapointMonthlyHelperBinSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatapointMonthlyBin
        fields = '__all__'

    def to_representation(self, instance):
        # Get the default representation
        representation = super().to_representation(instance)
        parameter_name = representation['parameter']
        datapoint_rep = {parameter_name: {
           'date': representation['date'],
           'label': representation['label'],
           'count': representation['count'],
           'average': representation['average'],
           'sources': representation['sources'],
           'year': representation['year'],
           'month': representation['month']
        }}
        return datapoint_rep

class DatapointMonthlyBinSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatapointMonthlyBin
        fields = '__all__'

    def to_representation(self, instance):
        # Get the default representation
        # representation = super().to_representation(instance)
        # TODO - need to implement check in case query returns empty
        representation = dict()
        representation["sensor_name"] = instance[0]["sensor_name"]
        representation['properties'] = DatapointMonthlyHelperBinSerializer(instance, many=True).data
        return representation

class DatapointYearlyBinSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatapointYearlyBin
        fields = '__all__'
