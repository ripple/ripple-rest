# `ripple-rest`

A RESTful API for submitting payments and monitoring accounts on the Ripple Network.

See the [__API Reference__](docs/api-reference.md) for details on the available endpoints.


## Setup

`ripple-rest` requires PostgreSQL for production systems but supports in-memory sqlite3 for testing.

### In-memory SQLite3

1. Run `git clone git@github.com:ripple/ripple-rest.git` to clone repository
2. Run `npm install` to install dependencies
3. Run `node server.js` to start the server
4. Visit [`http://localhost:5990`](http://localhost:5990) to view available endpoints and to get started

Note that restarting the server will delete the database so this CANNOT BE USED IN PRODUCTION.

### Existing PostgreSQL Installation

1. Run `git clone git@github.com:ripple/ripple-rest.git` to clone repository
2. Set the `DATABASE_URL` environment variable to point to your (configured and running) PostgreSQL instance. You can temporarily set the environment variable by running `export DATABASE_URL=postgres://{user}:{password}@{host}:{port}/{database}`. That variable can be more permanently set by adding the export line your shell configuration (default is `$HOME/.bashrc`) or to `/etc/environment`.
3. Run `npm install` to install dependencies and run database migrations
4. Run `node server.js` to start the server
5. Visit [`http://localhost:5990`](http://localhost:5990) to view available endpoints and to get started

Note that if `npm install` fails because the user running it does not have sufficient permissions to access and modify the database, the command `./node_modules/.bin/grunt` must be run with sufficient permissions to execute database migrations.

### Running in a Virtual Machine

1. Install [Fig](http://orchardup.github.io/fig/install.html) and dependencies listed on that page
2. If running on OSX, install [VirtualBox](https://www.virtualbox.org/wiki/Downloads) (not needed on Linux)
3. If running on OSX, run `docker-osx shell` (not needed on Linux)
4. Run `fig up` or, on OSX, `PYTHONIOENCODING=utf-8 fig up`
5. Visit [`http://localhost:5990`](http://localhost:5990), or [`http://localdocker:5990`](http://localdocker:5990) on OSX, to view available endpoints and to get started
