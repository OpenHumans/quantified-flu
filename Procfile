release: python manage.py migrate
web: gunicorn quantified_flu.wsgi:application --capture-output --enable-stdio-inheritance --log-file -
worker: celery worker -A quantified_flu --concurrency 1 -l info
