# `ripple-rest`

A simplified RESTful API for interfacing with the [Ripple Network](http://ripple.com).

See the [__Guide__](docs/GUIDE.md) and the [__API Reference__](docs/REF.md) for details on how to use the API.

## Setup

A test version of the API can be found at [`https://ripple-rest.herokuapp.com`](https://ripple-rest.herokuapp.com). Even though it supports HTTPS connections, __only submit transactions from test accounts__, we make __NO GUARANTEES__ about the security of your secret keys on this server.

To install `ripple-rest` locally for the first time:

1. Make sure you have [`Node.js`](http://nodejs.org/) and [PostgreSQL](http://www.postgresql.org/download/) installed.
2. Clone this repository
3. Setup a user and a database in PostgreSQL (see this [Getting Started Guide](http://www.postgresql.org/docs/9.3/static/tutorial-start.html) for more information on creating a database with PostgreSQL)
4. Set the configuration option `DATABASE_URL` to point to your database either by modifying the `config.json` file or by using environment variables. `DATABASE_URL` should follow the format: `postgres://{username}:{password}@{host}:{port -- default: 5432}/{database}
5. `npm install -g db-migrate`
6. `db-migrate up -m db/migrations --config db/database.json`
7. `npm install`
8. Configure `config.json` or your environment variables to point to your rippled
9. `node server.js`

To update your version of `ripple-rest`:

1. From the `ripple-rest` directory, run `git pull`
2. `db-migrate down -m db/migrations --config db/database.json`
3. `db-migrate up -m db/migrations --config db/database.json`
4. `npm install`
5. `node server.js`


## Testing

`npm test`

## Bugs

__This API is still in beta.__ Please open issues for any problems you encounter.

## API Object Formats

1. [Amount](docs/REF.md#1-amount)
2. [Payment](docs/REF.md#2-payment)
3. [Notification](docs/REF.md#3-notification)

## Available API Routes

1. [Notifications](docs/REF.md#1-notifications)
    + [`GET /api/v1/addresses/:address/next_notification`](docs/REF.md#get-apiv1addressesaddressnext_notification)
    + [`GET /api/v1/addresses/:address/next_notification/:prev_tx_hash`](docs/REF.md#get-apiv1addressesaddressnext_notificationprev_tx_hash)
2. [Payments](docs/REF.md#2-payments)
    + [`GET /api/v1/addresses/:address/payments/options`](docs/REF.md#get-apiv1addressesaddresspaymentsoptions)
    + [`POST /api/v1/addresses/:address/payments`](docs/REF.md#post-apiv1addressesaddresspayments)
    + [`GET /api/v1/addresses/:address/payments/:tx_hash`](docs/REF.md#get-apiv1addressesaddresspaymentstx_hash)
3. [Standard Ripple Transactions](docs/REF.md#3-standard-ripple-transactions)
    + [`GET /api/v1/addresses/:address/txs/:tx_hash`](docs/REF.md#get-apiv1addressesaddresstxstx_hash)
    + [`POST /api/v1/addresses/:address/txs/`](docs/REF.md#post-apiv1addressesaddresstxs)
4. [Server Info](docs/REF.md#4-server-info)
    + [`GET /api/v1/status`](docs/REF.md#get-apiv1status)
