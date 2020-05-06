from datetime import datetime
from functools import reduce

import pandas as pd
import pytz

def get_all_data_types(data):
    print(data.keys())
    return sorted(data['datasets'].keys())


def get_all_data_sources_for_data_type(data, datatype):
    return sorted(data['datasets'][datatype].keys())


def get_all_data_types_and_sources_pairs(data):
    res = []
    for dt in get_all_data_types(data):
        sources = get_all_data_sources_for_data_type(data, dt)
        for src in sources:
            res.add[(dt, src)]
    return res


def get_all_data_types_and_sources_pairs_and_col_names(data):
    res = []
    col_names = []
    idx = len('com.google.')
    for dt in get_all_data_types(data):
        sources = get_all_data_sources_for_data_type(data, dt)
        for i, src in enumerate(sources):
            res.append((dt, src))
            name = '{}.{}'.format(dt[idx:], i + 1)
            #if 'heart_rate' in name:
            #    print(name, src)
            col_names.append(name)
    return res, col_names


def get_dataframe(steps, dt_timezone, col_name):
    ts = []
    for day in steps.keys():
        data = steps[day].get('bucket', [])
        for datum in data:
            if datum['dataset'][0]['point'] == []:
                step_cnt = 0
            else:
                try:
                    step_cnt = datum['dataset'][0]['point'][0]['value'][0]['intVal']
                except:
                    step_cnt = datum['dataset'][0]['point'][0]['value'][0]['fpVal']

            start_ms = datum['startTimeMillis']
            start_sec = int(start_ms) / 1000
            dt = datetime.utcfromtimestamp(start_sec)
            dt = pytz.timezone('UTC').localize(dt)
            dt_local = dt.astimezone(pytz.timezone(dt_timezone))
            ts.append((dt_local, step_cnt))

    if len(ts) == 0:
        #print("empty!!")
        #print(col_name)
        return None
    df = pd.DataFrame(ts)
    df.columns = ['time', col_name]
    df = df.set_index('time')
    return df


def get_dataframe_with_all(data):
    dts_pairs, col_names = get_all_data_types_and_sources_pairs_and_col_names(data)
    return get_dataframe_with_data_types_and_sources(dts_pairs, col_names, data), col_names


def get_dataframe_with_data_types_and_sources(dts_pairs, col_names, data):
    dfs = []
    dt_timezone = 'UTC'
    for (dtype, dsource), col_name in zip(dts_pairs, col_names):
        # print(col_name)
        dts_data = data['datasets'][dtype][dsource]

        df = get_dataframe(dts_data, dt_timezone, col_name)
        if df is not None:
            dfs.append(df)

    if dfs:
        return reduce(lambda acc, df: acc.join(df, how='outer'), dfs)
    else:
        return []


