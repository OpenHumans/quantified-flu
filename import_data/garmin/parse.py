from datetime import datetime
import pandas as pd


def user_map_to_timeseries(user_map):
    """

    :param user_map:
    :return: a timeseries with datetime as index, heart rate as values
    """
    recs = []
    for dailies in user_map["dailies"]:
        # print(dailies)
        start_epoch = dailies["startTimeInSeconds"]
        start_dt = datetime.utcfromtimestamp(start_epoch)
        # for offset, hr in dailies['timeOffsetHeartRateSamples'].items():
        #    offset = int(offset)
        #    rec1 = (datetime.utcfromtimestamp(start_epoch + offset), hr)
        # rec2 = (datetime.utcfromtimestamp(start_epoch + offset + HEART_RATE_SAMPLE_DURATION_SECS), hr)
        # recs.append(rec1)
        # recs.append(rec2)
        recs.append((start_dt, dailies["minHeartRateInBeatsPerMinute"]))
    s = pd.Series(data=[r[1] for r in recs], index=[r[0] for r in recs]).dropna()
    s = s.loc[
        ~s.index.duplicated(keep="first")
    ]  # sometimes we have a few duplicate entries over the days
    return s.sort_index()
