from django.db import models
from django.contrib.gis.db import models as geomodels
from timescale.db.models.models import TimescaleModel
from timescale.db.models.fields import TimescaleDateTimeField
from timescale.db.models.managers import TimescaleManager

class Datapoint(TimescaleModel):
   gid = models.AutoField(primary_key=True)
   geog = geomodels.GeometryField(blank=False, null=False)  # redundant to sensors?
   time = TimescaleDateTimeField(interval='7 days')
   data = models.JSONField()
   stream_id = models.IntegerField(blank=False, null=False)

   # end_time = models.DateTimeField(blank=True, null=True)
   # created = models.DateTimeField(blank=True, null=True)
