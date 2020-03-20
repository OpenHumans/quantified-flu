"""
Asynchronous tasks that update data in Open Humans.
These tasks:
  1. delete any current files in OH if they match the planned upload filename
  2. adds a data file
"""
import logging
import json
import tempfile
import requests
import arrow
from datetime import datetime
from quantified_flu.settings import rr
from requests_respectful import RequestsRespectfulRateLimitedError

# Set up logging.
logger = logging.getLogger(__name__)


def fetch_fitbit_data(fitbit_member):
    """
    Fetches all of the fitbit data for a given user
    """
    restart_job = None

    fitbit_urls = [
        # Requires the 'settings' scope, which we haven't asked for
        # {'name': 'devices', 'url': '/-/devices.json', 'period': None},
        {
            "name": "activities-overview",
            "url": "/{user_id}/activities.json",
            "period": None,
        },
        # interday timeline data
        {
            "name": "heart",
            "url": "/{user_id}/activities/heart/date/{start_date}/{end_date}.json",
            "period": "month",
        },
        # MPB 2016-12-12: Although docs allowed for 'year' for this endpoint,
        # switched to 'month' bc/ req for full year started resulting in 504.
        {
            "name": "tracker-activity-calories",
            "url": "/{user_id}/activities/tracker/activityCalories/date/{start_date}/{end_date}.json",
            "period": "month",
        },
        {
            "name": "tracker-calories",
            "url": "/{user_id}/activities/tracker/calories/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "tracker-distance",
            "url": "/{user_id}/activities/tracker/distance/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "tracker-elevation",
            "url": "/{user_id}/activities/tracker/elevation/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "tracker-floors",
            "url": "/{user_id}/activities/tracker/floors/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "tracker-minutes-fairly-active",
            "url": "/{user_id}/activities/tracker/minutesFairlyActive/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "tracker-minutes-lightly-active",
            "url": "/{user_id}/activities/tracker/minutesLightlyActive/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "tracker-minutes-sedentary",
            "url": "/{user_id}/activities/tracker/minutesSedentary/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "tracker-minutes-very-active",
            "url": "/{user_id}/activities/tracker/minutesVeryActive/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "tracker-steps",
            "url": "/{user_id}/activities/tracker/steps/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "weight-log",
            "url": "/{user_id}/body/log/weight/date/{start_date}/{end_date}.json",
            "period": "month",
        },
        {
            "name": "weight",
            "url": "/{user_id}/body/weight/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "sleep-awakenings",
            "url": "/{user_id}/sleep/awakeningsCount/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "sleep-efficiency",
            "url": "/{user_id}/sleep/efficiency/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "sleep-minutes-after-wakeup",
            "url": "/{user_id}/sleep/minutesAfterWakeup/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "sleep-minutes",
            "url": "/{user_id}/sleep/minutesAsleep/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "awake-minutes",
            "url": "/{user_id}/sleep/minutesAwake/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "minutes-to-sleep",
            "url": "/{user_id}/sleep/minutesToFallAsleep/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "sleep-start-time",
            "url": "/{user_id}/sleep/startTime/date/{start_date}/{end_date}.json",
            "period": "year",
        },
        {
            "name": "time-in-bed",
            "url": "/{user_id}/sleep/timeInBed/date/{start_date}/{end_date}.json",
            "period": "year",
        },
    ]

    fitbit_access_token = fitbit_member.get_access_token()

    # Get existing data as currently stored on OH
    fitbit_data, old_fid = get_existing_fitbit(fitbit_member.member, fitbit_urls)

    # Set up user realm since rate limiting is per-user
    print(fitbit_member.member)
    user_realm = "fitbit-{}".format(fitbit_member.member.oh_id)
    rr.register_realm(user_realm, max_requests=150, timespan=3600)
    rr.update_realm(user_realm, max_requests=150, timespan=3600)

    # Get initial information about user from Fitbit
    print("Creating header and going to get user profile")
    headers = {"Authorization": "Bearer %s" % fitbit_access_token}
    query_result = requests.get(
        "https://api.fitbit.com/1/user/-/profile.json", headers=headers
    ).json()

    # Store the user ID since it's used in all future queries
    user_id = query_result["user"]["encodedId"]
    member_since = query_result["user"]["memberSince"]
    start_date = arrow.get(member_since, "YYYY-MM-DD")

    # TODO: update this so it just checks the expired field.
    # if query_result.status_code == 401:
    #     fitbit_member._refresh_tokens()

    if not fitbit_data:
        print("empty data")
        # fitbit_data = {}
        # return

    # Reset data if user account ID has changed.
    print("reset data if user account ID changed")
    if "profile" in fitbit_data:
        if fitbit_data["profile"]["encodedId"] != user_id:
            logging.info(
                "User ID changed from {} to {}. Resetting all data.".format(
                    fitbit_data["profile"]["encodedId"], user_id
                )
            )
            fitbit_data = {}
            for url in fitbit_urls:
                fitbit_data[url["name"]] = {}
        else:
            logging.debug("User ID ({}) matches old data.".format(user_id))

    fitbit_data["profile"] = {
        "averageDailySteps": query_result["user"]["averageDailySteps"],
        "encodedId": user_id,
        "height": query_result["user"]["height"],
        "memberSince": member_since,
        "strideLengthRunning": query_result["user"]["strideLengthRunning"],
        "strideLengthWalking": query_result["user"]["strideLengthWalking"],
        "weight": query_result["user"]["weight"],
    }

    print("entering try block")
    try:
        # Some block about if the period is none
        print("period none")
        for url in [u for u in fitbit_urls if u["period"] is None]:
            if not user_id and "profile" in fitbit_data:
                user_id = fitbit_data["profile"]["user"]["encodedId"]

            # Build URL
            fitbit_api_base_url = "https://api.fitbit.com/1/user"
            final_url = fitbit_api_base_url + url["url"].format(user_id=user_id)
            # Fetch the data
            print(final_url)
            r = rr.get(
                url=final_url,
                headers=headers,
                realms=["Fitbit", "fitbit-{}".format(fitbit_member.member.oh_id)],
            )
            print(r.text)

            # print(fitbit_data)
            fitbit_data[url["name"]] = r.json()

        # Period year URLs
        print("period year")
        # print(fitbit_data)
        for url in [u for u in fitbit_urls if u["period"] == "year"]:
            # print("LOOPED OVER A URL" + str(url))
            print("attempting to print the latest YEAR that data is present")
            if len(list(fitbit_data[url["name"]].keys())) > 0:
                print(sorted(fitbit_data[url["name"]].keys())[-1])
                last_present_year = sorted(fitbit_data[url["name"]].keys())[-1]
            else:
                print("no prior data")
                last_present_year = ""

            years = arrow.Arrow.range("year", start_date.floor("year"), arrow.get())
            # print(years)
            for year_date in years:
                # print(year_date)
                year = year_date.format("YYYY")

                if year in fitbit_data[url["name"]] and year != last_present_year:
                    logger.info("Skip retrieval {}: {}".format(url["name"], year))
                    continue

                logger.info("Retrieving %s: %s", url["name"], year)
                # Build URL
                fitbit_api_base_url = "https://api.fitbit.com/1/user"
                final_url = fitbit_api_base_url + url["url"].format(
                    user_id=user_id,
                    start_date=year_date.floor("year").format("YYYY-MM-DD"),
                    end_date=year_date.ceil("year").format("YYYY-MM-DD"),
                )
                # Fetch the data
                print(final_url)
                r = rr.get(
                    url=final_url,
                    headers=headers,
                    realms=["Fitbit", "fitbit-{}".format(fitbit_member.member.oh_id)],
                )

                # print([url['name']]['blah'])
                # print([str(year)])
                fitbit_data[url["name"]][str(year)] = r.json()

        # Month period URLs/fetching
        # print(fitbit_data)
        print("period month")
        for url in [u for u in fitbit_urls if u["period"] == "month"]:
            # get the last time there was data
            print("attempting to print the latest month that data is present")
            if len(list(fitbit_data[url["name"]].keys())) > 0:
                print(sorted(fitbit_data[url["name"]].keys())[-1])
                last_present_month = sorted(fitbit_data[url["name"]].keys())[-1]
            else:
                print("no prior month")
                last_present_month = ""

            months = arrow.Arrow.range("month", start_date.floor("month"), arrow.get())
            for month_date in months:
                month = month_date.format("YYYY-MM")

                # print("in month loop, here is the json data")
                # print(fitbit_data[url['name']][month])

                if month in fitbit_data[url["name"]] and month != last_present_month:
                    print("skipping month, data is there")
                    print(month)
                    logger.info("Skip retrieval {}: {}".format(url["name"], month))
                    continue

                logger.info("Retrieving %s: %s", url["name"], month)
                # Build URL
                fitbit_api_base_url = "https://api.fitbit.com/1/user"
                final_url = fitbit_api_base_url + url["url"].format(
                    user_id=user_id,
                    start_date=month_date.floor("month").format("YYYY-MM-DD"),
                    end_date=month_date.ceil("month").format("YYYY-MM-DD"),
                )
                # Fetch the data
                print(final_url)
                r = rr.get(
                    url=final_url,
                    headers=headers,
                    realms=["Fitbit", "fitbit-{}".format(fitbit_member.member.oh_id)],
                )

                fitbit_data[url["name"]][month] = r.json()

        # Update the last updated date if the data successfully completes
        fitbit_member.last_updated = arrow.now().format()
        fitbit_member.save()

    except RequestsRespectfulRateLimitedError:
        logging.info("Requests-respectful reports rate limit hit.")
        print("hit requests respectful rate limit, going to requeue")
        restart_job = "yes please"
        # raise RateLimitException()
    finally:
        print("calling finally")
        # print(fitbit_data)
        replace_fitbit(fitbit_member.member, fitbit_data, old_fid)
        return restart_job

    # return fitbit_data


