from django.urls import path

from .views import (
    ReportNoSymptomsView,
    ReportSymptomsView,
)  # TODO: add ReportDiagnosisView


app_name = "reports"

urlpatterns = [
    # TODO: Implement reporting of diagnostic testing.
    # path("diagnosis", ReportDiagnosisView.as_view(), name="diagnosis"),
    path("no-symptoms", ReportNoSymptomsView.as_view(), name="no-symptoms"),
    path("symptoms", ReportSymptomsView.as_view(), name="symptoms"),
]
