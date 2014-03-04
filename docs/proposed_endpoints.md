
### `ripple-rest` API Reference


`GET .../api/v1`
```js
{
  "endpoints": {
    "GET": {
      "accounts":                       ".../api/v1/accounts/{account}",
      "account_settings":               ".../api/v1/accounts/{account}/settings",
      "account_activity_url":           ".../api/v1/accounts/{account}/activity{?start_ledger,end_ledger,previous_transaction_hash,results_per_page,page}",
      "account_balances":               ".../api/v1/accounts/{account}/balances{?currency,issuer,page}",
      "account_payments":               ".../api/v1/accounts/{account}/payments{/hash,source_transaction_id}",
      "account_payments_browse":        ".../api/v1/accounts/{account}/payments{?start_ledger,end_ledger,source_account,destination_account,earliest_first,results_per_page,page}"
      "account_payments_outgoing":      ".../api/v1/accounts/{account}/payments/outgoing{?start_ledger,end_ledger,destination_account,earliest_first,results_per_page,page}",
      "account_payments_incoming":      ".../api/v1/accounts/{account}/payments/incoming{?start_ledger,end_ledger,source_account,earliest_first,results_per_page,page}",
      "account_payments_pending":       ".../api/v1/accounts/{account}/payments/pending",
      "account_payment_quote_send":     ".../api/v1/accounts/{account}/payments/quotes/send/{destination_account}/{destination_amount}",
      "account_payment_quote_pay":      ".../api/v1/accounts/{account}/payments/quotes/pay/{destination_account}/{source_amount}",
      "account_trustlines":             ".../api/v1/accounts/{account}/trustlines{?currency,counterparty}",
      "account_trustlines_historical":  ".../api/v1/accounts/{account}/trustlines{?start_ledger,end_ledger,currency,counterparty,earliest_first,results_per_page,page}",
      "account_orders_active":          ".../api/v1/accounts/{account}/orders{/sequence}",
      "account_orders_active_browse":   ".../api/v1/accounts/{account}/orders{?base_currency,counter_currency,buy_only,sell_only}",
      "account_orders_historical":      ".../api/v1/accounts/{account}/orders{?start_ledger,end_ledger,earliest_first,base_currency,counter_currency,buy_only,sell_only,results_per_page,page}"
      "orderbook":                      ".../api/v1/orders/{base_currency}/{base_issuer}/{counter_currency}/{counter_issuer}{?buy_only,sell_only}"
      "server_info":                    ".../api/v1/server",
      "server_connected":               ".../api/v1/server/connected",
      "uuid_generator":                 ".../api/v1/uuid"
    },
    "POST": {
      "account_settings_change":        ".../api/v1/accounts/{account}/settings",
      "payment_submission":             ".../api/v1/payments",
      "order_submission":               ".../api/v1/orders",
      "trustline_change":               ".../api/v1/trustlines"
    },
    "DELETE": {
      "order_cancellation":             ".../api/v1/accounts/{account}/orders{/sequence}"
    }
  }
}
```

### Changes from previous spec

The main change from the previous `ripple-rest` spec is the replacement of the `Notification` object and `next_notification` endpoint with simpler endpoints allowing direct access to the various transaction and resource types. To monitor for incoming payments one can just poll the `.../payments/incoming` endpoint, which will return a list of payments. The two proposed options (which are not mutually exclusive) for confirming that an outgoing payment has been validated are outlined in the next section.

### Payment Submission Options

Irrespective of the option(s) chosen, `.../api/v1/accounts/{account}/payments/quotes` will return `Payment` objects with the `source_transaction_id` already set with a UUID. If clients want to construct their own `Payment` objects they can get UUIDs for them from the `.../api/v1/uuid` endpoint, if they generate them programmatically in their application

#### Option 1: Monitor Pending and Validated Payments

1. Submit a payment to `.../api/v1/payments` with `source_transaction_fee` set to identify it in the following lists
2. Response to POST request contains error or an okay message
3. Payment immediately appears in the list at `.../api/v1/accounts/{account}/payments/pending`
4. When payment is validated it appears in the list at `.../api/v1/accounts/{account}/payments/outgoing`
5. To poll for validated outgoing payments client can use query string parameter `?start_ledger=...` and continuously check for newly validated payments after a specific ledger index

