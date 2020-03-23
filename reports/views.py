from django.contrib import messages
from django.shortcuts import render, redirect
from django.views.generic import CreateView, TemplateView

from .models import DiagnosisReport, SymptomReport, ReportToken


class CheckTokenMixin:
    def dispatch(self, request, *args, **kwargs):
        """Get and check token from GET & POST, store token and member in instance."""
        self.member = None
        self.token = request.GET.get("token", None)
        if not self.token:
            self.token = request.POST.get("token", None)
        if self.token:
            try:
                token_obj = ReportToken.objects.get(token=self.token)
                if token_obj.is_valid():
                    self.member = token_obj.member
            except ReportToken.DoesNotExist:
                pass
        if not self.member:
            messages.add_message(
                request,
                messages.WARNING,
                "Invalid or missing token for submitting a report.",
            )
            return redirect("/")
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, *args, **kwargs):
        """Pass token as context to templates to enable re-sending within form."""
        context = super().get_context_data(*args, **kwargs)
        context.update({"token": self.token})
        return context


class ReportSymptomsView(CheckTokenMixin, CreateView):
    model = SymptomReport
    template_name = "reports/symptoms.html"
    fields = ["symptoms", "fever_guess", "fever", "other_symptoms", "notes"]

    def form_valid(self, form):
        form.instance.member = self.member
        form.save()
        return super().form_valid(form)


class ReportNoSymptomsView(CheckTokenMixin, TemplateView):
    template_name = "reports/no-symptoms.html"

    def get(self, request, *args, **kwargs):
        """Loading with valid token immediately creates a no-symptom report."""
        print(self.member)
        report = SymptomReport(report_none=True, member=self.member)
        report.save()
        messages.add_message(request, messages.SUCCESS, "No symptom report saved!")
        print(report)
        return super().get(request, *args, **kwargs)


class ReportDiagnosisView(CheckTokenMixin, CreateView):
    model = DiagnosisReport
    template_name = "reports/diagnosis.html"
    fields = ["date_tested", "virus"]

    def form_valid(self, form):
        form.instance.member = self.request.user.openhumansmember
        form.save()
        return super().form_valid(form)
