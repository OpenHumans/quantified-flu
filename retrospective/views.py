import json

from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.shortcuts import render, redirect, reverse
from django.views.generic import CreateView, DetailView, ListView, UpdateView
from django.http import HttpResponse
from django.contrib import messages

from openhumans.models import OpenHumansMember

from quantified_flu.models import Account

from .tasks import analyze_event
from .models import RetrospectiveEventAnalysis, RetrospectiveEvent


def view_graph_json(request, analysis_id):
    analysis = RetrospectiveEventAnalysis.objects.get(id=analysis_id)
    if analysis.event.member_id == request.user.openhumansmember.oh_id:
        return HttpResponse(analysis.graph_data, content_type="application/json")
    else:
        return redirect("/")


def view_graph(request, analysis_id):
    analysis = RetrospectiveEventAnalysis.objects.get(id=analysis_id)
    if analysis.event.member_id == request.user.openhumansmember.oh_id:
        context = {"analysis_id": analysis_id, "analysis_type": analysis.graph_type}
        return render(request, "retrospective/graph_view.html", context)
    else:
        return redirect("/")


def view_events(request):
    events = RetrospectiveEvent.objects.filter(member=request.user.openhumansmember)
    context = {"events": events}
    return render(request, "retrospective/event_view.html", context)


class AddRetrospectiveEventView(LoginRequiredMixin, CreateView):
    model = RetrospectiveEvent
    fields = ["date", "certainty", "notes"]
    template_name = "retrospective/add_event.html"
    success_url = "/"
    login_url = "/"

    def form_valid(self, form):
        form.instance.member = self.request.user.openhumansmember
        event = form.save()
        print("ANALYZING EVENT {}".format(event.id))
        analyze_event.delay(event.id)
        return super().form_valid(form)


class IsOwnerMixin:
    def is_owner(self):
        if self.request.user.is_anonymous:
            return False
        if self.object.member == self.request.user.openhumansmember:
            return True
        return False

    def is_authorized(self):
        return self.is_owner()


class IsOwnerOrPublicMixin(IsOwnerMixin):
    def is_public_or_owner(self):
        if self.object.published:
            return True
        elif self.is_owner():
            return True
        return False

    def is_authorized(self):
        return self.is_public_or_owner()


class IsAuthorizedMixin:
    def dispatch(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.request = request
        if self.is_authorized():
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied


# TODO: Make visible if public data is allowed.
class RetrospectiveEventDetailView(IsAuthorizedMixin, IsOwnerOrPublicMixin, UpdateView):
    model = RetrospectiveEvent
    pk_url_kwarg = "event_id"
    fields = []
    template_name = "retrospective/event.html"
    as_json = False

    def get(self, request, *args, **kwargs):
        if self.as_json:
            return HttpResponse(self.object.as_json(), content_type="application/json")
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.object.published = True
        self.object.save()
        return self.get(request, *args, **kwargs)

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({"is_owner": self.is_owner()})
        return context

    def get_success_url(self):
        return reverse("retrospective:view_event", kwargs={"event_id": self.object.id})


class AnalysisDetailView(IsOwnerOrPublicMixin, DetailView):
    model = RetrospectiveEventAnalysis
    pk_url_kwarg = "analysis_id"
    template_name = "retrospective/graph_view.html"
    graph_data = False

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if self.graph_data:
            return HttpResponse(self.object.graph_data, content_type="application/json")
        return super().get(request, *args, **kwargs)


class EditRetrospectiveEventView(IsOwnerMixin, UpdateView):
    model = RetrospectiveEvent
    fields = ["notes"]
    pk_url_kwarg = "event_id"
    template_name = "retrospective/edit_event.html"
    login_url = "/"

    def dispatch(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.request = request
        if self.is_owner():
            return super().dispatch(request, *args, **kwargs)
        return HttpResponseForbidden()

    def get_success_url(self):
        return reverse("retrospective:view_event", kwargs={"event_id": self.object.id})


class PublicRetrospectiveEventsView(ListView):
    template_name = "retrospective/public.html"
    as_json = False

    def get_queryset(self):
        return RetrospectiveEvent.objects.exclude(published=False)

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        published_member_reports = 0
        any_member_reports = 0
        if not self.request.user.is_anonymous:
            published_member_reports = self.object_list.filter(
                member=self.request.user.openhumansmember
            ).count()
            any_member_reports = RetrospectiveEvent.objects.filter(
                member=self.request.user.openhumansmember
            ).count()
        context.update(
            {
                "published_member_reports": published_member_reports,
                "any_member_reports": any_member_reports,
                "openhumans_login_url": OpenHumansMember.get_auth_url(),
            }
        )
        return context

    def get(self, request, *args, **kwargs):
        if self.as_json:
            data = [
                {
                    "event_id": x.id,
                    "json_path": reverse(
                        "retrospective:view_event_json", kwargs={"event_id": x.id}
                    ),
                }
                for x in self.get_queryset()
            ]
            return HttpResponse(json.dumps(data), content_type="application/json")
        return super().get(request, *args, **kwargs)


@login_required(login_url="/")
def delete_event(request, event_id):
    if request.method == "POST":
        oh_member = request.user.openhumansmember
        event = RetrospectiveEvent.objects.get(pk=event_id)
        if event.member == oh_member:
            event.delete()
        else:
            messages.warning(request, "Permission denied!")
        return redirect("/")
