release: python manage.py migrate
web: gunicorn quantified_flu.wsgi:application --log-file -
worker: celery worker -A quantified_flu --concurrency 1 -l info
