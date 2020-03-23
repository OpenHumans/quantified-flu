from celery import shared_task
from celery.decorators import task

from .models import RetrospectiveEvent, RetrospectiveEventAnalysis
from import_data.models import FitbitMember, OuraMember
from import_data.celery_fitbit import fetch_fitbit_data
from import_data.celery_oura import fetch_oura_data
from .activity_parsers import oura_parser, fitbit_parser


@task
def analyze_event(event_id):
    event = RetrospectiveEvent.objects.get(id=event_id)
    oh_member = event.member
    oh_member_files = oh_member.list_files()

    oura_data = []
    fitbit_data = []

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

    for i in oura_data:
        oura_df = oura_parser(i, event.date)
        new_analysis = RetrospectiveEventAnalysis(
            event=event, graph_data=oura_df.to_json(orient="records"), graph_type="Oura"
        )
        new_analysis.save()

    for i in fitbit_data:
        fitbit_df = fitbit_parser(i, event.date)
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
        print("queued job after running into limitation")


@shared_task
def update_oura_data(oura_member_id):
    oura_user = OuraMember.objects.get(id=oura_member_id)
    print("trying to update {}".format(oura_user.id))
    fetch_oura_data(oura_user)
