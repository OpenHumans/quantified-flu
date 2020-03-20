import arrow
import requests

from django.db import models
from openhumans.models import OpenHumansMember
from django.conf import settings
from datetime import timedelta
import os

# Create your models here.


class FitbitMember(models.Model):
    """
    Store OAuth2 data for a Fitbit Member.
    This is a one to one relationship with a OpenHumansMember object.
    """

    member = models.OneToOneField(
        OpenHumansMember, related_name="fitbit_member", on_delete=models.CASCADE
    )
    userid = models.CharField(max_length=255, unique=True, null=True)
    access_token = models.CharField(max_length=512)
    refresh_token = models.CharField(max_length=512)
    token_expires = models.DateTimeField(default=arrow.now().format())
    scope = models.CharField(max_length=512)
    token_type = models.CharField(max_length=512)
    last_updated = models.DateTimeField(
        default=(arrow.now() - timedelta(days=7)).format()
    )
    last_submitted = models.DateTimeField(
        default=(arrow.now() - timedelta(days=7)).format()
    )

    @staticmethod
    def get_expiration(expires_in):
        return (arrow.now() + timedelta(seconds=expires_in)).format()

    def get_access_token(
        self,
        client_id=settings.FITBIT_CLIENT_ID,
        client_secret=settings.FITBIT_CLIENT_SECRET,
    ):
        """
        Return access token. Refresh first if necessary.
        """
        # Also refresh if nearly expired (less than 60s remaining).
        delta = timedelta(seconds=60)
        if arrow.get(self.token_expires) - delta < arrow.now():
            self._refresh_tokens()
        return self.access_token

    def _refresh_tokens(self):
        """
        Refresh access token.
        """
        print("calling refresh token method in class")
        response = requests.post(
            "https://api.fitbit.com/oauth2/token",
            data={"grant_type": "refresh_token", "refresh_token": self.refresh_token},
            auth=requests.auth.HTTPBasicAuth(
                settings.FITBIT_CLIENT_ID, settings.FITBIT_CLIENT_SECRET
            ),
        )
        print(response.text)
        if response.status_code == 200:
            data = response.json()
            self.access_token = data["access_token"]
            self.refresh_token = data["refresh_token"]
            self.token_expires = self.get_expiration(data["expires_in"])
            self.scope = data["scope"]
            self.userid = data["user_id"]
            self.save()
            return True
        return False


class OuraMember(models.Model):
    member = models.OneToOneField(
        OpenHumansMember, on_delete=models.CASCADE, related_name="oura_user"
    )
    access_token = models.TextField()
    refresh_token = models.TextField()
    expiration_time = models.DateTimeField()

    def get_access_token(self):
        if arrow.utcnow() >= self.expiration_time:
            self.refresh_tokens()
        return self.access_token

    def refresh_tokens(self):
        res = requests.post(
            "https://api.ouraring.com/oauth/token",
            data={
                "grant_type": "refresh_token",
                "client_id": os.getenv("OURA_CLIENT_ID"),
                "client_secret": os.getenv("OURA_CLIENT_SECRET"),
                "refresh_token": self.refresh_token,
            },
        ).json()
        if "access_token" not in res.keys():
            print("failed updating {}".format(self.user.oh_member.oh_id))
        else:
            self.access_token = res["access_token"]
            self.refresh_token = res["refresh_token"]
            self.expiration_time: arrow.utcnow().shift(
                seconds=res["expires_in"]
            ).datetime
            self.save()
