# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.contrib.gis.db import models as geomodels
from timescale.db.models.models import TimescaleModel
from timescale.db.models.fields import TimescaleDateTimeField
from timescale.db.models.managers import TimescaleManager


class Categories(models.Model):
    gid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    detail_type = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'categories'


class Datapoints(TimescaleModel):
    gid = models.AutoField(primary_key=True)
    geog = geomodels.GeometryField(blank=False, null=False)  # redundant to sensors?
    time = TimescaleDateTimeField(interval='7 days')
    data = models.JSONField()
    stream_id = models.IntegerField(blank=False, null=False)

    class Meta:
        db_table = 'datapoints'


class ParameterCategories(models.Model):
    gid = models.AutoField(primary_key=True)
    parameter_gid = models.ForeignKey('Parameters', models.DO_NOTHING, db_column='parameter_gid')
    category_gid = models.ForeignKey(Categories, models.DO_NOTHING, db_column='category_gid')

    class Meta:
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
        db_table = 'parameters'


class Sensors(models.Model):
    gid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    geog = geomodels.GeometryField(blank=False, null=False)   # This field type is a guess.
    created = models.DateTimeField(blank=True, null=True)
    metadata = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        db_table = 'sensors'


