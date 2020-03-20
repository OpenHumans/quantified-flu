"""
Asynchronous tasks that update data in Open Humans.
These tasks:
  1. delete any current files in OH if they match the planned upload filename
  2. adds a data file
"""
import json
import tempfile
import requests
from datetime import date

OURA_BASE_URL = "https://api.ouraring.com/v1"
# Set up logging.


def fetch_oura_data(oura_user):
    oura_data = {}
    oh_member = oura_user.member
    access_token = oura_user.get_access_token()
    profile = requests.get(
        OURA_BASE_URL + "/userinfo?access_token={}".format(access_token)
    )
    if profile.status_code == 200:
        oura_data["profile"] = profile.json()
    start_date = "2015-01-01"
    end_date = str(date.today())
    sleep = requests.get(
        OURA_BASE_URL
        + "/sleep?start={}&end={}&access_token={}".format(
            start_date, end_date, access_token
        )
    )
    if sleep.status_code == 200:
        oura_data["sleep"] = sleep.json()["sleep"]
    activity = requests.get(
        OURA_BASE_URL
        + "/activity?start={}&end={}&access_token={}".format(
            start_date, end_date, access_token
        )
    )
    if activity.status_code == 200:
        oura_data["activity"] = activity.json()["activity"]
    readiness = requests.get(
        OURA_BASE_URL
        + "/readiness?start={}&end={}&access_token={}".format(
            start_date, end_date, access_token
        )
    )
    if readiness.status_code == 200:
        oura_data["readiness"] = readiness.json()["readiness"]
    with tempfile.TemporaryFile() as f:
        js = json.dumps(oura_data)
        js = str.encode(js)
        f.write(js)
        f.flush()
        f.seek(0)
        oh_member.delete_single_file(file_basename="QF-oura-data.json")
        oh_member.upload(
            stream=f,
            filename="QF-oura-data.json",
            metadata={
                "description": "QF Oura records",
                "tags": ["QF-oura", "activity", "temperature", "sleep"],
            },
        )
        print("updated data for {}".format(oura_user.id))
