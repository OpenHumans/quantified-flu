from datetime import datetime

from import_data.models import GarminMember
from ohapi import api

from import_data.helpers import write_jsonfile_to_tmp_dir, download_to_json
from retrospective.tasks import analyze_existing_events, analyze_existing_reports

from celery.decorators import task
from collections import defaultdict
from requests_oauthlib import OAuth1Session
from django.conf import settings


MAX_FILE_BYTES = 256000000 # 256 MB


@task
def handle_backfill(garmin_user_id):
    garmin_member = GarminMember.objects.get(userid=garmin_user_id)
    oauth = OAuth1Session(
        client_key=settings.GARMIN_KEY,
        client_secret=settings.GARMIN_SECRET,
        resource_owner_key=garmin_member.access_token,
        resource_owner_secret=garmin_member.access_token_secret)

    start_epoch = 0
    end_epoch = 48 * 36000

    summary_url = "https://healthapi.garmin.com/wellness-api/rest/backfill/dailies?summaryStartTimeInSeconds={}&summaryEndTimeInSeconds={}".format(
        start_epoch, end_epoch)

    res = oauth.get(url=summary_url)
    if res.status_code != 202:
        raise Exception("Invalid backlfill query response: {},{}".format(res.content, res.status_code))
    return res


@task
def handle_dailies(json):
    user_maps = dailies_to_user_maps(json)

    for user_id in user_maps:
        # get existing file and merge
        user_map = user_maps[user_id]
        existing_user_map, existing_file_id = get_existing_data(user_id)
        print('existing data')
        print(len(existing_user_map.get('dailies')))
        print('new data')
        print(len(user_map['dailies']))
        if existing_user_map:
            user_map = merge_user_maps(user_map, existing_user_map)
        print('target data')
        print(len(user_map['dailies']))
        upload_user_dailies(user_id, user_map, existing_file_id)

        django_user_id = get_django_user_id_from_garmin_id(user_id)

        analyze_existing_events(django_user_id)
        analyze_existing_reports(django_user_id)


def get_django_user_id_from_garmin_id(garmin_user_id):
    oh_user = get_oh_user_from_garmin_id(garmin_user_id)
    return oh_user.user.id


def get_existing_data(garmin_user_id):
    oh_user = get_oh_user_from_garmin_id(garmin_user_id)
    member = api.exchange_oauth2_member(oh_user.get_access_token())
    for dfile in member['data']:
        if 'Garmin' in dfile['metadata']['tags']:
            download_url = dfile['download_url']
            return download_to_json(download_url), dfile['id']
    return {'dailies':[]}, None


def create_metadata():
    return {
        'description':
            'Garmin dailies heart rate data.',
        'tags': ['Garmin', 'heart rate'],
        'updated_at': str(datetime.utcnow()),
    }


def upload_user_dailies(garmin_user_id, user_map, existing_file_id):

    min_date = earliest_date(user_map)
    fn = write_jsonfile_to_tmp_dir('garmin-dailies.json', user_map)
    oh_user = get_oh_user_from_garmin_id(garmin_user_id)
    api.upload_aws(fn, create_metadata(),
                                  oh_user.get_access_token(),
                                  project_member_id=oh_user.oh_id,
                                  max_bytes=MAX_FILE_BYTES)

    oh_user.garmin_member.last_updated = datetime.now()
    if  oh_user.garmin_member.earliest_available_data and min_date < oh_user.garmin_member.earliest_available_data:
        oh_user.garmin_member.earliest_available_data = min_date
    oh_user.garmin_member.save()
    if existing_file_id:
        api.delete_file(oh_user.get_access_token(), file_id=existing_file_id)


def earliest_date(user_map):
    min_ts = None
    for summary in user_map['dailies']:
        start_ts = summary['startTimeInSeconds']
        if min_ts is None or start_ts < min_ts:
            min_ts = start_ts

    return datetime.utcfromtimestamp(min_ts)


def get_oh_user_from_garmin_id(garmin_user_id):
    garmin_member = GarminMember.objects.get(userid=garmin_user_id)
    return garmin_member.member


def dailies_to_user_maps(data):
    """

    :param data:
    :return: a dictionary of garmin user id to a dictionary {"dailies": lists of summaries for said user
    """
    res = defaultdict(lambda: {"dailies": []})

    keys_to_store = ['averageHeartRateInBeatsPerMinute',
                     'maxHeartRateInBeatsPerMinute',
                     'minHeartRateInBeatsPerMinute',
                     'timeOffsetHeartRateSamples',
                     'startTimeOffsetInSeconds',
                     'summaryId',
                     'startTimeInSeconds']

    for user_dailies in data['dailies']:
        userId = user_dailies['userId']
        data_to_store = {}
        for k in keys_to_store:
            data_to_store[k] = user_dailies.get(k, None)
        res[userId]['dailies'].append(data_to_store)

    return res


def merge_user_maps(um1, um2):

    new_map = {"dailies": []}
    seen_summary_ids = set()

    for summary in um1['dailies'] + um2['dailies']:
        if summary['summaryId'] in seen_summary_ids:
            print("already seen {}".format(summary['summaryId']))
            continue
        else:
            seen_summary_ids.add(summary['summaryId'])
            new_map['dailies'].append(summary)

    return new_map

