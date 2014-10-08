# ripple-rest

[![Build Status](https://travis-ci.org/ripple/ripple-rest.svg?branch=develop)](https://travis-ci.org/ripple/ripple-rest)
[![Coverage Status](https://coveralls.io/repos/ripple/ripple-rest/badge.png?branch=develop)](https://coveralls.io/r/ripple/ripple-rest?branch=develop)
[![Code Climate](https://codeclimate.com/github/ripple/ripple-rest.png)](https://codeclimate.com/github/ripple/ripple-rest)

A RESTful API for submitting payments and monitoring accounts on the Ripple Network.

See the [__API Reference__](docs/api-reference.md) for details on the available endpoints and supported data formats.


## Installing and Running

`ripple-rest` requires Node.js and PostgreSQL for production systems but supports in-memory sqlite3 for testing.

### Quick Start

Follow these instructions to get your `ripple-rest` server installed running with in-memory SQLite3.

1. Run `git clone https://github.com/ripple/ripple-rest.git` in a terminal and switch into the `ripple-rest` directory
2. Install dependencies needed: `npm install`
3. Copy the config example to config.json: `cp config-example.json config.json`
4. Edit the config.json file and remove the lines that set `DATABASE_URL` and `ssl`
5. Run `node server.js` to start the server
6. Visit [`http://localhost:5990`](http://localhost:5990) to view available endpoints and to get started

Note: Restarting the server will delete the database so this CANNOT BE USED IN PRODUCTION.

### Running in a Virtual Machine

#### On Linux

1. Run `git clone https://github.com/ripple/ripple-rest.git` in a terminal and switch into the `ripple-rest` directory
2. `cp config-example.json config.json` and configure DATABASE_URL appropriately
3. Run `npm install` to install the dependencies and setup the database
4. Run `node server.js` to start the server
5. Visit `http://localhost:5990/api/v1/server` in your browser to confirm that the server is up and running

#### On Mac OSX

1. Install [Fig](http://orchardup.github.io/fig/install.html) and dependencies listed on that page
2. Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
3. Run `docker-osx shell` (not needed on Linux)
4. Run `fig up` or, on OSX, `PYTHONIOENCODING=utf-8 fig up` to start virtual machine
5. Visit [`http://localdocker:5990`](http://localdocker:5990) to view available endpoints and to get started


## Configuring `ripple-rest`

The `ripple-rest` server loads configuration options from the following sources, according to the following hierarchy (where options from 1. override those below it):

1. Command line arguments
2. Environment variables
3. The `config.json` file

The path to the `config.json` file can be specified as a command line argument (`node server.js --config /path/to/config.json`). If no path is specified, the default location for that file is in `ripple-rest`'s root directory.

Available configuration options are outlined in the [__Server Configuration__](docs/server-configuration.md) document and an example configuration file is provided [here](config-example.json).

`ripple-rest` uses the [nconf](https://github.com/flatiron/nconf) configuration loader so that any options that can be specified in the `config.json` file can also be specified as command line arguments or environment variables.

Note that the server can be run in Debug Mode by running `node server.js --debug`.

## Running `ripple-rest` Securely

### Prerequisites

1. Install as small and lightweight a systemware build as possible. The Base system package set is ideal. Only install additional packages to support specific installation or maintenance objectives.
2. At a minimum, install all extant security patches, and configure the server to do so on an ongoing basis (daily, ideally).
3. Before installing the REST API server, harden the machine using industry best practices. For example, see [How to secure an Ubuntu 12.04 LTS server - Part 1 The Basics](https://www.thefanclub.co.za/how-to/how-secure-ubuntu-1204-lts-server-part-1-basics), [Ubuntu Security](https://help.ubuntu.com/community/Security), [CIS Debian Linux Benchmark v1.0.0](https://benchmarks.cisecurity.org/downloads/show-single/?file=debian.100).
4. Use only strong passwords, a minimum of 16 characters with a mix of capital and lowercase letters, numbers, and symbols. For more on password security see [Dropbox: realistic password strength estimation](https://tech.dropbox.com/2012/04/zxcvbn-realistic-password-strength-estimation/)

### Installing `ripple-rest`

1. Install ripple-rest into a directory tree owned by the root user.  We use `/opt`.

2. Create a service account that the `ripple-rest` instance will run as.  It should NOT have a home directory because an attacker could potentially make use of that for a point-in-time attack.
  ```bash
  sudo useradd -U -m -r -s /dev/null restful
  ```

3. Create a database that the `ripple-rest` server will store its back-end data in.  Also create a database service account which only has access to that database:

  ```bash
  sudo -u postgres createdb gateway_appliance
  sudo -u postgres createuser appliance -E -S -R -D
  sudo -u postgres psql -c "ALTER USER appliance PASSWORD '<strong password here>';"
  ```

4. Create SSL certificate to encrypt traffic to and from the `ripple-rest` server.  Ensure that all associated files are mode 0644 so that the service account can access them.  To mitigate the potential harm done by making those files accessible, proactively limit the number of people who can log into that machine.

  ```bash
  openssl genrsa -out /etc/ssl/private/server.key 2048
  openssl req -utf8 -new -key /etc/ssl/private/server.key -out /etc/ssl/server.csr -sha512
    -batch
  openssl x509 -req -days 730 -in /etc/ssl/server.csr -signkey /etc/ssl/private/server.key
    -out /etc/ssl/certs/server.crt -sha512
  ```

5. When starting the `ripple-rest` server itself, start it as the service account:

  ```bash
  cd /opt/ripple-rest
  sudo -E -u restful /usr/bin/node server.js
  ```
