from django.db import models

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
    ("runny nose", "Runny nose"),
]

# TODO: Should we survey people that can't measure?
FEVER_CHOICES = [
    ("none", "No fever"),
    ("low", "Low grade fever (below 38C / 100.4F)"),
    ("moderate", "Moderate fever (up to 38.9C / 102.1F"),
    ("high", "High fever (39.0C / 102.2F and above"),
    ("maybe_none", "Don't feel feverish"),
    ("maybe_low", "Might feel feverish"),
    ("maybe_moderate", "Feverish"),
    ("maybe_low", "Extremely feverish"),
]

# TODO: What's the right list of viruses? (This is placeholder.)
# Should this be two Qs? 1. virus list 2. best guess vs test result
VIRUS_CHOICES = [
    ("maybe_coronavirus", "I think it was Coronavirus"),
    ("coronavirus", "Test result: Coronavirus"),
    ("maybe_rhinovirus", "I hink it was Rhinovirus"),
    ("rhinovirus", "Test result: Rhinovirus"),
]

# Does a "no symptom" quick report create an empty symptom report, or is it
# recorded separately?
class SymptomReport(models.Model):
    member = models.ForeignKey(OpenHumansMember, on_delete=models.CASCADE)
    created = models.DateTime(auto_now_add=True)
    symptoms = models.CharField(max_length=20, choices=SYMPTOM_CHOICES)
    fever = models.CharField(max_length=20, choices=FEVER_CHOICES)
    other_symptoms = models.TextField(blank=True)
    notes = models.TextField(blank=True)


class DiagnosisReport(models.Model):
    member = models.ForeignKey(OpenHumansMember, on_delete=models.CASCADE)
    created = models.DateTime(auto_now_add=True)
    virus = models.CharField(max_length=20, choices=VIRUS_CHOICES)


# TODO: Plan is to pass these tokens in the links of check-in reminders
# (as parameters in URLs), and use them (in a hidden form field)
# to identify users for a report without requiring login.
class ReportToken(models.Model):
    member = models.OneToOneField(OpenHumansMember, on_delete=models.CASCADE)
    created = models.DateTime(auto_now_add=True)
    token = models.TextField()
