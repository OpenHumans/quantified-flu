import json

from celery import shared_task
from celery.decorators import task

from django.contrib.auth import get_user_model

from openhumans.models import OpenHumansMember

from .models import RetrospectiveEvent, RetrospectiveEventAnalysis
from import_data.models import FitbitMember, OuraMember
from reports.models import SymptomReport, SymptomReportPhysiology
from import_data.activity_parsers import (
    oura_parser,
    fitbit_parser,
    fitbit_intraday_parser,
    googlefit_parser,
    apple_health_parser,
    garmin_parser,
)
from import_data.celery_fitbit import fetch_fitbit_data
from import_data.celery_oura import fetch_oura_data
from import_data.celery_googlefit import fetch_googlefit_data

# from .activity_parsers import oura_parser, fitbit_parser, fitbit_intraday_parser

User = get_user_model()


def analyze_existing_events(user_id):
    user = User.objects.get(id=user_id)
    events = RetrospectiveEvent.objects.filter(member=user.openhumansmember)
    for event in events:
        print("Processing user {} for event {}…".format(user, event))
        analyze_event.delay(event_id=event.id)


def analyze_existing_reports(user_id):
    user = User.objects.get(id=user_id)
    reports = SymptomReport.objects.filter(member=user.openhumansmember)
    print("Processing user {} for symptom reports…".format(user))
    add_wearable_to_symptom.delay(user.openhumansmember.oh_id)


def get_wearable_data(member_files):
    oura_data = None
    fitbit_data = None
    googlefit_data = []
    fitbit_intraday_data = []
    apple_health_data = None
    garmin_data = None

    # Get info for relevant files.
    # Take the first match for Fitbit and Oura, where all data is in a single file.
    # Save all files matching Fitbit Intraday, which isstored in multiple files.
    for file_info in member_files:
        source = file_info["source"]
        basename = file_info["basename"]

        if "googlefit" in basename:
            googlefit_data.append(file_info)

        if (
            source == "direct-sharing-184"
            and basename == "oura-data.json"
            and not oura_data
        ):
            oura_data = file_info
        if (
            source == "direct-sharing-102"
            and basename == "fitbit-data.json"
            and not fitbit_data
        ):
            fitbit_data = file_info
        if source == "direct-sharing-39":
            if basename == "QF-oura-data.json" and not oura_data:
                oura_data = file_info
            if basename == "QF-fitbit-data.json" and not fitbit_data:
                fitbit_data = file_info
        if source == "direct-sharing-191":
            fitbit_intraday_data.append(file_info)

        if source == "direct-sharing-453" and basename.startswith("heartrate_samples"):
            apple_health_data = file_info

        if 'Garmin' in file_info['metadata']['tags']:
            garmin_data = file_info

    return {
        "oura_data": oura_data,
        "googlefit_data": googlefit_data,
        "fitbit_data": fitbit_data,
        "fitbit_intraday_data": fitbit_intraday_data,
        "apple_health_data": apple_health_data,
        "garmin_data": garmin_data,
    }


def analyze_googlefit_event(googlefit_data, event):
    googlefit_hr_data = googlefit_parser(googlefit_data, event.date)
    if googlefit_hr_data:
        googlefit_hr_analysis = RetrospectiveEventAnalysis(
            event=event,
            graph_data=json.dumps(googlefit_hr_data),
            graph_type="googlefit_heartrate",
        )
        googlefit_hr_analysis.save()
    else:
        print("No GoogleFit data available around event {}".format(event.date))


def analyze_garmin_event(garmin_data, event):
    garmin_hr_data = garmin_parser(garmin_data, event.date)
    print("hr data")
    print(garmin_hr_data)
    if garmin_hr_data:

        garmin_hr_analysis = RetrospectiveEventAnalysis(
            event=event,
            graph_data=json.dumps(garmin_hr_data),
            graph_type="garmin_heartrate",
        )
        garmin_hr_analysis.save()
    else:
        print("No Garmin data available around event {}".format(event.date))



