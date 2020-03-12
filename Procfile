release: python manage.py migrate
web: gunicorn quantified_flu.wsgi:application --log-file -
# worker: celery worker -A main --concurrency 1
