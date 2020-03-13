from celery import shared_task
from celery.decorators import task

from .models import RetrospectiveEvent, RetrospectiveEventAnalysis

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
