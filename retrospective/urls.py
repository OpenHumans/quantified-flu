from django.contrib import admin
from django.urls import include, path

from .views import HomeView, AddRetrospectiveEventView

urlpatterns = [
    path("", HomeView.as_view(), name="home"),
    path("add-event", AddRetrospectiveEventView.as_view(), name="add-event"),
]
