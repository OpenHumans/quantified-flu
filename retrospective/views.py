from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect
from django.views.generic import TemplateView, FormView
from django.http import HttpResponse
from openhumans.models import OpenHumansMember

from .forms import RetrospectiveEventForm
from .tasks import analyze_event
from .models import RetrospectiveEventAnalysis, RetrospectiveEvent


class HomeView(TemplateView):
    template_name = "retrospective/home.html"

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context["openhumans_login_url"] = OpenHumansMember.get_auth_url()
        return context


class AddRetrospectiveEventView(LoginRequiredMixin, FormView):
    template_name = "retrospective/addevent.html"
    form_class = RetrospectiveEventForm
    success_url = "/"
    login_url = "/"

    def form_valid(self, form):
        # This method is called when valid form data has been POSTed.
        # It should return an HttpResponse.
        form.instance.member = self.request.user.openhumansmember
        event = form.save()
        print("ANALYZING EVENT {}".format(event.id))
        analyze_event.delay(event.id)
        return super().form_valid(form)


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
