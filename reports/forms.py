from collections import OrderedDict

from django import forms
from django.core.exceptions import ValidationError

from .models import (
    SYMPTOM_CHOICES,
    SYMPTOM_INTENSITY_CHOICES,
    Symptom,
    SymptomReport,
    SymptomReportSymptomItem,
)


class SymptomReportForm(forms.ModelForm):
    other_symptoms = forms.CharField(widget=forms.TextInput(), required=False)
    suspected_virus = forms.CharField(widget=forms.TextInput(), required=False)

    class Meta:
        model = SymptomReport
        fields = ["other_symptoms", "fever_guess", "fever", "suspected_virus", "notes"]

    def __init__(self, *args, **kwargs):
        """
        Add fields to the form for each potential symptom.

        This reorders to place the symptom list first, in the order of SYMPTOM_CHOICES.
        The value is initialized to 0 if none is provided.
        """
        returned = super().__init__(*args, **kwargs)
        new_fields = OrderedDict()
        for symptom in SYMPTOM_CHOICES:
            if symptom[0] not in self.initial:
                self.initial[symptom[0]] = 0
            new_fields[symptom[0]] = forms.IntegerField(
                required=False,
                min_value=min([x[0] for x in SYMPTOM_INTENSITY_CHOICES]),
                max_value=max([x[0] for x in SYMPTOM_INTENSITY_CHOICES]),
            )
        new_fields.update(self.fields)
        self.fields = new_fields
        return returned

    def save(self):
        """
        Add saving for the symptom fields to SymptomReportSymptomItem.

        Creates a Symptom and SymptomReportSymptomItem objects if not already present.
        """
        new_report = super().save()
        for symptom_choice in SYMPTOM_CHOICES:
            value = self.cleaned_data[symptom_choice[0]]
            symptom, _ = Symptom.objects.get_or_create(
                label=symptom_choice[0], defaults={"available": True}
            )
            symptom_item, _ = SymptomReportSymptomItem.objects.get_or_create(
                report=new_report, symptom=symptom
            )
            symptom_item.intensity = value
            symptom_item.save()
        return new_report


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
