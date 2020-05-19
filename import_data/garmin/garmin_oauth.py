# -*- coding: utf-8 -*-
"""Core module for Python Garmin Health.
Adapted from: https://github.com/tchellomello/garmin_health/tree/master/garmin_health
"""

import logging
import os
from requests_oauthlib import OAuth1Session
from requests.exceptions import ReadTimeout, RequestException

import json
from datetime import datetime, timedelta


def timestamp_calculator(nro_days_ago=1):
    "Return the timestamp in seconds from a date interval."
    now = datetime.utcnow()
    start_time = int((now - timedelta(days=nro_days_ago)).timestamp())
    end_time = int(now.timestamp())
    return start_time, end_time

def save_json_data(data, filename):
    """Save JSON data to a given filename."""
    try:
        with open(filename, "w") as file:
            file.write(json.dumps(data, indent=4))
    except IOError:
        raise

class GarminHealthFatalException(Exception):
    """Garmin Health Fatal Exception."""
    pass

# Garmin Health Connection API
API_URL = "https://healthapi.garmin.com/wellness-api/rest"
ACCESS_TOKEN_URL = \
    "https://connectapi.garmin.com/oauth-service/oauth/access_token"
AUTHORIZE_TOKEN_URL = "https://connect.garmin.com/oauthConfirm"
REQUEST_TOKEN_URL = \
    "https://connectapi.garmin.com/oauth-service/oauth/request_token"

# Garmin Health Connection API Data Endpoints
API_DAILIES = "{0}/dailies?".format(API_URL)
API_ACTIVITIES = "{0}/activities?".format(API_URL)
API_SLEEPS = "{0}/sleeps?".format(API_URL)
API_BODY = "{0}/bodyComps?".format(API_URL)
API_STRESS = "{0}/stressDetails?".format(API_URL)
API_USER_METRICS = "{0}/userMetrics?".format(API_URL)
API_MOVEIQ = "{0}/moveiq?".format(API_URL)
API_USER_ID = "{0}/user/id".format(API_URL)


# Garmin Health Constants
RETRY = 3

CONFIG_DATA = {
    'client_key': None,
    'client_secret': None,
    'resource_owner_key': None,
    'resource_owner_secret': None,
    'verifier': None,
}

_LOGGER = logging.getLogger(__name__)


