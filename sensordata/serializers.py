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
