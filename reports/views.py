from django.contrib import messages
from django.contrib.auth import get_user_model, login, logout
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.generic import CreateView, ListView, RedirectView

from checkin.models import CheckinSchedule

from .forms import SymptomReportForm
from .models import SymptomReport, ReportToken  # TODO: add DiagnosisReport

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

    def get_queryset(self):
        self.user_id = None
        if "user_id" in self.kwargs:
            self.user_id = self.kwargs["user_id"]
            member = User.objects.get(id=self.user_id).openhumansmember
        else:
            member = self.request.user.openhumansmember
        return SymptomReport.objects.filter(member=member).order_by("-created")

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)

        try:
            timezone = self.request.user.openhumansmember.checkinschedule.timezone
        except CheckinSchedule.DoesNotExist:
            timezone = "Etc/UTC"

        context.update({"timezone": timezone, "user_id": self.user_id})

        return context


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
