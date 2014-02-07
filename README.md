# `ripple-rest`

A simplified RESTful API for interfacing with the [Ripple Network](http://ripple.com).


## Setup

A test version of the API can be found at [`https://ripple-rest.herokuapp.com`](https://ripple-rest.herokuapp.com). Even though it supports HTTPS connections, __only submit transactions from test accounts__, we make __NO GUARANTEES__ about the security of your secret keys on this server.

To install `ripple-rest` locally:

1. Clone repository (and make sure you have [`Node.js`](http://nodejs.org/) installed)
2. [Download](http://www.postgresql.org/download/) and install PostgreSQL and setup a user
3. `npm install -g db-migrate`
4. `db-migrate up -m db/migrations --config db/database.json`
5. `npm install`
6. Configure `config.json` or your environment variables to point to your rippled and PostgreSQL database
7. `node server.js`



## Testing

`npm test`

## Bugs

__This API is still in beta.__ Please open issues for any problems you encounter.

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
