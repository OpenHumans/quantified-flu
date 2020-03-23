from django.urls import path

from .views import ReportDiagnosisView, ReportNoSymptomsView, ReportSymptomsView


app_name = "reports"

urlpatterns = [
    path("diagnosis", ReportDiagnosisView.as_view(), name="diagnosis"),
    path("no-symptoms", ReportNoSymptomsView.as_view(), name="no-symptoms"),
    path("symptoms", ReportSymptomsView.as_view(), name="symptoms"),
]
