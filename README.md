# Quantified Flu

![](/static/img/example_graph.png)

## The project idea

We are trying to collect some data to answer the following question: **Can the various physiological parameters tracked by wearables help to predict when we’re getting sick? This is not only related to #covid19, but also the flu and colds in general.**

This question [came up in the *Quantified Self* forum](https://forum.quantifiedself.com/t/using-resting-heart-rate-for-early-warning-of-coronavirus-infection/7864/16), whether resting heart rate could be used as an early indicator for #covid19 infection. Some preliminary analysis for regular colds & flu-like symptoms showed that it's complicated, as resting heart rate can be fickle for lots of reasons. Body temperature data as measured by the Oura ring seems to be a better indicator, [as highlighted by a #covid19 patient here](https://perjantaikokki.fi/2020/03/14/greetings-from-a-corona-positive-patient-from-quarantine/).

To get a better understanding of **whether our wearables can help predict cold/flu/etc onsets** we are planning to do a **retrospective study using wearable data that's annotated with metadata about disease onset times**.

## The current state

This web application is build on the API of [Open Humans](https://www.openhumans.org), which can already import wearable data streams from Fitbit, Oura, Withings and Google Fit. Earlier, [Bastian](github.com/gedankenstuecke/) made some [preliminary Jupyter Notebooks for data from Fitbit & Oura](https://exploratory.openhumans.org/search/?search_term=quantifiedflu&search_field=tags), but to broaden the scope and scale up collection efforts from n=1 to n-of-many we need a website. This repo is for building that website.

In the current state it can take in wearable data from Fitbit & Oura and visualize it for a user-given sickness-date.

## Contributing

There's still plenty to do before this can launch. Check out our [Contribution guidelines & how-to](/CONTRIBUTING.md) and maybe join us in our Slack. You can [join the Open Humans slack by creating an account here](http://slackin.openhumans.org/) and join the `#quantifiedflu` channel.

## How to run locally

We have a Makefile with common commands.

- Do `make pip` once to install dependencies (using pipenv). Repeat every time the dependencies change.

- Create a copy of `env.example` like so:

    `cp env.example .env`

    and populate `.env` with the correct values for OPENHUMANS and data source credentials.

- Every time you want to run locally, do:
    - `make deps`

    - optionally `make makemigrationslocal` (if you've changed the models) and add new migration files to Git.

    - optionally `make migratelocal` (if setting up locally for the first time, or if you've changed the models)

    - `make local`. The app will be available at `127.0.0.1:5000`

To deploy the current version to heroku, do `make deploy`.