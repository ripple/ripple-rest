# `ripple-rest`

A simplified RESTful API for interfacing with the [Ripple Network](http://ripple.com).


## Setup

A test version of the API can be found at [`https://ripple-rest.herokuapp.com`](https://ripple-rest.herokuapp.com). Even though it supports HTTPS connections, __only submit transactions from test accounts__, we make __NO GUARANTEES__ about the security of your secret keys on this server.

To install `ripple-rest` locally:

1. Clone repository (and make sure you have [`Node.js`](http://nodejs.org/) installed)
2. [Download](http://www.postgresql.org/download/) and install PostgreSQL and setup a user
3. `npm install -g db-migrate`
4. `db-migrate up -m db/migrations --config db/database.json`
5. `npm install`
6. Configure `config.json` to point to your `rippled`
7. `node server.js`



## Testing

`npm test`

## Bugs

__This API is still in beta.__ Please open issues for any problems you encounter.

## How to use this to send payments

This API can help you robustly submit payments and monitor for their definitive confirmation in the Ripple ledger.

Let's say my account is `rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r`.

1. `GET /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification`
  This retrieves the most recent `notification` on my account:
  ```js
  {
    "success": true,
    "notification": {
      "address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
      "type": "payment",
      "tx_direction": "incoming",
      "tx_state": "confirmed",
      "tx_result": "tesSUCCESS",
      "tx_ledger": 4716034,
      "tx_hash": "EC19E24AA51D39E809597A5DCF3A7E253F98C27FE3287CB919319A5C59AD8302",
      "tx_timestamp": 1391130630000,
      "tx_url": "http://ripple-rest.herokuapp.com:49598/api/v1/addresses/rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz/payments/EC19E24AA51D39E809597A5DCF3A7E253F98C27FE3287CB919319A5C59AD8302?in_ledger=4716034",
      "confirmation_token": ""
    }
  }
  ```
  If I want more information about that payment I can follow the link at `tx_url`. Otherwise I'll take the `tx_hash` and move to the next step.

2. `GET /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification/EC19E24AA51D39E809597A5DCF3A7E253F98C27FE3287CB919319A5C59AD8302`
  This retrieves the next `notification` on my account.

  If there is no next `notification` I'll see:
  ```js
  {
    "success": true,
    "notification": {
      "address": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
      "type": "none",
      "tx_direction": "",
      "tx_state": "empty",
      "tx_result": "",
      "tx_ledger": ,
      "tx_hash": "",
      "tx_timestamp": "",
      "tx_url": "",
      "confirmation_token": ""
    }
  }
  ```
  Because the `type` is `none` and the `tx_state` is `empty`, that means there is no next notification (yet) and there are no transactions pending in the outgoing queue. A `tx_state` of `pending` would indicate that there are still transactions waiting for confirmation.


  If I see there is no new `notification` I'll wait a second and then call the same command again.

3. `GET /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification/EC19E24AA51D39E809597A5DCF3A7E253F98C27FE3287CB919319A5C59AD8302`
  This time there is a new `notification` so I'll see:
  ```js
  {
    "success": true,
    "notification": {
      "address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
      "type": "payment",
      "tx_direction": "incoming",
      "tx_state": "confirmed",
      "tx_result": "tesSUCCESS",
      "tx_ledger": 4716041,
      "tx_hash": "8DFC1A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B",
      "tx_timestamp": 1391130660000,
      "tx_url": "http://ripple-rest.herokuapp.com:49598/api/v1/addresses/rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz/payments/8DFC1A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B?in_ledger=4716041",
      "confirmation_token": ""
    }
  }
  ```
  Now I'll leave my `next_notification` polling process continue while I go and submit a payment.

4. `GET /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/payments/options`
  This step is optional but I can call it before submitting a payment to have the Ripple network determine possible options for the payment I want to make.

  Let's say I want to send `rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz` 0.10 USD.
  I'll use these query string parameters for this command:
  `?src_address=rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r&dst_address=rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz&dst_amount=0.1+USD`

  And I see this in return:
  ```js
  {
    "success": true,
    "payments": [
      {
        "src_address": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
        "src_tag": "",
        "src_amount": {
          "value": "5.400726",
          "currency": "XRP",
          "issuer": ""
        },
        "src_slippage": "10",
        "dst_address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
        "dst_tag": "",
        "dst_amount": {
          "value": "0.1",
          "currency": "USD",
          "issuer": ""
        },
        "dst_slippage": "0",
        "invoice_id": "",
        "paths": [
          [
            {
              "currency": "USD",
              "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
              "type": 48,
              "type_hex": "0000000000000030"
            },
            {
              "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
              "type": 1,
              "type_hex": "0000000000000001"
            }
          ],
          [
            {
              "currency": "USD",
              "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
              "type": 48,
              "type_hex": "0000000000000030"
            },
            {
              "account": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
              "type": 1,
              "type_hex": "0000000000000001"
            },
            {
              "account": "rUjbzuRoQagHet3XnygZkfaTFTFkMoD3YG",
              "type": 1,
              "type_hex": "0000000000000001"
            },
            {
              "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
              "type": 1,
              "type_hex": "0000000000000001"
            }
          ],
          [
            {
              "currency": "USD",
              "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
              "type": 48,
              "type_hex": "0000000000000030"
            },
            {
              "account": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
              "type": 1,
              "type_hex": "0000000000000001"
            },
            {
              "account": "rBKV8bnCuYz9gj2CDaGi8WDvP4tX8p2mbc",
              "type": 1,
              "type_hex": "0000000000000001"
            },
            {
              "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
              "type": 1,
              "type_hex": "0000000000000001"
            }
          ],
          [
            {
              "currency": "USD",
              "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
              "type": 48,
              "type_hex": "0000000000000030"
            },
            {
              "account": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
              "type": 1,
              "type_hex": "0000000000000001"
            },
            {
              "account": "r3MeEnYZY9fAd5pGjAWf4dfJsQBVY9FZRL",
              "type": 1,
              "type_hex": "0000000000000001"
            },
            {
              "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
              "type": 1,
              "type_hex": "0000000000000001"
            }
          ]
        ],
        "flag_partial_payment": false,
        "flag_no_direct_ripple": false
      }
    ]
  }
  ```
  The `src_amount` field tells me that I'll need to send 5.400726 XRP to have `rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz` receive 0.10 USD.
  The `paths` field looks complicated but it is just the Ripple network's way of saying how 5.400726 XRP can be sent from my address and end up at the other address as 0.10 USD. You can treat that field as opaque.


  To submit this payment, I can modify some of the fields to add a `dst_tag`, `src_tag`, add `src_slippage` (to give it a little more wiggle room to go through in case the paths change before I send it), etc.
  If I had more currencies, I would see multiple `payment` objects come back in that `payments` array and I could pick whichever one I want to send.

5. `POST /api/v1/addresses/:address/txs/`
  Now I'll submit the following to this route:
  ```js
  {
    "payment": { /* The payment object I got from .../payments/options above */ },
    "secret": "s..."
  }
  ```
  The secret is my [account secret](https://ripple.com/blog/how-to-protect-your-account/). If I were to tell that to you, you would have full access to my money (though this is a test account so you wouldn't get much).
  __NEVER__ send your secret anywhere unencrypted and, if possible, __only submit transactions to a local version of this API__.


  In response I get:
  ```js
  {
    success: true
    confirmation_token: "81D48826FA84B0B83902CA3BFE49E2503A5BA1069B214D492AE6AB145B6C4781"
  }
  ```
  This means that my payment was submitted successfully. 
  To definitively confirm that it was written into the Ripple ledger, I just need to look for this `confirmation_token` in the output of `next_notification`.


6. `GET /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification/EC19E24AA51D39E809597A5DCF3A7E253F98C27FE3287CB919319A5C59AD8302`

  When I see a notification like this, where the `confirmation_token` matches what I was given on submission and the `tx_state` is `confirmed`, I know my payment went through:
  ```js
  {
    "success": true,
    "notification": {
      "address": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
      "type": "payment",
      "tx_direction": "outgoing",
      "tx_state": "confirmed",
      "tx_result": "tesSUCCESS",
      "tx_ledger": 4850743,
      "tx_hash": "81D48826FA84B0B83902CA3BFE49E2503A5BA1069B214D492AE6AB145B6C4781",
      "tx_timestamp": 1391792990000,
      "tx_url": "https://ripple-rest.herokuapp.com:49598/api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/payments/81D48826FA84B0B83902CA3BFE49E2503A5BA1069B214D492AE6AB145B6C4781?in_ledger=4850743",
      "confirmation_token": "81D48826FA84B0B83902CA3BFE49E2503A5BA1069B214D492AE6AB145B6C4781"
    }
  }
  ```
  To fetch the exact details of the transaction I can follow the `tx_url` link.

7. `GET /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/payments/81D48826FA84B0B83902CA3BFE49E2503A5BA1069B214D492AE6AB145B6C4781?in_ledger=4850743`
  This gets the details of the confirmed payment.

  ```js
  {
    "success": true,
    "payment": {
      "src_address": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
      "src_tag": "",
      "src_amount": {
        "value": "15.400726",
        "currency": "XRP",
        "issuer": ""
      },
      "src_slippage": "0",
      "dst_address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
      "dst_tag": "",
      "dst_amount": {
        "currency": "USD",
        "issuer": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
        "value": "0.1"
      },
      "dst_slippage": "0",
      "invoice_id": "",
      "paths": [
        [
          {
            "currency": "USD",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "type": 48,
            "type_hex": "0000000000000030"
          },
          {
            "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "type": 1,
            "type_hex": "0000000000000001"
          }
        ],
        [
          {
            "currency": "USD",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "type": 48,
            "type_hex": "0000000000000030"
          },
          {
            "account": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "type": 1,
            "type_hex": "0000000000000001"
          },
          {
            "account": "rUjbzuRoQagHet3XnygZkfaTFTFkMoD3YG",
            "type": 1,
            "type_hex": "0000000000000001"
          },
          {
            "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "type": 1,
            "type_hex": "0000000000000001"
          }
        ],
        [
          {
            "currency": "USD",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "type": 48,
            "type_hex": "0000000000000030"
          },
          {
            "account": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "type": 1,
            "type_hex": "0000000000000001"
          },
          {
            "account": "rBKV8bnCuYz9gj2CDaGi8WDvP4tX8p2mbc",
            "type": 1,
            "type_hex": "0000000000000001"
          },
          {
            "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "type": 1,
            "type_hex": "0000000000000001"
          }
        ],
        [
          {
            "currency": "USD",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "type": 48,
            "type_hex": "0000000000000030"
          },
          {
            "account": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "type": 1,
            "type_hex": "0000000000000001"
          },
          {
            "account": "r3MeEnYZY9fAd5pGjAWf4dfJsQBVY9FZRL",
            "type": 1,
            "type_hex": "0000000000000001"
          },
          {
            "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "type": 1,
            "type_hex": "0000000000000001"
          }
        ]
      ],
      "flag_no_direct_ripple": false,
      "flag_partial_payment": false,
      "tx_direction": "outgoing",
      "tx_state": "confirmed",
      "tx_result": "tesSUCCESS",
      "tx_ledger": 4850743,
      "tx_hash": "81D48826FA84B0B83902CA3BFE49E2503A5BA1069B214D492AE6AB145B6C4781",
      "tx_timestamp": 1391792990000,
      "tx_fee": "0.000016",
      "tx_src_bals_dec": [
        {
          "value": "-5.400742",
          "currency": "XRP",
          "issuer": ""
        }
      ],
      "tx_dst_bals_inc": [
        {
          "value": "0.1",
          "currency": "USD",
          "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
        }
      ]
    }
  }
  ```
  Notice that a number of fields have been added to what I originally submitted (all of those that start with `tx_...`).
  These tell me how the transaction actually appeared in the ledger, including how much money came out of my account (in `tx_src_bals_dec`, which includes the network fee).



## API Reference

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

__________

### 3. Generic Ripple Transactions

These are transactions formatted by [`ripple-lib`](https://github.com/ripple/ripple-lib/). The submission formats are determined by the [`ripple-lib` Transaction class](https://github.com/ripple/ripple-lib/blob/develop/src/js/ripple/transaction.js). The retrieval formats are documented on the [Ripple wiki](https://ripple.com/wiki/Transaction_Format).

Additional commands for this API are in development to reduce the need to use these Generic Ripple Transaction commands.

__________

#### GET /api/v1/addresses/:address/txs/:tx_hash

Gets a particular transaction in the standard Ripple transaction JSON format



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
  "error": "Cannot connect to the Ripple network. Please check your internet connection and server settings and try again.",
  "message": "Cannot connect to the Ripple network. Please check your internet connection and server settings and try again."
}
```

__________



