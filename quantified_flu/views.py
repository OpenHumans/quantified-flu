from django.conf import settings
from django.contrib import messages
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.views.generic import TemplateView, UpdateView
from django.shortcuts import render
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from openhumans.models import OpenHumansMember

from checkin.models import CheckinSchedule
from checkin.forms import CheckinScheduleForm
from retrospective.models import RetrospectiveEvent

from .models import Account
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

    def dispatch(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            try:
                self.missing_sources = identify_missing_sources(
                    self.request.user.openhumansmember
                )
            except Exception:
                logout(request)
                return redirect("/")
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)

        if self.request.user.is_authenticated:
            openhumansmember = self.request.user.openhumansmember

            # checkin_form
            try:
                schedule = CheckinSchedule.objects.get(member=openhumansmember)
                checkin_form = CheckinScheduleForm(instance=schedule)
                schedule_exists = True
            except CheckinSchedule.DoesNotExist:
                checkin_form = CheckinScheduleForm()
                schedule_exists = False

            # fitbit_auth_url
            fitbit_auth_url = (
                "https://www.fitbit.com/oauth2/authorize?response_type=code&client_id="
                + settings.FITBIT_CLIENT_ID
                + "&scope=activity%20nutrition%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight"
            )

            context.update(
                {
                    "checkin_form": checkin_form,
                    "fitbit_auth_url": fitbit_auth_url,
                    "missing_sources": self.missing_sources,
                    "openhumansmember": openhumansmember,
                    "schedule_exists": schedule_exists,
                }
            )

        # Not logged in.
        else:
            context.update({"openhumans_login_url": OpenHumansMember.get_auth_url()})

        return context


def about(request):
    context = {"openhumans_login_url": OpenHumansMember.get_auth_url()}
    return render(request, "quantified_flu/about.html", context)


class ManageAccountView(LoginRequiredMixin, UpdateView):
    login_url = "/"
    model = Account
    fields = ["public_data"]
    template_name = "quantified_flu/manage_account.html"
    success_url = reverse_lazy("manage-account")

    def get_object(self):
        try:
            return Account.objects.get(member=self.request.user.openhumansmember)
        except Account.DoesNotExist:
            account = Account(member=self.request.user.openhumansmember)
            return account

    def form_valid(self, form):
        return_value = super().form_valid(form)
        messages.add_message(
            self.request, messages.SUCCESS, "Account settings updated."
        )
        return return_value


def delete_account(request):
    if request.method == "POST":
        request.user.delete()
        return redirect("/")
