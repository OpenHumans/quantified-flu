from django.core.management.base import BaseCommand
from retrospective.tasks import analyze_event
from retrospective.models import RetrospectiveEvent


class Command(BaseCommand):
    help = "Updates all data for all members"

    def handle(self, *args, **options):

        events = RetrospectiveEvent.objects.all()
        for e in events:
            e.retrospectiveeventanalysis_set.all().delete()
            analyze_event.delay(event_id=e.id)
