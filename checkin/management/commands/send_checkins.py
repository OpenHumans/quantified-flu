from django.core.management.base import BaseCommand
from checkin.models import CheckinSchedule
import datetime
import pytz
import arrow


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
                # # TODO: actually send todo message somehow ;)
