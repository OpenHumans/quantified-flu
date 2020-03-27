from django.contrib import admin
from django.urls import include, path

from .views import (
    AnalysisDetailView,
    AddRetrospectiveEventView,
    EditRetrospectiveEventView,
    PublicRetrospectiveEventsView,
    RetrospectiveEventDetailView,
)
from .views import view_graph_json, view_graph, view_events, delete_event


app_name = "retrospective"

urlpatterns = [
    path("add-event", AddRetrospectiveEventView.as_view(), name="add-event"),
    path(
        "graph_json/<analysis_id>/",
        AnalysisDetailView.as_view(graph_data=True),
        name="json_graph",
    ),
    path("view-graph/<analysis_id>/", AnalysisDetailView.as_view(), name="view_graph"),
    path("view-events/", view_events, name="view-events"),
    path(
        "edit-event/<event_id>", EditRetrospectiveEventView.as_view(), name="edit_event"
    ),
    path(
        "event/<event_id>.json",
        RetrospectiveEventDetailView.as_view(as_json=True),
        name="view_event_json",
    ),
    path("event/<event_id>", RetrospectiveEventDetailView.as_view(), name="view_event"),
    path("delete-event/<event_id>", delete_event, name="delete_event"),
    path("public", PublicRetrospectiveEventsView.as_view(), name="public"),
    path(
        "public.json",
        PublicRetrospectiveEventsView.as_view(as_json=True),
        name="public_json",
    ),
]
