# `ripple-rest` API Reference

This is a reference for all of the available API routes. See the [Guide](GUIDE.md) for a walkthrough of how this API is intended to be used.

----------

## Available API Routes

1. [Notifications](#1-notifications)
    + [`GET /api/v1/addresses/:address/next_notification`](#get-apiv1addressesaddressnext_notification)
    + [`GET /api/v1/addresses/:address/next_notification/:prev_tx_hash`](#get-apiv1addressesaddressnext_notificationprev_tx_hash)
2. [Payments](#2-payments)
    + [`GET /api/v1/addresses/:address/payments/options`](#get-apiv1addressesaddresspaymentsoptions)
    + [`POST /api/v1/addresses/:address/payments`](#post-apiv1addressesaddresspayments)
    + [`GET /api/v1/addresses/:address/payments/:tx_hash`](#get-apiv1addressesaddresspaymentstx_hash)
3. [Standard Ripple Transactions](#3-standard-ripple-transactions)
    + [`GET /api/v1/addresses/:address/txs/:tx_hash`](#get-apiv1addressesaddresstxstx_hash)
    + [`POST /api/v1/addresses/:address/txs/`](#post-apiv1addressesaddresstxs)
4. [Server Info](#4-server-info)
    + [`GET /api/v1/status`](#get-apiv1status)

----------

### 1. Notifications

#### The `Notification Object`

If there is a new `notification` for an account, it will come in this format:

```js
{
  "address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
  "type": "payment",
  "tx_direction": "outgoing",
  "tx_state": "confirmed",
  "tx_result": "tesSUCCESS",
  "tx_ledger": 4696959,
  "tx_hash": "55BA3440B1AAFFB64E51F497EFDF2022C90EDB171BBD979F04685904E38A89B7",
  "tx_timestamp": 1391025100000,
  "tx_url": "http://ripple-rest.herokuapp.com/api/v1/addresses/rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz/payments/55BA3440B1AAFFB64E51F497EFDF2022C90EDB171BBD979F04685904E38A89B7?in_ledger=4696959",
  "next_notification_url": "http://ripple-rest.herokuapp.com/api/v1/addresses/rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz/next_notification/55BA3440B1AAFFB64E51F497EFDF2022C90EDB171BBD979F04685904E38A89B7?ledger=4696959"
  "confirmation_token": "55BA3440B1AAFFB64E51F497EFDF2022C90EDB171BBD979F04685904E38A89B7"
}
```

If there are no new notifications for a particular account, it will follow this format:
```js
{
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
```

__________

#### GET /api/v1/addresses/:address/next_notification

Retrieve the most recent notification for a particular account from the connected rippled.

Response:
```js
{
    "success": true,
    "notification": { 
      /* Notification Object */ 
    }
}
```


__NOTE:__ This command relies on the connected `rippled`'s historical database so it may not work properly on a newly started `rippled` server.
__________

#### GET /api/v1/addresses/:address/next_notification/:prev_tx_hash

Retrieve the next notification after the given `:prev_tx_hash` for a particular account from the connected rippled.

Response:
```js
{
    "success": true,
    "notification": { 
      /* Notification Object */ 
    }
}
```
Or if there are no new notifications:

```js
{
    "success": true,
    "notification": { 
      /* Notification Object with "type": "none" and "tx_state" either "empty" or "pending" */
    }
}
```


__NOTE:__ This command relies on the connected `rippled`'s historical database so it may not work properly on a newly started `rippled` server.
__________

### 2. Payments

The payments commands use the `Simplified Payment Object` format, which expects the fields defined below on submission and is returned with additional fields added once it has been processed.

#### The `Simplified Payment Object`

The submission format is as follows (optional fields are commented out):
```js
{
    /* User Specified */

    "src_address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
    // "src_tag": "",
    // "src_amount": {
    //     "value": "0.001",
    //     "currency": "XRP",
    //     "issuer": ""
    // },
    // "src_slippage": "0",
    "dst_address": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
    // "dst_tag": "",
    "dst_amount": {
        "value": "0.001",
        "currency": "XRP",
        "issuer": ""
    },
    // "dst_slippage": "0",

    /* Advanced Options */

    // "invoice_id": "",
    // "paths": [],
    // "flag_no_direct_ripple": false,
    // "flag_partial_payment": false
}
```

When a payment is confirmed in the Ripple ledger, it will have additional fields added:
```js
{
    /* User Specified */

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

    /* Advanced Options */

    "invoice_id": "",
    "paths": [],
    "flag_no_direct_ripple": false,
    "flag_partial_payment": false,

    /* Generated After Validation */

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
```

__________

#### GET /api/v1/addresses/:address/payments/options

Generate possible payments for a given set of parameters. This is a wrapper around the [Ripple path-find command](https://ripple.com/wiki/RPC_API#path_find) that returns an array of [`Simplified Payment Objects`](#the-simplified-payment-object), which can be submitted directly to [`POST /api/v1/addresses/:address/payments`](#post-apiv1addressesaddresspayments).

__NOTE:__ This command may be quite slow. If the command times out, please try it again.

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

Submit a payment in the [`Simplified Payment Object`](#the-simplified-payment-object) format.

__DO NOT SUBMIT YOUR SECRET TO AN UNTRUSTED REST API SERVER__ -- this is the key to your account and your money. If you are using the test server provided, only use test accounts to submit payments.

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
  "error": "tecPATH_DRY", // A full list of error codes can be found at https://ripple.com/wiki/Transaction_errors
  "message": "Path could not send partial amount. Please ensure that the src_address has sufficient funds (in the src_amount currency, if specified) to execute this transaction."
}
```

Note: save the `confirmation_token` to check for transaction confirmation by matching that against new `notification`'s.


__________

#### GET /api/v1/addresses/:address/payments/:tx_hash?

Get a particular payment for a particular account.

Query string parameters:
+ `in_ledger` - *Optional*, specify the index of the ledger containing the transaction for significantly faster lookup times. If it is not specified it will search through the account's history, from the most recent transactions to the oldest, looking for the given `tx_hash` 

Response:
```js
{
    "success": true,
    "payment": {
        /* Simplified Payment Object */
    }
}
```


__NOTE:__ This command relies on the connected `rippled`'s historical database so it may not work properly on a newly started `rippled` server.

__________

### 3. Generic Ripple Transactions

These are transactions formatted by [`ripple-lib`](https://github.com/ripple/ripple-lib/). The submission formats are determined by the [`ripple-lib` Transaction class](https://github.com/ripple/ripple-lib/blob/develop/src/js/ripple/transaction.js). The retrieval formats are documented on the [Ripple wiki](https://ripple.com/wiki/Transaction_Format).

Additional commands for this API are in development to reduce the need to use these Generic Ripple Transaction commands.

__________

#### GET /api/v1/addresses/:address/txs/:tx_hash

Gets a particular transaction in the standard Ripple transaction JSON format



__NOTE:__ This command relies on the connected `rippled`'s historical database so it may not work properly on a newly started `rippled` server.

__________

#### POST /api/v1/addresses/:address/txs/

Post a transaction in the standard Ripple transaction format.

__DO NOT SUBMIT YOUR SECRET TO AN UNTRUSTED REST API SERVER__ -- this is the key to your account and your money. If you are using the test server provided, only use test accounts to submit payments.

Request JSON:
```js
{
  secret: "s...",
  tx: {
    type: "payment"
    from: "r...",
    to: "r...",
    amount: "1XRP"
  }
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
```js
{
  "api_server_status": "online",
  "rippled_server_url": "wss://s_west.ripple.com:443",
  "rippled_server_status": {
    "info": {
      "build_version": "0.21.0-rc2",
      "complete_ledgers": "32570-4805506",
      "hostid": "BUSH",
      "last_close": {
        "converge_time_s": 2.011,
        "proposers": 5
      },
      "load_factor": 1,
      "peers": 51,
      "pubkey_node": "n9KNUUntNaDqvMVMKZLPHhGaWZDnx7soeUiHjeQE8ejR45DmHyfx",
      "server_state": "full",
      "validated_ledger": {
        "age": 2,
        "base_fee_xrp": 0.00001,
        "hash": "2B79CECB06A500A2FB92F4FB610D33A20CF8D7FB39F2C2C7C3A6BD0D75A1884A",
        "reserve_base_xrp": 20,
        "reserve_inc_xrp": 5,
        "seq": 4805506
      },
      "validation_quorum": 3
    }
  },
  "api_documentation_url": "https://github.com/ripple/ripple-rest"
}
```
Or if the server is not connected to the Ripple Network:
```js
{
  "success": false,
  "error": "Cannot connect to the Ripple network.",
  "message": "Please check your internet connection and server settings and try again."
}
```

__________