from django import forms
from django.core.exceptions import ValidationError

from .models import SYMPTOM_CHOICES, Symptom, SymptomReport


class SymptomReportForm(forms.ModelForm):
    symptoms = forms.MultipleChoiceField(
        required=False, widget=forms.CheckboxSelectMultiple(), choices=SYMPTOM_CHOICES
    )
    other_symptoms = forms.CharField(widget=forms.TextInput(), required=False)
    suspected_virus = forms.CharField(widget=forms.TextInput(), required=False)

    class Meta:
        model = SymptomReport
        fields = [
            "symptoms",
            "other_symptoms",
            "fever_guess",
            "fever",
            "suspected_virus",
            "notes",
        ]

    def clean_symptoms(self):
        """Unclear why this is needed! Without it, form errors on any symptoms."""
        symptom_objects = []
        for value in self.cleaned_data["symptoms"]:
            if value in [x[0] for x in SYMPTOM_CHOICES]:
                symptom, _ = Symptom.objects.get_or_create(
                    label=value, defaults={"available": True}
                )
                symptom_objects.append(symptom.id)
            else:
                raise ValidationError("No {} in symptom choices!".format(value))
        return symptom_objects


"""
TODO: Implement reporting of diagnostic testing.
class DiagnosisReportForm(forms.ModelForm):
    diagnoses = forms.MultipleChoiceField(
        required=False, widget=forms.CheckboxSelectMultiple(), choices=DIAGNOSIS_CHOICES
    )

    class Meta:
        model = DiagnosisReport
        fields = ["date_tested", "diagnosis", "notes"]
"""
