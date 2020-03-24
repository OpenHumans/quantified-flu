from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect, render
from django.views.generic import UpdateView

from .forms import CheckinScheduleForm
from .models import CheckinSchedule

# TODO: The scheduling view doesn't work and breaks if you submit something!
# It only works if you manually create a Checkin object belonging to the user
# manually. The creation of the object fails.


class CheckinScheduleView(LoginRequiredMixin, UpdateView):
    model = CheckinSchedule
    fields = ["timezone", "time_string"]
    template_name = "checkin/schedule.html"
    success_url = "/"
    login_url = "/"

    def get_object(self):
        try:
            return CheckinSchedule.objects.get(
                member=self.request.user.openhumansmember
            )
        except CheckinSchedule.DoesNotExist:
            return None

    def form_valid(self, form):
        form.instance.active = True
        form.instance.member = self.request.user.openhumansmember
        form.save()
        messages.add_message(
            self.request, messages.SUCCESS, "Check-in schedule updated."
        )
        return super().form_valid(form)


def cancel_checkins(request):
    """
    Cancel checkins
    """
    if request.method == "POST":
        schedule = CheckinSchedule.objects.get(member=request.user.openhumansmember)
        schedule.active = False
        schedule.save()
    return redirect("/")
