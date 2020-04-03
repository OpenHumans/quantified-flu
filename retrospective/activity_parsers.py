import pandas as pd
import arrow
import json
import requests

WEEKS_BEFORE_SICK = 3
WEEKS_AFTER_SICK = 2


def oura_parser(oura_object, event_date):
    sick_dates = [event_date]
    oura = json.loads(requests.get(oura_object["download_url"]).content)

    sd_dict = {}

    for sd in sick_dates:
        sdd = arrow.get(sd)
        period_start = sdd.shift(weeks=WEEKS_BEFORE_SICK * -1).format("YYYY-MM-DD")
        period_end = sdd.shift(weeks=WEEKS_AFTER_SICK).format("YYYY-MM-DD")
        sd_dict[sd] = {"period_start": period_start, "period_end": period_end}

    period = []
    timestamp = []
    heart_rate = []
    temperature_delta = []

    for p in sd_dict.keys():
        for entry in oura["sleep"]:
            sdate = arrow.get(entry["summary_date"])
            if (sdate >= arrow.get(sd_dict[p]["period_start"])) and (
                sdate <= arrow.get(sd_dict[p]["period_end"])
            ):
                if "temperature_delta" in entry.keys():
                    temperature = entry["temperature_delta"]
                else:
                    temperature = 0
                bedtime_start = arrow.get(entry["bedtime_start"])
                for hr in entry["hr_5min"]:
                    if int(hr) != 0:
                        period.append(str(p))
                        timestamp.append(bedtime_start)
                        temperature_delta.append(temperature)
                        heart_rate.append(hr)
                    bedtime_start = bedtime_start.shift(minutes=+5)

    timestamp = [i.format("YYYY-MM-DD HH:mm:ss") for i in timestamp]

    dataframe = pd.DataFrame(
        data={
            "period": period,
            "timestamp": timestamp,
            "heart_rate": heart_rate,
            "temperature_delta": temperature_delta,
        }
    )

    return dataframe


def fitbit_parser(fitbit_object, event_date):
    sick_dates = [event_date]
    fitbit_data = json.loads(requests.get(fitbit_object["download_url"]).content)
    sd_dict = {}

    for sd in sick_dates:
        sdd = arrow.get(sd)
        period_start = sdd.shift(weeks=WEEKS_BEFORE_SICK * -1).format("YYYY-MM-DD")
        period_end = sdd.shift(weeks=WEEKS_AFTER_SICK).format("YYYY-MM-DD")
        sd_dict[sd] = {"period_start": period_start, "period_end": period_end}

    period = []
    timestamp = []
    heart_rate = []

    for p in sd_dict.keys():
        for month in fitbit_data["heart"]:
            for entry in fitbit_data["heart"][month]["activities-heart"]:
                sdate = arrow.get(entry["dateTime"])
                if (sdate >= arrow.get(sd_dict[p]["period_start"])) and (
                    sdate <= arrow.get(sd_dict[p]["period_end"])
                ):
                    period.append(p)
                    timestamp.append(entry["dateTime"])
                    heart_rate.append(entry["value"]["restingHeartRate"])

    timestamp = [i.format("YYYY-MM-DD HH:mm:ss") for i in timestamp]
    dataframe = pd.DataFrame(
        data={"period": period, "timestamp": timestamp, "heart_rate": heart_rate,}
    )
    return dataframe