def get_existing_fitbit(oh_member, fitbit_urls):
    print("entered get_existing_fitbit")
    for dfile in oh_member.list_files():
        if "QF-Fitbit" in dfile["metadata"]["tags"]:
            print("got inside fitbit if")
            # get file here and read the json into memory
            tf_in = tempfile.NamedTemporaryFile(suffix=".json")
            tf_in.write(requests.get(dfile["download_url"]).content)
            tf_in.flush()
            fitbit_data = json.load(open(tf_in.name))
            print("fetched existing data from OH")
            # print(fitbit_data)
            return fitbit_data, dfile["id"]
    fitbit_data = {}
    for url in fitbit_urls:
        fitbit_data[url["name"]] = {}
    return (fitbit_data, None)


def replace_fitbit(oh_member, fitbit_data, old_fid):
    print("replace function started")
    # delete old file and upload new to open humans
    metadata = {
        "description": "Fitbit data from QF.",
        "tags": ["QF-Fitbit", "activity", "steps", "quantified flu"],
        "updated_at": str(datetime.utcnow()),
    }

    with tempfile.TemporaryFile() as f:
        js = json.dumps(fitbit_data)
        js = str.encode(js)
        f.write(js)
        f.flush()
        f.seek(0)
        oh_member.upload(stream=f, filename="QF-fitbit-data.json", metadata=metadata)

    oh_member.delete_single_file(file_id=old_fid)
