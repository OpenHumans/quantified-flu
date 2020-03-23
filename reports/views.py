from django.contrib import messages
from django.contrib.auth import login, logout
from django.shortcuts import render, redirect
from django.views.generic import CreateView, TemplateView

from .forms import SymptomReportForm
from .models import SymptomReport, ReportToken  # TODO: add DiagnosisReport


class CheckTokenMixin:
    def dispatch(self, request, *args, **kwargs):
        """
        Redirect if user isn't logged in, or if provided token isn't valid for login.

        This also allows access if user is already logged in & no login_token is given.
        """
        self.token = request.GET.get("login_token", None)
        if self.token:
            # Logout to avoid potential confusion if token is attempt to switch user.
            logout(request)
            try:
                token_obj = ReportToken.objects.get(token=self.token)
                if token_obj.is_valid():
                    login(request, token_obj.member.user)
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
    success_url = "/"

    def form_valid(self, form):
        form.instance.member = self.request.user.openhumansmember
        form.save()
        messages.add_message(self.request, messages.SUCCESS, "Symptom report recorded")
        return super().form_valid(form)


class ReportNoSymptomsView(CheckTokenMixin, TemplateView):
    template_name = "reports/no-symptoms.html"

    def get(self, request, *args, **kwargs):
        """Loading with valid token immediately creates a no-symptom report."""
        report = SymptomReport(report_none=True, member=request.user.openhumansmember)
        report.save()
        messages.add_message(request, messages.SUCCESS, "No symptom report saved!")
        return super().get(request, *args, **kwargs)


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
