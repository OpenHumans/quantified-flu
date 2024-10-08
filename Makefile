SHELL := /bin/bash
export PIP_NO_CACHE_DIR = off

.PHONY: local
local:
	@heroku local

.PHONY: deps
deps: redis pipenv

.PHONY: pip
pip:
	@pipenv install --python 3.9 --dev --verbose

.PHONY: pipenv
pipenv:
	# activate pipenv if not active, otherwise do nothing
	@if [[ `pip -V` == *"virtualenvs"* ]]; then echo "pipenv shell active already :)"; else pipenv shell; echo "pipenv shell activated";fi

.PHONY: redis
redis:
	# create a new docker container with the redis image if one is not already running on port 6379, otherwise do nothing
	@if [[ -z "`docker ps | grep 0.0.0.0:6379`" ]]; then docker run -p 6379:6379 -d redis; echo "redis docker container now running";  else echo "redis docker container already running:)";fi

.PHONY: deploy
deploy:
	@git push heroku master

.PHONY: force_deploy
force_deploy:
	@git push -f heroku master


.PHONY: makemigrationslocal
makemigrationslocal:
	@export $(xargs < .env)
	@python manage.py makemigrations

.PHONY: migratelocal
migratelocal:
	@export $(xargs < .env)
	@python manage.py migrate

.PHONY: dbshell
dbshell:
	@export $(xargs < .env)
	@python manage.py dbshell

.PHONY: shell
shell:
	@export $(xargs < .env)
	@python manage.py shell

