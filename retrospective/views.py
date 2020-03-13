from django.shortcuts import render
from django.views.generic.base import TemplateView

from openhumans.models import OpenHumansMember


# Create your views here.
class HomeView(TemplateView):
    template_name = "retrospective/home.html"

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context["openhumans_login_url"] = OpenHumansMember.get_auth_url()
        return context
