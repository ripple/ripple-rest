
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
	- [Notifications](#notifications)
		- [GET /v1/accounts/{account}/notifications/{hash,client_resource_id}](#get-v1accountsaccountnotificationshashclient_resource_id)
	- [Standard Ripple Transactions](#standard-ripple-transactions)
		- [GET /v1/tx/{hash}](#get-v1txhash)
	- [Server Info](#server-info)
		- [GET /v1/server/connected](#get-v1serverconnected)
		- [GET /v1/server](#get-v1server)



----------

## Data formats

All of the data formats used by this API are defined by JSON Schemas. The full formats, which include descriptions of each field, can be found in [../schemas](../schemas). 

----------

## Differences from standard Ripple data formats

#### The `client_resource_id` (required for Payments)

The `client_resource_id` is a new field introduced by this API that is used to prevent duplicate payments and confirm that payments and other types of transactions have been validated.

The `client_resource_id` is required for all Payment submissions to `ripple-rest`. If another payment with the same `client_resource_id` as one that this instance of `ripple-rest` has marked as `pending` or `validated`, `ripple-rest` will assume that the second one was submitted accidentally. This helps clients prevent double spending on payments, even if the connection to `ripple-rest` is interrupted before the client can confirm the success or failure of a payment. In this case, the response will be the same but ONLY ONE of the duplicates will be submitted.

Because other types of duplicate transactions, such as updating account settings or modifying a trustline, do not carry as serious implications as duplicate Payments, the `client_resource_id` may be set for any type of resource submitted but it is only required for Payments.

Universally Unique Identifiers (UUIDs), are recommended for the `client_resource_id`. For more information on UUIDs see [here](http://en.wikipedia.org/wiki/Universally_unique_identifier).

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

Request JSON Body:
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
Note that the `client_resource_id` is required for all Payment submissions to `ripple-rest`. If another payment with the same `client_resource_id` as one that this instance of `ripple-rest` has marked as `pending` or `validated`, `ripple-rest` will assume that the second one was submitted accidentally. This helps clients prevent double spending on payments, even if the connection to `ripple-rest` is interrupted before the client can confirm the success or failure of a payment. In this case, the response will be the same but ONLY ONE of the duplicates will be submitted.

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

The `status_url` can be used to check the status of an individual payment. At first the `state` will be `pending`, then `validated` or `failed`.

If you want to monitor outgoing payments in bulk you can use the Notifications to monitor finalized (either validated or failed) payments.

----------

#### GET /v1/accounts/{account}/payments/{hash,client_resource_id}

Retrieve the details of a specific payment from the `rippled` server or from the `ripple-rest` instance's local database, if the payment was submitted to this `ripple-rest` instance and is still pending.

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

----------

### Notifications

----------

#### GET /v1/accounts/{account}/notifications/{hash,client_resource_id}

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

#### GET /v1/tx/{hash}

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









