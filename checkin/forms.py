from django.forms import ModelForm, Select

from .models import CheckinSchedule


class CheckinScheduleForm(ModelForm):
    class Meta:
        model = CheckinSchedule
        fields = ["timezone", "time_string"]
