from celery import shared_task
from celery.decorators import task

from .models import RetrospectiveEvent, RetrospectiveEventAnalysis
from import_data.models import FitbitMember
from import_data.celery_fitbit import fetch_fitbit_data
from .activity_parsers import oura_parser, fitbit_parser


@task
def analyze_event(event_id):
    event = RetrospectiveEvent.objects.get(id=event_id)
    oh_member = event.member
    oh_member_files = oh_member.list_files()

    oura_data = None
    fitbit_data = None

    for i in oh_member_files:
        if i["source"] == "direct-sharing-184" and i["basename"] == "oura-data.json":
            oura_data = i
        if i["basename"] == "fitbit-data.json" and i["source"] == "direct-sharing-102":
            fitbit_data = i

    if oura_data:
        oura_df = oura_parser(oura_data, event.date)
        new_analysis = RetrospectiveEventAnalysis(
            event=event, graph_data=oura_df.to_json(orient="records"), graph_type="Oura"
        )
        new_analysis.save()

    if fitbit_data:
        fitbit_df = fitbit_parser(fitbit_data, event.date)
        new_analysis = RetrospectiveEventAnalysis(
            event=event,
            graph_data=fitbit_df.to_json(orient="records"),
            graph_type="Fitbit",
        )
        new_analysis.save()


@task
def update_fitbit_data(fitbit_member_id):
    fitbit_member = FitbitMember.objects.get(id=fitbit_member_id)
    restart_job = fetch_fitbit_data(fitbit_member)
    if restart_job:
        update_fitbit_data.apply_async(args=[fitbit_member.id], countdown=3600)
