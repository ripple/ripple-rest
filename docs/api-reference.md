# API Reference

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
  - [Settings](#settings)
    - [GET /v1/accounts/{address}/settings](#get-settings)
    - [POST /v1/accounts/{address}/settings](#change-settings)
  - [Balances](#balances)
      - [GET /v1/accounts/{address}/balances](#get-balances)
  - [Payments](#payments)
    - [POST /v1/payments](#submit-a-payment)
    - [GET /v1/accounts/{address}/payments/{hash,client_resource_id}](#get-historical-payments)
    - [GET /v1/accounts/{address}/payments/paths/{destination_account}/{destination_amount as value+currency or value+currency+issuer}{?source_currencies}](#find-a-payment-path)
  - [Trustlines](#trustlines)
      - [GET /v1/accounts/{address}/trustlines](#get-trustlines)
      - [POST /v1/accounts/{address}/trustlines](#add-trustline)
  - [Notifications](#notifications)
    - [GET /v1/accounts/{address}/notifications/{hash,client_resource_id}](#get-notifications)
  - [Standard Ripple Transactions](#standard-ripple-transactions)
    - [GET /v1/transactions/{hash}](#get-transaction)
  - [Server Info](#server-info)
    - [GET /v1/server/connected](#get-connected-state)
    - [GET /v1/server](#get-server)
  - [Utils](#utils)
    - [GET /v1/uuid](#get-uuid)


----------

## Data formats

All of the data formats used by this API are defined by JSON Schemas. The full formats, which include descriptions of each field, can be found in [../schemas](../schemas). 

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

## Balances

### Get balances
Get an account's existing balances. This includes XRP balance (which does not include a counterparty) and trustline balances.

> GET /v1/accounts/{address}/balances

**Query parameters**

+ `currency` The balance's currency
+ `counterparty` Counterparty (issuer) of balance

**Response**

```js
{
  "success": true,
  "balances": [
    {
      "value": "938.929489",
      "currency": "XRP",
      "counterparty": ""
    },
    {
      "value": "1.817194430379747",
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    ...
  ]
}
```

----------

## Settings

Get or change an account's settings.

In `GET` requests, Transaction `flags` are always present in the response. Transaction `fields` are optional, and only present when they are set.

In `POST` requests, Transaction `flags` must be boolean (true or false). Transaction `fields` may be non-boolean.

**Settings flags**

+ `disable_master`
+ `disallow_xrp`
+ `password_spent`
+ `require_authorization`
+ `require_destination_tag`

**Settings fields**

+ `transaction_sequence`
+ `email_hash`
+ `wallet_locator`
+ `message_key`
+ `url`
+ `transfer_rate`
+ `signers`

### Get settings

> GET /v1/accounts/{address}/settings

**Response**

```js
{
  "success": true,
  "settings": {
    "disable_master": false,
    "disallow_xrp": false,
    "password_spent": false,
    "require_authorization": false,
    "require_destination_tag": true,
    "transaction_sequence": 2745,
    "transfer_rate": 100,
    "url": "www.example.com"
  }
}
```

### Change settings

> POST /v1/accounts/{address}/settings

**Body parameters**

+ `secret` Account secret. Required for sending account_set transasction to change settings.

Attach settings (flags or fields) as request body parameters. Example:

```js
{
  "secret": "shzx3CdH7h4DnwQQBvZcwbz8N9pYS",
  "require_destination_tag": true,
  "url": "mysite.com"
}
```

----------

## Payments

### Submit a payment

> POST /v1/payments

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


**Response**

```js
{
  "success": true,
  "client_resource_id": "f2f811b7-dc3b-4078-a2c2-e4ca9e453981",
  "status_url": ".../v1/accounts/r1.../payments/f2f811b7-dc3b-4078-a2c2-e4ca9e453981"
}
```

**Or if there was an error that was caught immediately**

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

### Find a payment path

> GET /v1/accounts/{address}/payments/paths/{destination_account}/{destination_amount as value+currency or value+currency+issuer}{?source_currencies}

Query `rippled` for possible payment "paths" through the Ripple Network to deliver the given amount to the specified `destination_account`. If the `destination_amount` issuer is not specified, paths will be returned for all of the issuers from whom the `destination_account` accepts the given currency.

**Query parameters**

+ `source_currencies` - an optional comma-separated list of source currencies that can be used to constrain the results returned (e.g. `XRP,USD+r...,BTC+r...`. Currencies can be denoted by their currency code (e.g. `USD`) or by their currency code and issuer (e.g. `USD+r...`). If no issuer is specified for a currency other than XRP, the results will be limited to the specified currencies but any issuer for that currency will do.

**Response**

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

**Or if there are no paths found**

```js
{
  "success": false,
  "error": "No paths found",
  "message": "Please ensure that the source_account has sufficient funds to exectue the payment. If it does there may be insufficient liquidity in the network to execute this payment right now"
}
```

**If `source_currencies` were specified the error message will be**

```js
{
  "success": false,
  "error": "No paths found",
  "message": "Please ensure that the source_account has sufficient funds to exectue the payment in one of the specified source_currencies. If it does there may be insufficient liquidity in the network to execute this payment right now"
}
```

This query will respond with an array of fully-formed payments. The client can select one and submit it to [/v1/payments](#post-v1payments), optionally after editing some of the fields. The `source_tag` and `destination_tag` can be used to denote hosted accounts at gateways. The `source_slippage` field can be set to give the payment additional cushion in case the path liquidity changes after this result is returned but before the payment is submitted.

----------

### Get historical payments

> GET /v1/accounts/{address}/payments{/hash,client_resource_id}{?source_account,destination_account,exclude_failed,start_ledger,end_ledger,earliest_first,results_per_page,page}

Retrieve the details of one or more payments from the `rippled` server or, if the transaction failled off-network or is still pending, from the `ripple-rest` instance's local database.

#### Retrieving an Individual Payment

Individual payments can be retrieved by querying `/v1/accounts/{address}/payments/{hash,client_resource_id}`.

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

#### Browsing Payments

Historical payments can be browsed in bulk by supplying query string parameters: `/v1/accounts/{address}/payments?`

Query string parameters:
+ `source_account` - If specified, limit the results to payments initiated by a particular account
+ `destination_account` - If specified, limit the results to payments made to a particular account
+ `exclude_failed` - if set to true, this will return only payment that were successfully validated and written into the Ripple Ledger
+ `start_ledger` - If `earliest_first` is set to true this will be the index number of the earliest ledger queried, or the most recent one if `earliest_first` is set to false. Defaults to the first ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `end_ledger` - If `earliest_first` is set to true this will be the index number of the most recent ledger queried, or the earliest one if `earliest_first` is set to false. Defaults to the last ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `earliest_first` - Determines the order in which the results should be displayed. Defaults to true
+ `results_per_page` - Limits the number of resources displayed per page. Defaults to 20
+ `page` - The page to be displayed. If there are fewer than the `results_per_page` number displayed, this indicates that this is the last page

**Response**

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

Note that all of the filters available for browsing historical payments must be applied by `ripple-rest`, as opposed to by `rippled`, so applying more filters will cause `ripple-rest` to respond slower.

----------

## Trustlines

Get an account's existing trustlines or add a new one.

### Get trustlines

> GET /accounts/{address}/trustlines

**Query parameters**

+ `currency` Trustline's currency
+ `counterparty` Counterparty (issuer) of trustline

**Response**

```js
{
  "success": true,
  "trustlines": [
    {
      "account": "rMZ1STX5D4u9cv6HbhRZjNQqMzntD68Uc5",
      "account_allows_rippling": false,
      "counterparty": "rhuLZPKhKAdZGxwbFq5sBdpHzkQ418sWof",
      "counterparty_allows_rippling": true,
      "currency": "USD",
      "limit": "1",
      "reciprocated_limit": "0"
    }
    ...
  ]
```

### Add trustline

> POST /accounts/{address}/trustlines

**Body parameters**

+ `secret` Account secret. Required for sending account_set transasction to change settings.
+ `trustline` Trust limit. Either a string representation of trustline limit, `object` containing `value`, `currency`, `counterparty` or a `string` form `value/currency/counterparty`.
+ `allow_rippling` Optional. Defaults to `true`. See [here](https://ripple.com/wiki/No_Ripple) for details

**Example**

```js
{
  "secret": "sn2zhhoggGghjAwa8h3U7628YvxST",
  "trustline": {
    "limit": 1,
    "currency": "USD",
    "counterparty": "rKKMpGKd4quYJWgFFK2GwhCfjbkd9s3jd5"
  }
}
```

**Equivalent to**

```js
{
  "secret": "sn2zhhoggGghjAwa8h3U7628YvxST",
  "trustline": {
    "limit": "1/USD/rKKMpGKd4quYJWgFFK2GwhCfjbkd9s3jd5"
  }
}
```

**Response**

```js
{
  "success": true,
  "hash": "FB12390090CA9265FDEA6F13DC65B33A7EDCB1ADCCBDDA8DE077B2BE5D0CB506",
  "ledger": "620725",
  "trustline": {
    "account": "rKKMpGKd4quYJWgFFK2GwhCfjbkd9s3jd5",
    "limit": 1,
    "currency": "USD",
    "counterparty": "rB2ZG7Ju11CKRDaWFUvpvkd27XCdxDW2H4",
    "allows_rippling": true,
  }
}
```

----------

## Notifications

### Get notifications

> GET /v1/accounts/{address}/notifications/{hash}

**Response**

```js
{
  "success": true,
  "notification": { /* Notification */ }
}
```

**Or if no transaction corresponding to the given hash**

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

## Standard Ripple Transactions

### Get transaction

> GET /v1/transactions/{hash}

Retrieve the details of a transaction in the standard Ripple JSON format. See the Ripple Wiki page on [Transaction Formats](https://ripple.com/wiki/Transactions) for more information.

**Response**

```js
{
  "success": true,
  "tx": { /* Ripple Transaction */ }
}
```

**Or if no transaction was found in the `rippled`'s historical database**

```js
{
  "success": false,
  "error": "txnNotFound",
  "message": "Transaction not found."
}
```

----------

## Server Info

### Get connected state

> GET /v1/server/connected

A simple endpoint that can be used to check if `ripple-rest` is connected to a `rippled` and is ready to serve. If used before querying the other endpoints this can be used to centralize the logic to handle if `rippled` is disconnected from the Ripple Network and unable to process transactions.

**Response**

`true` if `ripple-rest` is ready to serve

`false` otherwise

----------

### Get server info

> GET /v1/server

Retrieve information about the `ripple-rest` and connected `rippled`'s current status.

**Response**

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

**Or if the server is not connected to the Ripple Network**

```js
{
  "success": false,
  "error": "rippled Disconnected",
  "message": "ripple-rest is unable to connect to the specified rippled server, or the rippled server is unable to communicate with the rest of the Ripple Network. Please check your internet and rippled server settings and try again"
}
```

----------

## Utils

###Get UUID

> GET /v1/uuid

A UUID v4 generator, which can be used if the client wishes to use UUIDs for the `client_resource_id` but does not have a UUID generator handy.

**Response**

```js
{
  "success": true,
  "uuid": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
}
```
