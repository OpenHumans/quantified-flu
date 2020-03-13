import uuid

from celery import shared_task
from celery.decorators import task
from django.core.files.uploadedfile import SimpleUploadedFile

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
        oura_dataframe = oura_parser(oura_data, event.date)
        print(oura_dataframe.head())

    if fitbit_data:
        fitbit_dataframe = fitbit_parser(fitbit_data, event.date)
        print(fitbit_dataframe.head())

    placeholder_text = "Event reported on {} for project member {}".format(
        event.date, oh_member.oh_id
    )
    # UUID for unique filename, to avoid overwriting other files.
    file_uuid = uuid.uuid1()
    placeholder_file = SimpleUploadedFile(
        "{}-placeholder-filename.txt".format(file_uuid.hex),
        "Placeholder file content for event {}.".format(event.id).encode("utf-8"),
    )

    new_analysis = RetrospectiveEventAnalysis(
        event=event, graph_data=placeholder_text, graph_image=placeholder_file
    )
    new_analysis.save()
