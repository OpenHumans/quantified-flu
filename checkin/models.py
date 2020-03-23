from datetime import time
from django.db import models
from timezone_field import TimeZoneField

from openhumans.models import OpenHumansMember

TIME_CHOICES = [
    ("00:00", "00:00 / 12am"),
    ("01:00", "01:00 / 1am"),
    ("02:00", "02:00 / 2am"),
    ("03:00", "03:00 / 3am"),
    ("04:00", "04:00 / 4am"),
    ("05:00", "05:00 / 5am"),
    ("06:00", "06:00 / 6am"),
    ("07:00", "07:00 / 7am"),
    ("08:00", "08:00 / 8am"),
    ("09:00", "09:00 / 9am"),
    ("10:00", "10:00 / 10am"),
    ("11:00", "11:00 / 11am"),
    ("12:00", "12:00 / 12pm"),
    ("13:00", "13:00 / 1pm"),
    ("14:00", "14:00 / 2pm"),
    ("15:00", "15:00 / 3pm"),
    ("16:00", "16:00 / 4pm"),
    ("17:00", "17:00 / 5pm"),
    ("18:00", "18:00 / 6pm"),
    ("19:00", "19:00 / 7pm"),
    ("20:00", "20:00 / 8pm"),
    ("21:00", "21:00 / 9pm"),
    ("22:00", "22:00 / 10pm"),
    ("23:00", "23:00 / 11pm"),
]


class CheckinSchedule(models.Model):
    member = models.OneToOneField(OpenHumansMember, on_delete=models.CASCADE)
    active = models.BooleanField(default=False)
    timezone = TimeZoneField()
    time_string = models.CharField(
        max_length=5, choices=TIME_CHOICES, verbose_name="time"
    )

    @property
    def time(self):
        time_values = [int(x) for x in self.time_string.split(":")]
        return time(*time_values)
