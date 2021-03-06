import json

from django.db import models

from openhumans.models import OpenHumansMember

CERTAINTY_CHOICES = [
    (1, "Random guess"),
    (2, "Very uncertain"),
    (3, "Unsure"),
    (4, "Somewhat certain"),
    (5, "Very certain"),
]


class RetrospectiveEvent(models.Model):
    member = models.ForeignKey(OpenHumansMember, on_delete=models.CASCADE)
    date = models.DateField()
    certainty = models.IntegerField(choices=CERTAINTY_CHOICES)
    notes = models.TextField(
        blank=True,
        help_text="Notes about this illness, e.g. do you know or believe it was a cold, flu, or coronavirus infection?",
    )
    published = models.BooleanField(default=False)

    def as_json(self):
        data = {
            analysis.graph_type: json.loads(analysis.graph_data)
            for analysis in self.retrospectiveeventanalysis_set.all()
        }
        data["sickness_event"] = [
            {
                "timestamp": self.date.isoformat(),
                "data": {"certainty": self.certainty, "notes": self.notes},
            }
        ]
        return json.dumps(data, sort_keys=True)


class RetrospectiveEventAnalysis(models.Model):
    event = models.ForeignKey(RetrospectiveEvent, on_delete=models.CASCADE)
    graph_data = models.TextField()
    graph_type = models.TextField(default="")

    @property
    def member(self):
        return self.event.member
