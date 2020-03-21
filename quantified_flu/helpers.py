import arrow
from datetime import timedelta


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
    if hasattr(oh_member, "oura_member"):
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
