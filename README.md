# `ripple-simple.js`

A simplified RESTful API for interfacing with the [Ripple Network](http://ripple.com).


## Setup

A sample version of the API can also be found at [http://ripple-simple.herokuapp.com]. Please note that all data is transmitted insecurely so you should __only submit transactions on test accounts__. Sending your account secret over an unencrypted connection is a *very bad idea*.

To install `ripple-simple` locally:

1. Clone repository and `cd` into it
2. [Download](http://www.postgresql.org/download/) and install PostgreSQL and setup a user
3. Set Node environment variable `DATABASE_URL` to point to PostgreSQL: `export DATABASE_URL=postgres://{username}:{password}@{host}:{port}/{database}?native=true`
4. `db-migrate up -m db/migrations --config db/database.json`
5. `npm install`
6. `node app.js`



## Testing

`npm test`



## Available API Routes

1. [Notifications](#1-notifications)
    + `[GET /api/v1/addresses/:address/next_notification](#get-apiv1addressesaddressnext_notification)`
    + [GET /api/v1/addresses/:address/next_notification/:prev_tx_hash](#get-apiv1addressesaddressnext_notificationprev_tx_hash)
2. [Payments](#2-payments)
    + [GET /api/v1/addresses/:address/payments/options](#get-apiv1addressesaddresspaymentsoptions)
    + [POST /api/v1/addresses/:address/payments](#post-apiv1addressesaddresspayments)
    + [GET /api/v1/addresses/:address/payments/:tx_hash](#get-apiv1addressesaddresspaymentstx_hash)
3. [Standard Ripple Transactions](#3-standard-ripple-transactions)
    + [GET /api/v1/addresses/:address/txs/:tx_hash](#get-apiv1addressesaddresstxstx_hash)
    + [POST /api/v1/addresses/:address/txs/](#post-apiv1addressesaddresstxs)
4. [Server Info](#4-server-info)
    + [GET /api/v1/status](#get-apiv1status)



### 1. Notifications

__________

#### GET /api/v1/addresses/:address/next_notification

Get the most recent notification for a particular account. See next route details for response format.


__________

#### GET /api/v1/addresses/:address/next_notification/:prev_tx_hash

Get the next notification after the given `:prev_tx_hash` for a particular accounts.

Response:
```js
{
    "success": true,
    "notification": {
        "address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
        "type": "payment",
        "tx_direction": "outgoing",
        "tx_state": "confirmed",
        "tx_result": "tesSUCCESS",
        "tx_ledger": 4696959,
        "tx_hash": "55BA3440B1AAFFB64E51F497EFDF2022C90EDB171BBD979F04685904E38A89B7",
        "tx_timestamp": 1391025100000,
        "tx_url": "http://ripple-simple.herokuapp.com/api/v1/addresses/rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz/payments/55BA3440B1AAFFB64E51F497EFDF2022C90EDB171BBD979F04685904E38A89B7",
        "confirmation_token": "55BA3440B1AAFFB64E51F497EFDF2022C90EDB171BBD979F04685904E38A89B7"
    }
}
```
Or if there are no new notifications:
```js
{
    "success": true,
    "notification": {
        "address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
        "type": "none",
        "tx_direction": "",
        "tx_state": "empty", // or "pending" if still waiting for outgoing transactions to clear
        "tx_result": "",
        "tx_ledger": "",
        "tx_hash": "",
        "tx_timestamp": ,
        "tx_url": "",
        "confirmation_token": ""
    }
}
```

__________

### 2. Payments


__________

#### GET /api/v1/addresses/:address/payments/options

Get payment options for a given set of options (a.k.a. Ripple path-find). Each of the resulting payment objects can be submitted directly to [`POST /api/v1/addresses/:address/payments`](#post-apiv1addressesaddresspayments).

Request Query String Parameters:
+ `src_address` - *Required*
+ `dst_address` - *Required*
+ `dst_amount` - *Required*, Amount string in the form `"1+USD+r..."` or `"1+XRP"` 

Response:
```js
{
    "success": true,
    "payments": [{
        /* Simplified Payment Object */
    }, ...]
}
```
Or if no paths can be found:
```js
{
    "success": false,
    "error": "No paths found",
    "message": "Please ensure that the src_address has sufficient funds to exectue the payment. If it does there may be insufficient liquidity in the network to execute this payment right now"
}
```

__________

#### POST /api/v1/addresses/:address/payments

Submit a payment in the simplified format.

Request JSON:
```js
{
  secret: "s...",
  payment: {
    src_address: "r...",
    // src_tag: ",
    dst_address: "r...",
    // dst_tag: "",
    // src_amount: {
    //   value: ".0001",
    //   currency: "USD",
    //   issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    // },
    // src_slippage: "0.00005",
    dst_amount: {
      value: ".001",
      currency: "XRP",
      issuer: ""
    },
    // invoice_id: "",
    // paths: [],
    // flag_partial_payment: true,
    // flag_no_direct_ripple: true
  }
}
```

Response:
```js
{
    "success": true,
    "confirmation_token": "55BA3440B1AAFFB64E51F497EFDF2022C90EDB171BBD979F04685904E38A89B7"
}
```
Or if there is a problem with the transaction:
```js
{
  "success": false,
  "error": "tecPATH_DRY",
  "message": "Path could not send partial amount. Please ensure that the src_address has sufficient funds (in the src_amount currency, if specified) to execute this transaction."
}
```

Note: save the `confirmation_token` to check for transaction confirmation by matching that against new `notification`'s.


__________

#### GET /api/v1/addresses/:address/payments/:tx_hash

Get a particular payment for a particular account.

Response:
```js
{
    "success": true,
    "payment": {
        "src_address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
        "src_tag": "",
        "src_amount": {
            "value": "0.001",
            "currency": "XRP",
            "issuer": ""
        },
        "src_slippage": "0",
        "dst_address": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
        "dst_tag": "",
        "dst_amount": {
            "value": "0.001",
            "currency": "XRP",
            "issuer": ""
        },
        "dst_slippage": "0",
        "invoice_id": "",
        "paths": [],
        "flag_no_direct_ripple": false,
        "flag_partial_payment": false,
        "tx_direction": "outgoing",
        "tx_state": "confirmed",
        "tx_result": "tesSUCCESS",
        "tx_ledger": 4696959,
        "tx_hash": "55BA3440B1AAFFB64E51F497EFDF2022C90EDB171BBD979F04685904E38A89B7",
        "tx_timestamp": 1391025100000,
        "tx_fee": "0.000012",
        "tx_src_bals_dec": [{
            "value": "-0.001012",
            "currency": "XRP",
            "issuer": ""
        }],
        "tx_dst_bals_inc": [{
            "value": "0.001",
            "currency": "XRP",
            "issuer": ""
        }]
    }
}
```

__________

### 3. Generic Ripple Transactions


__________

#### GET /api/v1/addresses/:address/txs/:tx_hash

Gets a particular transaction in the standard Ripple transaction JSON format



__________

#### POST /api/v1/addresses/:address/txs/

Post a transaction in the standard Ripple transaction format.

Request JSON:
```js
{
  type: "payment"
  from: "r...",
  to: "r...",
  amount: "1XRP"
}
```

Response:
```js
{
  success: true,
  confirmation_token: "..."
}
```

Note: save the `confirmation_token` to check for transaction confirmation by matching that against new `notification`'s.


__________

### 4. Server Info

__________

#### GET /api/v1/status

Response:
`connected` or `disconnected`

__________



