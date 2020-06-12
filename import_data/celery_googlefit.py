"""
Asynchronous tasks that update data in Open Humans.
"""
import logging
import os

import arrow
from celery import shared_task

from openhumans.models import OpenHumansMember
from datetime import datetime
import os

from ohapi import api

from import_data.googlefit_api import get_googlefit_data

MAX_FILE_BYTES = 256000000 # 256 MB
# Set up logging.
logger = logging.getLogger(__name__)


def create_metadata(month):
    return {
        'description':
            'Google Fit data.',
        'tags': ['Google Fit', 'GoogleFit', 'activity', 'steps', 'calories', 'distance'],
        'updated_at': str(datetime.utcnow()),
        'month': month,
    }


@shared_task
def fetch_googlefit_data(oh_id, send_email=False):
    '''
    Fetches all of the googlefit data for a given user
    '''
    print("Started googlefit update task")
    try:
        current_dt = datetime.utcnow()
        oh_member = OpenHumansMember.objects.get(oh_id=oh_id)
        if not hasattr(oh_member, 'googlefit_member'):
            print("No googlefit connection exists for member")
            return
        gf_member = oh_member.googlefit_member
        oh_access_token = oh_member.get_access_token()
        gf_access_token = gf_member.get_access_token()

        basenames_to_ids = get_existing_basenames_to_ids(oh_member)

        filesmonth = get_googlefit_data(oh_access_token, gf_access_token, current_dt)
        for fn, month in filesmonth:
            api.upload_aws(fn, create_metadata(month),
                                  oh_access_token,
                                  project_member_id=oh_id,
                                  max_bytes=MAX_FILE_BYTES)
            basename = os.path.basename(fn)
            if basename in basenames_to_ids:
                file_id_to_delete = basenames_to_ids[basename]
                api.delete_file(oh_access_token, file_id=file_id_to_delete)

        gf_member.last_updated = arrow.now().format()
        gf_member.save()

        if send_email and len(filesmonth) > 0:
            send_first_success_email(oh_id, oh_access_token)
        elif send_email and len(filesmonth) == 0:
            send_first_no_data_email(oh_id, oh_access_token)

    except Exception as e:
        import traceback
        print("Fetching googlefit data failed: {}".format(e))
        print(traceback.format_exc())
        # queue to retry later
        #fetch_googlefit_data.apply_async(args=[oh_id], countdown=3600)
        raise


def get_existing_basenames_to_ids(oh_member):
    res = {}
    for file_info in oh_member.list_files():
        if 'GoogleFit' in file_info['metadata']['tags']:
            res[file_info['basename']] = file_info['id']
    return res


def send_first_success_email(oh_id, oh_access_token):
    api.message('[GoogleFit] Data Import: Success', 'Your GoogleFit data was imported successfully to OpenHumans. Go to your dashboard to view: https://googlefit.openhumans.org',
                oh_access_token, project_member_ids=[oh_id])


def send_first_no_data_email(oh_id, oh_access_token):
    api.message('[GoogleFit] Data Import: No Data', 'No GoogleFit data was found to import. You need to be using the GoogleFit app on your Android device to collect data.',
                oh_access_token, project_member_ids=[oh_id])

