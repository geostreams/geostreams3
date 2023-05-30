# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class BinsDay(models.Model):
    sensor_id = models.IntegerField(primary_key=True)
    yyyy = models.IntegerField()
    mm = models.IntegerField()
    dd = models.IntegerField()
    parameter = models.CharField(max_length=255)
    datapoint_count = models.IntegerField(blank=True, null=True)
    sum = models.FloatField(blank=True, null=True)
    average = models.FloatField(blank=True, null=True)
    start_time = models.DateTimeField(blank=True, null=True)
    end_time = models.DateTimeField(blank=True, null=True)
    updated = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'bins_day'
        unique_together = (('sensor_id', 'yyyy', 'mm', 'dd', 'parameter'),)


class BinsHour(models.Model):
    sensor_id = models.IntegerField(primary_key=True)
    yyyy = models.IntegerField()
    mm = models.IntegerField()
    dd = models.IntegerField()
    hh = models.IntegerField()
    parameter = models.CharField(max_length=255)
    datapoint_count = models.IntegerField(blank=True, null=True)
    sum = models.FloatField(blank=True, null=True)
    average = models.FloatField(blank=True, null=True)
    start_time = models.DateTimeField(blank=True, null=True)
    end_time = models.DateTimeField(blank=True, null=True)
    updated = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'bins_hour'
        unique_together = (('sensor_id', 'yyyy', 'mm', 'dd', 'hh', 'parameter'),)


class BinsMonth(models.Model):
    sensor_id = models.IntegerField(primary_key=True)
    yyyy = models.IntegerField()
    mm = models.IntegerField()
    parameter = models.CharField(max_length=255)
    datapoint_count = models.IntegerField(blank=True, null=True)
    sum = models.FloatField(blank=True, null=True)
    average = models.FloatField(blank=True, null=True)
    start_time = models.DateTimeField(blank=True, null=True)
    end_time = models.DateTimeField(blank=True, null=True)
    updated = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'bins_month'
        unique_together = (('sensor_id', 'yyyy', 'mm', 'parameter'),)


class BinsSeason(models.Model):
    sensor_id = models.IntegerField(primary_key=True)
    yyyy = models.IntegerField()
    season = models.CharField(max_length=10)
    parameter = models.CharField(max_length=255)
    datapoint_count = models.IntegerField(blank=True, null=True)
    sum = models.FloatField(blank=True, null=True)
    average = models.FloatField(blank=True, null=True)
    start_time = models.DateTimeField(blank=True, null=True)
    end_time = models.DateTimeField(blank=True, null=True)
    updated = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'bins_season'
        unique_together = (('sensor_id', 'yyyy', 'season', 'parameter'),)


class BinsYear(models.Model):
    sensor_id = models.IntegerField(primary_key=True)
    yyyy = models.IntegerField()
    parameter = models.CharField(max_length=255)
    datapoint_count = models.IntegerField(blank=True, null=True)
    sum = models.FloatField(blank=True, null=True)
    average = models.FloatField(blank=True, null=True)
    start_time = models.DateTimeField(blank=True, null=True)
    end_time = models.DateTimeField(blank=True, null=True)
    updated = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'bins_year'
        unique_together = (('sensor_id', 'yyyy', 'parameter'),)


class Categories(models.Model):
    gid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    detail_type = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'categories'


class Datapoints(models.Model):
    gid = models.AutoField(primary_key=True)
    geog = models.TextField(blank=True, null=True)  # This field type is a guess.
    start_time = models.DateTimeField(blank=True, null=True)
    end_time = models.DateTimeField(blank=True, null=True)
    data = models.TextField(blank=True, null=True)  # This field type is a guess.
    stream_id = models.IntegerField(blank=True, null=True)
    created = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'datapoints'


class Events(models.Model):
    gid = models.AutoField(primary_key=True)
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='userid', blank=True, null=True)
    sources = models.CharField(max_length=50, blank=True, null=True)
    attributes = models.TextField(blank=True, null=True)
    geocode = models.CharField(max_length=2000, blank=True, null=True)
    since = models.CharField(max_length=50, blank=True, null=True)
    until = models.CharField(max_length=50, blank=True, null=True)
    purpose = models.CharField(max_length=1000, blank=True, null=True)
    downloaddate = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'events'


class ParameterCategories(models.Model):
    gid = models.AutoField(primary_key=True)
    parameter_gid = models.ForeignKey('Parameters', models.DO_NOTHING, db_column='parameter_gid')
    category_gid = models.ForeignKey(Categories, models.DO_NOTHING, db_column='category_gid')

    class Meta:
        managed = False
        db_table = 'parameter_categories'


class Parameters(models.Model):
    gid = models.AutoField(primary_key=True)
    name = models.CharField(unique=True, max_length=200)
    title = models.CharField(max_length=200, blank=True, null=True)
    unit = models.CharField(max_length=20, blank=True, null=True)
    search_view = models.BooleanField(blank=True, null=True)
    explore_view = models.BooleanField(blank=True, null=True)
    scale_names = models.CharField(max_length=250, blank=True, null=True)
    scale_colors = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'parameters'


class RegionTrends(models.Model):
    region = models.OneToOneField('Regions', models.DO_NOTHING, primary_key=True)
    season = models.CharField(max_length=8)
    parameter = models.CharField(max_length=200)
    lastaverage = models.FloatField(blank=True, null=True)
    tenyearsaverage = models.FloatField(blank=True, null=True)
    totalaverage = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'region_trends'
        unique_together = (('region', 'season', 'parameter'),)


class Regions(models.Model):
    id = models.CharField(primary_key=True, max_length=10)
    title = models.CharField(max_length=200, blank=True, null=True)
    boundary = models.TextField(blank=True, null=True)  # This field type is a guess.
    center_coordinate = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'regions'


class Sensors(models.Model):
    gid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    geog = models.TextField(blank=True, null=True)  # This field type is a guess.
    created = models.DateTimeField(blank=True, null=True)
    metadata = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'sensors'


class SpatialRefSys(models.Model):
    srid = models.IntegerField(primary_key=True)
    auth_name = models.CharField(max_length=256, blank=True, null=True)
    auth_srid = models.IntegerField(blank=True, null=True)
    srtext = models.CharField(max_length=2048, blank=True, null=True)
    proj4text = models.CharField(max_length=2048, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'spatial_ref_sys'


class Streams(models.Model):
    gid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    geog = models.TextField(blank=True, null=True)  # This field type is a guess.
    created = models.DateTimeField(blank=True, null=True)
    metadata = models.TextField(blank=True, null=True)  # This field type is a guess.
    sensor_id = models.IntegerField(blank=True, null=True)
    start_time = models.DateTimeField(blank=True, null=True)
    end_time = models.DateTimeField(blank=True, null=True)
    params = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'streams'


class Users(models.Model):
    gid = models.AutoField(primary_key=True)
    email = models.CharField(max_length=40)
    emailconfirmed = models.BooleanField(blank=True, null=True)
    password = models.CharField(max_length=80)
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=20)
    organization = models.CharField(max_length=80)
    services = models.CharField(max_length=60)

    class Meta:
        managed = False
        db_table = 'users'
