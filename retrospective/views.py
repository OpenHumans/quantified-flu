from django.shortcuts import render
from django.views.generic import TemplateView, FormView

from openhumans.models import OpenHumansMember

from .forms import RetrospectiveEventForm


class HomeView(TemplateView):
    template_name = "retrospective/home.html"

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context["openhumans_login_url"] = OpenHumansMember.get_auth_url()
        return context


class AddRetrospectiveEventView(FormView):
    template_name = "retrospective/addevent.html"
    form_class = RetrospectiveEventForm
    success_url = "/"

    def form_valid(self, form):
        # This method is called when valid form data has been POSTed.
        # It should return an HttpResponse.
        form.instance.member = self.request.user.openhumansmember
        form.save()
        return super().form_valid(form)
