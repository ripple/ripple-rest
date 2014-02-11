# `ripple-rest` Guide

This guide walks through how you can use `ripple-rest` to submit a payment and monitor for its confirmation in the Ripple ledger.

See the [__API Reference__](REF.md) for details on all available API Routes.

----------

#### Steps:

1. [Checking the most recent notification](l#1-checking-the-most-recent-notification)
2. [Checking the next notification (when there is no new notification)](#2-checking-the-next-notification-when-there-is-no-new-notification)
3. [Checking the next notification (when there is a new notification)](#3-checking-the-next-notification-when-there-is-a-new-notification)
4. [Determining payment options (optional)](#4-determining-payment-options-optional)
5. [Submitting a payment](#5-submitting-a-payment)
6. [Checking for payment confirmation](#6-checking-for-payment-confirmation)
7. [Retrieving the details of a confirmed payment](#7-retrieving-the-details-of-a-confirmed-payment)

----------

#### 1. Checking the most recent notification

Command: `GET /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification`

Reference Link: [`GET /api/v1/addresses/:address/next_notification`](REF.md#get-apiv1addressesaddressnext_notification)

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
    "tx_url": "http://ripple-rest.herokuapp.com:49598/api/v1/addresses/rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz/payments/EC19E24AA51D39E809597A5DCF3A7E253F98C27FE3287CB919319A5C59AD8302?ledger=4716034",
    "next_notification_url": "http://ripple-rest.herokuapp.com:49598/api/v1/addresses/rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz/next_notification/EC19E24AA51D39E809597A5DCF3A7E253F98C27FE3287CB919319A5C59AD8302?ledger=4716034"
    "confirmation_token": ""
  }
}
```
(See the API Reference for details on the [`Notification` object format](REF.md#3-notification))

If I want more information about that payment I can follow the link at `tx_url`. Otherwise I'll follow the `next_notification_url` and move to the next step.


----------


#### 2. Checking the next notification (when there is no new notification)

Command: `GET /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification/EC19E24AA51D39E809597A5DCF3A7E253F98C27FE3287CB919319A5C59AD8302`

Reference Link: [`GET /api/v1/addresses/:address/next_notification/:prev_tx_hash`](REF.md#get-apiv1addressesaddressnext_notificationprev_tx_hash)

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
    "next_notification_url": "http://ripple-rest.herokuapp.com:49598/api/v1/addresses/rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz/next_notification/EC19E24AA51D39E809597A5DCF3A7E253F98C27FE3287CB919319A5C59AD8302?ledger=4716034",
    "confirmation_token": ""
  }
}
```
(See the API Reference for details on the [`Notification` object format](REF.md#3-notification))

Because the `type` is `none` and the `tx_state` is `empty`, that means there is no next notification (yet) and there are no transactions pending in the outgoing queue. A `tx_state` of `pending` would indicate that there are still transactions waiting for confirmation.


If I see there is no new `notification` I'll wait a second and then call the same command again.


----------


#### 3. Checking the next notification (when there is a new notification)

Command: `GET /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification/EC19E24AA51D39E809597A5DCF3A7E253F98C27FE3287CB919319A5C59AD8302`

Reference Link: [`GET /api/v1/addresses/:address/next_notification/:prev_tx_hash`](REF.md#get-apiv1addressesaddressnext_notificationprev_tx_hash)

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
    "tx_url": "http://ripple-rest.herokuapp.com:49598/api/v1/addresses/rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz/payments/8DFC1A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B?ledger=4716041",
    "next_notification_url": "http://ripple-rest.herokuapp.com:49598/api/v1/addresses/rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz/next_notification/8DFC1A7FBB60472CBEE9211D4DA44A5A42542729C9472D6B582302C77F31D95B?ledger=4716034",
    "confirmation_token": ""
  }
}
```
Now I'll leave my `next_notification` polling process continue while I go and submit a payment.


----------


#### 4. Determining payment options (optional)

Command: `GET /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/payments/options`

Reference Link: [`GET /api/v1/addresses/:address/payments/options`](REF.md#get-apiv1addressesaddresspaymentsoptions)

This step is optional but I can call it before submitting a payment to have the Ripple network determine possible options for the payment I want to make.

Let's say I want to send `rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz` 0.10 USD.
I'll use these query string parameters for this command:
`?dst_address=rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz&dst_amount=0.1+USD`

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
      "paths": "[[{\"currency\":\"USD\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rUjbzuRoQagHet3XnygZkfaTFTFkMoD3YG\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rBKV8bnCuYz9gj2CDaGi8WDvP4tX8p2mbc\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"r3MeEnYZY9fAd5pGjAWf4dfJsQBVY9FZRL\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
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


----------


#### 5. Submitting a payment

Command: `POST /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/payments/`

Reference Link: [`POST /api/v1/addresses/:address/payments`](REF.md#post-apiv1addressesaddresspayments)

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


----------


#### 6. Checking for payment confirmation

Command: `GET /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification/EC19E24AA51D39E809597A5DCF3A7E253F98C27FE3287CB919319A5C59AD8302`

Reference Link: [`GET /api/v1/addresses/:address/next_notification/:prev_tx_hash`](REF.md#get-apiv1addressesaddressnext_notificationprev_tx_hash)

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
    "tx_url": "https://ripple-rest.herokuapp.com:49598/api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/payments/81D48826FA84B0B83902CA3BFE49E2503A5BA1069B214D492AE6AB145B6C4781?ledger=4850743",
    "next_notification_url": "https://ripple-rest.herokuapp.com:49598/api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification/81D48826FA84B0B83902CA3BFE49E2503A5BA1069B214D492AE6AB145B6C4781?ledger=4850743"
    "confirmation_token": "81D48826FA84B0B83902CA3BFE49E2503A5BA1069B214D492AE6AB145B6C4781"
  }
}
```
To fetch the exact details of the transaction I can follow the `tx_url` link.



#### 7. Retrieving the details of a confirmed payment

Command: `GET /api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/payments/81D48826FA84B0B83902CA3BFE49E2503A5BA1069B214D492AE6AB145B6C4781?ledger=4850743`

Reference Link: [`GET /api/v1/addresses/:address/payments/:tx_hash`](REF.md#get-apiv1addressesaddresspaymentstx_hash)

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
    "paths": "[[{\"currency\":\"USD\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rUjbzuRoQagHet3XnygZkfaTFTFkMoD3YG\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rBKV8bnCuYz9gj2CDaGi8WDvP4tX8p2mbc\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"r3MeEnYZY9fAd5pGjAWf4dfJsQBVY9FZRL\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
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
(See the API Reference for details on the [`Payment` object format](REF.md#2-payment))

Notice that a number of fields have been added to what I originally submitted (all of those that start with `tx_...`).
These tell me how the transaction actually appeared in the ledger, including how much money came out of my account (in `tx_src_bals_dec`, which includes the network fee).