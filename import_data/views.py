from django.shortcuts import redirect, reverse
import json
import logging
import requests
from requests_oauthlib import OAuth1Session
import base64
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from .models import FitbitMember, OuraMember, GoogleFitMember, GarminMember
from retrospective.tasks import update_fitbit_data, update_oura_data, update_googlefit_data
from import_data.helpers import post_to_slack
from import_data.garmin.tasks import handle_dailies, handle_backfill
import arrow
from django.contrib import messages
from django.http import HttpResponse
import os
import urllib.parse

from ohapi import api

import google_auth_oauthlib.flow
from import_data.garmin import garmin_oauth

logger = logging.getLogger('import_data.views')


fitbit_authorize_url = "https://www.fitbit.com/oauth2/authorize"
fitbit_token_url = "https://api.fitbit.com/oauth2/token"


# Create your views here.
def complete_fitbit(request):

    code = request.GET["code"]

    # Create Base64 encoded string of clientid:clientsecret for the headers for Fitbit
    # https://dev.fitbit.com/build/reference/web-api/oauth2/#access-token-request
    encode_fitbit_auth = (
        str(settings.FITBIT_CLIENT_ID) + ":" + str(settings.FITBIT_CLIENT_SECRET)
    )
    print(encode_fitbit_auth)
    b64header = base64.b64encode(encode_fitbit_auth.encode("UTF-8")).decode("UTF-8")
    # Add the payload of code and grant_type. Construct headers
    payload = {"code": code, "grant_type": "authorization_code"}
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic %s" % (b64header),
    }
    # Make request for access token
    r = requests.post(fitbit_token_url, payload, headers=headers)
    # print(r.json())

    rjson = r.json()

    oh_user = request.user.openhumansmember

    # Save the user as a FitbitMember and store tokens
    try:
        fitbit_member = FitbitMember.objects.get(userid=rjson["user_id"])
        fitbit_member.access_token = rjson["access_token"]
        fitbit_member.refresh_token = rjson["refresh_token"]
        fitbit_member.token_expires = FitbitMember.get_expiration(rjson["expires_in"])
        fitbit_member.scope = rjson["scope"]
        fitbit_member.token_type = rjson["token_type"]
        fitbit_member.save()
    except FitbitMember.DoesNotExist:
        fitbit_member, created = FitbitMember.objects.get_or_create(
            member=oh_user,
            userid=rjson["user_id"],
            access_token=rjson["access_token"],
            refresh_token=rjson["refresh_token"],
            token_expires=FitbitMember.get_expiration(rjson["expires_in"]),
            scope=rjson["scope"],
            token_type=rjson["token_type"],
        )

    update_fitbit_data.delay(fitbit_member.id)

    if fitbit_member:
        messages.info(
            request,
            "Your Fitbit account has been connected, and your data has been queued to be fetched from Fitbit",
        )
        return redirect("/")

    messages.info(
        request,
        ("Something went wrong, please try connecting your " "Fitbit account again"),
    )
    return redirect("/")


def remove_fitbit(request):
    if request.method == "POST" and request.user.is_authenticated:
        try:
            oh_member = request.user.openhumansmember
            oh_member.delete_single_file(file_basename="QF-fitbit-data.json")
            messages.info(request, "Your Fitbit account has been removed")
            fitbit_account = request.user.openhumansmember.fitbit_member
            fitbit_account.delete()
        except:
            fitbit_account = request.user.openhumansmember.fitbit_member
            fitbit_account.delete()
            messages.info(
                request,
                ("Something went wrong, please" "re-authorize us on Open Humans"),
            )
            logout(request)
            return redirect("/")
    return redirect("/")


def update_fitbit(request):
    if request.method == "POST" and request.user.is_authenticated:
        print("entered update_data POST thing")
        oh_member = request.user.openhumansmember
        fitbit_member = oh_member.fitbit_member
        update_fitbit_data.delay(fitbit_member.id)
        fitbit_member.last_submitted = arrow.now().format()
        fitbit_member.save()
        messages.info(
            request,
            (
                "An update of your Fitbit data has been started! "
                "It can take some minutes before the first data is "
                "available. Reload this page in a while to find your "
                "data"
            ),
        )
        return redirect("/")


