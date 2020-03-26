from django.contrib import admin
from django.urls import include, path

from .views import (
    AddRetrospectiveEventView,
    EditRetrospectiveEventView,
    RetrospectiveEventDetailView,
)
from .views import view_graph_json, view_graph, view_events, delete_event


app_name = "retrospective"

urlpatterns = [
    path("add-event", AddRetrospectiveEventView.as_view(), name="add-event"),
    path("graph_json/<analysis_id>/", view_graph_json, name="json_graph"),
    path("view-graph/<analysis_id>/", view_graph, name="view_graph"),
    path("view-events/", view_events, name="view-events"),
    path(
        "edit-event/<event_id>", EditRetrospectiveEventView.as_view(), name="edit_event"
    ),
    path("event/<event_id>", RetrospectiveEventDetailView.as_view(), name="view_event"),
    path("delete-event/<event_id>", delete_event, name="delete_event"),
]
