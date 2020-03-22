from django.shortcuts import render, redirect
from django.views.generic import CreateView

from .models import DiagnosisReport, SymptomReport, ReportToken


class CheckTokenMixin:
    def get(self, request, *args, **kwargs):
        print("IN GET")
        token = request.GET.get("token", None)
        member = None
        if token:
            print("HAS TOKEN PARAM")
            try:
                token = ReportToken.objects.get(token=token)
                print("TOKEN FOUND")
                if token.is_valid():
                    print("TOKEN VALID")
                    member = token.member
            except ReportToken.DoesNotExist:
                pass
        if not member == self.request.user.openhumansmember:
            # TODO: add messages to tell user token was invalid/missing
            return redirect("/")
        return super().get(request, *args, **kwargs)


class ReportSymptomsView(CheckTokenMixin, CreateView):
    model = SymptomReport
    template_name = "reports/symptoms.html"
    fields = ["symptoms", "fever_guess", "fever", "other_symptoms", "notes"]

    def form_valid(self, form):
        form.instance.active = True
        form.instance.member = self.request.user.openhumansmember
        form.save()
        return super().form_valid(form)


class ReportDiagnosisView(CheckTokenMixin, CreateView):
    model = DiagnosisReport
    template_name = "reports/diagnosis.html"
    fields = ["date_tested", "virus"]

    def form_valid(self, form):
        form.instance.active = True
        form.instance.member = self.request.user.openhumansmember
        form.save()
        return super().form_valid(form)
