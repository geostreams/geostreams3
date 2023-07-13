from django.db import models
from django.contrib.gis.db import models as geomodels
from timescale.db.models.models import TimescaleModel
from timescale.db.models.fields import TimescaleDateTimeField


class Category(models.Model):
   gid = models.AutoField(primary_key=True)
   name = models.CharField(max_length=50, blank=True, null=True)
   detail_type = models.CharField(max_length=50, blank=True, null=True)

   class Meta:
      db_table = 'categories'


class Parameter(models.Model):
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


class ParameterCategory(models.Model):
   gid = models.AutoField(primary_key=True)
   parameter_gid = models.ForeignKey(Parameter, models.DO_NOTHING, db_column='parameter_gid')
   category_gid = models.ForeignKey(Category, models.DO_NOTHING, db_column='category_gid')

   class Meta:
      db_table = 'parameter_categories'


class Sensor(models.Model):
   gid = models.AutoField(primary_key=True)
   name = models.CharField(max_length=255, blank=True, null=True)
   geog = geomodels.GeometryField(blank=False, null=False)
   created = models.DateTimeField(blank=True, null=True)
   metadata = models.JSONField()

   class Meta:
      db_table = 'sensors'


class Stream(models.Model):
   gid = models.AutoField(primary_key=True)
   name = models.CharField(max_length=255, blank=True, null=True)
   geog = geomodels.GeometryField(blank=False, null=False)
   created = models.DateTimeField(blank=True, null=True)
   metadata = models.JSONField()

   class Meta:
      db_table = 'streams'


class Datapoint(TimescaleModel):
   gid = models.AutoField(primary_key=True)
   geog = geomodels.GeometryField(blank=False, null=False)  # if missing, use sensor geog
   time = TimescaleDateTimeField(interval='7 days')
   data = models.JSONField()
   stream_id = models.IntegerField(blank=False, null=False)
   # end_time = models.DateTimeField(blank=True, null=True)
   # created = models.DateTimeField(blank=True, null=True)

   class Meta:
      db_table = 'datapoints'
