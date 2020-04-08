from django.urls import path

from .views import (
    ReportListView,
    ReportNoSymptomsView,
    ReportSymptomsView,
)  # TODO: add ReportDiagnosisView


app_name = "reports"

urlpatterns = [
    # TODO: Implement reporting of diagnostic testing.
    # path("diagnosis", ReportDiagnosisView.as_view(), name="diagnosis"),
    path("no-symptoms", ReportNoSymptomsView.as_view(), name="no-symptoms"),
    path("symptoms", ReportSymptomsView.as_view(), name="symptoms"),
    path(
        "list/member/<member_id>.json",
        ReportListView.as_view(as_json=True),
        name="list_member_json",
    ),
    path("list/member/<member_id>", ReportListView.as_view(), name="list_member"),
    path("list.json", ReportListView.as_view(as_json=True), name="list_json"),
    path("list", ReportListView.as_view(), name="list"),
]
