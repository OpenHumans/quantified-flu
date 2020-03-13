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
                temperature = entry["temperature_delta"]
                bedtime_start = arrow.get(entry["bedtime_start"])
                for hr in entry["hr_5min"]:
                    period.append(p)
                    timestamp.append(bedtime_start)
                    temperature_delta.append(temperature)
                    heart_rate.append(hr)
                    bedtime_start = bedtime_start.shift(minutes=+5)

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

    dataframe = pd.DataFrame(
        data={"period": period, "timestamp": timestamp, "heart_rate": heart_rate,}
    )
    return dataframe
