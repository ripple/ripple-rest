# `ripple-rest` API Reference

__Contents:__

- [Data formats](#data-formats)
- [Differences from standard Ripple data formats](#differences-from-standard-ripple-data-formats)
  - [The `client_resource_id` (required for Payments)](#the-client_resource_id-required-for-payments)
  - [New data formats](#new-data-formats)
  - [No XRP "drops"](#no-xrp-drops)
  - [XRP Amount as an object](#xrp-amount-as-an-object)
  - [UNIX Epoch instead of Ripple Epoch](#unix-epoch-instead-of-ripple-epoch)
  - [Not compatible with `ripple-lib`](#not-compatible-with-ripple-lib)
- [Available Endpoints](#available-endpoints)
  - [Payments](#payments)
    - [POST /v1/payments](#post-v1payments)
    - [GET /v1/accounts/{account}/payments/{hash,client_resource_id}](#get-v1accountsaccountpaymentshashclient_resource_id)
    - [GET /v1/accounts/{account}/payments/paths/{destination_account}/{destination_amount as value+currency or value+currency+issuer}{?source_currencies}](#get-v1accountsaccountpaymentspathsdestination_accountdestination_amount-as-valuecurrency-or-valuecurrencyissuersource_currencies)
  - [Notifications](#notifications)
    - [GET /v1/accounts/{account}/notifications/{hash,client_resource_id}](#get-v1accountsaccountnotificationshashclient_resource_id)
  - [Standard Ripple Transactions](#standard-ripple-transactions)
    - [GET /v1/transactions/{hash}](#get-v1transactionshash)
  - [Server Info](#server-info)
    - [GET /v1/server/connected](#get-v1serverconnected)
    - [GET /v1/server](#get-v1server)
  - [Utils](#utils)
    - [GET /v1/uuid](#get-v1uuid)



----------

## Data formats

All of the data formats used by this API are defined by JSON Schemas. The full formats, which include descriptions of each field, can be found in [../schemas](../schemas). 

----------

## Differences from standard Ripple data formats

#### The `client_resource_id` (required for Payments)

The `client_resource_id` is a new field introduced by this API that is used to prevent duplicate payments and confirm that payments and other types of transactions have been validated.

The `client_resource_id` is required for all Payment submissions to `ripple-rest`. If another payment with the same `client_resource_id` as one that this instance of `ripple-rest` has marked as `pending` or `validated`, `ripple-rest` will assume that the second one was submitted accidentally. This helps clients prevent double spending on payments, even if the connection to `ripple-rest` is interrupted before the client can confirm the success or failure of a payment. In this case, the response will be the same but ONLY ONE of the duplicates will be submitted.

Because other types of duplicate transactions, such as updating account settings or modifying a trustline, do not carry as serious implications as duplicate Payments, the `client_resource_id` may be set for any type of resource submitted but it is only required for Payments.

Universally Unique Identifiers (UUIDs), are recommended for the `client_resource_id`. For more information on UUIDs see [here](http://en.wikipedia.org/wiki/Universally_unique_identifier). Note that 256-bit hex strings are disallowed because of the potential confusion with transaction hashes.

#### New data formats

This API uses different submission and retrieval formats for payments and other transactions than other Ripple technologies. These new formats are intended to standardize fields across different transaction types (Payments, Orders, etc). See the [Schemas](#schemas) for more information.

#### No XRP "drops"

Both `rippled` and `ripple-lib` use XRP "drops", or millionths (1/1000000) of an XRP, to denote amounts in XRP. This API uses whole XRP units in amount fields and in reporting network transaction fees paid.

#### XRP Amount as an object

Outside of this API, XRP Amounts are usually denoted by a string representing XRP drops. Not only does this API not use XRP drops, for consistency XRP represented here as an `Amount` object like all other currencies. See the [`Amount`](#amount) format for more information.

#### UNIX Epoch instead of Ripple Epoch

This API uses the more standard UNIX timestamp instead of the Ripple Epoch Offset to denote times. The UNIX timestamp is the number of milliseconds since January 1st, 1970 (00:00 UTC). In `rippled` timestamps are stored as the number of seconds since the Ripple Epoch, January 1st, 2000 (00:00 UTC).

#### Not compatible with `ripple-lib`

While this API uses [`ripple-lib`](https://github.com/ripple/ripple-lib/), the Javascript library for connecting to the Ripple Network, the formats specified here are not compatible with `ripple-lib`. These formats can only be used with this API.

----------

## Available Endpoints

All resources submitted to `ripple-rest` should be POSTed to the appropriate endpoints in the following format:
```js
{
  "secret": "s...",
  "client_resource_id": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "<resource type>": { /* Resource object, as defined by appropriate JSON schema */ }
}
```

All submission responses will follow this format:
```js
{
  "success": true,
  "client_resource_id": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "status_url": "http://..."
}
```
Or if there is an error immediately upon submission:
```js
{
  "success": false,
  "client_resource_id": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "error": "Some Error",
  "message": "More explanation of the error"
}
```

----------

### Payments

----------

#### POST /v1/payments

Submit a payment.

Note that the `client_resource_id` is required for all Payment submissions to `ripple-rest`. If another payment with the same `client_resource_id` as one that this instance of `ripple-rest` has marked as `pending` or `validated`, `ripple-rest` will assume that the second one was submitted accidentally. This helps clients prevent double spending on payments, even if the connection to `ripple-rest` is interrupted before the client can confirm the success or failure of a payment. In this case, the response will be the same but ONLY ONE of the duplicates will be submitted.

Request JSON Body (with only the required fields):
```js
{
  "secret": "s...",
  "client_resource_id": "f2f811b7-dc3b-4078-a2c2-e4ca9e453981",
  "payment": {
    "source_account": "r1...",
    "destination_account": "r2...",
    "destination_amount": {
      "value": "10",
      "currency": "XRP",
      "issuer": "r3..."
    }
  }
}
```
Request JSON Body (with all of the fields available on submission):
```js
{
  "source_account": "r1...",
  "source_tag": "123",
  "source_amount": {
    "value": "1",
    "currency": "USD",
    "issuer": "r3..."
  },
  "source_slippage": "0.5",
  "destination_account": "r2...",
  "destination_tag": "456",
  "destination_amount": {
    "value": "10",
    "currency": "XRP",
    "issuer": ""
  },
  "invoice_id": "",
  "paths": "[]",
  "partial_payment": false,
  "no_direct_ripple": false
}
```

+ `source_account`, `destination_account` - the Ripple addresses of the sender and receiver accounts
+ `source_tag`, `destination_tag` - optional string representation of 32-bit integers that can be used to denote hosted accounts at gateways
+ `source_amount` - this is optional but if left unset will default to the same amount as the `destination_amount`. It is particularly useful to set the `source_amount`, as well as the `source_slippage`, in the case of cross-currency payments to constrain the amount that can be spent by the sender to deliver the `destination_amount` to the recipient
+ `source_slippage` - optional string representation of a floating point number. The `source_amount` will never be charged more than the `source_amount`'s value plus the `source_slippage` (these are used for the `SendMax` field in the `rippled` format)
+ `destination_amount` - the amount that should be delivered to the recipient
+ `invoice_id` - an optional 256-bit hash that can be used to identify a particular payment. Note that this is NOT the `client_resource_id`
+ `paths` - most users will want to treat this field as opaque. This is used internally to specify payment paths and is set automatically by the pathfinding endpoint. This field can be a JSON array representing the Ripple [PathSet](https://ripple.com/wiki/Payment_paths)
+ `partial_payment` - a boolean that, if set to true, indicates that this payment should go through even if the whole amount cannot be delivered because of a lack of liquidity or funds in the source_account account. Defaults to false
+ `no_direct_ripple` - a boolean that can be set to true if paths are specified and the sender would like the Ripple Network to disregard any direct paths from the source_account to the destination_account. This may be used to take advantage of an arbitrage opportunity or by gateways wishing to issue balances from a hot wallet to a user who has mistakenly set a trustline directly to the hot wallet. Defaults to false


Response:
```js
{
  "success": true,
  "client_resource_id": "f2f811b7-dc3b-4078-a2c2-e4ca9e453981",
  "status_url": ".../v1/accounts/r1.../payments/f2f811b7-dc3b-4078-a2c2-e4ca9e453981"
}
```
Or if there was an error that was caught immediately:
```js
{
  "success": false,
  "client_resource_id": "f2f811b7-dc3b-4078-a2c2-e4ca9e453981",
  "error": "Some Error",
  "message": "Some explanation of the error"
}
```

Note that a successfull POST request does NOT mean the transaction was validated. While a successful POST indicates that it is very likely the payment will be validated and written into the Ripple Ledger, the `status_url` should be used to check the status of an individual payment. At first the `state` will be `pending`, then `validated` or `failed`.

If you want to monitor outgoing payments in bulk you can use the [Notifications](#notifications) to monitor finalized (either validated or failed) payments.

Note that payments will have additional fields after validation. Please refer to the Payment schema for details on all possible fields.

----------

#### GET /v1/accounts/{account}/payments/paths/{destination_account}/{destination_amount as value+currency or value+currency+issuer}{?source_currencies}

Query `rippled` for possible payment "paths" through the Ripple Network to deliver the given amount to the specified `destination_account`. If the `destination_amount` issuer is not specified, paths will be returned for all of the issuers from whom the `destination_account` accepts the given currency.

Query String Parameters:
+ `source_currencies` - an optional comma-separated list of source currencies that can be used to constrain the results returned (e.g. `XRP,USD+r...,BTC+r...`. Currencies can be denoted by their currency code (e.g. `USD`) or by their currency code and issuer (e.g. `USD+r...`). If no issuer is specified for a currency other than XRP, the results will be limited to the specified currencies but any issuer for that currency will do.

Response:
```js
{
  "success": true,
  "payments": [{
    /* Payment with source_amount set to an amount in currency 1 */
  }, {
    /* Payment with source_amount set to an amount in currency 2 */
  } /* ... */]
}
```
Or if there are no paths found:
```js
{
  "success": false,
  "error": "No paths found",
  "message": "Please ensure that the source_account has sufficient funds to exectue the payment. If it does there may be insufficient liquidity in the network to execute this payment right now"
}
```
If `source_currencies` were specified the error message will be:
```js
{
  "success": false,
  "error": "No paths found",
  "message": "Please ensure that the source_account has sufficient funds to exectue the payment in one of the specified source_currencies. If it does there may be insufficient liquidity in the network to execute this payment right now"
}
```

This query will respond with an array of fully-formed payments. The client can select one and submit it to [/v1/payments](#post-v1payments), optionally after editing some of the fields. The `source_tag` and `destination_tag` can be used to denote hosted accounts at gateways. The `source_slippage` field can be set to give the payment additional cushion in case the path liquidity changes after this result is returned but before the payment is submitted.

----------

#### GET /v1/accounts/{account}/payments{/hash,client_resource_id}{?direction,exclude_failed}

Retrieve the details of one or more payments from the `rippled` server or, if the transaction failled off-network or is still pending, from the `ripple-rest` instance's local database.

##### Retrieving an Individual Payment

Individual payments can be retrieved by querying `/v1/accounts/{account}/payments/{hash,client_resource_id}`. 

If the `state` field is `validated`, then the payment has been validated and written into the Ripple Ledger.

```js
{
  "success": true,
  "payment": {
    /* Payment */
  }
}
```
Note that the `state` field may be used to check the current status of the payment.

If no payment is found with the given hash or client_resource_id the following error will be returned:
```js
{
  "success": false,
  "error": "Payment Not Found",
  "message": "This may indicate that the payment was never validated and written into the Ripple ledger and it was not submitted through this ripple-rest instance. This error may also be seen if the databases of either ripple-rest or rippled were recently created or deleted."
}
```

##### Browsing Historical Payments

Historical payments can be browsed in bulk by supplying query string parameters: `/v1/accounts/{account}/payments{?direction,exclude_failed}`

Query string parameters:
+ `direction` - limit results to either `incoming`, `outgoing`, or `incoming_and_outgoing`
+ `exclude_failed` - if set to true, this will return only payment that were successfully validated and written into the Ripple Ledger

Response:
```js
{
  "success": true,
  "payments": [
    {
      "client_resource_id": "3492375b-d4d0-42db-9a80-a6a82925ccd5",
      "payment": {
        /* Payment */
      }
    }, {
      "client_resource_id": "4a4e3fa5-d81e-4786-8383-7164c3cc9b01",
      "payment": {
        /* Payment */
      }
    }
  ]
}
```


----------

### Notifications

----------

#### GET /v1/accounts/{account}/notifications/{hash,client_resource_id}{?types}

Query String Parameters:

+ `types` - a comma-separated list of transaction types to include. Available options are `payment`, `offercreate`, `offercancel`, `accountset`, `trustset`. Defaults to all.
+ `exclude_failed` - if set to true, this will return only notifications about transactions that were successfully validated and written into the Ripple Ledger

Retrieve a notification corresponding to a transaction with a particular hash or client_resource_id from either `rippled`'s historical database or `ripple-rest`'s local database if the transaction was submitted through this instance of `ripple-rest`.

Response:
```js
{
  "success": true,
  "client_resource_id": "",
  "notification": { /* Notification */ }
}
```
Or if no transaction corresponding to the given hash or client_resource_id:
```js
{
  "success": "false",
  "error": "Transaction Not Found",
  "message": "No transaction matching the given identifier was found in the rippled database, nor in this ripple-rest instance's local database of outgoing transactions. This may mean that the transaction was never or not yet validated and written into the Ripple Ledger and it was not submitted through this ripple-rest instance. This error may also occur if the databases of either ripple-rest or rippled have been recently created or deleted"
}
```

Clients using notifications to monitor their account activity should pay particular attention to the `state` and `result` fields. The `state` field will either be `validated` or `failed` and represents the finalized status of that transaction. The `result` field will be `tesSUCCESS` if the `state` was validated. If the transaction failed, `result` will contain the `rippled` or `ripple-lib` error code.

Notifications have `next_notification_url` and `previous_notification_url`'s. Account notifications can be polled by continuously following the `next_notification_url`, and handling the resultant notifications, until the `next_notification_url` is an empty string. This means that there are no new notifications but, as soon as there are, querying the same URL that produced this notification in the first place will return the same notification but with the `next_notification_url` set.

----------

### Standard Ripple Transactions

----------

#### GET /v1/transactions/{hash}

Retrieve the details of a transaction in the standard Ripple JSON format. See the Ripple Wiki page on [Transaction Formats](https://ripple.com/wiki/Transactions) for more information.

Response:
```js
{
  "success": true,
  "tx": { /* Ripple Transaction */ }
}
```
Or if no transaction was found in the `rippled`'s historical database:
```js
{
  "success": false,
  "error": "txnNotFound",
  "message": "Transaction not found."
}
```

----------

### Server Info

----------

#### GET /v1/server/connected

A simple endpoint that can be used to check if `ripple-rest` is connected to a `rippled` and is ready to serve. If used before querying the other endpoints this can be used to centralize the logic to handle if `rippled` is disconnected from the Ripple Network and unable to process transactions.

Response:

`true` if `ripple-rest` is ready to serve

`false` otherwise

----------

#### GET /v1/server

Retrieve information about the `ripple-rest` and connected `rippled`'s current status.

Response:
```js
{
  "api_server_status": "online",
  "rippled_server_url": "wss://s_west.ripple.com:443",
  "rippled_server_status": {
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
  },
  "api_documentation_url": "https://github.com/ripple/ripple-rest"
}
```
Or if the server is not connected to the Ripple Network:
```js
{
  "success": false,
  "error": "rippled Disconnected",
  "message": "ripple-rest is unable to connect to the specified rippled server, or the rippled server is unable to communicate with the rest of the Ripple Network. Please check your internet and rippled server settings and try again"
}
```

----------

### Utils

----------

#### GET /v1/uuid

A UUID v4 generator, which can be used if the client wishes to use UUIDs for the `client_resource_id` but does not have a UUID generator handy.

Response:
```js
{
  "success": true,
  "uuid": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
}
```






