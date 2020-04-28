from datetime import datetime, timedelta
import json
import tempfile

import arrow
import pytz
from checkin.models import CheckinSchedule
from reports.models import SymptomReport


def identify_missing_sources(oh_member):
    missing_sources = {"oura": True, "fitbit": True}

    # Check data already in Open Humans.
    for i in oh_member.list_files():
        if i["source"] == "direct-sharing-184" and i["basename"] == "oura-data.json":
            missing_sources.pop("oura", None)
        if i["basename"] == "fitbit-data.json" and i["source"] == "direct-sharing-102":
            missing_sources.pop("fitbit", None)

    # Check data imported by this app.
    if hasattr(oh_member, "fitbit_member"):
        missing_sources.pop("fitbit", None)
    if hasattr(oh_member, "oura_user"):
        missing_sources.pop("oura", None)

    return list(missing_sources.keys())


def get_fitbit_file(oh_member):
    for dfile in oh_member.list_files():
        if "QF-Fitbit" in dfile["metadata"]["tags"]:
            return dfile["download_url"]
    return ""


def check_update(fitbit_member):
    if fitbit_member.last_submitted < (arrow.now() - timedelta(hours=1)):
        return True
    return False


def update_openhumans_reportslist(oh_member):
    """
    Update symptom reports data stored in Open Humans member account.
    """
    reports = SymptomReport.objects.filter(member=oh_member).order_by("-created")
    try:
        timezone = oh_member.checkinschedule.timezone
    except CheckinSchedule.DoesNotExist:
        timezone = pytz.timezone("UTC")

    old_fid = None
    for dfile in oh_member.list_files():
        if "QF-SymptomReports" in dfile["metadata"]["tags"]:
            old_fid = dfile["id"]
            break

    metadata = {
        "description": "Symptom reports data from QF.",
        "tags": ["QF-SymptomReports", "quantified flu"],
        "updated_at": str(datetime.utcnow()),
    }

    data = {
        "reports": [json.loads(r.as_json()) for r in reports],
        "timezone": timezone.tzname(dt=None),
    }

    with tempfile.TemporaryFile() as f:
        js = json.dumps(data)
        js = str.encode(js)
        f.write(js)
        f.flush()
        f.seek(0)
        oh_member.upload(
            stream=f, filename="QF-symptomreport-data.json", metadata=metadata
        )

    if old_fid:
        oh_member.delete_single_file(file_id=old_fid)