# OURA IMPORT AND MANAGEMENT


def authorize_oura(request):
    auth_endpoint = "https://cloud.ouraring.com/oauth/authorize?"
    scopes = [
        "personal",
        "daily",
    ]
    auth_params = {
        "client_id": os.getenv("OURA_CLIENT_ID"),
        "redirect_uri": request.build_absolute_uri(
            reverse("import_data:complete-oura")
        ),
        "scope": " ".join(scopes),
        "response_type": "code",
        "state": os.getenv("SECRET_KEY"),
    }
    return redirect(auth_endpoint + urllib.parse.urlencode(auth_params))


def complete_oura(request):

    if request.GET.get("state") != os.getenv("SECRET_KEY") or request.GET.get("error"):
        return redirect("info")

    res = requests.post(
        "https://api.ouraring.com/oauth/token",
        data={
            "grant_type": "authorization_code",
            "code": request.GET.get("code"),
            "redirect_uri": request.build_absolute_uri(
                reverse("import_data:complete-oura")
            ),
            "client_id": os.getenv("OURA_CLIENT_ID"),
            "client_secret": os.getenv("OURA_CLIENT_SECRET"),
        },
    ).json()

    OuraMember.objects.update_or_create(
        member=request.user.openhumansmember,
        defaults={
            "access_token": res["access_token"],
            "refresh_token": res["refresh_token"],
            "expiration_time": arrow.utcnow().shift(seconds=res["expires_in"]).datetime,
        },
    )
    update_oura_data.delay(request.user.openhumansmember.oura_user.id)
    return redirect("/")


def remove_oura(request):
    if request.method == "POST":
        request.user.openhumansmember.oura_user.delete()
        return redirect("/")


def update_oura(request):
    if request.method == "POST":
        update_oura_data.delay(request.user.openhumansmember.oura_user.id)
        return redirect("/")


def authorize_googlefit(request):
    # Create google oauth flow instance to manage the OAuth 2.0 Authorization Grant Flow steps.
    flow = google_auth_oauthlib.flow.Flow.from_client_config(
        settings.GOOGLEFIT_CLIENT_CONFIG, scopes=settings.GOOGLEFIT_SCOPES)

    flow.redirect_uri = request.build_absolute_uri(reverse('import_data:complete-googlefit'))

    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true')
    request.session['googlefit_oauth2_state'] = state

    return redirect(authorization_url)


def complete_googlefit(request):

    if 'googlefit_oauth2_state' not in request.session:
        messages.warning('Authorization with google did not succeed. Please try again')
        return redirect('/')

    state = request.session['googlefit_oauth2_state']
    flow = google_auth_oauthlib.flow.Flow.from_client_config(
        settings.GOOGLEFIT_CLIENT_CONFIG, scopes=settings.GOOGLEFIT_SCOPES,
        state=state)
    flow.redirect_uri = request.build_absolute_uri(reverse('import_data:complete-googlefit'))

    authorization_response = settings.OPENHUMANS_APP_BASE_URL + request.get_full_path()
    flow.fetch_token(authorization_response=authorization_response)

    credentials = flow.credentials

    if hasattr(request.user.openhumansmember, 'googlefit_member'):
        googlefit_member = request.user.openhumansmember.googlefit_member
    else:
        googlefit_member = GoogleFitMember()

    googlefit_member.access_token = credentials.token
    if credentials.refresh_token:
        # Google returns a null refresh token after the 1st time
        googlefit_member.refresh_token = credentials.refresh_token
    googlefit_member.expiry_date = credentials.expiry
    googlefit_member.scope = credentials.scopes
    googlefit_member.user_id = request.user.openhumansmember.oh_id
    googlefit_member.save()

    update_googlefit_data.delay(request.user.openhumansmember.oh_id, request.user.id)

    if googlefit_member and googlefit_member.refresh_token:
        messages.info(request,
                      "Your GoogleFit account has been connected, and your heart rate data has been queued to be fetched from GoogleFit.")
        return redirect('/')

    #logger.debug('Invalid code exchange. User returned to starting page.')
    messages.warning(request, ("Something went wrong, please try connecting your "
                               "GoogleFit account again. If you have an existing connection, please go to https://myaccount.google.com/permissions to remove it and try again."))
    return redirect('/')


