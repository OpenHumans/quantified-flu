from django.conf import settings
from django.contrib.auth import logout
from django.shortcuts import redirect


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
