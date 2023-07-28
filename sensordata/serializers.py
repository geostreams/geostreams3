from rest_framework import serializers
from .models import Category, ParameterCategory, Parameter, Sensor, Stream, Datapoint, \
    DatapointBin, DatapointHourlyBin, DatapointDailyBin, DatapointMonthlyBin, DatapointYearlyBin


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


class DatapointMonthlyBinSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatapointMonthlyBin
        fields = '__all__'




class DatapointYearlyBinSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatapointYearlyBin
        fields = '__all__'