def remove_googlefit(request):
    if request.method == "POST" and request.user.is_authenticated:
        try:
            openhumansmember = request.user.openhumansmember
            api.delete_file(openhumansmember.access_token,
                            openhumansmember.oh_id,
                            file_basename="googlefit-data.json")
            messages.info(request, "Your GoogleFit account has been removed")
            googlefit_account = request.user.openhumansmember.googlefit_member
            googlefit_account.delete()
        except:
            googlefit_account = request.user.openhumansmember.googlefit_member
            googlefit_account.delete()
            messages.info(request, ("Something went wrong, please"
                                    "re-authorize us on Open Humans"))
            #logout(request)
            return redirect('/')
    return redirect('/')


def update_googlefit(request):
    if request.method == "POST" and request.user.is_authenticated:
        openhumansmember = request.user.openhumansmember
        googlefit_member = openhumansmember.googlefit_member
        update_googlefit_data.delay(request.user.openhumansmember.oh_id, request.user.id)
        googlefit_member.last_submitted_for_update = arrow.now().format()
        googlefit_member.save()
        messages.info(request,
                      ("An update of your GoogleFit data has been started! "
                       "It can take some minutes before the first data is "
                       "available. Reload this page in a while to find your "
                       "data."))
        return redirect('/')


@csrf_exempt
def garmin_dailies(request):
    if request.method == "POST":
        content = json.loads(request.body)
        post_to_slack("message:"+str(content))
        handle_dailies.delay(content)
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=405)


def authorize_garmin(request):
    print(request.user.openhumansmember)
    garmin = garmin_oauth.GarminHealth(settings.GARMIN_KEY, settings.GARMIN_SECRET)
    # oauth1 leg 1
    garmin.fetch_oauth_token()
    oauth_callback = request.build_absolute_uri(reverse('import_data:complete-garmin', kwargs={"resource_owner_secret": garmin.resource_owner_secret}))
    # oauth1 leg 2
    authorization_url = garmin.fetch_authorization_url(oauth_callback)

    return redirect(authorization_url)


def complete_garmin(request, resource_owner_secret):
    authorization_response = settings.OPENHUMANS_APP_BASE_URL + request.get_full_path()
    garmin = garmin_oauth.GarminHealth(settings.GARMIN_KEY, settings.GARMIN_SECRET)
    # oauth1 leg 3
    garmin.complete_garmin(authorization_response, resource_owner_secret)
    access_token = garmin.uat
    userid = garmin.api_id

    if hasattr(request.user.openhumansmember, 'garmin_member'):
        garmin_member = request.user.openhumansmember.garmin_member
    else:
        garmin_member = GarminMember()

    garmin_member.access_token = access_token
    garmin_member.access_token_secret = garmin.oauth.token.get('oauth_token_secret')
    garmin_member.userid = userid
    garmin_member.member = request.user.openhumansmember
    handle_backfill.delay(userid)
    garmin_member.save()
    if garmin_member:
        messages.info(request,
                      "Your Garmin account has been connected, and your heart rate data has been queued to be fetched from it.")
        return redirect('/')

    messages.warning(request, ("Something went wrong, please try connecting your "
                               "Garmin account again."))
    return redirect('/')


def remove_garmin(request):
    oauth = OAuth1Session(
        client_key=settings.GARMIN_KEY,
        client_secret=settings.GARMIN_SECRET,
        resource_owner_key= request.user.openhumansmember.garmin_member.access_token,
        resource_owner_secret=request.user.openhumansmember.garmin_member.access_token_secret)

    res = oauth.delete(url="https://healthapi.garmin.com/wellness-api/rest/user/registration")
    print("deleted {}".format(res))
    print(res.content)

    request.user.openhumansmember.garmin_member.delete()
    messages.info(request,
                  "Your Garmin account has been successfully deleted.")

    return redirect("/")