@task
def analyze_event(event_id):
    event = RetrospectiveEvent.objects.get(id=event_id)
    oh_member = event.member

    wearable_data = get_wearable_data(oh_member.list_files())
    oura_data = wearable_data["oura_data"]
    fitbit_data = wearable_data["fitbit_data"]
    fitbit_intraday_data = wearable_data["fitbit_intraday_data"]
    googlefit_data = wearable_data["googlefit_data"]
    apple_health_data = wearable_data["apple_health_data"]
    garmin_data = wearable_data["garmin_data"]

    if googlefit_data:
        analyze_googlefit_event(googlefit_data, event)

    if garmin_data:
        analyze_garmin_event(garmin_data, event)

    if oura_data:
        oura_analyses = event.retrospectiveeventanalysis_set.filter(
            graph_type__startswith="oura_"
        )
        if not oura_analyses:
            oura_hr_data, oura_temp_data = oura_parser(oura_data, event.date)
            if oura_hr_data:
                oura_hr_analysis = RetrospectiveEventAnalysis(
                    event=event,
                    graph_data=json.dumps(oura_hr_data),
                    graph_type="oura_sleep_5min",
                )
                oura_hr_analysis.save()
                oura_temp_analysis = RetrospectiveEventAnalysis(
                    event=event,
                    graph_data=json.dumps(oura_temp_data),
                    graph_type="oura_sleep_summary",
                )
                oura_temp_analysis.save()

    if apple_health_data:
        apple_analyses = event.retrospectiveeventanalysis_set.filter(
            graph_type__exact="apple_health_summary"
        )
        if not apple_analyses:
            apple_hr_data = apple_health_parser(apple_health_data, event.date)
            if apple_hr_data:
                apple_hr_analysis = RetrospectiveEventAnalysis(
                    event=event,
                    graph_data=json.dumps(apple_hr_data),
                    graph_type="apple_health_summary",
                )
                apple_hr_analysis.save()

    if fitbit_data:
        fitbit_analyses = event.retrospectiveeventanalysis_set.filter(
            graph_type__exact="fitbit_summary"
        )
        if not fitbit_analyses:
            fitbit_hr_data = fitbit_parser(fitbit_data, event.date)
            percent_missing = sum(
                [1 for i in fitbit_hr_data if i["data"]["heart_rate"] == "-"]
            ) / len(fitbit_hr_data)
            if percent_missing <= 0.4:
                fitbit_hr_analysis = RetrospectiveEventAnalysis(
                    event=event,
                    graph_data=json.dumps(fitbit_hr_data),
                    graph_type="fitbit_summary",
                )
                fitbit_hr_analysis.save()

    if fitbit_data and fitbit_intraday_data:
        fitbit_intraday_analyses = event.retrospectiveeventanalysis_set.filter(
            graph_type__exact="fitbit_intraday"
        )

        if not fitbit_intraday_analyses:
            try:
                fb_intraday_data = fitbit_intraday_parser(
                    fitbit_data, fitbit_intraday_data, event.date
                )
                new_analysis = RetrospectiveEventAnalysis(
                    event=event,
                    graph_data=json.dumps(fb_intraday_data),
                    graph_type="fitbit_intraday",
                )
                new_analysis.save()
            except:
                # The fitbit intraday parsing is very fickle and often breaks
                # Blanket except here to allow the pipeline to work regardless.
                pass


@task
def update_fitbit_data(fitbit_member_id):
    fitbit_member = FitbitMember.objects.get(id=fitbit_member_id)
    restart_job = fetch_fitbit_data(fitbit_member)
    if restart_job:
        update_fitbit_data.apply_async(args=[fitbit_member.id], countdown=3600)
        print("queued job after running into limitation")
    else:
        analyze_existing_events(fitbit_member.member.user.id)
        analyze_existing_reports(fitbit_member.member.user.id)


@shared_task
def update_oura_data(oura_member_id):
    oura_user = OuraMember.objects.get(id=oura_member_id)
    print("trying to update {}".format(oura_user.id))
    fetch_oura_data(oura_user)
    analyze_existing_events(oura_user.member.user.id)
    analyze_existing_reports(oura_user.member.user.id)


