
### API

/api/v1
```js
{
  "accounts_url":                   ".../api/v1/accounts/{account}",
  "ledgers_url":                    ".../api/v1/ledgers/{ledger_index}",
  "server_info_url":                ".../api/v1/server",
  "account_balances_url":           ".../api/v1/accounts/{account}/balances",
  "account_payments_url":           ".../api/v1/accounts/{account}/payments",
  "account_payments_outgoing_url":  ".../api/v1/accounts/{account}/payments/outgoing",
  "account_payments_incoming_url":  ".../api/v1/accounts/{account}/payments/incoming",
  "account_payment_quotes_url":     ".../api/v1/accounts/{account}/payments/quotes",
  "account_payment_submission_url": ".../api/v1/accounts/{account}/payments"
  "account_orders_url":             ".../api/v1/accounts/{account}/orders",
  "account_order_submission_url":   ".../api/v1/accounts/{account}/orders"
  "account_trustlines_url":         ".../api/v1/accounts/{account}/trustlines"
}
```

### Accounts

/api/v1/accounts/{account}
```js
{
  "account":                "{account}",
  "balances_url":           ".../api/v1/accounts/{account}/balances",
  "payments_url":           ".../api/v1/accounts/{account}/payments",
  "payments_outgoing_url":  ".../api/v1/accounts/{account}/payments/outgoing",
  "payments_incoming_url":  ".../api/v1/accounts/{account}/payments/incoming",
  "payment_quotes_url":     ".../api/v1/accounts/{account}/payments/quotes",
  "payment_submission_url": ".../api/v1/accounts/{account}/payments"
  "orders_url":             ".../api/v1/accounts/{account}/orders",
  "order_submission_url":   ".../api/v1/accounts/{account}/orders"
  "trustlines_url":         ".../api/v1/accounts/{account}/trustlines"
}
```

### Balances

/api/v1/accounts/{account}/balances
```js
[
  {
    "value": "100",
    "currency": "XRP",
    "issuer": ""
  },
  {
    "value": "35",
    "currency": "USD",
    "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
  }
]
```

### Payments

/api/v1/accounts/{account}/payments
/api/v1/accounts/{account}/payments/incoming
/api/v1/accounts/{account}/payments/outgoing
```js
[
  {
    "source_account": "{account}",
    "destination_account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
    "source_amount": {
      "value": "50",
      "currency": "XRP",
      "issuer": ""
    },
    "destination_amount": {
      "value": "1",
      "currency": "USD",
      "issuer": ""
    }
  }
]
```

Query string parameters can filter results:

/api/v1/accounts/{account}/payments?limit=10&descending=true
/api/v1/accounts/{account}/payments?start=2014-02-01T00:00:00+00:00&end=2014-02-28T00:00:00+00:00

Or you can look for a specifig result:

...by UUID...

/api/v1/accounts/{account}/payments/5e018001-880c-4520-bb3a-5afc268c8008

...or by hash...

/api/v1/accounts/{account}/payments/46A680AB1683DF4E9E740C0C39117B798DF4B1A61FEF21E18DBA1F47740DBFD9

#### Submitting a Payment

POST /api/v1/accounts/{account}/payments

Request
```js
{
  /* ... */
  "source_transaction_id": "5e018001-880c-4520-bb3a-5afc268c8008"
}
```
Response
```js
{
  "success": true,
  "status_url": "/api/v1/accounts/{account}/payments/5e018001-880c-4520-bb3a-5afc268c8008"
}
```

/api/v1/accounts/{account}/payments/5e018001-880c-4520-bb3a-5afc268c8008
```js
{
  "status": "queued",
  "source_transaction_id": "5e018001-880c-4520-bb3a-5afc268c8008"
  /* ... */
}
```
...after 2 seconds...
```js
{
  "status": "pending",
  "source_transaction_id": "5e018001-880c-4520-bb3a-5afc268c8008"
  /* ... */
}
```
...after another 10 seconds...
```js
{
  "status": "validated",
  "source_transaction_id": "5e018001-880c-4520-bb3a-5afc268c8008"
  /* ... */
}
```
...after any amount of time (until you delete the database)...
```js
{
  "status": "validated",
  "source_transaction_id": "5e018001-880c-4520-bb3a-5afc268c8008"
  /* ... */
}
```

#### Getting a Payment Quote (i.e. Ripple Path Find)

/api/v1/accounts/{account}/payments/quotes/{destination_account}/{destination_amount}
```js
[
  {
    /* XRP Payment */
  },
  {
    /* USD Payment */
  }
]
```

### Orders

/api/v1/accounts/{account}/orders
```js
[
  {
    /* Outstanding Order */
  },
  {
    /* Outstanding Order */
  }
]
```

Filter results with query string parameters:

/api/v1/accounts/{account}/orders?bid_currency=USD
/api/v1/accounts/{account}/orders?ask_currency=XRP
/api/v1/accounts/{account}/orders?limit=10&descending=true
/api/v1/accounts/{account}/payments?start=2014-02-01T00:00:00+00:00&end=2014-02-28T00:00:00+00:00

__[Can you look up old orders?]__

### Trustlines
