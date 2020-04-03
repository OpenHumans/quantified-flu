import datetime
import json
import secrets

from django.core.exceptions import ValidationError
from django.db import models
from django.forms.widgets import CheckboxSelectMultiple
from django.utils.timezone import now

from openhumans.models import OpenHumansMember

# List from the Vicks Smart Temp app.
SYMPTOM_CHOICES = [
    ("cough", "Cough"),
    ("sore_throat", "Sore throat"),
    ("chills", "Chills"),
    ("body_ache", "Body ache"),
    ("ear_ache", "Ear ache"),
    ("nausea", "Nausea"),
    ("stomach_ache", "Stomach ache"),
    ("fatigue", "Fatigue"),
    ("short_breath", "Short breath"),
    ("headache", "Headache"),
    ("diarrhea", "Diarrhea"),
    ("runny_nose", "Runny nose"),
    ("anosmia", "Reduced sense of smell (anosmia)"),
]

FEVER_CHOICES = [
    ("none", "No fever"),
    ("low", "Maybe feverish"),
    ("moderate", "Feverish"),
    ("high", "High fever"),
]

"""
# TODO: Implement reporting of diagnostic testing.
VIRUS_CHOICES = [
    ("maybe_coronavirus", "suspect Coronavirus"),
    ("coronavirus", "Coronavirus, confirmed by test"),
    ("maybe_influenza", "suspect Influenza"),
    ("influenza", "Influenza, confirmed by test"),
    ("cold", "Common cold"),
]
"""


def create_token():
    return secrets.token_urlsafe(16)


TOKEN_EXPIRATION_MINUTES = 1440  # default expiration is one day


class ReportToken(models.Model):
    member = models.ForeignKey(OpenHumansMember, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    token = models.TextField(default=create_token)
    minutes_valid = models.IntegerField(default=TOKEN_EXPIRATION_MINUTES)

    def is_valid(self):
        expires = self.created + datetime.timedelta(minutes=self.minutes_valid)
        if expires > now():
            return True
        return False

    def valid_member(self):
        if self.is_valid():
            return self.member
        return None


class Symptom(models.Model):
    label = models.CharField(max_length=20, choices=SYMPTOM_CHOICES, unique=True)
    available = models.BooleanField(default=False)

    def __str__(self):
        return self.label

    def __unicode__(self):
        return self.label


"""
# TODO: Implement reporting of diagnostic testing.
class DiagnosticTest(models.Model):

    label = models.CharField(max_length=20, choices=VIRUS_CHOICES, unique=True)
    tested = models.BooleanField(null=True, blank=True)
    available = models.BooleanField(default=False)

    def __str__(self):
        return self.label

    def __unicode__(self):
        return self.label
"""


class SymptomReport(models.Model):
    member = models.ForeignKey(OpenHumansMember, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    symptoms = models.ManyToManyField(Symptom)
    fever_guess = models.CharField(
        max_length=20, choices=FEVER_CHOICES, null=True, blank=True
    )
    fever = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    other_symptoms = models.TextField(blank=True, default="")
    suspected_virus = models.TextField(
        blank=True,
        default="",
        help_text="Any guess on what infection you have? (flu, cold, norovirus, coronavirus, etc.)",
    )
    notes = models.TextField(blank=True, default="")

    # Represents reports which were simple "report nothing" clicks.
    report_none = models.BooleanField(default=False)
    token = models.ForeignKey(ReportToken, null=True, on_delete=models.SET_NULL)

    def clean(self):
        """Ensure that nothing is "reported" when report_none is True."""
        if self.report_none:
            if self.fever_guess or self.fever or self.other_symptoms or self.notes:
                raise ValidationError

    @property
    def severity(self):
        """Rough attempt to assess "severity" for a report, for display purposes"""
        num_symptoms = self.symptoms.all().count()
        if self.report_none or (
            num_symptoms == 0 and (not self.fever_guess) or self.fever_guess == "none"
        ):
            return 0
        if num_symptoms <= 2 and (not self.fever_guess or self.fever_guess == "none"):
            return 1
        if not self.fever_guess or self.fever_guess in ["none", "low"]:
            return 2
        if self.fever_guess == "moderate":
            return 3
        return 4

    def as_json(self):
        data = {
            "created": self.created.isoformat(),
            "symptoms": [s.label for s in self.symptoms.all()],
            "other_symptoms": self.other_symptoms,
            "fever_guess": self.fever_guess,
            "fever": self.fever,
            "suspected_virus": self.suspected_virus,
            "notes": self.notes,
        }
        return json.dumps(data)


"""
# TODO: Implement reporting of diagnostic testing.
class DiagnosisReport(models.Model):
    member = models.ForeignKey(OpenHumansMember, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    date_tested = models.DateField()
    diagnosis = ManyToManyField(Diagnosis)
    notes = models.TextField(blank=True, default="")
"""
