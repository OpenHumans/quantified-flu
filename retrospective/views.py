from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect, reverse
from django.views.generic import CreateView, DetailView, UpdateView
from django.http import HttpResponse
from django.contrib import messages

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
    fields = ["date", "certainty"]
    template_name = "retrospective/add_event.html"
    success_url = "/"
    login_url = "/"

    def form_valid(self, form):
        form.instance.member = self.request.user.openhumansmember
        event = form.save()
        print("ANALYZING EVENT {}".format(event.id))
        analyze_event.delay(event.id)
        return super().form_valid(form)


# TODO: Make visible if public data is allowed.
class RetrospectiveEventDetailView(LoginRequiredMixin, DetailView):
    model = RetrospectiveEvent
    pk_url_kwarg = "event_id"
    template_name = "retrospective/event.html"


class EditRetrospectiveEventView(LoginRequiredMixin, UpdateView):
    model = RetrospectiveEvent
    fields = ["notes"]
    pk_url_kwarg = "event_id"
    template_name = "retrospective/edit_event.html"

    def get_success_url(self):
        return reverse("retrospective:view_event", kwargs={"event_id": self.object.id})


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
