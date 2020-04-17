from django.core.management.base import BaseCommand

from openhumans.models import OpenHumansMember

from retrospective.tasks import add_wearable_to_symptom


class Command(BaseCommand):
    help = "Updates all data for all members"

    def handle(self, *args, **options):

        members = OpenHumansMember.objects.all()
        for member in members:
            add_wearable_to_symptom.delay(member.oh_id)
