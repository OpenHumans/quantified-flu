from django.db import models
from timezone_field import TimeZoneField

from openhumans.models import OpenHumansMember


class CheckinSchedule(models.Model):
    member = models.OneToOneField(OpenHumansMember, on_delete=models.CASCADE)
    active = models.BooleanField(default=False)
    timezone = TimeZoneField()
    time = models.TimeField()
