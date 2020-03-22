from django.core.management.base import BaseCommand
from django.shortcuts import reverse
from checkin.models import CheckinSchedule
import datetime
import pytz
import arrow

from reports.models import ReportToken


class Command(BaseCommand):
    help = "Send reminders where appropriate"

    def handle(self, *args, **options):
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
            print("scheduled: {}, now: {}".format(scheduled_time_utc, current_time_utc))
            if scheduled_time_utc == current_time_utc:
                print("SHOULD SEND CHECKIN FOR {}".format(c.member.oh_id))
                token = ReportToken(member=c.member)
                token.save()
                url1 = reverse("reports:symptoms") + "?token={}".format(token.token)
                url2 = reverse("reports:diagnosis") + "?token={}".format(token.token)
                print(url1)
                print(url2)
                # # TODO: turn URLs into email
                # ... and add a URL ... and model? which records a no-symptom report?
