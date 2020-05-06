import json
from collections import defaultdict
from datetime import datetime, timedelta

import requests
from dateutil.rrule import rrule, DAILY, MONTHLY
from ohapi import api

from datauploader.helpers import unix_time_millis, start_of_day, end_of_day, end_of_month, start_of_month, \
    write_jsonfile_to_tmp_dir, download_to_json, remove_empty_buckets
from datauploader.retry import retry

# based on the initial release
# https://en.wikipedia.org/wiki/Google_Fit
GOOGLEFIT_DEFAULT_START_DATE = datetime(2014, 10, 1, 0, 0, 0)
GOOGLEFIT_AGGREGATE_URL = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate"
GOOGLEFIT_DATASOURCES_URL = "https://www.googleapis.com/fitness/v1/users/me/dataSources"

GOOGLEFIT_SYNCED_DATATYPES = ('com.google.active_minutes',
                              'com.google.calories.expended',
                              'com.google.distance.delta',
                              'com.google.step_count.delta',
                              'com.google.heart_rate.bpm',
                              'com.google.heart_minutes')

HOURLY = 3600000
MINUTELY = 60000
PER_SECOND = 1000
DEFAULT_BUCKETING = MINUTELY
MAX_MONTHS_AT_A_TIME = 12


def query_data_sources(access_token):
    headers = {"Content-Type": "application/json;encoding=utf-8",
               "Authorization": "Bearer {}".format(access_token)}
    res = requests.get(GOOGLEFIT_DATASOURCES_URL, headers=headers).json()
    if 'dataSource' not in res:
        return set()
    return set([(res['dataSource'][i]['dataType']['name'], res['dataSource'][i]['dataStreamId']) for i in range(len(res['dataSource']))])


@retry(Exception, tries=2)
def query_data_stream(access_token, aggregate_value, start_dt, end_dt, bucketing=DEFAULT_BUCKETING, aggregate_name="dataSourceId"):

    data = {
        "aggregateBy": [
             {
             aggregate_name: aggregate_value
             }
        ],
        "bucketByTime": {"durationMillis": bucketing},
        "startTimeMillis": unix_time_millis(start_dt),
        "endTimeMillis": unix_time_millis(end_dt)
    }
    headers = {"Content-Type": "application/json;encoding=utf-8",
               "Authorization": "Bearer {}".format(access_token)}


    res = requests.post(GOOGLEFIT_AGGREGATE_URL, data=json.dumps(data), headers=headers).json()
    return res


def is_empty_aggregate_result(result):
    for bucket in result.get('bucket', {}):
        ds = bucket['dataset']
        for data in ds:
            if data['point'] != []:
                return False
    return True


def find_first_month_with_data(access_token, end_dt):

    start_dt = GOOGLEFIT_DEFAULT_START_DATE

    for i, dt in enumerate(rrule(MONTHLY, dtstart=start_dt, until=end_dt)):
        res = query_data_stream(access_token, 'com.google.active_minutes', start_of_day(dt), end_of_day(dt + timedelta(days=32)),
                                bucketing=12*HOURLY, aggregate_name="dataTypeName")

        is_empty = is_empty_aggregate_result(res)
        if is_empty:
            print("No data for {}, will look at later dates".format(dt))
            continue
        else:
            return start_of_month(dt)

    return None


def find_first_date_with_data(access_token, end_dt):

    start_dt = find_first_month_with_data(access_token, end_dt)

    for i, dt in enumerate(rrule(DAILY, dtstart=start_dt, until=end_dt)):
        res = query_data_stream(access_token, 'com.google.active_minutes', start_of_day(dt), end_of_day(dt),
                                bucketing=12*HOURLY, aggregate_name="dataTypeName")

        is_empty = is_empty_aggregate_result(res)
        if is_empty:
            print("No data for {}, will look at later dates".format(dt))
        else:
            return start_of_day(dt)

    return None


def generate_monthly_ranges(first_date, last_date):

    first_month_date = first_date
    while(True):
        last_month_date = end_of_month(first_month_date)
        if last_month_date >= last_date:
            yield first_month_date, last_date
            return
        yield first_month_date, last_month_date
        # get the first date for the next month
        first_month_date = start_of_day(last_month_date + timedelta(days=1))


def get_googlefit_data(oh_access_token, gf_access_token, current_date):

    last_monthly_gf_data, start_sync_date = get_last_synced_data(oh_access_token, gf_access_token, current_date)

    if start_sync_date is None:
        # no data available
        return []

    months = 0

    # separate the data into monthly buckets
    all_gf_data_files = []
    for dt1, dt2 in generate_monthly_ranges(start_sync_date, current_date):
        if start_sync_date == current_date:
            continue

        monthly_gf_data =  GoogleFitData.from_API(gf_access_token, dt1, dt2)

        if last_monthly_gf_data and last_monthly_gf_data.last_dt<dt2:
            print("merging")
            monthly_gf_data = last_monthly_gf_data.merge(monthly_gf_data)
            del last_monthly_gf_data
            last_monthly_gf_data = None


        monthly_data_json = monthly_gf_data.to_json()
        print("Last dt: {}".format(monthly_gf_data.last_dt))
        file_name = 'googlefit_{}.json'.format(dt1.strftime('%Y-%m'))
        full_file_name = write_jsonfile_to_tmp_dir(file_name, monthly_data_json)
        all_gf_data_files.append((full_file_name, dt1.strftime("%Y-%m")))
        del monthly_gf_data
        del monthly_data_json
        months += 1
        if months > MAX_MONTHS_AT_A_TIME:
            break


    print(all_gf_data_files)

    return all_gf_data_files


