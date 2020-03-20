from django.contrib import admin
from django.urls import include, path

from .views import AddRetrospectiveEventView
from .views import view_graph_json, view_graph, view_events, delete_event
from .views import about


urlpatterns = [
    path("add-event", AddRetrospectiveEventView.as_view(), name="add-event"),
    path("graph_json/<analysis_id>/", view_graph_json, name="json_graph"),
    path("view_graph/<analysis_id>/", view_graph, name="view_graph"),
    path("view-events/", view_events, name="view-events"),
    path("about/", about, name="about"),
    path("delete-event/<event_id>", delete_event, name="delete_event"),
]
