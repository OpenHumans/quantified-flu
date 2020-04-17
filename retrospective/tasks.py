from celery import shared_task
from celery.decorators import task

from django.contrib.auth import get_user_model

from openhumans.models import OpenHumansMember

from .models import RetrospectiveEvent, RetrospectiveEventAnalysis
from import_data.models import FitbitMember, OuraMember
from reports.models import SymptomReport, SymptomReportPhysiology
from import_data.celery_fitbit import fetch_fitbit_data
from import_data.celery_oura import fetch_oura_data
from .activity_parsers import oura_parser, fitbit_parser, fitbit_intraday_parser

User = get_user_model()


def analyze_existing_events(user_id):
    user = User.objects.get(id=user_id)
    events = RetrospectiveEvent.objects.filter(member=user.openhumansmember)
    for event in events:
        analyze_event.delay(event_id=event.id)


def analyze_existing_reports(user_id):
    user = User.objects.get(id=user_id)
    reports = SymptomReport.objects.filter(member=user.openhumansmember)
    add_wearable_to_symptom.delay(user.openhumansmember.oh_id)


@task
def analyze_event(event_id):
    event = RetrospectiveEvent.objects.get(id=event_id)
    oh_member = event.member
    oh_member_files = oh_member.list_files()

    oura_data = []
    fitbit_data = []
    has_fitbit_intraday = False

    for i in oh_member_files:
        if i["source"] == "direct-sharing-184" and i["basename"] == "oura-data.json":
            oura_data.append(i)
        if i["basename"] == "fitbit-data.json" and i["source"] == "direct-sharing-102":
            fitbit_data.append(i)
        if i["source"] == "direct-sharing-39" and i["basename"] == "QF-oura-data.json":
            oura_data.append(i)
        if (
            i["basename"] == "QF-fitbit-data.json"
            and i["source"] == "direct-sharing-39"
        ):
            fitbit_data.append(i)
        if i["source"] == "direct-sharing-191":
            has_fitbit_intraday = True
    if not event.retrospectiveeventanalysis_set.filter(graph_type__exact="Oura"):
        for i in oura_data:
            oura_df = oura_parser(i, event.date)
            new_analysis = RetrospectiveEventAnalysis(
                event=event,
                graph_data=oura_df.to_json(orient="records"),
                graph_type="Oura",
            )
            new_analysis.save()
    if not event.retrospectiveeventanalysis_set.filter(graph_type__exact="Fitbit"):
        for i in fitbit_data:
            fitbit_df = fitbit_parser(i, event.date)
            new_analysis = RetrospectiveEventAnalysis(
                event=event,
                graph_data=fitbit_df.to_json(orient="records"),
                graph_type="Fitbit",
            )
            new_analysis.save()

    if has_fitbit_intraday and not event.retrospectiveeventanalysis_set.filter(
        graph_type__exact="Fitbit Intraday"
    ):
        fb_intraday_df = fitbit_intraday_parser(
            fitbit_data[0], oh_member_files, event.date
        )
        new_analysis = RetrospectiveEventAnalysis(
            event=event,
            graph_data=fb_intraday_df.to_json(orient="records"),
            graph_type="Fitbit Intraday",
        )
        new_analysis.save()


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


@task
def add_wearable_to_symptom(oh_member_id):
    oh_member = OpenHumansMember.objects.get(oh_id=oh_member_id)
    oh_member_files = oh_member.list_files()

    symptom_reports_start = (
        SymptomReport.objects.filter(member=oh_member).earliest("created").created
    )
    symptom_reports_end = (
        SymptomReport.objects.filter(member=oh_member).latest("created").created
    )

    oura_data = []
    fitbit_data = []
    has_fitbit_intraday = False
    for i in oh_member_files:
        if i["source"] == "direct-sharing-184" and i["basename"] == "oura-data.json":
            oura_data.append(i)
        if i["basename"] == "fitbit-data.json" and i["source"] == "direct-sharing-102":
            fitbit_data.append(i)
        if i["source"] == "direct-sharing-39" and i["basename"] == "QF-oura-data.json":
            oura_data.append(i)
        if (
            i["basename"] == "QF-fitbit-data.json"
            and i["source"] == "direct-sharing-39"
        ):
            fitbit_data.append(i)
        if i["source"] == "direct-sharing-191":
            has_fitbit_intraday = True

    if oura_data:
        for i in oura_data:
            try:
                oura_df = oura_parser(
                    i,
                    symptom_reports_start.date().isoformat(),
                    symptom_reports_end.date().isoformat(),
                )
                oura_df = oura_df.drop(columns=["period"])
                if oura_df.to_json(orient="records"):
                    wearable_report, created = SymptomReportPhysiology.objects.get_or_create(
                        member=oh_member,
                        data_source="oura",
                        defaults={
                            "start_date": symptom_reports_start,
                            "end_date": symptom_reports_end,
                        },
                    )
                    if not created:
                        wearable_report.start_date = symptom_reports_start
                        wearable_report.end_date = symptom_reports_end
                        wearable_report.save()
                    wearable_report.values = oura_df.to_json(orient="records")
                    wearable_report.save()
            except:
                pass

    if fitbit_data:
        for i in fitbit_data:
            try:
                fitbit_df = fitbit_parser(
                    i,
                    symptom_reports_start.date().isoformat(),
                    symptom_reports_end.date().isoformat(),
                )
                fitbit_df = fitbit_df.drop(columns=["period"])
                if fitbit_df.to_json(orient="records"):
                    wearable_report, created = SymptomReportPhysiology.objects.get_or_create(
                        member=oh_member,
                        data_source="fitbit",
                        defaults={
                            "start_date": symptom_reports_start,
                            "end_date": symptom_reports_end,
                        },
                    )
                    if not created:
                        wearable_report.start_date = symptom_reports_start
                        wearable_report.end_date = symptom_reports_end
                        wearable_report.save()
                    wearable_report.values = fitbit_df.to_json(orient="records")
                    wearable_report.save()
            except:
                pass

    if has_fitbit_intraday:
        try:
            fb_intraday_df = fitbit_intraday_parser(
                fitbit_data[0],
                oh_member_files,
                symptom_reports_start.date().isoformat(),
                symptom_reports_end.date().isoformat(),
            )
            fb_intraday_df = fb_intraday_df.drop(columns=["period"])
            if fb_intraday_df.to_json(orient="records"):
                wearable_report, created = SymptomReportPhysiology.objects.get_or_create(
                    member=oh_member,
                    data_source="fitbit-intraday",
                    defaults={
                        "start_date": symptom_reports_start,
                        "end_date": symptom_reports_end,
                    },
                )
                if not created:
                    wearable_report.start_date = symptom_reports_start
                    wearable_report.end_date = symptom_reports_end
                    wearable_report.save()
                wearable_report.values = fb_intraday_df.to_json(orient="records")
                wearable_report.save()
        except:
            pass
