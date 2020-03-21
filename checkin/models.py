from django.db import models
from timezone_field import TimeZoneField

from openhumans.models import OpenHumansMember


class CheckinSchedule(models.Model):
    member = models.OneToOneField(OpenHumansMember, on_delete=models.CASCADE)
    active = models.BooleanField(default=False)
    # TODO: get a friendly subset to offer users for the timezone field
    timezone = TimeZoneField()
    time = models.TimeField()


"""
TODO: actually scheduling check-in messages. This seems likely to involve:

1. set a routine "cron" command run at time X
2. immediately queue celery for a check-in if before time X, with appropriate delay.
3. at time X, run a management command to queue celery check-ins for upcoming day.
4. for 2 and 3, store the IDs of the tasks in a model.
5. if someone cancels check-ins, find task IDs and use to cancel upcoming check-ins.
"""
