# `ripple-rest` API Reference

__Contents:__

- [API Root](#api-root)
- [Changes from previous spec](#changes-from-previous-spec)
- [Payment Submission Options](#payment-submission-options)
	- [Option 1: Monitor Pending and Validated Payments](#option-1-monitor-pending-and-validated-payments)
	- [Option 2: Montior Specific Status URL](#option-2-montior-specific-status-url)
- [Schemas](#schemas)
	- [RippleAddress](#rippleaddress)
	- [FloatString](#floatstring)
	- [UINT32](#uint32)
	- [Hash256](#hash256)
	- [Hash128](#hash128)
	- [Timestamp](#timestamp)
	- [ResourceId](#resourceid)
	- [URL](#url)
	- [Currency](#currency)
	- [Amount](#amount)
	- [Account Settings](#account-settings)
	- [Payment](#payment)
	- [Trustline](#trustline)
	- [Order](#order)
		- [Priority Ranking of Currencies](#priority-ranking-of-currencies)
- [API Endpoints](#api-endpoints)
	- [Account Settings, Activity, and Balances](#account-settings-activity-and-balances)
		- [GET .../api/v1/accounts/{account}](#get-apiv1accounts{account})
		- [GET .../api/v1/accounts/{account}/settings](#get-apiv1accounts{account}settings)
		- [POST .../api/v1/accounts/{account}/settings](#post-apiv1accounts{account}settings)
		- [GET .../api/v1/accounts/{account}/settings/{hash,client_resource_id}](#get-apiv1accounts{account}settings{hashclient_resource_id})
		- [GET .../api/v1/accounts/{account}/activity?](#get-apiv1accounts{account}activity)
		- [GET .../api/v1/accounts/{account}/balances?](#get-apiv1accounts{account}balances)
	- [Payments](#payments)
		- [POST .../api/v1/payments](#post-apiv1payments)
		- [GET /api/v1/accounts/{account}/payments/{hash,client_resource_id}](#get-apiv1accounts{account}payments{hashclient_resource_id})
		- [GET .../api/v1/accounts/{account}/payments?](#get-apiv1accounts{account}payments)
		- [GET .../api/v1/accounts/{account}/payments/outgoing?](#get-apiv1accounts{account}paymentsoutgoing)
		- [GET .../api/v1/accounts/{account}/payments/outgoing/pending](#get-apiv1accounts{account}paymentsoutgoingpending)
		- [GET .../api/v1/accounts/{account}/payments/outgoing/failed?](#get-apiv1accounts{account}paymentsoutgoingfailed)
		- [GET .../api/v1/accounts/{account}/payments/incoming?](#get-apiv1accounts{account}paymentsincoming)
		- [GET .../api/v1/accounts/{account}/payments/incoming/failed?](#get-apiv1accounts{account}paymentsincomingfailed)
		- [GET .../api/v1/accounts/{account}/payments/quotes/send/{destination_account}/{destination_amount}](#get-apiv1accounts{account}paymentsquotessend{destination_account}{destination_amount})
		- [GET .../api/v1/accounts/{account}/payments/quotes/pay/{destination_account}/{source_amount}](#get-apiv1accounts{account}paymentsquotespay{destination_account}{source_amount})
	- [Trustlines](#trustlines)
		- [POST .../api/v1/trustlines](#post-apiv1trustlines)
		- [GET .../api/v1/accounts/{account}/trustlines?](#get-apiv1accounts{account}trustlines)
			- [Current Trustlines](#current-trustlines)
			- [Historical Trustlines](#historical-trustlines)
	- [Orders](#orders)
		- [POST .../api/v1/orders](#post-apiv1orders)
		- [GET .../api/v1/accounts/{account}/orders/{sequence,client_resource_id}](#get-apiv1accounts{account}orders{sequenceclient_resource_id})
		- [DELETE .../api/v1/accounts/{account}/orders{/sequence}](#delete-apiv1accounts{account}orders{sequence})
		- [GET .../api/v1/accounts/{account}/orders?](#get-apiv1accounts{account}orders)
			- [Current](#current)
			- [Historical](#historical)
		- [GET .../api/v1/orders/{base_currency}/{base_issuer}/{counter_currency}/{counter_issuer}?](#get-apiv1orders{base_currency}{base_issuer}{counter_currency}{counter_issuer})
	- [Server Info and Tools](#server-info-and-tools)
		- [GET .../api/v1/server](#get-apiv1server)
		- [GET .../api/v1/server/connected](#get-apiv1serverconnected)
		- [GET .../api/v1/uuid](#get-apiv1uuid)






## API Root

`GET .../api/v1`
```js
{
  "endpoints": {
    "GET": {
      "accounts":                           ".../api/v1/accounts/{account}",
      "account_settings":                   ".../api/v1/accounts/{account}/settings",
      "account_settings_historical":        ".../api/v1/accounts/{account}/settings/{hash,client_resource_id}",
      "account_activity_url":               ".../api/v1/accounts/{account}/activity{?start_ledger,end_ledger,resource_types,previous_transaction_hash,results_per_page,page}",
      "account_balances":                   ".../api/v1/accounts/{account}/balances{?currency,issuer,page}",
      "account_payments":                   ".../api/v1/accounts/{account}/payments/{hash,client_resource_id}",
      "account_payments_browse":            ".../api/v1/accounts/{account}/payments{?start_ledger,end_ledger,source_account,destination_account,earliest_first,results_per_page,page}"
      "account_payments_outgoing":          ".../api/v1/accounts/{account}/payments/outgoing{?start_ledger,end_ledger,destination_account,earliest_first,results_per_page,page}",
      "account_payments_outgoing_pending":  ".../api/v1/accounts/{account}/payments/outgoing/pending",
      "account_payments_outgoing_failed":   ".../api/v1/accounts/{account}/payments/outgoing/failed{?start_ledger,end_ledger,earliest_first,results_per_page,page}",
      "account_payments_incoming":          ".../api/v1/accounts/{account}/payments/incoming{?start_ledger,end_ledger,source_account,include_failed,earliest_first,results_per_page,page}",
      "account_payments_incoming_failed":   ".../api/v1/accounts/{account}/payments/incoming/failed{?start_ledger,end_ledger,earliest_first,results_per_page,page}",
      "account_payment_quote_send":         ".../api/v1/accounts/{account}/payments/quotes/send/{destination_account}/{destination_amount}",
      "account_payment_quote_pay":          ".../api/v1/accounts/{account}/payments/quotes/pay/{destination_account}/{source_amount}",
      "account_trustlines":                 ".../api/v1/accounts/{account}/trustlines/{client_resource_id}",
      "account_trustlines_browse":          ".../api/v1/accounts/{account}/trustlines{?currency,counterparty}",
      "account_trustlines_historical":      ".../api/v1/accounts/{account}/trustlines{?start_ledger,end_ledger,currency,counterparty,earliest_first,results_per_page,page}",
      "account_orders_active":              ".../api/v1/accounts/{account}/orders/{sequence,client_resource_id}",
      "account_orders_active_browse":       ".../api/v1/accounts/{account}/orders{?base_currency,counter_currency,buy_only,sell_only}",
      "account_orders_historical":          ".../api/v1/accounts/{account}/orders{?start_ledger,end_ledger,earliest_first,base_currency,counter_currency,buy_only,sell_only,results_per_page,page}"
      "orderbook":                          ".../api/v1/orders/{base_currency}/{base_issuer}/{counter_currency}/{counter_issuer}{?buy_only,sell_only}"
      "server_info":                        ".../api/v1/server",
      "server_connected":                   ".../api/v1/server/connected",
      "uuid_generator":                     ".../api/v1/uuid"
    },
    "POST": {
      "account_settings_change":            ".../api/v1/accounts/{account}/settings",
      "payment_submission":                 ".../api/v1/payments",
      "trustline_change":                   ".../api/v1/trustlines",
      "order_submission":                   ".../api/v1/orders"
    },
    "DELETE": {
      "order_cancellation":                 ".../api/v1/accounts/{account}/orders{/sequence}"
    }
  }
}
```
## Changes from previous spec

The main change from the previous `ripple-rest` spec is the replacement of the `Notification` object and `next_notification` endpoint with simpler endpoints allowing direct access to the various transaction and resource types. To monitor for incoming payments one can just poll the `.../payments/incoming` endpoint, which will return a list of payments. The two proposed options (which are not mutually exclusive) for confirming that an outgoing payment has been validated are outlined in the next section.

## Payment Submission Options

Irrespective of the option(s) chosen, `.../api/v1/accounts/{account}/payments/quotes` will return `Payment` objects with the `client_resource_id` already set with a UUID. If clients want to construct their own `Payment` objects they can get UUIDs for them from the `.../api/v1/uuid` endpoint, if they generate them programmatically in their application

### Option 1: Monitor Pending and Validated Payments

1. Submit a payment to `.../api/v1/payments` with `source_transaction_fee` set to identify it in the following lists
2. Response to POST request contains error or an okay message
3. Payment immediately appears in the list at `.../api/v1/accounts/{account}/payments/pending`
4. When payment is validated it appears in the list at `.../api/v1/accounts/{account}/payments/outgoing`
5. To poll for validated outgoing payments client can use query string parameter `?start_ledger=...` and continuously check for newly validated payments after a specific ledger index

### Option 2: Montior Specific Status URL

1. Submit a payment to `.../api/v1/payments` with `source_transaction_fee` set
2. Response from POST request includes an error message or a `"status_url":".../api/v1/accounts/{account}/payments/{client_resource_id}"` (whether or not the POST response is received, this URL can be used with the `client_resource_id` to get information about the payment)
3. Querying that `status_url` at first will return:
  ```js
  {
    "success": true,
    "payment": {
      "state": "pending",
      /* ... */
    }
  }
  ```
  ...then after a few seconds...
  ```js
  {
    "success": true,
    "payment": {
      "state": "validated",
      /* ... */
    }
  }
  ```
  ...or...
  ```js
  {
    "success": true,
    "payment": {
      "state": "failed",
      /* ... */
    }
  }
  ```
## Schemas

### RippleAddress

```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "RippleAddress",
  "description": "A Ripple account address",
  "type": "string",
  "pattern": "r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{26,34}"
}
```

### FloatString
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "FloatString",
  "description": "A string representation of a floating point number",
  "type": "string",
  "pattern": "^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$"
}
```

### UINT32
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "UINT32",
  "description": "A string representation of an unsigned 32-bit integer (0-4294967295)",
  "type": "string",
  "pattern": "^(429496729[0-5]|42949672[0-8]\d|4294967[01]\d{2}|429496[0-6]\d{3}|42949[0-5]\d{4}|4294[0-8]\d{5}|429[0-3]\d{6}|42[0-8]\d{7}|4[01]\d{8}|[1-3]\d{9}|[1-9]\d{8}|[1-9]\d{7}|[1-9]\d{6}|[1-9]\d{5}|[1-9]\d{4}|[1-9]\d{3}|[1-9]\d{2}|[1-9]\d|\d)$"
}
```

### Hash256
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Hash256",
  "description": "The hex representation of a 256-bit hash",
  "type": "string",
  "pattern": "^[A-Fa-f0-9]{64}$"
}
```

### Hash128
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Hash128",
  "description": "The hex representation of a 128-bit hash",
  "type": "string",
  "pattern": "^[A-Fa-f0-9]{32}$"
}
```

### Timestamp
```js
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Timestamp",
  "description": "An ISO 8601 combined date and time timestamp",
  "type": "string",
  "pattern": "^\d{4}-[0-1]\d-[0-3][\d]T(2[0-3]|[01]\d):[0-5]\d:[0-5]\d\+(2[0-3]|[01]\d):[0-5]\d$"
```

### ResourceId
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "ResourceId",
  "description": "A client-supplied unique identifier (ideally a UUID) for this transaction used to prevent duplicate payments and help confirm the transaction's final status. All ASCII printable characters are allowed",
  "type": "string",
  "pattern": "^[ !\"#$%&'\(\)\*\+,\-\.\/0-9:;<=>\?@A-Z\[\\\]\^_`a-z\{\|\}~]{1,255}$"
}
```

### URL
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "URL",
  "description": "A standard URL",
  "type": "string",
  "pattern": "^(ftp:\/\/|http:\/\/|https:\/\/)?(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!-\/]))?$"
}
```

### Currency
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Currency",
  "description": "The three-character code used to denote currencies",
  "type": "string",
  "pattern": "^[a-zA-Z]{3}$"
}
```

### Amount
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Amount",
  "description": "An Amount on the Ripple Protocol, used also for XRP in the ripple-rest API",
  "type": "object",
  "properties": {
    "value": {
      "description": "The quantity of the currency, denoted as a string to retain floating point precision",
      "type": "string",
      "$ref": "FloatString"
    },
    "currency": {
      "description": "The currency expressed as a three-character code",
      "$ref": "Currency"
    },
    "issuer": {
      "description": "The Ripple account address of the currency's issuer or gateway, or an empty string if the currency is XRP",
      "type": "string",
      "pattern": "^$|^r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{26,34}$"
    }
  },
  "required": ["value", "currency"]
}
```

### Account Settings

```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "AccountSettings",
  "description": "An object ",
  "type": "object",
  "properties": {
    "account": {
      "description": "The Ripple address of the account in question",
      "$ref": "RippleAddress"
    },
    "regular_key": {
      "description": "The hash of an optional additional public key that can be used for signing and verifying transactions",
      "$ref": "RippleAddress"
    },
    "owner_url": {
      "description": "The domain associated with this account. The ripple.txt file can be looked up to verify this information",
      "$ref": "URL"
    },
    "email_hash": {
      "description": "The MD5 128-bit hash of the account owner's email address",
      "$ref": "Hash128"
    },
    "message_public_key": {
      "description": "An optional public key, represented as hex, that can be set to allow others to send encrypted messages to the account owner",
      "type": "string",
      "^([0-9a-fA-F]{2}){0,33}$"
    },
    "transfer_rate": {
      "description": "A string representation of the rate charged each time a holder of currency issued by this account transfers it. By default the rate is \"1.0\". A rate of \"1.01\" is a 1% charge on top of the amount being transferred. Up to nine decimal places are supported",
      "type": "string",
      "pattern": "^[0-9]*\.?[0-9]{0,9}?$"
    },
    "require_destination_tag_for_incoming_payments": {
      "description": "If set to true incoming payments will only be validated if they include a destination_tag. This may be used primarily by gateways that operate exclusively with hosted wallets",
      "type": "boolean"
    },
    "require_authorization_for_incoming_trustlines": {
      "description": "If set to true incoming trustlines will only be validated if this account first creates a trustline to the counterparty with the authorized flag set to true. This may be used by gateways to prevent accounts unknown to them from holding currencies they issue",
      "type": "boolean"
    },
    "allow_xrp_payments": {
      "description": "If set to true incoming XRP payments will be allowed",
      "type": "boolean"
    },
    "transaction_sequence": {
      "description": "A string representation of the last sequence number of a validated transaction created by this account",
      "$ref": "UINT32"
    },
    "trustlines_owned": {
      "description": "The number of trustlines owned by this account. This value does not include incoming trustlines where this account has not explicitly reciprocated trust",
      "$ref": "UINT32"
    },
    "ledger": {
      "description": "The string representation of the index number of the ledger containing these account settings or, in the case of historical queries, of the transaction that modified these settings",
      "type": "string",
      "pattern": "^\d+$"
    },
    "hash": {
      "description": "If this object was returned by a historical query this value will be the hash of the transaction that modified these settings. The transaction hash is used throughout the Ripple Protocol to uniquely identify a particular transaction",
      "$ref": "Hash256"
    },
    "previous": {
      "description": "If the account settings were changed this will be a full AccountSettings object representing the previous values. If the previous object also had a previous object that will be removed to reduce data complexity. AccountSettings changes can be walked backwards by querying the API for previous.hash repeatedly",
      "$ref": "AccountSettings"
    }
  },
  "required": ["account"]
}
```

### Payment

```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Payment",
  "description": "A flattened Payment object used by the ripple-rest API",
  "type": "object",
  "properties": {
    "source_account": {
      "description": "The Ripple account address of the Payment sender",
      "$ref": "RippleAddress"
    },
    "source_tag": {
      "description": "A string representing an unsigned 32-bit integer most commonly used to refer to a sender's hosted account at a Ripple gateway",
      "$ref": "UINT32"
    },
    "source_amount": {
      "description": "An optional amount that can be specified to constrain cross-currency payments",
      "$ref": "Amount"
    },
    "source_slippage": {
      "description": "An optional cushion for the source_amount to increase the likelihood that the payment will succeed. The source_account will never be charged more than source_amount.value + source_slippage",
      "$ref": "FloatString"
    },
    "destination_account": {
      "$ref": "RippleAddress"
    },
    "destination_tag": {
      "description": "A string representing an unsigned 32-bit integer most commonly used to refer to a receiver's hosted account at a Ripple gateway",
      "$ref": "UINT32"
    },
    "destination_amount ": {
      "description": "The amount the destination_account will receive",
      "$ref": "Amount"
    },
    "invoice_id": {
      "description": "A 256-bit hash that can be used to identify a particular payment",
      "$ref": "Hash256"
    },
    "paths ": {
      "description": "A \"stringified\" version of the Ripple PathSet structure that users should treat as opaque",
      "type": "string"
    },
    "partial_payment": {
      "description": "A boolean that, if set to true, indicates that this payment should go through even if the whole amount cannot be delivered because of a lack of liquidity or funds in the source_account account",
      "type": "boolean"
    },
    "no_direct_ripple": {
      "description": "A boolean that can be set to true if paths are specified and the sender would like the Ripple Network to disregard any direct paths from the source_account to the destination_account. This may be used to take advantage of an arbitrage opportunity or by gateways wishing to issue balances from a hot wallet to a user who has mistakenly set a trustline directly to the hot wallet",
      "type": "boolean"
    },
    "direction": {
      "description": "The direction of the payment, from the perspective of the account being queried. Possible values are \"incoming\", \"outgoing\", and \"passthrough\"",
      "type": "string",
      "pattern": "^incoming|outgoing|passthrough$"
    },
    "state": {
      "description": "The state of the payment from the perspective of the Ripple Ledger. Possible values are \"validated\" and \"failed\" and \"new\" if the payment has not been submitted yet",
      "type": "string",
      "pattern": "^validated|failed|new$" 
    },
    "result": {
      "description": "The rippled code indicating the success or failure type of the payment. The code \"tesSUCCESS\" indicates that the payment was successfully validated and written into the Ripple Ledger. All other codes will begin with the following prefixes: \"tec\", \"tef\", \"tel\", or \"tej\"",
      "type": "string",
      "pattern": "te[cfjlms][A-Za-z_]+"
    },
    "ledger": {
      "description": "The string representation of the index number of the ledger containing the validated or failed payment. Failed payments will only be written into the Ripple Ledger if they fail after submission to a rippled and a Ripple Network fee is claimed",
      "type": "string",
      "pattern": "^\d+$"
    },
    "hash": {
      "description": "The 256-bit hash of the payment. This is used throughout the Ripple protocol as the unique identifier for the transaction",
      "$ref": "Hash256"
    },
    "timestamp": {
      "description": "The timestamp representing when the payment was validated and written into the Ripple ledger",
      "$ref": "Timestamp"
    },
    "fee": {
      "description": "The Ripple Network transaction fee, represented in whole XRP (NOT \"drops\", or millionths of an XRP, which is used elsewhere in the Ripple protocol)",
      "$ref": "FloatString"
    },
    "source_balance_changes": {
      "description": "Parsed from the validated transaction metadata, this array represents all of the changes to balances held by the source_account. Most often this will have one amount representing the Ripple Network fee and, if the source_amount was not XRP, one amount representing the actual source_amount that was sent",
      "type": "array",
      "items": {
        "$ref": "Amount"
      }
    },
    "destination_balance_changes": {
      "description": "Parsed from the validated transaction metadata, this array represents the changes to balances held by the destination_account. For those receiving payments this is important to check because if the partial_payment flag is set this value may be less than the destination_amount",
      "type": "array",
      "items": {
        "$ref": "Amount"
      }
    }
  },
  "required": ["source_account", "destination_account", "destination_amount", "client_resource_id"]
}
```

### Trustline

```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Trustline",
  "description": "A simplified Trustline object used by the ripple-rest API",
  "type": "object",
  "properties": {
    "account": {
      "description": "The account from whose perspective this trustline is being viewed",
      "$ref": "RippleAddress"
    },
    "counterparty": {
      "description": "The other party in this trustline",
      "$ref": "RippleAddress"
    },
    "currency": {
      "description": "The code of the currency in which this trustline denotes trust",
      "$ref": "Currency"
    },
    "trust_limit": {
      "description": "The maximum value of the currency that the account may hold issued by the counterparty",
      "$ref": "FloatString"
    },
    "reciprocated_trust_limit": {
      "description": "The maximum value of the currency that the counterparty may hold issued by the account",
      "$ref": "FloatString"
    },
    "balance": {
      "description": "The Amount representing the currency held by the account that is issued by the counterparty",
      "$ref": "Amount"
    },
    "authorized_by_account": {
      "description": "Set to true if the account has explicitly authorized the counterparty to hold currency it issues. This is only necessary if the account's settings include require_authorization_for_incoming_trustlines",
      "type": "boolean"
    },
    "authorized_by_counterparty": {
      "description": "Set to true if the counterparty has explicitly authorized the account to hold currency it issues. This is only necessary if the counterparty's settings include require_authorization_for_incoming_trustlines",
      "type": "boolean"
    },
    "account_allows_rippling": {
      "description": "If true it indicates that the account allows pairwise rippling out through this trustline",
      "type": "boolean"
    },
    "counterparty_allows_rippling": {
      "description": "If true it indicates that the counterparty allows pairwise rippling out through this trustline",
      "type": "boolean"
    },
    "ledger": {
      "description": "The string representation of the index number of the ledger containing this trustline or, in the case of historical queries, of the transaction that modified this Trustline",
      "type": "string",
      "pattern": "^\d+$"
    },
    "hash": {
      "description": "If this object was returned by a historical query this value will be the hash of the transaction that modified this Trustline. The transaction hash is used throughout the Ripple Protocol to uniquely identify a particular transaction",
      "$ref": "Hash256"
    },,
    "previous": {
      "description": "If the trustline was changed this will be a full Trustline object representing the previous values. If the previous object also had a previous object that will be removed to reduce data complexity. Trustline changes can be walked backwards by querying the API for previous.hash repeatedly",
      "$ref": "Trustline"
    }
  },
  "required": ["account", "counterparty", "trust_limit"]
}
```

### Order


```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Order",
  "description": "A simplified Order object used by the ripple-rest API (note that \"orders\" are referred to elsewhere in the Ripple protocol as \"offers\")",
  "type": "object",
  "properties": {
    "account": {
      "description": "The Ripple account address of the order's creator",
      "$ref": "RippleAddress"
    },
    "buy": {
      "description": "If set to true the order it indicates that the creator is looking to receive the base_amount in exchange for the counter_amount. If undefined or set to false it indicates that the creator is looking to sell the base_amount to receive the counter_amount",
      "type": "boolean"
    },
    "base_amount": {
      "description": "The amount of currency the seller_account is seeking to buy. If other orders take part of this one, this value will change to represent the amount left in the order. This may be specified along with the counter_amount OR exchange_rate but not both. When the order is parsed from the Ripple Ledger the base currency will be determined according to the Priority Ranking of Currencies (XRP,EUR,GBP,AUD,NZD,USD,CAD,CHF,JPY,CNY) and if neither currency is listed in the ranking the base currency will be the one that is alphabetically first",
      "$ref": "Amount"
    },
    "counter_amount": {
      "description": "The amount of currency being sold. If other orders take part of this one, this value will change to represent the amount left in the order. This may be specified along with the base_amount OR the exchange_rate but not both",
      "$ref": "Amount"
    },
    "exchange_rate": {
      "description": "A string representation of the order price, defined as the cost one unit of the base currency in terms of the counter currency. This may be specified along with the base_amount OR the counter_amount but not both. If it is unspecified it will be computed automatically based on the counter_amount divided by the base_amount",
      "$ref": "FloatString"
    },
    "expiration_timestamp": {
      "description": "The ISO combined date and time string representing the point beyond which the order will no longer be considered active or valid",
      "$ref": "Timestamp"
    },
    "ledger_timeout": {
      "description": "A string representation of the number of ledger closes after submission during which the order should be considered active",
      "type": "string",
      "pattern": "^\d*$"
    },
    "immediate_or_cancel": {
      "description": "If set to true this order will only take orders that are available at the time of execution and will not create an entry in the Ripple Ledger",
      "type": "boolean"
    },
    "fill_or_kill": {
      "description": "If set to true this order will only take orders that fill the base_amount and are available at the time of execution and will not create an entry in the Ripple Ledger",
      "type": "boolean"
    },
    "maximize_sell": {
      "description": "If set to true this order will sell up to the counter_amount, even if the amount bought exceeds the base_amount",
      "type": "boolean"
    },
    "cancel_replace": {
      "description": "If this is set to the sequence number of an outstanding order, that order will be cancelled and replaced with this one",
      "type": "string",
      "pattern": "^d*$"
    },
    "sequence": {
      "description": "The sequence number of this order from the perspective of the seller_account. The seller_account and the sequence number uniquely identify the order in the Ripple Ledger",
      "type": "string",
      "pattern": "^\d*$"
    },
    "fee": {
      "description": "The Ripple Network transaction fee, represented in whole XRP (NOT \"drops\", or millionths of an XRP, which is used elsewhere in the Ripple protocol) used to create the order",
      "$ref": "FloatString"
    },
    "state": {
      "description": "If the order is active the state will be \"active\". If this object represents a historical order the state will be \"validated\", \"filled\" if the order was removed because it was fully filled, \"cancelled\" if it was deleted by the owner, \"expired\" if it reached the expiration_timestamp, or \"failed\" if there was an error with the initial attempt to place the order",
      "type": "string",
      "pattern": "^active|validated|filled|cancelled|expired|failed$"
    },
    "ledger": {
      "description": "The string representation of the index number of the ledger containing this order or, in the case of historical queries, of the transaction that modified this Order. ",
      "type": "string",
      "pattern": "^\d+$"
    },
    "hash": {
      "description": "When returned as the result of a historical query this will be the hash of Ripple transaction that created, modified, or deleted this order. The transaction hash is used throughout the Ripple Protocol to uniquely identify a particular transaction",
      "$ref": "Hash256"
    },
    "previous": {
      "description": "If the order was modified or partially filled this will be a full Order object. If the previous object also had a previous object that will be removed to reduce data complexity. Order changes can be walked backwards by querying the API for previous.hash repeatedly",
      "$ref": "Order"
    }
  },
  "required": ["account"]
}
```

#### Priority Ranking of Currencies

Currencies located earlier in the array have greater priority than those lower in the array. All crosses where neither currency is in this list will have whichever currency comes first alphabetically prioritized.

```js
[
  "XRP",
  "EUR",
  "GBP",
  "AUD",
  "NZD",
  "USD",
  "CAD",
  "CHF",
  "JPY",
  "CNY"
]
```

## API Endpoints

Notes:

+ All errors will be returned in the following format:

  ```js
  {
    "success": false,
    "error": "Some error",
    "message": "Some explanation of the error"
  }
  ```

+ Unless otherwise specified, all data is retrieved from or passed to the connected `rippled`. For this reason, if the `rippled` is not connected and synced with the rest of the Ripple Network, all endpoints will return the following error:

  ```js
  {
    "success": false,
    "error": "rippled Disconnected",
    "message": "ripple-rest is unable to connect to the specified rippled server, or the rippled server is unable to communicate with the rest of the Ripple Network. Please check your internet and rippled server settings and try again"
  }
  ```



### Account Settings, Activity, and Balances

#### GET .../api/v1/accounts/{account}

Response:
```js
{
  "success": true,
  "account": "r...",
  "funded": true,
  "settings":                   ".../api/v1/accounts/{account}/settings",
  "activity_url":               ".../api/v1/accounts/{account}/activity{?start_ledger,end_ledger,resource_types,previous_transaction_hash,results_per_page,page}",
  "balances":                   ".../api/v1/accounts/{account}/balances{?currency,issuer,page}",
  "payments":                   ".../api/v1/accounts/{account}/payments{/hash,client_resource_id}",
  "payments_browse":            ".../api/v1/accounts/{account}/payments{?start_ledger,end_ledger,source_account,destination_account,earliest_first,results_per_page,page}"
  "payments_outgoing":          ".../api/v1/accounts/{account}/payments/outgoing{?start_ledger,end_ledger,destination_account,include_failed,earliest_first,results_per_page,page}",
  "payments_outgoing_pending":  ".../api/v1/accounts/{account}/payments/outgoing/pending",
  "payments_outgoing_failed":   ".../api/v1/accounts/{account}/payments/outgoing/failed",
  "payments_incoming":          ".../api/v1/accounts/{account}/payments/incoming{?start_ledger,end_ledger,source_account,include_failed,earliest_first,results_per_page,page}",
  "payments_incoming_failed":   ".../api/v1/accounts/{account}/payments/incoming/failed",
  "payment_quote_send":         ".../api/v1/accounts/{account}/payments/quotes/send/{destination_account}/{destination_amount}",
  "payment_quote_pay":          ".../api/v1/accounts/{account}/payments/quotes/pay/{destination_account}/{source_amount}",
  "trustlines":                 ".../api/v1/accounts/{account}/trustlines{?currency,counterparty}",
  "trustlines_historical":      ".../api/v1/accounts/{account}/trustlines{?start_ledger,end_ledger,currency,counterparty,earliest_first,results_per_page,page}",
  "orders_active":              ".../api/v1/accounts/{account}/orders{/sequence}",
  "orders_active_browse":       ".../api/v1/accounts/{account}/orders{?base_currency,counter_currency,buy_only,sell_only}",
  "orders_historical":          ".../api/v1/accounts/{account}/orders{?start_ledger,end_ledger,earliest_first,base_currency,counter_currency,buy_only,sell_only,results_per_page,page}"
}
```
Or if the account does not exist in the `rippled`'s validated ledger, most likely because it has not been funded with XRP, the response will be:
```js
{
  "success": false,
  "error": "Account Does Not Exist",
  "message": "This account does not exist in this `rippled`'s validated ledger, most likely because it has not yet been funded with XRP. Accounts need minimum XRP balances to transact on the Ripple Network"
}
```
All other requests will return this same error if the account does not exist or is unfunded.

#### GET .../api/v1/accounts/{account}/settings

Retrieve the current settings for a given account.

Response:
```js
{
  "success": true,
  "settings": {
    /* AccountSettings */
  }
}
```

Note that the AccountSettings object returned may be modified and submitted directly back to `ripple-rest` to change the settings.

#### POST .../api/v1/accounts/{account}/settings

Change the settings on your account.

Request JSON Body:
{
  "secret": "s...",
  "client_resource_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "settings": {
    /* AccountSettings */
  }
}

Note that while the `client_resource_id` may be supplied here, it will not block duplicate submissions as in the case of Payments. Redundant settings changes will have no effect, aside from unnecessary Ripple Network fees being spent.

Response:
{
  "success": true,
  "client_resource_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status_url": ".../api/v1/accounts/{account}/settings/f47ac10b-58cc-4372-a567-0e02b2c3d479"
}

Or if there was an error:
{
  "success": false,
  "client_resource_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "error": "Some Error",
  "message": "Some explanation of the error"
}

#### GET .../api/v1/accounts/{account}/settings/{hash,client_resource_id}

Retrieve a historical transaction that modified the settings of this account.

Response:
```js
{
  "success": true,
  "settings": {
    /* AccountSettings */
  }
}
```
Note that the `previous` object will contain the account settings as they were before the transaction that modified them.

#### GET .../api/v1/accounts/{account}/activity?

Query String Parameters:

+ `start_ledger` - If `earliest_first` is set to true this will be the index number of the earliest ledger queried, or the most recent one if `earliest_first` is set to false. Defaults to the first ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `end_ledger` - If `earliest_first` is set to true this will be the index number of the most recent ledger queried, or the earliest one if `earliest_first` is set to false. Defaults to the last ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `resource_types` - A comma-separated list of the resources to return activity for. Possible values are `payments`, `trustlines`, `orders`, `settings`. By default all will be included
+ `previous_transaction_hash` - If the hash of a previous transaction that modified a resource is included here the results will include the transactions following the specified one. `results_per_page` can be used in combination to limit the number of results returned each time to, for example, a single resource
+ `earliest_first` - Determines the order in which the results should be displayed. Defaults to true
+ `results_per_page` - Limits the number of resources displayed per page. Defaults to 20
+ `page` - The page to be displayed. If there are fewer than the `results_per_page` number displayed, this indicates that this is the last page

Response:
```js
{
  "success": true,
  "resources": [{
    "type": "payment",
    "client_resource_id": "af6b82c3-d989-4dd1-9145-b0fb5d1c0538",
    "resource": {
      /* Payment */
    }
  }, {
    "type": "order",
    "client_resource_id": "0c58bc31-56a9-4d4b-b738-721727636042",
    "resource": {
      /* Order */
    }
  }, {
    "type": "trustline",
    "client_resource_id": "df479ecd-b1a9-4933-b935-a44b9a31db3d",
    "resource": {
      /* Trustline */
    }
  }, {
    "type": "settings",
    "client_resource_id": "df479ecd-b1a9-4933-b935-a44b9a31db3d",
    "resource": {
      /* AccountSettings */
    }
  } /* ... */]
}
```
Note that the `client_resource_id` is only persisted by `ripple-rest` locally so it will be `""` if the transaction that modified a particular resource was not initiated by the same `ripple-rest` instance querying the activity. Also note that this example shows all of the resource types but the real results will contain an assortment of the types in the array and there will likely be multiple resources of the same type returned.


#### GET .../api/v1/accounts/{account}/balances?

Query String Parameters:

+ `currency` - Limit the results to one specific currency
+ `issuer` - Limit the results to a specific issuer

Response:
```js
{
  "success": true,
  "balances": [{
    /* Amount in XRP */
  }, {
    /* Amount */
  }]
}
```
Note that this will include the account's XRP balance.


### Payments

#### POST .../api/v1/payments

Submit a payment.

Request JSON Body:
```js
{
  "secret": "s...",
  "client_resource_id": "f2f811b7-dc3b-4078-a2c2-e4ca9e453981",
  "payment": {
    /* Payment */
  }
}
```
Note that the `client_resource_id` is required for all Payment submissions to `ripple-rest`. If another payment with the same `client_resource_id` as one that this instance of `ripple-rest` has marked as `pending` or `validated`, `ripple-rest` will assume that the second one was submitted accidentally. This helps clients prevent double spending on payments, even if the connection to `ripple-rest` is interrupted before the client can confirm the success or failure of a payment. In this case, the response will be the same but ONLY ONE of the duplicates will be submitted.

Response:
{
  "success": true,
  "client_resource_id": "f2f811b7-dc3b-4078-a2c2-e4ca9e453981",
  "status_url": ".../api/v1/accounts/{account}/payments/f2f811b7-dc3b-4078-a2c2-e4ca9e453981"
}
Or if there was an error that was caught immediately:
{
  "success": false,
  "client_resource_id": "f2f811b7-dc3b-4078-a2c2-e4ca9e453981",
  "error": "Some Error",
  "message": "Some explanation of the error"
}

The `status_url` can be used to check the status of an individual payment. At first the `state` will be `pending`, then `validated` or `failed`.

If you want to monitor outgoing payments in bulk you can use the `.../api/v1/accounts/{account}/payments/outgoing?` endpoint to retrieve all validated payments for a specific ledger range. When a payment appears in the results from that endpoint with the same `client_resource_id` supplied here, you know this payment has been validated and written into the Ripple Ledger.


#### GET /api/v1/accounts/{account}/payments/{hash,client_resource_id}

Retrieve the details of a specific payment from the `rippled` server or, if the payment is still pending, from the `ripple-rest` instance's local database.

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
  "message": "No payment with the supplied identifier was found either in the rippled's database or in ripple-rest's pending database. This may be due to an incomplete or recently deleted database or the payment may not have been validated and written into the Ripple Ledger"
}
```

#### GET .../api/v1/accounts/{account}/payments?

Browse though payments that affected the given account.

Query String Parameters:

+ `source_account` - If specified, limit the results to payments initiated by a particular account
+ `destination_account` - If specified, limit the results to payments made to a particular account
+ `include_failed` - If set to true, include failed payments. Note that these will have `state` set to `failed` and `result` set to a code other than `tesSUCCESS`. Failed payments may have caused a Ripple Network fee to be claimed but no other money was transferred
+ `start_ledger` - If `earliest_first` is set to true this will be the index number of the earliest ledger queried, or the most recent one if `earliest_first` is set to false. Defaults to the first ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `end_ledger` - If `earliest_first` is set to true this will be the index number of the most recent ledger queried, or the earliest one if `earliest_first` is set to false. Defaults to the last ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `earliest_first` - Determines the order in which the results should be displayed. Defaults to true
+ `results_per_page` - Limits the number of resources displayed per page. Defaults to 20
+ `page` - The page to be displayed. If there are fewer than the `results_per_page` number displayed, this indicates that this is the last page


Response:
```js
{
  "success": true,
  "payments": [{
    /* Payment */
  }, {
    /* Payment */
  } /* ... */]
}
```

#### GET .../api/v1/accounts/{account}/payments/outgoing?

Browse through __validated__ payments sent by the given account (though not necessarily through `ripple-rest`).

Query String Parameters:

+ `destination_account` - If specified, limit the results to payments made to a particular account
+ `start_ledger` - If `earliest_first` is set to true this will be the index number of the earliest ledger queried, or the most recent one if `earliest_first` is set to false. Defaults to the first ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `end_ledger` - If `earliest_first` is set to true this will be the index number of the most recent ledger queried, or the earliest one if `earliest_first` is set to false. Defaults to the last ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `earliest_first` - Determines the order in which the results should be displayed. Defaults to true
+ `results_per_page` - Limits the number of resources displayed per page. Defaults to 20
+ `page` - The page to be displayed. If there are fewer than the `results_per_page` number displayed, this indicates that this is the last page

Response:
```js
{
  "success": true,
  "payments": [{
    /* Payment */
  }, {
    /* Payment */
  } /* ... */]
}
```
#### GET .../api/v1/accounts/{account}/payments/outgoing/pending

Browse through the list of outgoing payments that `ripple-rest`/`ripple-lib` is in the process of submitting or waiting to hear confirmation of from the `rippled`.

Response:
```js
{
  "success": true,
  "payments": [{
    /* Payment */
  }, {
    /* Payment */
  } /* ... */]
}
```
Note that all of these payments will have `state` set to `pending` and have NOT been validated and written into the Ripple Ledger yet.

#### GET .../api/v1/accounts/{account}/payments/outgoing/failed?

Browse through the list of outgoing failed payments. This list will include results from `rippled` that have `tec...` `result` codes, as well as some failed payments submitted through this `ripple-rest` instance. Failed payments submitted through this `ripple-rest` instance will only appear here if they failed after they passed all of `ripple-rest` and `ripple-lib`'s checks AND received an initial `tesSUCCESS` code from `rippled`.

Query String Parameters:

+ `start_ledger` - If `earliest_first` is set to true this will be the index number of the earliest ledger queried, or the most recent one if `earliest_first` is set to false. Defaults to the first ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `end_ledger` - If `earliest_first` is set to true this will be the index number of the most recent ledger queried, or the earliest one if `earliest_first` is set to false. Defaults to the last ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `earliest_first` - Determines the order in which the results should be displayed. Defaults to true
+ `results_per_page` - Limits the number of resources displayed per page. Defaults to 20
+ `page` - The page to be displayed. If there are fewer than the `results_per_page` number displayed, this indicates that this is the last page

Response:
```js
{
  "success": true,
  "payments": [{
    /* Payment */
  }, {
    /* Payment */
  } /* ... */]
}
```
Note that all of these will have `state` set to `failed` and the `result` field will contain the `rippled` or `ripple-lib` error code that caused the payment to fail. The `tec...` prefix indicates that a Ripple Network fee was claimed. All other prefixes indicate that the transaction failed off-network.

#### GET .../api/v1/accounts/{account}/payments/incoming?

Browse through the list of __validated__ payments sent to the given account.

Query String Parameters:

+ `source_account` - Limit the results to payments originating from a particular account
+ `start_ledger` - If `earliest_first` is set to true this will be the index number of the earliest ledger queried, or the most recent one if `earliest_first` is set to false. Defaults to the first ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `end_ledger` - If `earliest_first` is set to true this will be the index number of the most recent ledger queried, or the earliest one if `earliest_first` is set to false. Defaults to the last ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `earliest_first` - Determines the order in which the results should be displayed. Defaults to true
+ `results_per_page` - Limits the number of resources displayed per page. Defaults to 20
+ `page` - The page to be displayed. If there are fewer than the `results_per_page` number displayed, this indicates that this is the last page

Response:
```js
{
  "success": true,
  "payments": [{
    /* Payment */
  }, {
    /* Payment */
  } /* ... */]
}
```

#### GET .../api/v1/accounts/{account}/payments/incoming/failed?

Browse through the list of failed payments that others attempted to send to the given account.

Query String Parameters:

+ `start_ledger` - If `earliest_first` is set to true this will be the index number of the earliest ledger queried, or the most recent one if `earliest_first` is set to false. Defaults to the first ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `end_ledger` - If `earliest_first` is set to true this will be the index number of the most recent ledger queried, or the earliest one if `earliest_first` is set to false. Defaults to the last ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `earliest_first` - Determines the order in which the results should be displayed. Defaults to true
+ `results_per_page` - Limits the number of resources displayed per page. Defaults to 20
+ `page` - The page to be displayed. If there are fewer than the `results_per_page` number displayed, this indicates that this is the last page

Response:
```js
{
  "success": true,
  "payments": [{
    /* Payment */
  }, {
    /* Payment */
  } /* ... */]
}
```
Note that all of these will have `state` set to `failed` and the `result` field will contain the `rippled` or `ripple-lib` error code that caused the payment to fail.

#### GET .../api/v1/accounts/{account}/payments/quotes/send/{destination_account}/{destination_amount}

Query `rippled` for possible payment options to deliver the `destination_amount` to the `destination_account` such that the sender pays the fees. This is the default Ripple Path-Find, however unlike the standard call to `rippled`, this will return fully formed Payment objects that can be directly submitted back to `ripple-rest`.

Note that the `destination_amount` MUST be written as a string in the form `value+currency+issuer` (e.g. `1+XRP` or `1+USD+r...`).

Response:
```js
{
  "success": true,
  "payments": [{
    /* Payment */
  }, {
    /* Payment */
  } /* ... */]
}
```
Note that all of these will have `state` set to `new`, because they have not yet been submitted to the Ripple Network.

If no possible paths are found, likely because of a lack of funds or lack of liquidity in the paths between the `source_account`'s currencies and the `destination_amount`, the response will be:
```js
{
  "success": true,
  "payments": []
}
```

To determine which of these payments you want to submit, consider the `source_amount`'s of each and the currencies they are specified in. A Payment object will be returned for each currency held by your account in sufficient quantities to send the recipient the specified amount.

You may want to modify some of the fields of the Payment before submitting it, such as the `source_tag` and `destination_tag`. To increase the likelihood that the Payment will be successful, even if the liquidity of the path through the Ripple Network changes suddenly, you can add some `source_slippage`. Even without `source_slippage`, however, submitting one of the payments returned by this endpoint back to `ripple-rest` very soon after has a high chance of succeeding.

#### GET .../api/v1/accounts/{account}/payments/quotes/pay/{destination_account}/{source_amount}

Query `rippled` for possible payment options to pay the `destination_account` with the `source_amount` such that the receiver pays the fees. This is not supported by the standard Ripple Path-Find.

Note that the `source_amount` MUST be written as a string in the form `value+currency+issuer` (e.g. `1+XRP` or `1+USD+r...`).

Response:
```js
{
  "success": true,
  "payments": [{
    /* Payment */
  }, {
    /* Payment */
  } /* ... */]
}
```
Note that all of these will have `state` set to `new`, because they have not yet been submitted to the Ripple Network.

To determine which of these payments you want to submit, consider the `destination_amount`'s of each and the currencies they are specified in. A Payment object will be returned for each currency accepted by the `destination_account` for which there is a path through the Ripple Network from the `source_amount`.

You may want to modify some of the fields of the Payment before submitting it, such as the `source_tag` and `destination_tag`. To increase the likelihood that the Payment will be successful, even if the liquidity of the path through the Ripple Network changes suddenly, you can add some `source_slippage`. Even without `source_slippage`, however, submitting one of the payments returned by this endpoint back to `ripple-rest` very soon after has a high chance of succeeding.


### Trustlines

#### POST .../api/v1/trustlines

Create a new trustline or modify an existing one.

Request JSON Body:
```js
{
  "secret": "s...",
  "client_resource_id": "d4c280fa-4542-487b-ab7b-ce7e0502214b",
  "trustline": {
    /* Trustline */
  }
}
```
Note that while the `client_resource_id` may be supplied here, it will not block duplicate submissions as in the case of Payments. Redundant trustline changes will have no effect, aside from unnecessary Ripple Network fees being spent.

Response:
{
  "success": true,
  "client_resource_id": "f2f811b7-dc3b-4078-a2c2-e4ca9e453981",
  "status_url": ".../api/v1/accounts/{account}/trustlines/f2f811b7-dc3b-4078-a2c2-e4ca9e453981"
}


#### GET .../api/v1/accounts/{account}/trustlines?

Depending on the Query String Parameters used this endpoint may return the account's current trustlines or historical changes to an account's trustlines.

##### Current Trustlines

Query String Parameters:

+ `currency` - If specified, limit the results to trustlines denominated in a single currency
+ `counterparty` - If specified, limit the results to the trustlines with one other Ripple account

Response:
```js
{
  "success": true,
  "trustlines": [{
    /* Trustline */
  }, {
    /* Trustline */
  }, /* ... */]
}
```
Note that all of the results will be the current trustlines for the account. None of them will have `previous` set.

##### Historical Trustlines

Query String Parameters:

+ `currency` - If specified, limit the results to trustlines denominated in a single currency
+ `counterparty` - If specified, limit the results to the trustlines with one other Ripple account
+ `start_ledger` - If `earliest_first` is set to true this will be the index number of the earliest ledger queried, or the most recent one if `earliest_first` is set to false. Defaults to the first ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `end_ledger` - If `earliest_first` is set to true this will be the index number of the most recent ledger queried, or the earliest one if `earliest_first` is set to false. Defaults to the last ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `earliest_first` - Determines the order in which the results should be displayed. Defaults to true
+ `results_per_page` - Limits the number of resources displayed per page. Defaults to 20
+ `page` - The page to be displayed. If there are fewer than the `results_per_page` number displayed, this indicates that this is the last page

Response:
```js
{
  "success": true,
  "trustlines": [{
    /* Trustline */
  }, {
    /* Trustline */
  }, /* ... */]
}
```
Note that all of the results will represent changes to this account's trustlines. There may be multiple entries per trustline if there have multiple modifications to it. Entries representing trustline modifications will have `previous` values that show the full Trustline before the modfication. 


### Orders

#### POST .../api/v1/orders

Create a new order or modify an existing one.

Request JSON Body:
```js
{
  "secret": "s...",
  "client_resource_id": "d4c280fa-4542-487b-ab7b-ce7e0502214b",
  "order": {
    /* Order */
  }
}
```
Note that while the `client_resource_id` may be supplied here, it will not block duplicate submissions as in the case of Payments. Redundant order changes will have no effect, aside from unnecessary Ripple Network fees being spent.

Response:
{
  "success": true,
  "client_resource_id": "f2f811b7-dc3b-4078-a2c2-e4ca9e453981",
  "status_url": ".../api/v1/accounts/{account}/orders/f2f811b7-dc3b-4078-a2c2-e4ca9e453981"
}

#### GET .../api/v1/accounts/{account}/orders/{sequence,client_resource_id}

Retrieve a single active order.

```js
{
  "success": true,
  "order": {
    /* Order */
  }
}
```
Or if the order does not exist (or is not currently active):
```js
{
  "success": false,
  "error": "Order Not Found",
  "message": "This order may not exist or it may no longer be active"
}
```
If an order that was previously active has been filled it may be retrieved by querying the `.../api/v1/accounts/{account}/orders?` endpoint.

#### DELETE .../api/v1/accounts/{account}/orders{/sequence}

Request JSON Body:
{
  "secret": "s...",
  "client_resource_id": "55579312-0b49-4869-9604-b934f7bd9f45"
}

Response:
```js
{
  "success": true,
  "status_url": ".../api/v1/accounts/{account}/orders{/sequence}"
}
```

#### GET .../api/v1/accounts/{account}/orders?

Depending on the Query String Parameters used this endpoint may return the account's current orders or historical changes to an account's orders.

##### Current

Query String Parameters:

+ `base_currency` - If specified, limit the results to orders with the specified base currency
+ `counter_currency` - If specified, limit the results to orders with the specified counter or quote currency
+ `buy_only` - If specified, limit the results to only "buy" orders
+ `sell_only` - If specified, limit the results to only "sell" orders

Response:
```js
{
  "success": true,
  "orders": [{
    /* Order */
  }, {
    /* Order */
  }, /* ... */]
}
```

Note that all of the results will be the active orders for the account. None of them will have `previous` set.

##### Historical

Query String Parameters:

+ `base_currency` - If specified, limit the results to orders with the specified base currency
+ `counter_currency` - If specified, limit the results to orders with the specified counter or quote currency
+ `buy_only` - If specified, limit the results to only "buy" orders
+ `sell_only` - If specified, limit the results to only "sell" orders
+ `start_ledger` - If `earliest_first` is set to true this will be the index number of the earliest ledger queried, or the most recent one if `earliest_first` is set to false. Defaults to the first ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `end_ledger` - If `earliest_first` is set to true this will be the index number of the most recent ledger queried, or the earliest one if `earliest_first` is set to false. Defaults to the last ledger the `rippled` has in its complete ledger. An error will be returned if this value is outside the `rippled`'s complete ledger set
+ `earliest_first` - Determines the order in which the results should be displayed. Defaults to true
+ `results_per_page` - Limits the number of resources displayed per page. Defaults to 20
+ `page` - The page to be displayed. If there are fewer than the `results_per_page` number displayed, this indicates that this is the last page

Response:
```js
{
  "success": true,
  "orders": [{
    /* Order */
  }, {
    /* Order */
  }, /* ... */]
}
```

Note that all of the results will represent changes to this account's orders. There may be multiple entries per order if there have multiple modifications to it. Entries representing order modifications will have `previous` values that show the full Order before the modfication. 

#### GET .../api/v1/orders/{base_currency}/{base_issuer}/{counter_currency}/{counter_issuer}?

Retrieve the current orderbook for a given currency pair.

Query String Parameters:

+ `buy_only` - If specified, limit the results to only "buy" orders
+ `sell_only` - If specified, limit the results to only "sell" orders

Response:
```js
{
  "success": true,
  "orders": [{
    /* Order */
  }, {
    /* Order */
  }, /* ... */]
}
```

### Server Info and Tools

#### GET .../api/v1/server

Retrieve information about the `ripple-rest` and connected `rippled`'s current status.

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
  "error": "rippled Disconnected",
  "message": "ripple-rest is unable to connect to the specified rippled server, or the rippled server is unable to communicate with the rest of the Ripple Network. Please check your internet and rippled server settings and try again"
}
```

#### GET .../api/v1/server/connected

A simple endpoint that can be used to check if `ripple-rest` is connected to a `rippled` and is ready to serve. If used before querying the other endpoints this can be used to centralize the logic to handle if `rippled` is disconnected from the Ripple Network and unable to process transactions.

Response:

`true` if `ripple-rest` is ready to serve

`false` otherwise

#### GET .../api/v1/uuid

A UUID version 4 generator. The result may be used to supply the `client_resource_id` for resource submissions if you wish to use a UUID (recommended) but do not have a local generator. See [here](http://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_.28random.29) for more information on UUIDs.

Response:
```js
{
  "success": true,
  "uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

From Wikipedia: "Version 4 UUIDs have the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where x is any hexadecimal digit and y is one of 8, 9, A, or B (e.g., f47ac10b-58cc-4372-a567-0e02b2c3d479)."



