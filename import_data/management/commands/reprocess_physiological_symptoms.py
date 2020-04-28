from django.core.management.base import BaseCommand

from openhumans.models import OpenHumansMember

from retrospective.tasks import (
    analyze_existing_events,
    analyze_existing_reports,
    add_wearable_to_symptom,
)


class Command(BaseCommand):
    help = "Updates all data for all members"

    def handle(self, *args, **options):

        members = OpenHumansMember.objects.all()
        for member in members:
            analyze_existing_events(member.user.id)
            analyze_existing_reports(member.user.id)
