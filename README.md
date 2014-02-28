# `ripple-rest`

A simplified RESTful API for interfacing with the [Ripple Network](http://ripple.com).


See the [__Guide__](docs/GUIDE.md) and the [__API Reference__](docs/REF.md) for details on how to use the API.

## Setup

#### Test Instance

A test version of the API can be found at [`https://ripple-rest.herokuapp.com`](https://ripple-rest.herokuapp.com). 

Even though the test API supports HTTPS connections, __only submit transactions from test accounts__, we make __NO GUARANTEES__ about the security of your secret keys on this server.

#### Dependencies

1. [Node.js](http://nodejs.org/)
2. [PostgreSQL](http://www.postgresql.org/download/) (on a Mac use the [app](http://postgresapp.com/)). Follow the instructions [here](http://www.postgresql.org/docs/9.3/static/server-start.html) or those that came with your PostgreSQL to get the database server running on your machine  

#### Installing

1. Run `git clone https://github.com/ripple/ripple-rest.git` in a terminal and switch into the `ripple-rest` directory
2. Run `npm install` to install the dependencies and setup the database
3. Run `node server.js` to start the server
4. Visit `http://localhost:5990/api/v1/status` in your browser to confirm that the server is up and running

#### Updating

1. From the root `ripple-rest` directory run `npm install` to update to the newest version, update dependencies, and reconfigure the database
2. If the old version of the server is still running, kill the process with `CTRL-C` in the same terminal window where it is running or `killall node` to stop all Node.js processes on a Linux or Mac computer
3. Run `node server.js` to restart the server
4. Visit `http://localhost:5990/api/v1/status` in your browser to confirm that the server is up and running

#### Customization

+ Configuration options are loaded from various sources according to the following hierarchy (where 1 is the highest priority):

  1. Command line options: 

    `node server.js --DATABASE_URL=postgres://ripple_rest_user:password@localhost:5432/ripple_rest_db`

  2. Environment variables: 

    `export DATABASE_URL=postgres://ripple_rest_user:password@localhost:5432/ripple_rest_db; node server.js`

  3. The `config.json` file, which follows the format of the `config-example.json` file: 
   
  ```js
  { 
    /* ... */
    DATABASE_URL: "postgres://ripple_rest_user:password@localhost:5432/ripple_rest_db" 
    /* ... */
  }
  ```
  For more information on the `config.json` file and its versions see [docs/CONFIG.md](docs/CONFIG.md).

+ Configure the PostgreSQL connection by setting the `DATABASE_URL` field in any of the aforementioned configuration sources to a string in the following format: `postgres://ripple_rest_user:password@localhost:5432/ripple_rest_db`.

+ Configure the `rippled` connection by setting the `rippled_servers` field to a JSON object of the form:

  ```js
    "rippled_servers": [
      {
        "host": "s_west.ripple.com",
        "port": 443,
        "secure": true
      }
    ]
  ```

+ Enable SSL by including the following in the `config.json` in any of the configuration sources:

  ```js
  {
  /* ... */
    "ssl": {
      "key_path": "path/to/server.key",
      "cert_path": "path/to/server.crt"
    }
  /* ... */
  }
  ```
  Note that you will need to connect to the server with `https://` if you have SSL enabled.

+ If installing on Heroku you must add the Heroku PostgreSQL add-on first by running the command:

  `heroku addons:add heroku-postgresql:dev`

## Running Tests

`npm test`

## Bugs

__This API is still in beta.__ Please open issues for any problems you encounter.

## Doc Contents

#### Guide

1. [__Add new payments to a pending payments database table__](docs/GUIDE.md#1-add-new-transactions-to-a-pending-payments-database-table)
  + [Minimal schema for pending payments table](docs/GUIDE.md#minimal-schema-for-pending-payments-table)
  + [Full schema for the pending payments table](docs/GUIDE.md#full-schema-for-the-pending-payments-table)
2. [__Check the state of the `rippled` connection__](docs/GUIDE.md#2-check-the-state-of-the-rippled-connection)
3. [__Poll for new Notifications and handle confirmation of incoming and outgoing payments__](docs/GUIDE.md#3-poll-for-and-handle-notifications-of-incoming-and-outgoing-payments)
  + [Polling for `Notification`s](docs/GUIDE.md#polling-for-notifications)
  + [Confirming outgoing `Payment`s](docs/GUIDE.md#confirming-outgoing-payments-with-notifications)
  + [Listening for incoming `Payment`s](docs/GUIDE.md#listening-for-incoming-payments)
4. [__Submit pending payments to `ripple-rest`__](docs/GUIDE.md#4-submit-pending-payments-to-ripple-rest)
  + [Robust payment submission](docs/GUIDE.md#robust-payment-submission)
  + [Preventing duplicate payments](docs/GUIDE.md#preventing-duplicate-payments)

#### API Reference

1. [__Differences from standard Ripple data formats__](docs/REF.md#differences-from-standard-ripple-data-formats)
2. [__Object Formats__](docs/REF.md#object-formats)
  + [Amount](docs/REF.md#amount)
  + [Payment](docs/REF.md#payment)
  + [Notification](docs/REF.md#notification)
3. [__Available API Routes__](docs/REF.md#available-api-routes)
  + [Notifications](docs/REF.md#notifications)
      + [`GET /api/v1/addresses/:address/next_notification`](docs/REF.md#get-apiv1addressesaddressnext_notification)
      + [`GET /api/v1/addresses/:address/next_notification/:prev_hash`](docs/REF.md#get-apiv1addressesaddressnext_notificationprev_hash)
  + [Payments](docs/REF.md#payments)
      + [`GET /api/v1/addresses/:address/payments/:destination_address/:destination_amount`](docs/REF.mddocs/REF.md#get-apiv1addressesaddresspaymentsdestination_addressdestination_amount)
      + [`POST /api/v1/addresses/:address/payments`](docs/REF.md#post-apiv1addressesaddresspayments)
      + [`GET /api/v1/addresses/:address/payments/:hash`](docs/REF.md#get-apiv1addressesaddresspaymentshash)
  + [Standard Ripple Transactions](docs/REF.md#3-standard-ripple-transactions)
      + [`GET /api/v1/addresses/:address/txs/:hash`](docs/REF.md#get-apiv1addressesaddresstxshash)
  + [Server Info](docs/REF.md#server-info)
      + [`GET /api/v1/server/status`](docs/REF.md#get-apiv1serverstatus)
      + [`GET /api/v1/server/connected`](docs/REF.md#get-apiv1serverconnected)
