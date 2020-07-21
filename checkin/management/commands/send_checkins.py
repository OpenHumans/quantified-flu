import datetime
from urllib.parse import urljoin
import warnings

import arrow
import pytz

from django.conf import settings
from django.core.management.base import BaseCommand
from django.shortcuts import reverse

from openhumans.models import OpenHumansMember

from checkin.models import CheckinSchedule
from reports.models import ReportToken


def create_token_url(url_name, token):
    return urljoin(
        settings.OPENHUMANS_APP_BASE_URL,
        reverse(url_name) + "?login_token={}".format(token.token),
    )


def create_checkin_email(member):
    token = ReportToken(member=member)
    token.save()
    subject = "Quantified Flu Daily Check-In"
    content = """Here's quick links to report if you're well or feeling sick:

Just click this to report no symptoms:
{}

Feeling sick? Fill out a form here to report symptoms:
{}

These will log you in to the Quantified Flu site—the token works for 24 hours.
You can use the link to check-in more than once, if you'd like.

Best,

Bastian & Mad
""".format(
        create_token_url("reports:no-symptoms", token),
        create_token_url("reports:symptoms", token),
    )
    return (subject, content)


class Command(BaseCommand):
    help = "Send reminders where appropriate"

    def add_arguments(self, parser):
        parser.add_argument(
            "-l",
            "--local",
            dest="local",
            action="store_true",
            help=("if true, just print planned messages locally"),
        )
        parser.add_argument(
            "-t",
            "--test",
            dest="test",
            required=False,
            help=("one or more project member IDs, comma separated"),
        )

    def handle(self, *args, **options):
        checkin_members = []

        if options["test"]:
            checkin_members = [
                OpenHumansMember.objects.get(oh_id=id)
                for id in options["test"].split(",")
            ]
        else:
            checkins = CheckinSchedule.objects.filter(active=True)
            for c in checkins:
                print("checkin for {}".format(c.member.oh_id))
                local_tz = pytz.timezone(str(c.timezone))
                naive_user_time = datetime.datetime.strptime(
                    (arrow.now().format()[:11] + str(c.time)), "%Y-%m-%d %H:%M:%S"
                )
                local_user_time = local_tz.localize(naive_user_time)
                scheduled_time_utc = local_user_time.astimezone(pytz.utc).hour
                current_time_utc = arrow.now().hour
                print(
                    "scheduled: {}, now: {}".format(
                        scheduled_time_utc, current_time_utc
                    )
                )
                if scheduled_time_utc == current_time_utc:
                    checkin_members.append(c.member)

        for member in checkin_members:
            subject, content = create_checkin_email(member)
            if options["local"]:
                print("Subject: {}".format(subject))
                print(content)
            else:
                try:
                    member.message(subject=subject, message=content)
                except Exception:
                    warnings.warn(
                        "Message failed for OpenHumansMember {}".format(member.oh_id)
                    )
