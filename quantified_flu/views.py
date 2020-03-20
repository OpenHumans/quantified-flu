from django.conf import settings
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.views.generic import TemplateView

from openhumans.models import OpenHumansMember

from .helpers import identify_missing_sources


def logout_user(request):
    """
    Logout user.
    """
    if request.method == "POST":
        logout(request)
    redirect_url = settings.LOGOUT_REDIRECT_URL
    if not redirect_url:
        redirect_url = "/"
    return redirect(redirect_url)


class HomeView(TemplateView):
    template_name = "quantified_flu/home.html"

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context["openhumans_login_url"] = OpenHumansMember.get_auth_url()
        if self.request.user.is_authenticated:
            missing_sources = identify_missing_sources(
                self.request.user.openhumansmember
            )
            context["missing_sources"] = missing_sources
        return context
