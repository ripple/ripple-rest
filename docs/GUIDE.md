# `ripple-rest` Guide

`ripple-rest` provides a simple mechanism for robustly submitting payments and definitively confirming the state of outgoing and incoming payments. Future versions of this API will also provide support for managing Addresses and Trustlines, as well as submitting trade Orders.

This is a guided introduction for setting up an application to use the `ripple-rest` API.

Before starting, please read the [API Reference](REF.md) sections on the [__Differences from standard Ripple data formats__](REF.md#differences-from-standard-ripple-data-formats) and the [__Object Formats__](REF.md#object-formats).

----------


`ripple-rest` users should implement the following application logic:

1. [__Add new payments to a pending payments database table__](#1-add-new-transactions-to-a-pending-payments-database-table)
  + [Minimal schema for pending payments table](#minimal-schema-for-pending-payments-table)
  + [Full schema for the pending payments table](#full-schema-for-the-pending-payments-table)
2. [__Check the state of the `rippled` connection__](#2-check-the-state-of-the-rippled-connection)
3. [__Poll for new Notifications and handle confirmation of incoming and outgoing payments__](#3-poll-for-and-handle-notifications-of-incoming-and-outgoing-payments)
  + [Polling for `Notification`s](#polling-for-notifications)
  + [Confirming outgoing `Payment`s](#confirming-outgoing-payments-with-notifications)
  + [Listening for incoming `Payment`s](#listening-for-incoming-payments)
4. [__Submit pending payments to `ripple-rest`__](#4-submit-pending-payments-to-ripple-rest)
  + [Robust payment submission](#robust-payment-submission)
  + [Preventing duplicate payments](#preventing-duplicate-payments)

----------

### 1. Add new transactions to a pending payments database table

`ripple-rest` users should maintain a table of pending outgoing payments. This table will record all payments submitted to `ripple-rest` and note changes in the status of each payment.

The field names used here are different than those used in `rippled` and `ripple-lib`, please see the [API Reference](REF.md) sections on the [__Differences from standard Ripple data formats__](REF.md#differences-from-standard-ripple-data-formats) and the [Payment](REF.md#2-payment) for more information.

#### Minimal schema for pending payments table

At a minimum, the pending payments table should have the following columns, all of which are strings except for the `Amount` objects.

These columns will be written to upon payment creation and submission:

+ `source_transaction_id` - This is a required user-generated ID that should be used to match payments submitted with payments confirmed as validated in new `Notification`s (continue reading for more information on `Notification`s). This value must be a string comprised of [ASCII printable characters](http://en.wikipedia.org/wiki/ASCII#ASCII_printable_characters), most commonly A-Z, a-z, 0-9, hyphens (-), and colons (:). We recommend using [UUIDs](http://en.wikipedia.org/wiki/Universally_unique_identifier)
+ `destination_address` - The Ripple address of the recipient
+ `destination_amount` - `ripple-rest` uses an [`Amount`](REF.md#1-amount) object, but you may wish to break this field out into `destination_amount_value`, `destination_amount_currency`, and `destination_amount_issuer`, all of which will be strings
+ `state` - This represents the state of the transaction and should be updated upon creation (`new`), submission (`pending`), and confirmation of validation (`validated`) or failure (`failed`) based `state` field of the `Notification` seen later corresponding to this payment (continue reading for more information on `Notification`s)

The following columns should be written to directly with the values seen in the `Notification` corresponding to this payment:

+ `result` - This is the code used by `rippled` and `ripple-lib` to denote the success of a transaction or the problem that caused it to fail. `tesSUCCESS` is the only code that indicates the transaction was successfully validated and written into the Ripple Ledger. The first three characters of each of the other types of code denote the class of error that the problem belongs to. The `tec` prefix indicates that the transaction failed after it was submitted to the network and a network fee was claimed. All other prefixes indicate that the transaction failed before being submitted to the network, but the vast majority of these should be returned immediately when a transaction is submitted, rather than showing up in `Notification`s later
+ `ledger` - The index number of the ledger containing the transaction, which is useful for looking up the details of the transaction later
+ `hash` - The unique hash of the transaction. This is used throughout the Ripple protocol as the key identifier for any transaction
+ `timestamp_human` - The ISO-formatted combined date and time (in UTC) string when the transaction was written into the Ripple Ledger. It follows the format: `2014-02-26T22:50:34+00:00` for February 26th, 2014 at 22:50:34 (UTC)

#### Full schema for the pending payments table

Please see the API Reference section on the [`Payment`](REF.md#2-payment) format for the complete list of fields. Users who will want to use this table to recreate and resubmit `Payment` objects should store all of the fields as columns in this table.


----------

### 2. Check the state of the `rippled` connection

Make a simple call to `ripple-rest`'s [`/api/v1/server/connected`]. This endpoint will return either `true` or `false`, indicating whether `ripple-rest` has successfully connected to a `rippled` and is ready to serve.

----------

### 3. Poll for and handle notifications of incoming and outgoing payments

The `Notification` is a new data type introduced by this API to help users monitor for new activity related to their Ripple address. See the [API Reference](REF.md) for the complete explanation of the [`Notification`](REF.md#3-notification) object and details on all of its fields.

#### Polling for `Notification`s

`Notifications` are obtained by querying `ripple-rest`'s [`GET /api/v1/addresses/:address/next_notification/:prev_hash`](#get-apiv1addressesaddressnext_notificationprev_hash) endpoint. The `prev_hash` is the `hash` value of the last transaction you heard about. If the endpoint is queried with no `prev_hash`, it will respond with a `Notification` corresponding to the earliest transaction stored in the connected `rippled`'s database. Note that if you have just started your `rippled` or recently deleted its historical databases the first `Notification` will be an "empty" one (continue reading for details).

Each `Notification` contains a `next_notification_url` that can be followed to help make the polling process simpler.

Let's say that my address is `rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r` and the hash of the last transaction I know about was `39E4563A175AA9A8071D2F15ACD337B1D39F272195E5E20532DB40A81EB9A5FF`. I'll query the following URL: `https://ripple-rest.herokuapp.com/api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification/39E4563A175AA9A8071D2F15ACD337B1D39F272195E5E20532DB40A81EB9A5FF`

And I see:
```js
{
    "success": true,
    "notification": {
        "address": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
        "type": "payment",
        "direction": "outgoing",
        "state": "validated",
        "result": "tesSUCCESS",
        "ledger": 4350649,
        "hash": "DFD9A76A5AB01D805AA1CD205DEA31D42866A2F81C4FBA14D1A205203433028C",
        "timestamp": 1389351530000,
        "timestamp_human": "2014-01-10T10:58:50.000Z",
        "url": "http://ripple-rest.herokuapp.com/api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/payments/DFD9A76A5AB01D805AA1CD205DEA31D42866A2F81C4FBA14D1A205203433028C",
        "next_notification_url": "http://ripple-rest.herokuapp.com/api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification/DFD9A76A5AB01D805AA1CD205DEA31D42866A2F81C4FBA14D1A205203433028C",
        "source_transaction_id": "fd4d7ee8-3a20-458e-a47b-235fc0d12d1a"
    }
}
```

If follow the `next_notification_url` provided and there is another transaction affecting my address I'll see another `Notification` in exactly the same format, but with values that correspond to the transaction following `DFD9A76A5AB01D805AA1CD205DEA31D42866A2F81C4FBA14D1A205203433028C`.

If there are no new `Notification`s of transactions affecting my address I'll see a response that looks like this:
```js
{
    "success": true,
    "notification": {
        "address": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
        "type": "none",
        "direction": "",
        "state": "empty",
        "result": "",
        "ledger": "",
        "hash": "",
        "timestamp": "",
        "timestamp_human": "",
        "transaction_url": "",
        "next_notification_url": "http://ripple-rest.herokuapp.com/api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification/3739745646D2090100513340AA687C5C4E6685DE8CEDAD76EFCBD573B94C41C8",
        "source_transaction_id": ""
    }
}
```

When the `type` is `none` I know that there are no new `Notification`s and I'll wait 1-5 seconds (depending on how quickly I need to process new transactions). The `state` will be `pending` if there are any outgoing transactions pending for my address, otherwise it will be `empty`.


#### Confirming Outgoing `Payment`s

The `source_transaction_id` should be used to match pending `Payment`s against transactions that have been validated and written into the Ripple Ledger.

__All `Payment`s that are submitted to `ripple-rest` without immediately reporting an error will appear as a `Notification`, with a `state` of `validated` or `failed`,  within 10 ledgers.__

Let's consider the sample `Notification` from the previous section (the non-empty one). The `source_transaction_id` is `fd4d7ee8-3a20-458e-a47b-235fc0d12d1a`. I'll look up that entry in my application's database and once I've located it I can write the final status of that transaction into my database.

The most important fields to consider, aside from the `source_transaction_id`, are the `state` and the `result`. If the `state` is `validated`, then I know my `Payment` has been executed and written into the Ripple Ledger. If it is `failed` I know that the `Payment` did not go through and I must take some action to modify and resubmit it. If the `state` is `failed`, I can look at the `result` field, which will have the `rippled` code for the specific problem that caused my `Payment` to fail (e.g. if I did not have sufficient funds to complete the payment I will see `tecPATH_PARTIAL`).

If I want to see the full final details of the `Payment`, including exactly how much money left my address and ended up with the recipient, I can follow the `transaction_url`.


#### Listening for incoming `Payment`s

If someone has sent me money, a `Notification` in the following form will be returned soon after when I query `next_notification`:

```js
{
    "success": true,
    "notification": {
        "address": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
        "type": "payment",
        "direction": "incoming",
        "state": "validated",
        "result": "tesSUCCESS",
        "ledger": 5085783,
        "hash": "56D7B6A2EE3ACF68665849B383CC2630E5B6CD3ABE9AAE6F61C302A083AA6049",
        "timestamp": 1392847080000,
        "timestamp_human": "2014-02-19T21:58:00.000Z",
        "transaction_url": "http://ripple-rest.herokuapp.com/api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/payments/56D7B6A2EE3ACF68665849B383CC2630E5B6CD3ABE9AAE6F61C302A083AA6049",
        "next_notification_url": "http://ripple-rest.herokuapp.com/api/v1/addresses/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/next_notification/56D7B6A2EE3ACF68665849B383CC2630E5B6CD3ABE9AAE6F61C302A083AA6049",
        "source_transaction_id": ""
    }
}
```

I know I'll need to handle this notification because I see the `type` is a `payment`, the `direction` is `incoming` and the `state` is `validated`. To get the full details I'll follow the `transaction_url`:
```js
{
    "success": true,
    "payment": {
        "source_address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
        "source_tag": "",
        "source_transaction_id": "",
        "source_amount": {
            "value": "0.062888",
            "currency": "XRP",
            "issuer": ""
        },
        "source_slippage": "0",
        "destination_address": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
        "destination_tag": "",
        "destination_amount": {
            "currency": "USD",
            "issuer": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
            "value": "0.001"
        },
        "destination_slippage": "0",
        "invoice_id": "",
        "paths": "[[{\"currency\":\"USD\",\"issuer\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rE8L4Kbz1PoUQR7aqWWDK1muGBrTQ47Vrc\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rnziParaNb8nsU4aruQdwYE3j5jUcqjzFm\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
        "no_direct_ripple": false,
        "partial_payment": false,
        "direction": "incoming",
        "state": "confirmed",
        "result": "tesSUCCESS",
        "ledger": 5085783,
        "hash": "56D7B6A2EE3ACF68665849B383CC2630E5B6CD3ABE9AAE6F61C302A083AA6049",
        "timestamp": "1392847080000",
        "timestamp_human": "2014-02-19T21:58:00+00:00",
        "fee": "0.000012",
        "source_balance_changes": [{
            "value": "-0.0629",
            "currency": "XRP",
            "issuer": ""
        }],
        "destination_balance_changes": [{
            "value": "0.00099999999999999",
            "currency": "USD",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
        }]
    }
}
```
See the [API Reference](REF.md) for complete details on the [`Payment`](REF.md#2-payment) object.

Before I process this payment as received I'll check the `destination_balance_changes` to ensure that I've been paid at least as much as I expected. If the `partial_payment` flag is set to `true`, payments can be validated even if they only deliver a part of the `destination_amount`. The `source_balance_changes` and `destination_balance_changes` fields have been parsed from the Ripple transaction metadata, which contains the definitive record of how the balances of the sender and receiver were changed.

Once I have checked who sent this payment, double-checked that it was `validated` and that the full amount I expected was delivered, I will pass this off to the non-Ripple part of my application that deals with payments received.  

----------

### 4. Submit pending payments to `ripple-rest`

#### Robust payment submission

`ripple-rest` provides access to `ripple-lib`'s robust transaction submission processes. This means that it will set the fee, manage the transaction sequence numbers, sign the transaction with your secret, and resubmit the transaction up to 10 times if `rippled` reports an initial error that can be solved automatically.

Each of the pending payments should be POSTed to `ripple-rest`'s [`/api/v1/addresses/:address/payments`](REF.md#post-apiv1addressesaddresspayments) endpoint with the body formatted as JSON in the following manner:

```js
{
  "secret": "s...",
  "payment": { /* Payment object */ }
}
```

The `secret` is the secret key corresponding to your Ripple address. __DO NOT__ submit this over insecure connections or to `ripple-rest` servers you do not control.

See the [__API Reference__](REF.md) for the full details of the [`Payment`](REF.md#2-payment) object fields.

#### Preventing duplicate payments

`ripple-rest` uses the `source_transaction_id` to prevent duplicate payments.

The `source_transaction_id` is __STORED IN `ripple-rest`'s LOCAL DATABASE__, not in the transaction record on the Ripple Network. The value is saved when a transaction is submitted to `ripple-rest`, but before the transaction is passed to the `rippled`. If another transaction of the same type (i.e. `Payment`, `Order`, etc.) is submitted by the same `source_address` with the same `source_transaction_id`, __ONLY ONE WILL BE SUBMITTED__ to `rippled`.

Even if upon submitting a payment to `ripple-rest` you get no response or confirmation that the request has been received, you can __RESUBMIT THE PAYMENT WITHOUT FEAR__ of two duplicate payments going through. In fact, if you do not get a response from the POST we recommend resubmitting the payment.

The `source_transaction_id` will be __STORED ONLY UNTIL AFTER THE NEXT NOTIFICATION__ is requested. 

Let's say you have transactions A, B, and C. You query for the next `Notification` after A and you get the one corresponding to transaction B. You can query `ripple-rest` for the next `Notification` after A as many times as you like (e.g. if your server goes offline without having stored the state change for B) and you will always get the same response, with the `source_transaction_id` attached. However, as soon as you ask for the next `Notification` after B, the database entry for transaction A will be deleted from `ripple-rest`'s database. When you ask for the `Notification` after transaction C, the entry for transaction B will be delted from the database. You can and should store this information more permanently in your application's database, but should not rely on `ripple-rest` to store the `source_transaction_id`s forever.

Future versions of this API may store the `source_transaction_id` in the transaction record on the Ripple Network, but it is important to note that this version does not. For now this also means that `ripple-rest`'s ability to prevent duplicate payments only applies to payments submitted to a single `ripple-rest` instance. This version of `ripple-rest` is __NOT INTENDED TO WORK AS A CLUSTER__.









