# Contributing

Thanks so much for your interest in contributing! 🎉🎉🎉🎉

Check out the [open issues to see where you can contribute](https://github.com/madprime/quantified-flu/issues). 
You can also join our Slack channel (`#quantifiedself`) on the [Open Humans Slack](http://slackin.openhumans.org/). 
You can send yourself an [invite to the Slack through this link](http://slackin.openhumans.org/).


## Setting up your development enviroment 

The production version of this website is deployed to [Heroku](https://www.heroku.com). Anticipating this deployment
we run the local development version through `heroku local`, which requires you [to have the `heroku` CLI installed](https://github.com/heroku/cli) globally. 

We use [`pipenv` for the Python package management](https://pipenv.pypa.io/en/latest/). On MacOS it can be installed through [`Homebrew`](https://brew.sh/) using `brew install pipenv`. (See the homebrew website for instructions on how to install `brew`).

### Installing the development version:

1. Download the repo: `git clone git@github.com:OpenHumans/quantified-flu.git`
2. Enter the project folder: `cd quantified-flu`
3. Set up packages: `pipenv install --dev` 
4. Activate the virtual environment: `pipenv shell` 
5. Set up Black pre-commit: `pre-commit install`

The key-value-store for background tasks is set up to be `redis` which you'll need to install separately and then start with `redis-server`
for actual use. It can be installed through `Homebrew` as well, using `brew install redis`.

### Settings for APIs etc. 

Copy `example.env` to `.env` and set it up.

### Migrate

`heroku local:run python manage.py migrate`

## Running your development setup

In a first terminal to start redis: `redis-server`
In second terminal to start the local dev environment: `heroku local`

In browser, go to http://127.0.0.1:5000/

