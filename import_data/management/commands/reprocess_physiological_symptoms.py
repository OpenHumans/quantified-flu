from django.core.management.base import BaseCommand
from retrospective.tasks import add_wearable_to_symptom
from reports.models import SymptomReport


class Command(BaseCommand):
    help = "Updates all data for all members"

    def handle(self, *args, **options):

        reports = SymptomReport.objects.all()
        for r in reports:
            add_wearable_to_symptom.delay(symptom_report_id=r.id)
