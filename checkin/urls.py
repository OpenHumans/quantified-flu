from django.contrib import admin
from django.urls import include, path

from .views import cancel_checkins, CheckinScheduleView


app_name = "checkin"

urlpatterns = [
    path("schedule", CheckinScheduleView.as_view(), name="schedule"),
    path("cancel", cancel_checkins, name="cancel"),
]
