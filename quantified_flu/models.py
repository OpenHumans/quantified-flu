from django.db import models
from openhumans.models import OpenHumansMember


class Account(models.Model):
    """
    Store OAuth2 data for a Fitbit Member.
    This is a one to one relationship with a OpenHumansMember object.
    """

    member = models.OneToOneField(OpenHumansMember, on_delete=models.CASCADE)
    public_data = models.BooleanField(default=True)
