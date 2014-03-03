
### API

/api/v1
```js
{
  "endpoints": {
    "GET": {
      "accounts":                     ".../api/v1/accounts/{account}",
      "account_settings":             ".../api/v1/accounts/{account}/settings",
      "account_balances":             ".../api/v1/accounts/{account}/balances{?currency,issuer,page}",
      "account_payments":             ".../api/v1/accounts/{account}/payments{/hash,source_transaction_id}",
      "account_payments_browse":      ".../api/v1/accounts/{account}/payments{?start_ledger,end_ledger,source_account,destination_account,latest_first,page}"
      "account_payments_outgoing":    ".../api/v1/accounts/{account}/payments/outgoing{?start_ledger,end_ledger,destination_account,latest_first,page}",
      "account_payments_incoming":    ".../api/v1/accounts/{account}/payments/incoming{?start_ledger,end_ledger,source_account,latest_first,page}",
      "account_payments_pending":     ".../api/v1/accounts/{account}/payments/pending",
      "account_payment_quote_send":   ".../api/v1/accounts/{account}/payments/quotes/send/{destination_account}/{destination_amount}",
      "account_payment_quote_pay":    ".../api/v1/accounts/{account}/payments/quotes/pay/{destination_account}/{source_amount}",
      "account_trustlines":           ".../api/v1/accounts/{account}/trustlines{?currency,counterparty}",
      "account_orders_active":        ".../api/v1/accounts/{account}/orders{/sequence}",
      "account_orders_active_browse": ".../api/v1/accounts/{account}/orders{?buy_currency,sell_currency}",
      "orderbook":                    ".../api/v1/orders/{buy_currency}/{buy_issuer}/{sell_currency}/{sell_issuer}"
      "server_info":                  ".../api/v1/server",
      "server_connected":             ".../api/v1/server/connected",
      "uuid_generator":               ".../api/v1/uuid"
    },
    "POST": {
      "account_settings_change":      ".../api/v1/accounts/{account}/settings",
      "payment_submission":           ".../api/v1/payments",
      "order_submission":             ".../api/v1/orders",
      "trustline_change":             ".../api/v1/trustlines"
    },
    "DELETE": {
      "order_cancellation":           ".../api/v1/accounts/{account}/orders{/sequence}"
    }
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

#### Timestamp
```js
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Timestamp",
  "description": "An ISO 8601 combined date and time timestamp",
  "type": "string",
  "pattern": "^\d{4}-[0-1]\d-[0-3][\d]T(2[0-3]|[01]\d):[0-5]\d:[0-5]\d\+(2[0-3]|[01]\d):[0-5]\d$"
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
      "type": "string",
      "pattern": "^[a-zA-Z]{3}$"
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
    "owner_url": {

    },
    "email_hash": {

    },
    "message_public_key": {
      
    },
    "require_destination_tag_for_incoming_payments": {

    },
    "require_authorization_for_incoming_trustlines": {

    },
    "allow_xrp_payments": {

    },

  },
  "required": []
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
    "source_transaction_id": {
      "description": "A client-supplied unique identifier (ideally a UUID) for this transaction used to prevent duplicate payments and help confirm the transaction's final status",
      "type": "string",
      "pattern": "^[ -~]{1,255}"
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

TODO

```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Trustline",
  "description": "A simplified Trustline object used by the ripple-rest API",
  "type": "object",
  "properties": {

  },
  "required": []
}
```

#### Order

TODO

```js
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Order",
  "description": "A simplified Order object used by the ripple-rest API (note that \"orders\" are referred to elsewhere in the Ripple protocol as \"offers\")",
  "type": "object",
  "properties": {
    "seller_account": {
      "description": "The Ripple account address of the order's creator",
      "$ref": "RippleAddress"
    },
    "sell_amount": {
      "description": "The amount of currency being sold. If other orders take part of this one, this value will change to represent the amount left in the order",
      "$ref": "Amount"
    },
    "buy_amount": {
      "description": "The amount of currency the seller_account is seeking to buy. If other orders take part of this one, this value will change to represent the amount left in the order",
      "$ref": "Amount"
    },
    "millisecond_timeout": {
      "description": "A string representation of the number of milliseconds after submission during which the order should be considered active",
      "type": "string",
      "pattern": "^\d*$"
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
      "description": "If set to true this order will only take orders that fill the buy_amount and are available at the time of execution and will not create an entry in the Ripple Ledger",
      "type": "boolean"
    },
    "maximize_sell": {
      "description": "If set to true this order will sell up to the sell_amount, even if the amount bought exceeds the buy_amount",
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
    }
  },
  "required": ["buy_account", "buy_amount", "sell_amount"]
}
```

### Payment Submission Options

Irrespective of the option(s) chosen, `.../api/v1/accounts/{account}/payments/quotes` will return `Payment` objects with the `source_transaction_id` already set with a UUID. If clients want to construct their own `Payment` objects they can get UUIDs for them from the `.../api/v1/uuid` endpoint, if they generate them programmatically in their application

#### Option 1: Monitor Pending and Validated Payments

1. Submit a payment to `.../api/v1/payments` with `source_transaction_fee` set to identify it in the following lists
2. Payment immediately appears in the list at `.../api/v1/accounts/{account}/payments/pending`
3. When payment is validated it appears in the list at `.../api/v1/accounts/{account}/payments/outgoing`
4. To poll for validated outgoing payments client can use query string parameter `?start_ledger=...` and continuously check for newly validated payments after a specific ledger index

#### Option 2: Montior Specific Status URL

1. Submit a payment to `.../api/v1/payments` with `source_transaction_fee` set
2. Response from POST request includes `"status_url":".../api/v1/accounts/{account}/payments/{source_transaction_id}"` (whether or not the POST response is received, this URL can be used with the `source_transaction_id` to get information about the payment)
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
