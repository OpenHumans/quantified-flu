from django.forms import ModelForm

from .models import CheckinSchedule


class CheckinScheduleForm(ModelForm):
    class Meta:
        model = CheckinSchedule
        fields = ["timezone", "time"]
