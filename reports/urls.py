from django.urls import path

from .views import ReportDiagnosisView, ReportSymptomsView


app_name = "reports"

urlpatterns = [
    path("diagnosis", ReportDiagnosisView.as_view(), name="diagnosis"),
    path("symptoms", ReportSymptomsView.as_view(), name="symptoms"),
]