class GarminHealth(object):
    """Garmin Health API object."""

    def __init__(self, consumer_key=None, consumer_secret=None,
                 interactive=True, save_credentials=False,
                 import_credentials=False, config_file=None):
        """
        Initialize Garmin Health object.

        This object requires valid credentials created at
        https://healthapi.garmin.com
        https://developerportal.garmin.com/developer-programs/

        Note that to use this code, you must submit a request for approval
        to Garmin at https://developer.garmin.com/health-api/request-the-api/

        :param consumer_key: define API consumer key
        :param consumer_secret: define API consumer secret
        :param interactive: define if OAuth1 mode should be interactive
        :param save_credentials: save credentials to file
        :param import_credentials: read credentials from file
        :param config_file: file to read/save authentication credentials
        :type consumer_key: string
        :type consumer_secret: string
        :type interactive: boolean
        :type save_credentials: boolean
        :type import_credentials: boolean
        :type config_file: string
        """
        self._consumer_key = consumer_key
        self._consumer_secret = consumer_secret
        self._interactive = interactive
        self._save_credentials = save_credentials
        self._import_credentials = import_credentials

        self._config_file = config_file
        if config_file is None:
            self._config_file = os.path.join(os.getenv("HOME"), '.garmin.json')

        # validate if options passed by constructor are good
        self.__validate_conditions()

        # initialize core attributes
        self._api_id = None

        # request oauth token
        self.__fetch_oauth_token()

    def __repr__(self):
        """Object representation."""
        return "<{0}: {1}>".format(self.__class__.__name__, self.api_id)

    def __validate_conditions(self):
        """Validate if options passed by constructor are valid to proceed."""

        if (self._consumer_key is None or self._consumer_secret is None) \
                and self._import_credentials is False:
            raise ValueError(
                """
                You must provide the consumer key/secret or
                read from the credentials files.
                """)

        if self._interactive and self._import_credentials:
            raise ValueError(
                """
                The parameters interactive and import_credentials cannot be
                True simultaneously. Set only one of them to True.
                """)

    def __write_credentials(self, data):
        """Save OAuth1 credentials to a config file."""
        try:
            with open(self._config_file, 'w') as json_file:
                json_file.write(json.dumps(data))
                _LOGGER.debug("Credentials saved in %s", self._config_file)
        except IOError as error_msg:
            _LOGGER.error("Error: %s", error_msg)

    def __read_credentials_from_file(self):
        """Read OAuth1 credentials from the config file."""
        data = None
        try:
            with open(self._config_file, 'r') as json_file:
                _LOGGER.debug("Reading credentials from %s", self._config_file)
                data = json.load(json_file)
        except IOError as error_msg:
            _LOGGER.error("Error: %s", error_msg)
            raise ValueError(error_msg)
        return data

    def __fetch_oauth_token(self):
        """Get OAuth1 token based on the mode selected."""
        # assigns token
        CONFIG_DATA['client_key'] = self._consumer_key
        CONFIG_DATA['client_secret'] = self._consumer_secret

        if self._interactive:
            self.__fetch_oauth_interactive_token()
        elif self._import_credentials:
            self.__reuse_oauth_token_from_file()

    def __reuse_oauth_token_from_file(self):
        """Read Oauth1 credentials stored and use them."""
        if self._interactive:
            _LOGGER.debug("Aborting as interactive mode is set")
            return

        oauth_data = self.__read_credentials_from_file()
        _LOGGER.debug("Restoring OAuth1 session using stored credentials")
        self.oauth = OAuth1Session(
            client_key=oauth_data['client_key'],
            client_secret=oauth_data['client_secret'],
            resource_owner_key=oauth_data['resource_owner_key'],
            resource_owner_secret=oauth_data['resource_owner_secret'],
            verifier=oauth_data['verifier'])

        # double check if we got really authorized
        assert self.authorized, "Sorry, something went wrong!!!"
        return True

    def __fetch_oauth_interactive_token(self, retry=RETRY):
        """
        Fetch Oauth1 token using interactive mode.

        :param retry: number of attempts in case of failure
        :type retry: integer
        """
        loop = 0
        while loop <= retry:
            try:
                loop += 1

                _LOGGER.debug("Creating OAuth object (%s/%s)", loop, retry)
                self.oauth = OAuth1Session(
                    client_key=self._consumer_key,
                    client_secret=self._consumer_secret)

                # request token (step 1/3)
                _LOGGER.debug("Initializing OAuth1 (1/3) authentication to %s",
                              REQUEST_TOKEN_URL)
                self.oauth.fetch_request_token(REQUEST_TOKEN_URL)

                # authorization (step 2/3)
                _LOGGER.debug("Authorizing OAuth1 (2/3) token to %s",
                              AUTHORIZE_TOKEN_URL)
                authorization_url = \
                    self.oauth.authorization_url(AUTHORIZE_TOKEN_URL)

                # prompt for URL when in interactive mode
                if self._interactive:
                    print('Please go here and authorize,', authorization_url)
                    redirect_response = input('Paste the full redirect URL: ')
                oauth_response = \
                    self.oauth.parse_authorization_response(redirect_response)

                # access token (step 3/3)
                _LOGGER.debug("Fetching OAuth1 (3/3) token to %s",
                              ACCESS_TOKEN_URL)
                self.oauth.fetch_access_token(ACCESS_TOKEN_URL)

                # save/update crendentials
                if self._save_credentials:
                    CONFIG_DATA['resource_owner_key'] = \
                        self.oauth.token.get('oauth_token')
                    CONFIG_DATA['resource_owner_secret'] = \
                        self.oauth.token.get('oauth_token_secret')
                    CONFIG_DATA['verifier'] = \
                        oauth_response.get('oauth_verifier')

                    # save to disk
                    self.__write_credentials(CONFIG_DATA)

                # leave loop since we got authenticated
                if self.authorized:
                    _LOGGER.debug("OAuth1 token authorized, leaving loop.")
                    break
                else:
                    continue

            except Exception as error_msg:
                _LOGGER.error("Error: %s", error_msg)
                continue

        # double check if we got really authorized
        assert self.authorized, "Sorry, something went wrong!!!"
        return True

    @property
    def uat(self):
        if self.authorized:
            return self.oauth.token.get('oauth_token')
        else:
            raise Exception("No user access token available")

    def query(self, url, method='GET', retry=RETRY, raw=False):
        """
        Method to query the Garmin Health API.

        :param method: define the HTTP method
        :param raw: define if a requests raw object will be returned
        :param retry: number of attempts in case of failure
        :type method: string
        :type raw: boolean
        :type retry: integer
        """
        # make sure oauth token is present
        if not self.authorized:
            _LOGGER.debug("OAuth token not valid, trying to fetch a new one")
            self.__fetch_oauth_token()

        loop = 0
        try:
            while loop <= retry:
                loop += 1

                if method.lower() == 'get':
                    _LOGGER.debug("Querying %s", url)
                    resp = self.oauth.get(url)

                # in case of a problem
                if not resp:
                    if resp.status_code == 403:
                        msg = "Invalid OAuth1 Token. Consider refreshing it!!"
                        raise GarminHealthFatalException(msg)

                # if everything worked as expected
                if resp.status_code == 200:
                    print(resp.content)
                    if raw:
                        return resp
                    else:
                        return resp.json()

        # threat exceptions
        except (ReadTimeout, RequestException) as error_msg:
            _LOGGER.error("Error: %s", error_msg)

        # if we haven't left the method yet, throw ops!
        raise GarminHealthFatalException("Something went wrong!!!")

    @property
    def authorized(self):
        """Return a boolean if OAuth1 session is authenticated or not."""
        try:
            return self.oauth.authorized
        except AttributeError:
            return False

    def _summary(self, url, filename, start_time=None, end_time=None):
        # defaults to the last 24hrs
        if start_time is None and end_time is None:
            start_time, end_time = timestamp_calculator()

        endpoint = '{0}uploadStartTimeInSeconds={1}&uploadEndTimeInSeconds={2}'.format(url, start_time, end_time)
        data = self.query(endpoint)
        return data

    def daily_summary(self, start_time=None, end_time=None):
        return self._summary(API_DAILIES, 'dailies')

    def activity_summary(self,  start_time=None, end_time=None):
        return self._summary(API_ACTIVITIES, 'activities')

    def sleep_summary(self,  start_time=None, end_time=None):
        return self._summary(API_SLEEPS, 'sleep')

    def body_summary(self,  start_time=None, end_time=None):
        return self._summary(API_BODY, 'body')

    def stress_summary(self,  start_time=None, end_time=None):
        return self._summary(API_STRESS, 'stress')

    def user_metrics(self,  start_time=None, end_time=None):
        return self._summary(API_USER_METRICS, 'userMetrics')

    def moveiq(self,  start_time=None, end_time=None):
        return self._summary(API_MOVEIQ, 'moveIQ')

    @property
    def api_id(self):
        if self._api_id is None:
            data = self.query(API_USER_ID)
            self._api_id = data.get('userId')
        return self._api_id
