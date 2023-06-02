from rest_framework import serializers
from .models import Categories, Datapoints, ParameterCategories, Parameters, Sensors


class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = '__all__'


class DatapointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Datapoints
        fields = '__all__'


class ParameterCategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParameterCategories
        fields = '__all__'


class ParametersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameters
        fields = '__all__'


class SensorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensors
        fields = '__all__'
