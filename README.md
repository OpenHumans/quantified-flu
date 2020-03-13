# Quantified Flu development instructions

This runs via `heroku local`, anticipating deployment on Heroku. It assumes you have `heroku` installed globally.

## Setting up

### Download and install things

1. Download the repo: `git clone git@github.com:madprime/quantified-flu.git`
2. Set up packages: `pipenv shell` & `pipenv install --dev`
3. Set up Black pre-commit: `pre-commit install`

### Secret settings

Copy `example.env` to `.env` and set it up.

### Migrate

`heroku local:run python manage.py migrate`

## Running

In terminal: `heroku local`

In browser, go to http://127.0.0.1:5000/