@shared_task
def update_googlefit_data(oh_id, django_user_id):
    fetch_googlefit_data(oh_id, send_email=False)
    analyze_existing_events(django_user_id)
    analyze_existing_reports(django_user_id)


def set_symptomwearablereport(oh_member, data_source, start, end, data):
    values = json.dumps(data)
    wearable_report, created = SymptomReportPhysiology.objects.get_or_create(
        member=oh_member,
        data_source=data_source,
        defaults={"start_date": start, "end_date": end, "values": values},
    )
    if not created:
        wearable_report.start_date = start
        wearable_report.end_date = end
        wearable_report.values = values
        wearable_report.save()


@task
def add_wearable_to_symptom(oh_member_id):
    oh_member = OpenHumansMember.objects.get(oh_id=oh_member_id)
    if SymptomReport.objects.filter(member=oh_member).count():
        wearable_data = get_wearable_data(oh_member.list_files())
        oura_data = wearable_data["oura_data"]
        fitbit_data = wearable_data["fitbit_data"]
        fitbit_intraday_data = wearable_data["fitbit_intraday_data"]
        googlefit_data = wearable_data["googlefit_data"]
        apple_health_data = wearable_data["apple_health_data"]
        garmin_data = wearable_data["garmin_data"]

        symptoms_start = (
            SymptomReport.objects.filter(member=oh_member).earliest("created").created
        )
        symptoms_end = (
            SymptomReport.objects.filter(member=oh_member).latest("created").created
        )

        if googlefit_data:
            googlefit_hr_data = googlefit_parser(
                googlefit_data, symptoms_start, symptoms_end
            )
            set_symptomwearablereport(
                oh_member=oh_member,
                data_source="googlefit_heartrate",
                start=symptoms_start,
                end=symptoms_end,
                data=googlefit_hr_data,
            )
        if garmin_data:
            garmin_hr_data = garmin_parser(
                garmin_data, symptoms_start, symptoms_end
            )
            set_symptomwearablereport(
                oh_member=oh_member,
                data_source="garmin_heartrate",
                start=symptoms_start,
                end=symptoms_end,
                data=garmin_hr_data,
            )

        if apple_health_data:
            apple_hr_data = apple_health_parser(
                apple_health_data, symptoms_start, symptoms_end
            )
            set_symptomwearablereport(
                oh_member=oh_member,
                data_source="apple_health_summary",
                start=symptoms_start,
                end=symptoms_end,
                data=apple_hr_data,
            )

        if oura_data:
            oura_hr_data, oura_temp_data = oura_parser(
                oura_data, symptoms_start, symptoms_end
            )
            set_symptomwearablereport(
                oh_member=oh_member,
                data_source="oura_sleep_5min",
                start=symptoms_start,
                end=symptoms_end,
                data=oura_hr_data,
            )
            set_symptomwearablereport(
                oh_member=oh_member,
                data_source="oura_sleep_summary",
                start=symptoms_start,
                end=symptoms_end,
                data=oura_temp_data,
            )

        if fitbit_data:
            fitbit_summary_data = fitbit_parser(
                fitbit_data, symptoms_start, symptoms_end
            )
            set_symptomwearablereport(
                oh_member=oh_member,
                data_source="fitbit_summary",
                start=symptoms_start,
                end=symptoms_end,
                data=fitbit_summary_data,
            )

        if fitbit_data and fitbit_intraday_data:
            try:
                # this is very fickle, if regular sleep data is missing this will
                # crash
                fb_intraday_data = fitbit_intraday_parser(
                    fitbit_data, fitbit_intraday_data, symptoms_start, symptoms_end
                )
                set_symptomwearablereport(
                    oh_member=oh_member,
                    data_source="fitbit_intraday",
                    start=symptoms_start,
                    end=symptoms_end,
                    data=fb_intraday_data,
                )
            except:
                pass