#### Option 2: Montior Specific Status URL

1. Submit a payment to `.../api/v1/payments` with `source_transaction_fee` set
2. Response from POST request includes an error message or a `"status_url":".../api/v1/accounts/{account}/payments/{source_transaction_id}"` (whether or not the POST response is received, this URL can be used with the `source_transaction_id` to get information about the payment)
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

### Schemas

#### RippleAddress

```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "RippleAddress",
  "description": "A Ripple account address",
  "type": "string",
  "pattern": "r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{26,34}"
}
```

#### FloatString
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "FloatString",
  "description": "A string representation of a floating point number",
  "type": "string",
  "pattern": "^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$"
}
```

#### UINT32
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "UINT32",
  "description": "A string representation of an unsigned 32-bit integer (0-4294967295)",
  "type": "string",
  "pattern": "^(429496729[0-5]|42949672[0-8]\d|4294967[01]\d{2}|429496[0-6]\d{3}|42949[0-5]\d{4}|4294[0-8]\d{5}|429[0-3]\d{6}|42[0-8]\d{7}|4[01]\d{8}|[1-3]\d{9}|[1-9]\d{8}|[1-9]\d{7}|[1-9]\d{6}|[1-9]\d{5}|[1-9]\d{4}|[1-9]\d{3}|[1-9]\d{2}|[1-9]\d|\d)$"
}
```

#### Hash256
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Hash256",
  "description": "The hex representation of a 256-bit hash",
  "type": "string",
  "pattern": "^[A-Fa-f0-9]{64}$"
}
```

#### Hash128
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Hash128",
  "description": "The hex representation of a 128-bit hash",
  "type": "string",
  "pattern": "^[A-Fa-f0-9]{32}$"
}
```

#### Timestamp
```js
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Timestamp",
  "description": "An ISO 8601 combined date and time timestamp",
  "type": "string",
  "pattern": "^\d{4}-[0-1]\d-[0-3][\d]T(2[0-3]|[01]\d):[0-5]\d:[0-5]\d\+(2[0-3]|[01]\d):[0-5]\d$"
```

#### ResourceId
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "ResourceId",
  "description": "A client-supplied unique identifier (ideally a UUID) for this transaction used to prevent duplicate payments and help confirm the transaction's final status. All ASCII printable characters are allowed",
  "type": "string",
  "pattern": "^[ !\"#$%&'\(\)\*\+,\-\.\/0-9:;<=>\?@A-Z\[\\\]\^_`a-z\{\|\}~]{1,255}$"
}
```

#### URL
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "URL",
  "description": "A standard URL",
  "type": "string",
  "pattern": "^(ftp:\/\/|http:\/\/|https:\/\/)?(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!-\/]))?$"
}
```

#### Currency
```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Currency",
  "description": "The three-character code used to denote currencies",
  "type": "string",
  "pattern": "^[a-zA-Z]{3}$"
}
```

#### Amount
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

#### Account Settings

TODO

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
      "description": "The optional hash of the public key for verifying transactions",
      "$ref": "RippleAddress"
      <!-- TODO: Is this type actually a Ripple address? That's what the wiki says but it sounds odd -->
    },
    "owner_url": {
      "description": "The domain associated with this account. The ripple.txt file can be looked up to verify this information",
      "$ref": "URL"
    },
    "email_hash": {
      "description": "The MD5 128-bit hash of the account owner's email address",
      "$ref": "Hash128"
    },
    <!-- "message_public_key": {
      // TODO: What is the type of this?
    }, -->
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

#### Payment

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
      "description": "The state of the payment from the perspective of the Ripple Ledger. Possible values are \"validated\" and \"failed\"",
      "type": "string",
      "pattern": "^validated|failed$" 
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
  "required": ["source_account", "destination_account", "destination_amount", "source_transaction_id"]
}
```

#### Trustline

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
    <!-- "account_authorized": {
      "description": ""
    },
    "counterparty_authorized": {
      TODO
    },
    "allow_rippling": {

    }, -->
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

#### Order


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

##### Priority Ranking of Currencies

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

