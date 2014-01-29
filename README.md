# `ripple-simple.js`

A simplified interface to the Ripple network through a Javascript library and RESTful API.


## Installation

1. Clone repository 
2. `npm install`
3. `node app.js`

## Testing

`grunt test`

## Available API Routes

A sample version of the API can be found at `http://ripple-simple.herokuapp.com`. Please note that all data is transmitted insecurely so you should __only submit transactions on test accounts__. Sending your account secret over an unencrypted connection is a very bad idea.

### GET /api/v1/status

Response:
`connected` or `disconnected`



### GET /api/v1/addresses/:address/txs/:tx_hash

Gets a particular transaction in the standard Ripple transaction JSON format



### POST /api/v1/addresses/:address/txs/

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

Note: save the `confirmation_token` to check for transaction confirmation by matching that against new `notification`s.


### GET /api/v1/addresses/:address/next_notification

Get the most recent notification for a particular account. See next route details for response format.

### GET /api/v1/addresses/:address/next_notification/:prev_tx_hash

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

### GET /api/v1/addresses/:address/payments/:tx_hash

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

### POST /api/v1/addresses/:address/payments

Submit a payment in the simplified format.

Request JSON:
```js
{
  src_address: "r...",
  // src_tag: ",
  dst_address: "r...",
  // dst_tag: ",
  // src_amount: {
  //   value: ".0001",
  //   currency: "USD",
  //   issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
  // },
  // src_slippage: "0.00005",
  dst_amount: {
    value: ".001",
    currency: "XRP",
    issuer: "
  },
  // flag_partial_payment: true,
  // flag_no_direct_ripple: true,
  secret: "s..."
}
```

Response:
```js
{
    "success": true,
    "confirmation_token": "55BA3440B1AAFFB64E51F497EFDF2022C90EDB171BBD979F04685904E38A89B7"
}
```

Note: save the `confirmation_token` to check for transaction confirmation by matching that against new `notification`s.





