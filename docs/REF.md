# `ripple-rest` API Reference

This is a reference for the [__Object Formats__](#object-formats) and [__Available API Routes__](#available-api-routes).

See the [__Guide__](GUIDE.md) for a walkthrough of how this API is intended to be used.



----------

## Object Formats

1. [Amount](#1-amount)
2. [Payment](#2-payment)
3. [Notification](#3-notification)

----------

#### 1. Amount

```js
{
  "value": "1.0",
  "currency": "USD",
  "issuer": "r..."
}
```

All currencies on the Ripple Network have issuers, except for XRP. In the case of XRP, the `"issuer"` field may be omitted or set to `""`. Otherwise, the `"issuer"` must be a valid Ripple address of the gateway that issues the currency.

For more information about XRP see [the Ripple Wiki page on XRP](https://ripple.com/wiki/XRP). For more information about using currencies other than XRP on the Ripple Network see [the Ripple Wiki page for gateways](https://ripple.com/wiki/Ripple_for_Gateways).

----------

#### 2. Payment

The `Payment` object is a simplified version of the standard Ripple transaction format. 

This `Payment` format is intended to be straightforward to create and parse, from strongly or loosely typed programming languages. Once a transaction is processed and validated it also includes information about the final details of the payment.

The following fields are the minimum required to submit a `Payment`:
```js
{
  "src_address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
  "dst_address": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
  "dst_amount": {
    "value": "0.001",
    "currency": "XRP",
    "issuer": ""
  }
}
```
+ `dst_amount` is an [`Amount` object](#1-amount)

The full set of fields accepted on `Payment` submission is as follows:

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

    /* Advanced Options */

    "invoice_id": "",
    "paths": "[]",
    "flag_no_direct_ripple": false,
    "flag_partial_payment": false
}
```
+ `src_tag` is an optional unsigned 32 bit integer (0-4294967294, inclusive) that is generally used if the sender is a hosted wallet at a gateway. This should be the same as the `dst_tag` used to identify the hosted wallet when they are receiving a payment.
+ `dst_tag` is an optional unsigned 32 bit integer (0-4294967294, inclusive) that is generally used if the receiver is a hosted wallet at a gateway
+ `src_slippage` can be specified to give the `src_amount` a cushion and increase its chance of being processed successfully. This is helpful if the payment path changes slightly between the time when a payment options quote is given and when the payment is submitted. The `src_address` will never be charged more than `src_slippage` + the `value` specified in `src_amount`
+ `invoice_id` is an optional 256-bit hash field that can be used to link payments to an invoice or bill
+ `paths` is a "stringified" version of the Ripple PathSet structure. Most users of this API will want to treat this field as opaque. See the [Ripple Wiki](https://ripple.com/wiki/Payment_paths) for more information about Ripple pathfinding
+ `flag_no_direct_ripple` is a boolean that can be set to `true` if `paths` are specified and the sender would like the Ripple Network to disregard any direct paths from the `src_address` to the `dst_address`. This may be used to take advantage of an arbitrage opportunity or by gateways wishing to issue balances from a hot wallet to a user who has mistakenly set a trustline directly to the hot wallet. Most users will not need to use this option.
+ `flag_partial_payment` is a boolean that, if set to true, indicates that this payment should go through even if the whole amount cannot be sent because of a lack of liquidity or funds in the `src_address` account. The vast majority of senders will never need to use this option.

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

    /* Advanced Options */

    "invoice_id": "",
    "paths": "[]",
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
+ `tx_result` will be `tesSUCCESS` if the transaction was successfully processed. If it was unsuccessful but a transaction fee was claimed the code will start with `tec`. More information about transaction errors can be found on the [Ripple Wiki](https://ripple.com/wiki/Transaction_errors).
+ `tx_timestamp` is the UNIX timestamp for when the transaction was validated
+ `tx_fee` is the network transaction fee charged for processing the transaction. For more information on fees, see the [Ripple Wiki](https://ripple.com/wiki/Transaction_fees). In the standard Ripple transaction format fees are expressed in drops, or millionths of an XRP, but for clarity the new formats introduced by this API always use the full XRP unit.
+ `tx_src_bals_dec` is an array of [`Amount`](#1-amount) objects representing all of the balance changes of the `src_address` caused by the payment. Note that this includes the `tx_fee`
+ `tx_dst_bals_inc` is an array of [`Amount`](#1-amount) objects representing all of the balance changes of the `dst_address` caused by the payment

----------

#### 3. Notification

Notifications are new type of object not used elsewhere on the Ripple Network but intended to simplify the process of monitoring accounts for new activity.

If there is a new `Notification` for an account it will contain information about the type of transaction that affected the account, as well as a link to the full details of the transaction and a link to get the next notification. 


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
+ `tx_timestamp` is the UNIX timestamp for when the transaction was validated
+ `tx_url` is a URL that can be queried to retrieve the full details of the transaction. If it the transaction is a payment it will be returned in the `Payment` object format, otherwise it will be returned in the standard Ripple transaction format
+ `next_notification_url` is a URL that can be queried to get the notification following this one for the given address
+ `confirmation_token` is a temporary string that is returned upon transaction submission and can be matched against account notifications to confirm that the transaction was processed


If there are no new notifications, the empty `Notification` object will be returned in this format:
```js
{
  "address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
  "type": "none",
  "tx_direction": "",
  "tx_state": "empty",
  "tx_result": "",
  "tx_ledger": "",
  "tx_hash": "",
  "tx_timestamp": ,
  "tx_url": "",
  "next_notification_url": "http://ripple-rest.herokuapp.com/api/v1/addresses/rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz/next_notification/55BA3440B1AAFFB64E51F497EFDF2022C90EDB171BBD979F04685904E38A89B7?ledger=4696959
  "confirmation_token": ""
}
```
+ `type` will be `none` if there are no new notifications
+ `tx_state` will be `pending` if there are still transactions waiting to clear and `empty` otherwise
+ `next_notification_url` will be provided whether there are new notifications or not so that that field can always be used to query the API for new notifications.

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

__________

#### GET /api/v1/addresses/:address/next_notification

Retrieve the most recent notification for a particular account from the connected rippled.

This uses the [`Notification` Object format](#3-notification).

Response:
```js
{
    "success": true,
    "notification": { 
      /* Notification */ 
    }
}
```



__NOTE:__ This command relies on the connected `rippled`'s historical database so it may not work properly on a newly started `rippled` server.
__________

#### GET /api/v1/addresses/:address/next_notification/:prev_tx_hash

Retrieve the next notification after the given `:prev_tx_hash` for a particular account from the connected rippled.

This uses the [`Notification` Object format](#3-notification).

Response:
```js
{
    "success": true,
    "notification": { 
      /* Notification */ 
    }
}
```
Or if there are no new notifications:

```js
{
    "success": true,
    "notification": { 
      /* Notification with "type": "none" and "tx_state" either "empty" or "pending" */
    }
}
```


__NOTE:__ This command relies on the connected `rippled`'s historical database so it may not work properly on a newly started `rippled` server.
__________

### 2. Payments

__________

#### GET /api/v1/addresses/:address/payments/options

Generate possible payments for a given set of parameters. This is a wrapper around the [Ripple path-find command](https://ripple.com/wiki/RPC_API#path_find) that returns an array of [`Payment Objects`](#2-payment), which can be submitted directly to [`POST /api/v1/addresses/:address/payments`](#post-apiv1addressesaddresspayments).

This uses the [`Payment` Object format](#2-payment).

__NOTE:__ This command may be quite slow. If the command times out, please try it again.

Request Query String Parameters:
+ `dst_address` - *Required*
+ `dst_amount` - *Required*, Amount string in the form `"1+USD+r..."` or `"1+XRP"` 

Response:
```js
{
    "success": true,
    "payments": [{
      /* Payment */
    }, {
      /* Payment */  
    }...]
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

Submit a payment in the [`Payment` Object](#2-payment) format.

__DO NOT SUBMIT YOUR SECRET TO AN UNTRUSTED REST API SERVER__ -- this is the key to your account and your money. If you are using the test server provided, only use test accounts to submit payments.

Request JSON:
```js
{
  secret: "s...",
  payment: { /* Payment */ }
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
More information about transaction errors can be found on the [Ripple Wiki](https://ripple.com/wiki/Transaction_errors).

Note: save the `confirmation_token` to check for transaction confirmation by matching that against new `notification`'s.


__________

#### GET /api/v1/addresses/:address/payments/:tx_hash?

Get a particular payment for a particular account.

This uses the [`Payment` Object format](#2-payment).

Query string parameters:
+ `in_ledger` - *Optional*, specify the index of the ledger containing the transaction for significantly faster lookup times. If it is not specified it will search through the account's history, from the most recent transactions to the oldest, looking for the given `tx_hash` 

Response:
```js
{
    "success": true,
    "payment": {
        /* Payment */
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

Gets a particular transaction in the standard Ripple transaction JSON format.

Query string parameters:
+ `in_ledger` - *Optional*, specify the index of the ledger containing the transaction for significantly faster lookup times. If it is not specified it will search through the account's history, from the most recent transactions to the oldest, looking for the given `tx_hash` 

__NOTE:__ This command relies on the connected `rippled`'s historical database so it may not work properly on a newly started `rippled` server.

__________

#### POST /api/v1/addresses/:address/txs/

Post a transaction in the standard Ripple transaction format.

__DO NOT SUBMIT YOUR SECRET TO AN UNTRUSTED REST API SERVER__ -- this is the key to your account and your money. If you are using the test server provided, only use test accounts to submit payments.

Request JSON for Payments:
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
Other available formats are those accepted by the [`ripple-lib` Transaction class](https://github.com/ripple/ripple-lib/blob/develop/src/js/ripple/transaction.js#L455-L692).


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