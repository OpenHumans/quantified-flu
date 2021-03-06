from django.db import models
from openhumans.models import OpenHumansMember


class Account(models.Model):
    """
    Store additional data for an Open humans member.
    This is a one to one relationship with a OpenHumansMember object.
    """

    member = models.OneToOneField(OpenHumansMember, on_delete=models.CASCADE)
    publish_symptom_reports = models.BooleanField(default=False)
