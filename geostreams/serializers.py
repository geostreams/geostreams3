from rest_framework import serializers
from .models import BinsDay, BinsHour, BinsMonth, BinsSeason, BinsYear, Categories, Datapoints, Events, \
    ParameterCategories, Parameters, RegionTrends, Regions, Sensors, SpatialRefSys, Streams, Users


class BinsDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = BinsDay
        fields = '__all__'


class BinsHourSerializer(serializers.ModelSerializer):
    class Meta:
        model = BinsHour
        fields = '__all__'


class BinsMonthSerializer(serializers.ModelSerializer):
    class Meta:
        model = BinsMonth
        fields = '__all__'


class BinsSeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = BinsSeason
        fields = '__all__'


class BinsYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = BinsYear
        fields = '__all__'


class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = '__all__'


class DatapointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Datapoints
        fields = '__all__'


class EventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Events
        fields = '__all__'


class ParameterCategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParameterCategories
        fields = '__all__'


class ParametersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameters
        fields = '__all__'


class RegionTrendsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegionTrends
        fields = '__all__'


class RegionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Regions
        fields = '__all__'


class SensorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensors
        fields = '__all__'


class SpatialRefSysSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpatialRefSys
        fields = '__all__'


class StreamsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Streams
        fields = '__all__'


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'
