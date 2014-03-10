# `ripple-rest`

A RESTful API for submitting payments and monitoring accounts on the Ripple Network.

See the [__API Reference__](docs/api-reference.md) for details on the available endpoints.

## Quickstart

There is a test server available at [`https://ripple-rest.herokuapp.com`](https://ripple-rest.herokuapp.com). The root of the API contains links to all of the available endpoints.

Note that this TEST SERVER IS NOT SECURE. If you submit any payments through it, only do so with test accounts.

## Setup

`ripple-rest` uses PostgreSQL for storing outgoing transactions.

### Existing PostgreSQL Installation

1. Run `git clone git@github.com:ripple/ripple-rest.git` to clone repository
2. Set the `DATABASE_URL` environment variable to point to your (configured and running) PostgreSQL instance. You can temporarily set the environment variable by running `export DATABASE_URL=postgres://{user}:{password}@{host}:{port}/{database}`. That variable can be more permanently set by adding the export line your shell configuration (default is `$HOME/.bashrc`) or to `/etc/environment`.
3. Run `npm install` to install dependencies and run database migrations
4. Run `node server.js` to start the server
5. Visit [`http://localhost:5990`](http://localhost:5990) to view available endpoints and to get started

### Running in a Virtual Machine

1. Install [Fig](http://orchardup.github.io/fig/install.html) and dependencies listed on that page
2. If running on OSX, install [VirtualBox](https://www.virtualbox.org/wiki/Downloads) (not needed on Linux)
3. If running on OSX, run `docker-osx shell` (not needed on Linux)
4. Run `fig up` or, on OSX, `PYTHONIOENCODING=utf-8 fig up`
5. Visit [`http://localhost:5990`](http://localhost:5990), or [`http://localdocker:5990`](http://localdocker:5990) on OSX, to view available endpoints and to get started