def fitbit_intraday_parser(fitbit_data, user_files, event_date):
    fitbit_data = requests.get(fitbit_data["download_url"]).json()
    sick_dates = [event_date]
    sd_dict = {}

    for sd in sick_dates:
        sdd = arrow.get(sd)
        period_start = sdd.shift(weeks=WEEKS_BEFORE_SICK * -1).format("YYYY-MM-DD")
        period_end = sdd.shift(weeks=WEEKS_AFTER_SICK).format("YYYY-MM-DD")
        sd_dict[sd] = {
            "period_start": period_start,
            "period_end": period_end,
            "sleep_start_dates": [],
            "sleep_amount_minutes": [],
        }

    for p in sd_dict.keys():
        for year in fitbit_data["sleep-start-time"]:
            for entry in fitbit_data["sleep-start-time"][year]["sleep-startTime"]:
                sdate = arrow.get(entry["dateTime"])
                if (sdate >= arrow.get(sd_dict[p]["period_start"])) and (
                    sdate <= arrow.get(sd_dict[p]["period_end"])
                ):
                    sd_dict[p]["sleep_start_dates"].append(entry)

    for p in sd_dict.keys():
        for year in fitbit_data["sleep-minutes"]:
            for entry in fitbit_data["sleep-minutes"][year]["sleep-minutesAsleep"]:
                sdate = arrow.get(entry["dateTime"])
                if (sdate >= arrow.get(sd_dict[p]["period_start"])) and (
                    sdate <= arrow.get(sd_dict[p]["period_end"])
                ):
                    sd_dict[p]["sleep_amount_minutes"].append(entry)

    for p in sd_dict.keys():
        sd_dict[p]["entries"] = {}
        for entry in sd_dict[p]["sleep_start_dates"]:
            sd_dict[p]["entries"][entry["dateTime"]] = {
                "start": arrow.get(entry["dateTime"] + " " + entry["value"])
            }
        for entry in sd_dict[p]["sleep_amount_minutes"]:
            sd_dict[p]["entries"][entry["dateTime"]]["end"] = sd_dict[p]["entries"][
                entry["dateTime"]
            ]["start"].shift(minutes=int(entry["value"]))

    for k in sd_dict.keys():
        del sd_dict[k]["sleep_start_dates"]
        del sd_dict[k]["sleep_amount_minutes"]

    for p in sd_dict.keys():

        for i in user_files:
            if i["source"] == "direct-sharing-191" and i[
                "basename"
            ] == "fitbit-intraday-{}.json".format(sd_dict[p]["period_start"][:7]):
                data = json.loads(requests.get(i["download_url"]).content)
                hr_data = data["activities-heart-intraday"]
        if sd_dict[p]["period_start"][:7] != sd_dict[p]["period_end"][:7]:
            for i in user_files:
                if i["source"] == "direct-sharing-191" and i[
                    "basename"
                ] == "fitbit-intraday-{}.json".format(sd_dict[p]["period_end"][:7]):
                    data = json.loads(requests.get(i["download_url"]).content)
                    hr_data = hr_data + data["activities-heart-intraday"]

    rows = []
    for hr_point in hr_data:
        hr_date = hr_point["date"]
        for hr_datapoint in hr_point["dataset"]:
            rows.append((hr_date + " " + hr_datapoint["time"], hr_datapoint["value"]))
    hr_dataframe = pd.DataFrame(rows, columns=["timestamp", "heart_rate"])
    hr_dataframe["timestamp"] = pd.to_datetime(hr_dataframe["timestamp"], utc=True)

    # combine with sick days data
    dataframes = []
    for p in sd_dict.keys():
        for entry_date, entry in sd_dict[p]["entries"].items():
            #
            start = entry["start"].datetime
            end = entry["end"].datetime
            filtered = hr_dataframe[
                (hr_dataframe["timestamp"] >= start)
                & (hr_dataframe["timestamp"] <= end)
            ].copy()
            filtered["period"] = p
            dataframes.append(filtered)

    dataframe_new = pd.concat(dataframes).reset_index(drop=True)
    dataframe_new = dataframe_new.set_index("timestamp")
    dataframe_new = dataframe_new.groupby(pd.Grouper(freq="5Min")).mean()
    dataframe_new = dataframe_new.reset_index()
    dataframe_new["period"] = sick_dates[0]
    dataframe_new.timestamp = dataframe_new.timestamp.astype("str")
    return dataframe_new
