SHELL := /bin/bash

.PHONY: local
local:
	@heroku local

.PHONY: deps
deps: redis pipenv

.PHONY: pip
pip:
	@pipenv install --python 3.6 --dev

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
