import uuid

from celery import shared_task
from celery.decorators import task
from django.core.files.uploadedfile import SimpleUploadedFile

from .models import RetrospectiveEvent, RetrospectiveEventAnalysis


@task
def analyze_event(event_id):
    event = RetrospectiveEvent.objects.get(id=event_id)
    oh_member = event.member

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
