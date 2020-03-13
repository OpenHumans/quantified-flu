from django.forms import ModelForm

from .models import RetrospectiveEvent


class RetrospectiveEventForm(ModelForm):
    class Meta:
        model = RetrospectiveEvent
        fields = ["date", "certainty"]
