import json
import pytz

from django.contrib import messages
from django.contrib.auth import get_user_model, login, logout
from django.core.exceptions import PermissionDenied
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.utils.timezone import now
from django.views.generic import CreateView, ListView, RedirectView

from openhumans.models import OpenHumansMember

from checkin.models import CheckinSchedule
from quantified_flu.models import Account

from .forms import SymptomReportForm
from .models import (
    CATEGORIZED_SYMPTOM_CHOICES,
    SYMPTOM_INTENSITY_CHOICES,
    SymptomReport,
    ReportToken,
)  # TODO: add DiagnosisReport

User = get_user_model()


class CheckTokenMixin:
    def dispatch(self, request, *args, **kwargs):
        """
        Redirect if user isn't logged in, or if provided token isn't valid for login.

        This also allows access if user is already logged in & no login_token is given.
        """
        self.token = None
        token_string = request.GET.get("login_token", None)
        if token_string:
            # Logout to avoid potential confusion if token is attempt to switch user.
            logout(request)
            try:
                self.token = ReportToken.objects.get(token=token_string)
                if self.token.is_valid():
                    login(request, self.token.member.user)
            except ReportToken.DoesNotExist:
                pass

        # Either token login failed or user wasn't logged in.
        if request.user.is_anonymous:
            messages.add_message(
                request,
                messages.WARNING,
                "Login or token required to submit reports. (Token may be expired, invalid, or missing.)",
            )
            return redirect("/")

        return super().dispatch(request, *args, **kwargs)


class ReportSymptomsView(CheckTokenMixin, CreateView):
    form_class = SymptomReportForm
    template_name = "reports/symptoms.html"
    success_url = reverse_lazy("reports:list")

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update(
            {
                "form_categorized_symptom_choices": CATEGORIZED_SYMPTOM_CHOICES,
                "form_symptom_intensity_choices": SYMPTOM_INTENSITY_CHOICES,
            }
        )
        return context

    def form_valid(self, form):
        form.instance.member = self.request.user.openhumansmember
        report = form.save()
        if self.token:
            report.token = self.token
            report.save()
        messages.add_message(self.request, messages.SUCCESS, "Symptom report recorded")
        return super().form_valid(form)


class ReportNoSymptomsView(CheckTokenMixin, RedirectView):
    pattern_name = "reports:list"

    def get(self, request, *args, **kwargs):
        """Loading with valid token immediately creates a no-symptom report."""
        report = SymptomReport(
            report_none=True, token=self.token, member=request.user.openhumansmember
        )
        report.save()
        messages.add_message(request, messages.SUCCESS, "No symptom report saved!")
        return super().get(request, *args, **kwargs)


class ReportListView(ListView):
    template_name = "reports/list.html"
    as_json = False
    member = None
    is_owner = False

    def get_queryset(self):
        if self.member:
            list_member = self.member
        else:
            list_member = self.request.user.openhumansmember
        if (
            not self.request.user.is_anonymous
            and list_member == self.request.user.openhumansmember
        ):
            self.is_owner = True
        return SymptomReport.objects.filter(member=list_member).order_by("-created")

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)

        timezone = pytz.timezone("UTC")
        if not self.request.user.is_anonymous:
            try:
                timezone = self.request.user.openhumansmember.checkinschedule.timezone
            except CheckinSchedule.DoesNotExist:
                pass

        member_id = self.member.oh_id if self.member else self.member

        context.update(
            {"timezone": timezone, "member_id": member_id, "is_owner": self.is_owner}
        )

        return context

    def get_as_json(self):
        context_data = self.get_context_data()
        data = {
            "reports": [json.loads(r.as_json()) for r in context_data["object_list"]],
            "member_id": context_data["member_id"],
            "timezone": context_data["timezone"].tzname(dt=None),
        }
        return json.dumps(data)

    def get(self, request, *args, **kwargs):
        if "member_id" in self.kwargs:
            self.member = OpenHumansMember.objects.get(oh_id=self.kwargs["member_id"])
            account, _ = Account.objects.get_or_create(member=self.member)
            if not account.publish_symptom_reports:
                raise PermissionDenied
        elif self.request.user.is_anonymous:
            return redirect("/")

        default_response = super().get(request, *args, **kwargs)
        if self.as_json:
            return HttpResponse(self.get_as_json(), content_type="application/json")
        return default_response

    def post(self, request, *args, **kwargs):
        account, _ = Account.objects.get_or_create(
            member=self.request.user.openhumansmember
        )
        account.publish_symptom_reports = True
        account.save()
        return self.get(request, *args, **kwargs)


"""
TODO: Implement reporting of diagnostic testing.
class ReportDiagnosisView(CheckTokenMixin, CreateView):
    model = DiagnosisReport
    template_name = "reports/diagnosis.html"
    fields = ["date_tested", "virus"]

    def form_valid(self, form):
        form.instance.member = self.request.user.openhumansmember
        form.save()
        return super().form_valid(form)
"""
