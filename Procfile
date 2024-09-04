release: python manage.py migrate
web: gunicorn quantified_flu.wsgi:application --capture-output --enable-stdio-inheritance --log-file -
worker: celery -A quantified_flu worker --concurrency 1 -l info