def get_last_synced_data(oh_access_token, gf_access_token, current_date):
    download_url = get_latest_googlefit_file_url(oh_access_token)
    if download_url:
        existing_data_json = download_to_json(download_url)
        last_monthly_gf_data = GoogleFitData.from_json(existing_data_json)
        start_date = start_of_day(
            last_monthly_gf_data.last_dt)  # start of day to account for partial data in the last day
    else:
        last_monthly_gf_data = None
        start_date = find_first_date_with_data(gf_access_token, current_date)
    return last_monthly_gf_data, start_date


def get_latest_googlefit_file_url(oh_access_token):
    member = api.exchange_oauth2_member(oh_access_token)
    latest_month = GOOGLEFIT_DEFAULT_START_DATE.strftime("%Y-%m")
    download_url = None
    for dfile in member['data']:
        if 'GoogleFit' in dfile['metadata']['tags']:
            if dfile['metadata'].get('month', '') >= latest_month:
                latest_month = dfile['metadata']['month']
                download_url = dfile['download_url']
    return download_url

def get_latest_googlefit_file_updated_dt(oh_access_token):
    member = api.exchange_oauth2_member(oh_access_token)
    latest_month = GOOGLEFIT_DEFAULT_START_DATE.strftime("%Y-%m")
    last_updated = None
    for dfile in member['data']:
        if 'GoogleFit' in dfile['metadata']['tags']:
            if dfile['metadata'].get('month', '') >= latest_month:
                latest_month = dfile['metadata']['month']
                last_updated = dfile['metadata']['updated_at']
    if last_updated:
        return datetime.strptime(last_updated, "%Y-%m-%d %H:%M:%S.%f")
    else:
        return None



class GoogleFitData(object):

    def __init__(self, datasets, metadata):
        self.datasets = datasets
        self.metadata = metadata


    def __eq__(self, other):

        metadata_equal = (self.metadata.keys() == other.metadata.keys())

        for k in self.metadata:
            if k == 'data_source_pairs' or k == 'data_types':
                metadata_equal = metadata_equal and (set(self.metadata[k]) == set(other.metadata[k]))
            else:
                metadata_equal = metadata_equal and (self.metadata[k] == other.metadata[k])

        return metadata_equal and self.datasets == other.datasets

    def __repr__(self):
        return str(self.metadata) + '\n' + str(self.datasets)

    @property
    def last_dt(self):
        return datetime.strptime(self.metadata['last_dt'], "%Y-%m-%d %H:%M:%S")


    @classmethod
    def from_API(self, access_token, start_dt, end_dt):
        available_datasources = query_data_sources(access_token)
        datasets = defaultdict(lambda :{})
        data_types_synced = set()
        data_sources_synced = set()
        for data_type_name, data_stream_id in available_datasources:
            if data_type_name not in GOOGLEFIT_SYNCED_DATATYPES:
                continue
            monthly_dataset = {}
            for i, dt in enumerate(rrule(DAILY, dtstart=start_dt, until=end_dt)):
                print("Getting {} for {}".format(data_stream_id, start_of_day(dt)))
                res = query_data_stream(access_token, data_stream_id, start_of_day(dt), end_of_day(dt))
                res = remove_empty_buckets(res)
                monthly_dataset[dt.strftime("%Y-%m-%d")] = res

            datasets[data_type_name][data_stream_id] = monthly_dataset
            data_types_synced.add(data_type_name)
            data_sources_synced.add((data_type_name, data_stream_id))

        metadata = {'month': start_dt.strftime("%Y-%m"), 'last_dt': end_dt.strftime("%Y-%m-%d %H:%M:%S"),
                    'data_source_pairs': list(data_sources_synced), 'data_types': list(data_types_synced)}
        return GoogleFitData(datasets, metadata)

    @classmethod
    def from_json(self, json_data):
        metadata = json_data['metadata']
        # turn into tuples
        metadata['data_source_pairs'] = [(pair[0],pair[1]) for pair in json_data['metadata']['data_source_pairs']]
        return GoogleFitData(datasets=json_data['datasets'], metadata=metadata)


    def get_dataset_for_type_and_source(self, type, source):
        return self.datasets.get(type, {}).get(source, {})

    def merge(self, other_gf_data):
        if other_gf_data is None:
            return self
        if self.metadata['month'] != other_gf_data.metadata['month']:
            raise Exception('Should merge datasets of the same month')

        merged_dsp = list(set(self.metadata['data_source_pairs']) | set(other_gf_data.metadata['data_source_pairs']))
        merged_dt = list(set(self.metadata['data_types']) | set(other_gf_data.metadata['data_types']))

        new_metadata = {'month': self.metadata['month'],
                        'last_dt': max(self.metadata['last_dt'], other_gf_data.metadata['last_dt']),
                        'data_source_pairs': merged_dsp,
                        'data_types': merged_dt}

        #merge the datasets
        new_datasets = defaultdict(lambda :{})
        for data_type, data_source in merged_dsp:
            data1 = self.get_dataset_for_type_and_source(data_type, data_source)
            data2 = other_gf_data.get_dataset_for_type_and_source(data_type, data_source)
            new_keys = set(list(data1.keys()) + list(data2.keys()))
            new_datasets[data_type][data_source] = {}
            for date in new_keys:
                if date in data1.keys() and date in data2.keys():
                    if self.metadata['last_dt'] > other_gf_data.metadata['last_dt']:
                        dataset = data1[date]
                    else:
                        dataset = data2[date]
                elif date in data1.keys():
                    dataset = data1[date]
                elif date in data2.keys():
                    dataset = data2[date]
                else:
                    continue

                new_datasets[data_type][data_source][date] = dataset


        return GoogleFitData(new_datasets, new_metadata)


    def to_json(self):
        return {
            "datasets": self.datasets,
            "metadata": self.metadata
        }

