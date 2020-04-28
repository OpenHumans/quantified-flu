import json
import re

import arrow
import pandas as pd
import requests

WEEKS_BEFORE_SICK = 3
WEEKS_AFTER_SICK = 2


def oura_parser(oura_object, event_start, event_end=False):
    if not event_end:
        event_end = event_start
    oura = json.loads(requests.get(oura_object["download_url"]).content)

    start_date = arrow.get(event_start).floor("day")
    end_date = arrow.get(event_end).ceil("day")
    period_start = start_date.shift(weeks=WEEKS_BEFORE_SICK * -1)
    period_end = end_date.shift(weeks=WEEKS_AFTER_SICK)

    returned_hr_data = []
    returned_temp_data = []

    # p is start_date!
    for entry in oura["sleep"]:
        sdate = arrow.get(entry["summary_date"])

        # Use this data if it falls within our target window.
        if sdate >= period_start and sdate <= period_end:
            record_time = arrow.get(entry["bedtime_start"])
            temperature_delta = entry.get("temperature_delta", 0)
            returned_temp_data.append(
                {
                    "timestamp": record_time.format("YYYY-MM-DD"),
                    "data": {"temperature_delta": temperature_delta},
                }
            )
            for hr in entry["hr_5min"]:
                if int(hr) != 0:
                    returned_hr_data.append(
                        {
                            "timestamp": record_time.isoformat(),
                            "data": {"heart_rate": hr},
                        }
                    )
                record_time = record_time.shift(minutes=+5)

    return returned_hr_data, returned_temp_data


def fitbit_parser(fitbit_info, event_start, event_end=None):
    if not event_end:
        event_end = event_start
    fitbit_data = json.loads(requests.get(fitbit_info["download_url"]).content)

    start_date = arrow.get(event_start)
    end_date = arrow.get(event_end)
    period_start = start_date.shift(weeks=WEEKS_BEFORE_SICK * -1)
    period_end = end_date.shift(weeks=WEEKS_AFTER_SICK)

    returned_fitbit_data = []

    for month in fitbit_data["heart"]:
        for entry in fitbit_data["heart"][month]["activities-heart"]:
            sdate = arrow.get(entry["dateTime"])
            if sdate >= period_start and sdate <= period_end:
                returned_fitbit_data.append(
                    {
                        "timestamp": entry["dateTime"],
                        "data": {
                            "heart_rate": entry["value"].get("restingHeartRate", "-")
                        },
                    }
                )

    return returned_fitbit_data


def fitbit_intraday_parser(
    fitbit_data, fitbit_intraday_files, event_start, event_end=None
):
    """
    Return intraday heartrate data for sleep periods in target period.
    """
    if not event_end:
        event_end = event_start
    fitbit_data = requests.get(fitbit_data["download_url"]).json()

    start_date = arrow.get(event_start)
    end_date = arrow.get(event_end)
    period_start = start_date.shift(weeks=WEEKS_BEFORE_SICK * -1)
    period_end = end_date.shift(weeks=WEEKS_AFTER_SICK)

    fitbit_sleep_data = {"start_times": [], "minutes": [], "periods": {}}
    returned_fitbit_data = {}

    # Calculate and store sleep periods in target time period.
    for year in fitbit_data["sleep-start-time"]:
        for entry in fitbit_data["sleep-start-time"][year]["sleep-startTime"]:
            sdate = arrow.get(entry["dateTime"])
            if sdate >= period_start and sdate <= period_end:
                fitbit_sleep_data["start_times"].append(entry)
    for year in fitbit_data["sleep-minutes"]:
        for entry in fitbit_data["sleep-minutes"][year]["sleep-minutesAsleep"]:
            sdate = arrow.get(entry["dateTime"])
            if sdate >= period_start and sdate <= period_end:
                fitbit_sleep_data["minutes"].append(entry)
    for entry in fitbit_sleep_data["start_times"]:
        if entry.get("value", None):
            fitbit_sleep_data["periods"][entry["dateTime"]] = {
                "start": arrow.get(entry["dateTime"] + " " + entry["value"])
            }
    for entry in fitbit_sleep_data["minutes"]:
        sleep_entry = fitbit_sleep_data["periods"].get(entry["dateTime"], None)
        if sleep_entry:
            sleep_entry["end"] = sleep_entry["start"].shift(minutes=int(entry["value"]))

    # Get all potentially needed heartrate data.
    hr_data = []
    for file_info in fitbit_intraday_files:
        try:
            yearmonth = re.search(
                "fitbit-intraday-(.*?)\.json", file_info["basename"]
            ).groups()[0]
            yearmonth = arrow.get(yearmonth)

            if yearmonth.floor(
                "month"
            ) <= period_end and period_start <= yearmonth.ceil("month"):
                data = json.loads(requests.get(file_info["download_url"]).content)
                hr_data = hr_data + data["activities-heart-intraday"]
        except AttributeError:
            continue
    # load into dataframe
    rows = []
    for hr_point in hr_data:
        hr_date = hr_point["date"]
        for hr_datapoint in hr_point["dataset"]:
            rows.append((hr_date + " " + hr_datapoint["time"], hr_datapoint["value"]))
    hr_dataframe = pd.DataFrame(rows, columns=["timestamp", "heart_rate"])
    hr_dataframe["timestamp"] = pd.to_datetime(hr_dataframe["timestamp"], utc=True)

    # combine with sick days data
    dataframes = []
    for entry_date, entry in fitbit_sleep_data["periods"].items():
        start = entry["start"].datetime
        end = entry["end"].datetime
        filtered = hr_dataframe[
            (hr_dataframe["timestamp"] >= start) & (hr_dataframe["timestamp"] <= end)
        ].copy()
        dataframes.append(filtered)

    dataframe_new = pd.concat(dataframes).reset_index(drop=True)
    dataframe_new = dataframe_new.set_index("timestamp")
    dataframe_new = dataframe_new.groupby(pd.Grouper(freq="5Min")).mean()
    dataframe_new = dataframe_new.reset_index()
    dataframe_new.timestamp = dataframe_new.timestamp.astype("str")

    # structure and return data
    data_flat = [
        x
        for x in json.loads(dataframe_new.to_json(orient="records"))
        if x["heart_rate"]
    ]
    returned_data = [
        {"timestamp": entry["timestamp"], "data": {"heart_rate": entry["heart_rate"]}}
        for entry in data_flat
    ]
    return returned_data
