from datetime import datetime
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.gis.db import models as geomodels
from timescale.db.models.models import TimescaleModel
from timescale.db.models.fields import TimescaleDateTimeField


class Category(models.Model):
    """ Categories are used to represent the type of graphs to show in the detail page in Geodashboard v3
   The name will be the title of the tab where the data associated with the category is displayed
   The detail_type is the type of graph in the UI, it could be (time, stacked-line, stacked-bar)"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    detail_type = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'categories'


class Parameter(models.Model):
    """Parameters are types of data stored in datapoints for which there is data associated.
   This elements provides additional information about the parameter than the short name in the datapoints
   It provides a longer title, the unit, information to show up on the search and explore views, names and colors for
   stacked-bar graphs that could be used for other stacked graphs."""
    id = models.AutoField(primary_key=True)
    name = models.CharField(unique=True, max_length=200)
    title = models.CharField(max_length=200, blank=True, null=True)
    unit = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'parameters'


class ParameterCategory(models.Model):
    """Mappings between a parameter and a category
   To add a new mapping, the category and parameter should both exist
   All mappings associated with a parameter are deleted upon parameter deletion.

   This is used for allowing the same parameter to show up on more than one tab or with different representations
   For example, alkalinity can be in both a stacked-line graph and a time series graph
   or Alkalinity could show up as time series in two categories/tabs: Contaminants and Nutrients"""
    id = models.AutoField(primary_key=True)
    parameter = models.ForeignKey(Parameter, models.DO_NOTHING)
    category = models.ForeignKey(Category, models.DO_NOTHING)

    class Meta:
        db_table = 'parameter_categories'


class Region(models.Model):
    id = models.AutoField(primary_key=True)
    geog = geomodels.GeometryField(dim=3, blank=False, null=False)
    properties = models.JSONField()

    class Meta:
        db_table = 'regions'


class Sensor(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    geog = geomodels.GeometryField(dim=3, blank=False, null=False)
    created = models.DateTimeField(blank=True, null=True, default=datetime.now)
    parameters = ArrayField(models.CharField())
    properties = models.JSONField()
    min_start_time = models.DateTimeField(blank=True, null=True)
    max_end_time = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'sensors'


class Stream(models.Model):
    id = models.AutoField(primary_key=True)
    sensor = models.ForeignKey(Sensor, models.DO_NOTHING)
    name = models.CharField(max_length=255, blank=True, null=True)
    geog = geomodels.GeometryField(dim=3, blank=False, null=False)
    created = models.DateTimeField(blank=True, null=True, default=datetime.now)
    parameters = ArrayField(models.CharField(max_length=200))
    properties = models.JSONField()
    start_time = models.DateTimeField(blank=True, null=True)
    end_time = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'streams'


class Datapoint(TimescaleModel):
    id = models.AutoField(primary_key=True)
    stream = models.ForeignKey(Stream, models.DO_NOTHING)
    geog = geomodels.GeometryField(dim=3, blank=False, null=False)  # if missing, use sensor geog
    time = TimescaleDateTimeField(interval='7 days')
    end_time = models.DateTimeField(blank=True, null=True)
    parameter = models.ForeignKey(Parameter, models.DO_NOTHING,null=True)
    value = models.FloatField(blank=True, null=True)

    class Meta:
        db_table = 'datapoints'

