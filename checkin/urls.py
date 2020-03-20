from django.contrib import admin
from django.urls import include, path

from .views import CheckinScheduleView


app_name = "checkin"

urlpatterns = [path("schedule", CheckinScheduleView.as_view(), name="schedule")]
