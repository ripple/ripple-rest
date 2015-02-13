# Ripple-REST API #

[![Build Status](https://travis-ci.org/ripple/ripple-rest.svg?branch=develop)](https://travis-ci.org/ripple/ripple-rest)
[![Coverage Status](https://coveralls.io/repos/ripple/ripple-rest/badge.png?branch=develop)](https://coveralls.io/r/ripple/ripple-rest?branch=develop)
[![Code Climate](https://codeclimate.com/github/ripple/ripple-rest.png)](https://codeclimate.com/github/ripple/ripple-rest)

[![NPM](https://nodei.co/npm/ripple-rest.png)](https://www.npmjs.org/package/ripple-rest)

The Ripple-REST API provides a simplified, easy-to-use interface to the Ripple Network via a RESTful API. This page explains how to use the API to send and receive payments on Ripple.

We recommend Ripple-REST for users just getting started with Ripple, since it provides high-level abstractions and convenient simplifications in the data format. If you prefer to access a `rippled` server directly, you can use [rippled's WebSocket or JSON-RPC APIs](https://ripple.com/build/rippled-apis/) instead, which provide the full power of Ripple at the cost of more complexity.


## Available API Routes ##

#### Accounts ####

* [Generate Wallet - `GET /v1/wallet/new`](#generate-wallet)
* [Get Account Balances - `GET /v1/accounts/{:address}/balances`](#get-account-balances)
* [Get Account Settings - `GET /v1/accounts/{:address}/settings`](#get-account-settings)
* [Update Account Settings - `POST /v1/accounts/{:address}/settings`](#update-account-settings)

#### Payments ####

* [Prepare Payment - `GET /v1/accounts/{:source_address}/payments/paths/{:destination_address}/{:amount}`](#prepare-payment)
* [Submit Payment - `POST /v1/accounts/{:source_address}/payments`](#submit-payment)
* [Confirm Payment - `GET /v1/accounts/{:address}/payments/{:id}`](#confirm-payment)
* [Get Payment History - `GET /v1/accounts/{:address}/payments`](#get-payment-history)

#### Orders ####

* [Place Order - `POST /v1/accounts/{:address}/orders`](#place-order)
* [Cancel Order - `DELETE /v1/accounts/{:address}/orders/{:sequence}`](#cancel-order)
* [Get Account Orders - `GET /v1/accounts/{:address}/orders`](#get-account-orders)
* [Get Order Book - `GET /v1/accounts/{:address}/order_book/{:base}/{:counter}`](#get-order-book)
* [Get Order Transaction - `GET /v1/accounts{:address}/orders/{:hash}`](#get-order)

#### Trustlines ####

* [Get Trustlines - `GET /v1/accounts/{:address}/trustlines`](#get-trustlines)
* [Grant Trustline - `POST /v1/accounts/{:address}/trustlines`](#grant-trustline)

#### Notifications ####

* [Check Notifications - `GET /v1/accounts/{:address}/notifications/{:id}`](#check-notifications)

#### Status ####

* [Check Connection - `GET /v1/server/connected`](#check-connection)
* [Get Server Status - `GET /v1/server`](#get-server-status)

#### Utilities ####

* [Retrieve Ripple Transaction - `GET /v1/transactions/{:id}`](#retrieve-ripple-transaction)
* [Retrieve Transaction Fee - `GET /v1/transaction-fee`](#retrieve-transaction-fee)
* [Generate UUID - `GET /v1/uuid`](#create-client-resource-id)



## API Overview ##

### Ripple Concepts ###

Ripple is a system for making financial transactions.  You can use Ripple to send money anywhere in the world, in any currency, instantly and for free.

In the Ripple world, each account is identified by a [Ripple Address](https://ripple.com/wiki/Account).  A Ripple address is a string that uniquely identifies an account, for example: `rNsJKf3kaxvFvR8RrDi9P3LBk2Zp6VL8mp`

A Ripple ___payment___ can be sent using Ripple's native currency, XRP, directly from one account to another.  Payments can also be sent in other currencies, for example US dollars, Euros, Pounds or Bitcoins, though the process is slightly more complicated.

Payments are made between two accounts, by specifying the ___source___ and ___destination___ address for those accounts.  A payment also involves an ___amount___, which includes both the numeric amount and the currency, for example: `100+XRP`.

When you make a payment in a currency other than XRP, you also need to include the Ripple address of the ___counterparty___.  The counterparty is the gateway or other entity who holds the funds on your behalf.  For non-XRP payments, the amount looks something like this: `100+USD+rNsJKf3kaxvFvR8RrDi9P3LBk2Zp6VL8mp`.

Although the Ripple-REST API provides a high-level interface to Ripple, there are also API methods for checking the status of the `rippled` server and retrieving a Ripple transaction in its native format.

### Sending Payments ###

Sending a payment involves three steps:

1. Generate the payment object with the [Prepare Payment method](#prepare-payment).  If the payment is not a direct send of XRP from one account to another, the Ripple system identifies the chain of trust, or ___path___, that connects the source and destination accounts, and includes it in the payment object.
2. Modify the payment object if desired, and then [submit it](#submit-payment) to the API for processing. *Caution:* Making many changes to the payment object increases the chances of causing an error.
3. Finally, ___confirm___ that the payment has completed, using the [Confirm Payment method](#confirm-payment). Payment submission is an asynchronous process, so payments can fail even after they have been submitted successfully.

When you submit a payment for processing, you assign a unique `client resource identifier` to that payment.  This is a string which uniquely identifies the payment, and ensures that you do not accidentally submit the same payment twice.  You can also use the `client_resource_id` to retrieve a payment once it has been submitted.

### Transaction Types ###

The Ripple protocol supports multiple types of transactions, not just payments. Transactions are considered to be any changes to the database made on behalf of a Ripple Address. Transactions are first constructed and then submitted to the network. After transaction processing, meta data is associated with the transaction which itemizes the resulting changes to the ledger.

 * Payment: A Payment transaction is an authorized transfer of balance from one address to another. (This maps to rippled's [Payment transaction type](transactions.html#payment))
 * Trustline: A Trustline transaction is an authorized grant of trust between two addresses. (This maps to rippled's [TrustSet transaction type](transactions.html#trustset))
 * Setting: A Setting transaction is an authorized update of account flags under a Ripple Account. (This maps to rippled's [AccountSet transaction type](transactions.html#accountset))
 
### Client Resource IDs ###

All Ripple transactions are identified by a unique hash, which is generated with the fields of the transaction. Ripple-REST uses an additional type of identifier, called a Client Resource ID, which is an arbitrary string provided at the time a transaction is submitted.

A client resource ID generally maps to one Ripple transaction. However, if Ripple-REST re-submits a failed transaction, the client resource ID can become associated with the new transaction, which may have slightly different properties (such as the deadline for it to succeed) and therefore a different transaction hash.

You can create client resource IDs using any method you like, so long as you follow some simple rules:

* Do not reuse identifiers. 
* A client resource ID cannot be a 256-bit hex string, because that is ambiguous with Ripple transaction hashes.
* Client resource IDs must be properly [encoded](http://tools.ietf.org/html/rfc3986#section-2.1) when provided as part of a URL.

You can use the [Create Client Resource ID](#create-client-resource-id) method in order to generate new Client Resource IDs.


## Using Ripple-REST ##

You don't need to do any setup to retrieve information from a public Ripple-REST server. Ripple Labs hosts a public Ripple-REST server here:

`https://api.ripple.com`

If you want to run your own Ripple-REST server, see the [installation instructions](#running-ripple-rest).

In order to submit payments or other transactions, you need an activated Ripple account. See the [online support](https://support.ripplelabs.com/hc/en-us/categories/200194196-Set-Up-Activation) for how you can create an account using the [Ripple Trade client](https://rippletrade.com/).

Make sure you know both the account address and the account secret for your account:

 * The *address* can be found by clicking the *Show Address* button in the __Fund__ tab of Ripple Trade
 * The *secret* is provided when you first create your account. **WARNING: If you submit your secret to a server you do not control, your account can be stolen, along with all the money in it.** We recommend using a test account with very limited funds on the public Ripple-REST server.

As a programmer, you will also need to have a suitable HTTP client that allows you to make secure HTTP (`HTTPS`) GET and POST requests. For testing, there are lots of options, including:

 * The [`curl`](http://curl.haxx.se/) commandline utility
 * The [Poster Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/poster/)
 * The [Postman Chrome extension](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm?hl=en)

You can also use the [REST API Tool](https://ripple.com/build/rest-tool/) here on the Dev Portal to try out the API.

[Try it! >](https://ripple.com/build/rest-tool/)

### Exploring the API ###

A REST API makes resources available via HTTP, the same protocol used by your browser to access the web. This means you can even use your browser to get a response from the API. Try visiting the following URL:

https://api.ripple.com/v1/server

The response should be a page with content similar to the following:

```js
{
  "rippled_server_url": "wss://s-west.ripple.com:443",
  "rippled_server_status": {
    "build_version": "0.23.0",
    "complete_ledgers": "5526705-6142138",
    "fetch_pack": 2004,
    "hostid": "NEAT",
    "last_close": {
      "converge_time_s": 2.005,
      "proposers": 5
    },
    "load_factor": 1,
    "peers": 55,
    "pubkey_node": "n9KmrBnGoyVf89WYdiAnvGnKFaVqjLdAYjKrBuvg2r8pMxGPp6MF",
    "server_state": "full",
    "validated_ledger": {
      "age": 1,
      "base_fee_xrp": 0.00001,
      "hash": "BADDAB671EF21E8ED56B21253123D2C74139FE34E12DBE4B1F5527772EC88494",
      "reserve_base_xrp": 20,
      "reserve_inc_xrp": 5,
      "seq": 6142138
    },
    "validation_quorum": 3
  },
  "success": true,
  "api_documentation_url": "https://github.com/ripple/ripple-rest"
}
```

If you want to connect to your own server, just replace the hostname and port with the location of your instance. For example, if you are running Ripple-REST locally on port 5990, you can access the same information at the following URL:

http://localhost:5990/v1/server

Since the hostname depends on where your chosen Ripple-REST instance is, the methods in this document are identified using only the part of the path that comes after the hostname.



# Running Ripple-REST #

## Quick Start ##

Ripple-REST requires [Node.js](http://nodejs.org/) and [sqlite 3](http://www.sqlite.org/). Before starting, you should make sure that you have both installed. 

Following that, use these instructions to get Ripple-REST installed and running:

1. Clone the Ripple-REST repository with git:
    `git clone https://github.com/ripple/ripple-rest.git`
2. Switch to the `ripple-rest` directory:
    `cd ripple-rest`
3. Use *npm* to install additional dependencies:
    `npm install`
4. Copy the example config file to `config.json`:
    `cp config-example.json config.json`
5. Start the server:
    `node server.js`
6. Visit [http://localhost:5990](http://localhost:5990) in a browser to view available endpoints and get started


## Configuring `ripple-rest` ##

The Ripple-REST server uses [nconf](https://github.com/flatiron/nconf) to load configuration options from several sources. Settings from sources earlier in the following hierarchy override settings from the later levels:

1. Command line arguments
2. Environment variables
3. The `config.json` file

The path to the `config.json` file can be specified as a command line argument (`node server.js --config /path/to/config.json`). If no path is specified, the default location for that file is Ripple-REST's root directory.

Available configuration options are outlined in the [__Server Configuration__](https://github.com/ripple/ripple-rest/blob/develop/docs/server-configuration.md) document. The `config-example.json` file in the root directory contains a sample configuration.


## Debug mode ##
The server can be run in Debug Mode by running `node server.js --debug`.


## Running Ripple-REST securely over SSL ##

We highly recommend running Ripple-REST securely over SSL. Doing so requires a certificate. For development and internal-only deployments, you can use a self-signed certificate. For production servers that are accessed over untrusted network connections, you should purchase a cert from a proper authority.

You can perform the following steps to generate a self-signed cert with [OpenSSL](https://www.openssl.org/) and configure Ripple-REST to use it:

1. Generate the SSL certificate:

```bash
openssl genrsa -out /etc/ssl/private/server.key 2048
openssl req -utf8 -new -key /etc/ssl/private/server.key -out /etc/ssl/server.csr -sha512
-batch
openssl x509 -req -days 730 -in /etc/ssl/server.csr -signkey /etc/ssl/private/server.key
-out /etc/ssl/certs/server.crt -sha512
```

2. Modify the `config.json` to enable SSL and specify the paths to the `certificate` and `key` files

```
  "ssl_enabled": true,
  "ssl": {
    "key_path": "./certs/server.key",
    "cert_path": "./certs/server.crt"
  },

```

## Deployment Tips ##

### Keeping the service running ###

Monitor `ripple-rest` using [`monit`](http://mmonit.com/monit/). On Ubuntu you can install `monit` using `sudo apt-get install monit`.

Here is an example of a monit script that will restart the server if:

- memory usage surpasses 25% of the server's available memory
- the server fails responding to server status

```
set httpd port 2812 and allow localhost

check process ripple-rest with pidfile /var/run/ripple-rest/ripple-rest.pid
    start program = "/etc/init.d/ripple-rest start"
    stop program = "/etc/init.d/ripple-rest stop"
    if memory > 25% then restart
    if failed port 5990 protocol HTTP
        and request "/v1/server"
    then restart
```



# Formatting Conventions #

The `ripple-rest` API conforms to the following general behavior for [RESTful API](http://en.wikipedia.org/wiki/Representational_state_transfer):

* You make HTTP (or HTTPS) requests to the API endpoint, indicating the desired resources within the URL itself. (The public server, for the sake of security, only accepts HTTPS requests.)
* The HTTP method identifies what you are trying to do.  Generally, HTTP `GET` requests are used to retrieve information, while HTTP `POST` requests are used to make changes or submit information.
* If more complicated information needs to be sent, it will be included as JSON-formatted data within the body of the HTTP POST request.
  * This means that you must set `Content-Type: application/json` in the headers when sending POST requests with a body.
* Upon successful completion, the server returns an [HTTP status code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) of 200 OK, and a `Content-Type` value of `application/json`.  The body of the response will be a JSON-formatted object containing the information returned by the endpoint.

As an additional convention, all responses from Ripple-REST contain a `"success"` field with a boolean value indicating whether or not the success

## Errors ##

When errors occur, the server returns an HTTP status code in the 400-599 range, depending on the type of error. The body of the response contains more detailed information on the cause of the problem.

In general, the HTTP status code is indicative of where the problem occurred:

* Codes in the 200-299 range indicate success. (*Note:* This behavior is new in [Ripple-REST v1.3.0](https://github.com/ripple/ripple-rest/releases/tag/1.3.0). Previous versions sometimes return 200 OK for some types of errors.)
    * Unless otherwise specified, methods are expected to return `200 OK` on success.
* Codes in the 400-499 range indicate that the request was invalid or incorrect somehow. For example:
    * `400 Bad Request` occurs if the JSON body is malformed. This includes syntax errors as well as when invalid or mutually-exclusive options are selected.
    * `404 Not Found` occurs if the path specified does not exist, or does not support that method (for example, trying to POST to a URL that only serves GET requests)
* Codes in the 500-599 range indicate that the server experienced a problem. This could be due to a network outage or a bug in the software somewhere. For example:
    * `500 Internal Server Error` occurs when the server does not catch an error. This is always a bug. If you can reproduce the error, file it at [our bug tracker](https://ripplelabs.atlassian.net/browse/RA/).
    * `502 Bad Gateway` occurs if Ripple-REST could not contact its `rippled` server at all.
    * `504 Gateway Timeout` occurs if the `rippled` server took too long to respond to the Ripple-REST server.

When possible, the server provides a JSON response body with more information about the error. These responses contain the following fields:

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | `false` indicates that an error occurred. |
| error_type | String | A short code identifying a general category for the error that occurred. |
| error | String | A human-readable summary of the error that occurred. |
| message | String | (May be omitted) A longer human-readable explanation for the error. |

Example error:

```js
{
    "success": false,
    "error_type": "invalid_request",
    "error": "Invalid parameter: destination_amount",
    "message": "Non-XRP payment must have an issuer"
}
```


## Quoted Numbers ##

In any case where a large number should be specified, Ripple-REST uses a string instead of the native JSON number type. This avoids problems with JSON libraries which might automatically convert numbers into native types with differing range and precision.

You should parse these numbers into a numeric data type with adequate precision. If it is not clear how much precision you need, we recommend using an arbitrary-precision data type.

## <a id="amount_object"></a> Currency Amounts ##

There are two kinds of currency on the Ripple network: XRP, and issuances. XRP is the native cryptocurrency that only exists in the network, and can be held by accounts and sent directly to other accounts with no trust necessary.

All other currencies take the form of *issuances*, which are held in the *trust lines* that link accounts. Issuances are identified by a `counterparty` on the other end of the trust line, sometimes also called the `issuer`. Sending and trading issuances actually means debiting the balance of a trust line and crediting the balance of another trust line linked to the same account. Ripple ensures this operation happens atomically.

Issuances are typically created by Gateway accounts in exchange for assets in the outside world. In most cases, the `counterparty` of a currency refers to the gateway that created the issuances. XRP never has a counterparty.

You can read more about [XRP](https://ripple.com/knowledge_categories/xrp/) and [Gateways](https://ripple.com/knowledge_center/gateways/) in the Knowledge Center.


### Amounts in JSON ###

When an amount of currency is specified as part of a JSON body, it is encoded as an object with three fields:

| Field | Type | Description |
|-------|------|-------------|
| value | String (Quoted decimal) | The quantity of the currency |
| currency | String | Three-digit [ISO 4217 Currency Code](http://www.xe.com/iso4217.php) specifying which currency. Alternatively, a 160-bit hex value. (Some advanced features, like [demurrage](https://ripple.com/wiki/Gateway_demurrage), require the hex version.) |
| counterparty | String | (New in [v1.3.2](https://github.com/ripple/ripple-rest/releases/tag/1.3.2-rc4)) The Ripple address of the account that is a counterparty to this currency. This is usually an [issuing gateway](https://wiki.ripple.com/Gateway_List). Always omitted, or an empty string, for XRP. |
| issuer | String | (Prior to 1.3.2) **DEPRECATED** alias for `counterparty`. Some methods may still return this instead. |


Example Amount Object:

```js
{
  "value": "1.0",
  "currency": "USD",
  "counterparty": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
}
```

or for XRP:

```js
{
  "value": "1.0",
  "currency": "XRP",
  "counterparty": ""
}
```

The `value` field can get very large or very small. See the [Currency Format](https://wiki.ripple.com/Currency_Format) for the exact limits of Ripple's precision.

### Amounts in URLs ###

When an amount of currency has to be specified in a URL, you use the same fields as the JSON object -- value, currency, and counterparty -- but concatenate them with `+` symbols in that order.

Example Amount:

`1.0+USD+rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q`

When specifying an amount of XRP, you must omit the counterparty entirely. For example:

`1.0+XRP`

### Counterparties in Payments ###

Most of the time, the `counterparty` field of a non-XRP currency indicates the account of the gateway that issues that currency. However, when describing payments, there are a few nuances that are important:

* There is only ever one balance for the same currency between two accounts. This means that, sometimes, the `counterparty` field of an amount actually refers to a counterparty that is redeeming issuances, instead of the account that created the issuances.
* You can omit the counterparty from the `destination_amount` of a payment to mean "any counterparty that the destination accepts". This includes all accounts to which the destination has extended trust lines, as well as issuances created by the destination which may be held on other trust lines. 
    * For compatibility with `rippled`, setting the `counterparty` of the `destination_amount` to be the destination account's address means the same thing.
* You can omit the counterparty from the `source_amount` of a payment to mean "any counterparty the source can use". This includes creating new issuances on trust lines that other accounts have extended to the source account, as well as issuances from other accounts that the source account possesses.
    * Similarly, setting the `counterparty` of the `source_amount` to be the source account's address means the same thing.


## <a id="payment_object"></a> Payment Objects ##

The `Payment` object is a simplified version of the standard Ripple transaction format.

This `Payment` format is intended to be straightforward to create and parse, from strongly or loosely typed programming languages. Once a transaction is processed and validated it also includes information about the final details of the payment.

An example Payment object looks like this:

```js
{

    "source_address": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
    "source_tag": "",
    "source_amount": {
        "value": "0.001",
        "currency": "XRP",
        "issuer": ""
    },
    "source_slippage": "0",
    "destination_address": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
    "destination_tag": "",
    "destination_amount": {
        "value": "0.001",
        "currency": "XRP",
        "issuer": ""
    },
    "invoice_id": "",
    "paths": "[]",
    "flag_no_direct_ripple": false,
    "flag_partial_payment": false
}
```

The fields of a Payment object are defined as follows:

| Field | Type | Description |
|-------|------|-------------|
| `source_account` | String | The Ripple address of the account sending the payment |
| `source_amount` | [Amount Object](#amount_object) | The amount to deduct from the account sending the payment. |
| `destination_account` | String | The Ripple address of the account receiving the payment |
| `destination_amount` | [Amount Object](#amount_object) | The amount that should be deposited into the account receiving the payment. |
| `source_tag` | String (Quoted unsigned integer) | (Optional) A quoted 32-bit unsigned integer (0-4294967294, inclusive) to indicate a sub-category of the source account. Typically, it identifies a hosted wallet at a gateway as the sender of the payment. |
| `destination_tag` | String (Quoted unsigned integer) | (Optional) A quoted 32-bit unsigned integer (0-4294967294, inclusive) to indicate a particular sub-category of the destination account. Typically, it identifies a hosted wallet at a gateway as the recipient of the payment. |
| `source_slippage` | String (Quoted decimal) | (Optional) Provides the `source_amount` a cushion to increase its chance of being processed successfully. This is helpful if the payment path changes slightly between the time when a payment options quote is given and when the payment is submitted. The `source_address` will never be charged more than `source_slippage` + the `value` specified in `source_amount`. |
| `invoice_id` | String | (Optional) Arbitrary 256-bit hash that can be used to link payments to an invoice or bill. |
| `paths` | String | A "stringified" version of the Ripple PathSet structure. You can get a path for your payment from the [Prepare Payment](#prepare-payment) method. |
| `no_direct_ripple` | Boolean  | (Optional, defaults to false) `true` if `paths` are specified and the sender would like the Ripple Network to disregard any direct paths from the `source_address` to the `destination_address`. This may be used to take advantage of an arbitrage opportunity or by gateways wishing to issue balances from a hot wallet to a user who has mistakenly set a trustline directly to the hot wallet. Most users will not need to use this option. |
| `partial_payment` | Boolean | (Optional, defaults to false) If set to `true`, fees will be deducted from the delivered amount instead of the sent amount. (*Caution:* There is no minimum amount that will actually arrive as a result of using this flag; only a miniscule amount may actually be received.) See [Partial Payments](transactions.html#partial-payments) |
| `memos` | Array | (Optional) Array of [memo objects](#memo-objects), where each object is an arbitrary note to send with this payment. |

Submitted transactions can have additional fields reflecting the current status and outcome of the transaction, including:

[[Source]<br>](https://github.com/ripple/ripple-rest/blob/59ea02d634ac4a308db2ba21781efbc02f5ccf53/lib/tx-to-rest-converter.js#L25 "Source")

| Field | Type | Description |
|-------|------|-------------|
| direction | String | The direction of the payment relative to the account from the URL, either `"outgoing"` (sent by the account in the URL) or `"incoming"` (received by the account in the URL) |
| result | String | The [Ripple transaction status code](https://wiki.ripple.com/Transaction_errors) for the transaction. A value of `"tesSUCCESS"` indicates a successful transaction. |
| timestamp | String | The time the ledger containing this transaction was validated, as a [ISO8601 extended format](http://en.wikipedia.org/wiki/ISO_8601) string in the form `YYYY-MM-DDTHH:mm:ss.sssZ`. |
| fee | String (Quoted decimal) | The amount of XRP charged as a transaction fee. |
| balance_changes | Array | Array of [Amount objects](#amount_object) indicating changes in balances held by the perspective account (i.e., the Ripple account address specified in the URI). |
| source_balance_changes | Array | Array of [Amount objects](#amount_object) indicating changes in balances held by the account sending the transaction as a result of the transaction. |
| destination_balance_changes | Array | Array of [Amount objects](#amount_object) indicating changes in balances held by the account receiving the transaction as a result of the transaction. |
| destination_amount_submitted | Object | An [Amount object](#amount_object) indicating the destination amount submitted (useful when `payment.partial_payment` flag is set to *true* |
| source_amount_submitted | Object | An [Amount object](#amount_object) indicating the source amount submitted (useful when `payment.partial_payment` flag is set to *true* |


### Memo Objects ###

(New in [Ripple-REST v1.3.0](https://github.com/ripple/ripple-rest/releases/tag/1.3.0))

Memo objects represent arbitrary data that can be included in a transaction. The overall size of the `memos` field cannot exceed 1KB after serialization.

Each Memo object must have at least one of the following fields:

| Field | Type | Description |
|-------|------|-------------|
| MemoType | String | Arbitrary string, conventionally a unique relation type (according to [RFC 5988](http://tools.ietf.org/html/rfc5988#section-4)) that defines the format of this memo. |
| MemoData | String | Arbitrary UTF-8 string representing the content of the memo. |

The MemoType field is intended to support URIs, so the contents of that field should only contain characters that are valid in URIs. In other words, MemoType should only consist of the following characters: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=%`

Example of the memos field:

```js
    "memos": [
      {
        "MemoType": "unformatted_memo",
        "MemoData": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum是指一篇常用於排版設計領域的拉丁文文章，主要的目的為測試文章或文字在不同字型、版型下看起來的效果。Lorem ipsum es el texto que se usa habitualmente en diseño gráfico en demostraciones de tipografías o de borradores de diseño para probar el diseño visual antes de insertar el texto final."
      },
      {
        "MemoData": "Fusce est est, malesuada in tincidunt mattis, auctor eu magna."
      }
    ]
```

## Order Objects ##

An order object describes an offer to exchange two currencies. Order objects are used when creating or looking up individual orders.

| Field | Value | Description |
|-------|-------|-------------|
| type  | String (`buy` or `sell`) | Whether the order is to buy or sell. | 
| taker\_pays | String ([Amount Object](#amount_object)) | The amount the taker must pay to consume this order. |
| taker\_gets | String ([Amount Object](#amount_object)) | The amount the taker will get once the order is consumed. |
| sequence   | Number | The sequence number of the transaction that created the order. Used in combination with account to uniquely identify the order. |
| passive    | Boolean | Whether the order should be [passive](transactions.html#offercreate-flags). |
| sell       | Boolean | Whether the order should be [sell](transactions.html#offercreate-flags). |
| immediate\_or\_cancel | Boolean | Whether the order should be [immediate or cancel](transactions.html#offercreate-flags). |
| fill\_or\_kill        | Boolean | Whether the order should be [fill or kill](transactions.html#offercreate-flags). |

## Order Change Objects ##

An order change object describes the changes to to a Ripple account's open order due to a transaction.

| Field | Value | Description |
|-------|-------|-------------|
| type  | String (`buy` or `sell`) | Whether the order is to buy or sell. |
| taker\_pays | String ([Amount Object](#amount_object)) | The `value` of the amount is expressed as the difference between the final amount and original amount. |
| taker\_gets | String ([Amount Object](#amount_object)) | The `value` of the amount is expressed as the difference between the final amount and original amount. |
| sequence   | Number | The sequence number of the transaction that created the order. Used in combination with account to uniquely identify the order. |
| status | String(`created`, `closed`, `canceled`, `open`) | The status of the order on the ledger. An order that is partially filled has the status `open`. |


## Bid Objects ##

An bid object describes an offer to exchange two currencies, including the current funding status of the offer. Bid objects are used when retrieving an order book.

| Field | Value | Description |
|-------|-------|-------------|
| type  | String (`buy` or `sell`) | Whether the order is to buy or sell. |
| price | String ([Amount Object](#amount_object)) | The quoted price, denominated in total units of the counter currency per unit of the base currency |
| taker\_pays\_total | String ([Amount Object](#amount_object)) | The total amount the taker must pay to consume this order. |
| taker\_pays\_funded | String ([Amount Object](#amount_object)) | The actual amount the taker must pay to consume this order, if the order is (partially funded)[https://wiki.ripple.com/Unfunded_offers]. |
| taker\_gets\_total | String ([Amount Object](#amount_object)) | The total amount the taker will get once the order is consumed. |
| taker\_gets\_funded | String ([Amount Object](#amount_object)) | The actual amount the taker will get once the order is consumed, if the order is (partially funded)[https://wiki.ripple.com/Unfunded_offers]. |
| order\_maker | String | The Ripple address of the account that placed the bid or ask on the order book. |
| sequence | Number | The sequence number of the transaction that created the order. Used in combination with account to uniquely identify the order. |
| sell     | Boolean | Whether the order should be [sell](https://ripple.com/build/transactions/#offercreate-flags). |
| passive  | Boolean | Whether the order should be [passive](https://ripple.com/build/transactions/#offercreate-flags). |

## Trustline Objects ##

A trustline object describes a link between two accounts that allows one to hold the other's issuances. A trustline can also be two-way, meaning that each can hold balances issued by the other, but that case is less common. In other words, a trustline tracks money owed.

A trustline with a positive limit indicates an account accepts issuances from the other account (typically an issuing gateway) as payment, up to the limit. An account cannot receive a payment that increases its balance over that trust limit. It is possible, however, to go over a limit by either by trading currencies or by decreasing the limit while already holding a balance.

From the perspective of an account on one side of the trustline, the trustline has the following fields:

| Field | Value | Description |
|-------|-------|-------------|
| account | String (Address) | This account |
| counterparty | String (Address) | The account at the other end of the trustline |
| currency | String | Currency code for the type of currency that is held on this trustline. |
| limit | String (Quoted decimal) | The maximum amount of currency issued by the counterparty account that this account should hold. |
| reciprocated_limit | String (Quoted decimal) | (Read-only) The maximum amount of currency issued by this account that the counterparty account should hold. |
| account\_allows\_rippling | Boolean | If set to false on two trustlines from the same account, payments cannot ripple between them. (See the [NoRipple flag](https://ripple.com/knowledge_center/understanding-the-noripple-flag/) for details.) |
| counterparty\_allows\_rippling | Boolean | (Read-only) If false, the counterparty account has the [NoRipple flag](https://ripple.com/knowledge_center/understanding-the-noripple-flag/) enabled. |
| account\_trustline\_frozen | Boolean | Indicates whether this account has [frozen](https://wiki.ripple.com/Freeze) the trustline. (`account_froze_trustline` prior to [v1.3.2](https://github.com/ripple/ripple-rest/releases/tag/1.3.2-rc4)) |
| counterparty\_trustline\_frozen | Boolean | (Read-only) Indicates whether the counterparty account has [frozen](https://wiki.ripple.com/Freeze) the trustline. (`counterparty_froze_line` prior to [v1.3.2](https://github.com/ripple/ripple-rest/releases/tag/1.3.2-rc4)) |

The read-only fields indicate portions of the trustline that pertain to the counterparty, and can only be changed by that account. (The `counterparty` field is technically part of the identity of the trustline. If you "change" it, that just means that you are referring to a different trustline object.)

A trust line with a limit *and* a balance of 0 is equivalent to no trust line.


# ACCOUNTS #

Accounts are the core unit of authentication in the Ripple Network. Each account can hold balances in multiple currencies, and all transactions must be signed by an account’s secret key. In order for an account to exist in a validated ledger version, it must hold a minimum reserve amount of XRP. (The [account reserve](https://wiki.ripple.com/Reserves) increases with the amount of data it is responsible for in the shared ledger.) It is expected that accounts will correspond loosely to individual users.



## Generate Wallet ##

(New in [Ripple-REST v1.3.0](https://github.com/ripple/ripple-rest/releases/tag/1.3.0))

Randomly generate keys for a potential new Ripple account.


```
GET /v1/wallet/new
```

[Try it! >](https://ripple.com/build/rest-tool/#generate-wallet)

There are two steps to making a new account on the Ripple network: randomly creating the keys for that account, and sending it enough XRP to meet the account reserve.

Generating the keys can be done offline, since it does not affect the network at all. To make it easy, Ripple-REST can generate account keys for you.

*Caution:* Ripple account keys are very sensitive, since they give full control over that account's money on the Ripple network. Do not transmit them to untrusted servers, or unencrypted over the internet (for example, through HTTP instead of HTTPS). There *are* bad actors who are sniffing around for account keys so they can steal your money!

#### Response ####

The response is an object with the address and the secret for a potential new account:

```js
{
    "success": true,
    "account": {
        "address": "raqFu9wswvHYS4q5hZqZxVSYei73DQnKL8",
        "secret": "shUzHiYxoXX2FgA54j42cXCZ9dTVT"
    }
}
```

The second step is [making a payment](#payments) of XRP to the new account address. (Ripple lets you send XRP to any mathematically possible account address, which creates the account if necessary.) The generated account does not exist in the ledger until it receives enough XRP to meet the account reserve.



## Get Account Balances ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/a268d7058b9bf20d48a1b61d86093756e5274512/api/balances.js#L34 "Source")

Retrieve the current balances for the given Ripple account.


```
GET /v1/accounts/{:address}/balances
```

[Try it! >](https://ripple.com/build/rest-tool/#get-account-balances)

The following URL parameters are required by this API endpoint:

| Field | Type | Description |
|-------|------|-------------|
| address | String | The Ripple account address of the account whose balances to retrieve. |

Optionally, you can also include any of the following query parameters:

| Field | Type | Description |
|-------|------|-------------|
| currency | String ([ISO 4217 Currency Code](http://www.xe.com/iso4217.php)) | If provided, only include balances in the given currency. |
| counterparty | String (Address) | If provided, only include balances issued by the provided address (usually a gateway). |
| marker | String | Server-provided value that marks where to resume pagination. |
| limit | String (Integer or `all`) | (Defaults to 200) Max results per response. Cannot be less than 10. Cannot be greater than 400. Use `all` to return all results |
| ledger | String (ledger hash or sequence, or 'validated', 'current', or 'closed') | (Defaults to 'validated') Identifying ledger version to pull results from. |

*Note:* Pagination using `limit` and `marker` requires a consistent ledger version, so you must also provide the `ledger` hash or sequence query parameter to use pagination.

*Caution:* When an account holds balances on a very large number of trust lines, specifying `limit=all` may take a long time or even time out. If you experience timeouts, try again later, or specify a smaller limit.

#### Response ####

```js
{
  "success": true,
  "marker": "0C812C919D343EAE789B29E8027C62C5792C22172D37EA2B2C0121D2381F80E1",
  "limit": 200,
  "ledger": 10478339,
  "validated": true,
  "balances": [
    {
      "currency": "XRP",
      "amount": "1046.29877312",
      "counterparty": ""
    },
    {
      "currency": "USD",
      "amount": "512.79",
      "counterparty": "r...",
    }
    ...
  ]
}
```

*Note:* `marker` will be present in the response when there are additional pages to page through.

There is one entry in the `balances` array for the account's XRP balance, and additional entries for each combination of currency code and counterparty.



## Get Account Settings ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/master/api/settings.js#L53 "Source")

Retrieve the current settings for a given account.


```
GET /v1/accounts/{:address}/settings
```

[Try it! >](https://ripple.com/build/rest-tool/#get-account-settings)

The following URL parameters are required by this API endpoint:

| Field   | Value | Description |
|---------|-------|-------------|
| address | String | The Ripple account address of the account whose settings to retrieve. |

#### Response ####

```js
{
  "success": true,
  "settings": {
    "account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "transfer_rate": "",
    "password_spent": false,
    "require_destination_tag": false,
    "require_authorization": false,
    "disallow_xrp": false,
    "disable_master": false,
    "transaction_sequence": "36",
    "email_hash": "",
    "wallet_locator": "",
    "wallet_size": "",
    "message_key": "0000000000000000000000070000000300",
    "domain": "mduo13.com",
    "signers": ""
  }
}
```

The response contains a `settings` object, with the following fields:

| Field | Value | Description |
|-------|-------|-------------|
| account | String | The Ripple address of this account |
| transfer_rate | String (Quoted decimal number) | If set, imposes a fee for transferring balances issued by this account. Must be between 1 and 2, with up to 9 decimal places of precision. See [TransferRate](transactions.html#transferrate) for details. |
| password_spent | Boolean | If false, then this account can submit a special [SetRegularKey transaction](transactions.html#setregularkey) without a transaction fee. |
| require\_destination\_tag | Boolean | If true, require a destination tag to send payments to this account. (This is intended to protect users from accidentally omitting the destination tag in a payment to a gateway's hosted wallet.) |
| require_authorization | Boolean | If true, require authorization for users to hold balances issued by this account. (This prevents users unknown to a gateway from holding funds issued by that gateway.) |
| disallow_xrp | Boolean | If true, XRP should not be sent to this account. (Enforced in clients but not in the server, because it could cause accounts to become unusable if all their XRP were spent.) |
| disable_master | Boolean | If true, the master secret key cannot be used to sign transactions for this account. Can only be set to true if a Regular Key is defined for the account. |
| transaction_sequence | String (Quoted integer) | The sequence number of the next valid transaction for this account. (Each account starts with Sequence = 1 and increases each time a transaction is made.) |
| email_hash | String | Hash of an email address to be used for generating an avatar image. Conventionally, clients use [Gravatar](http://en.gravatar.com/site/implement/hash/) to display this image. |
| wallet_locator | String | (Not used) |
| wallet_size | String | (Not used) |
| message_key | String | A [secp256k1](https://en.bitcoin.it/wiki/Secp256k1) public key that should be used to encrypt secret messages to this account. |
| domain | String | The domain that holds this account. Clients can use this to verify the account in the [ripple.txt](https://wiki.ripple.com/Ripple.txt) or [host-meta](https://wiki.ripple.com/Gateway_Services) of the domain. |



## Update Account Settings ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/a268d7058b9bf20d48a1b61d86093756e5274512/api/settings.js#L135 "Source")

Modify the existing settings for an account.


```
POST /v1/accounts/{:address}/settings?validated=true

{
  "secret": "sssssssssssssssssssssssssssss",
  "settings": {
    "transfer_rate": 1.02,
    "require_destination_tag": false,
    "require_authorization": false,
    "disallow_xrp": false,
    "disable_master": false,
    "transaction_sequence": 22
  }
}
```

[Try it! >](https://ripple.com/build/rest-tool/#update-account-settings)

The following URL parameters are required by this API endpoint:

| Field | Value | Description |
|-------|-------|-------------|
| address | String | The Ripple account address of the account whose settings to retrieve. |

The request body must be a JSON object with the following fields:

| Field | Value | Description |
|-------|-------|-------------|
| secret | String | A secret key for your Ripple account. This is either the master secret, or a regular secret, if your account has one configured. |
| settings | Object | A map of settings to change for this account. Any settings not included are left unchanged. |

Optionally, you can include the following as a URL query parameter:

| Field     | Type    | Description |
|-----------|---------|-------------|
| validated | Boolean | If `true`, the server waits to respond until the account transaction has been successfully validated by the network. A validated transaction has `state` field of the response set to `"validated"`. |

__DO NOT SUBMIT YOUR SECRET TO AN UNTRUSTED REST API SERVER__ -- The secret key can be used to send transactions from your account, including spending all the balances it holds. For the public server, only use test accounts.

The `settings` object can contain any of the following fields (any omitted fields are left unchanged):

| Field | Value | Description |
|-------|-------|-------------|
| transfer_rate | String (Quoted decimal number) | If set, imposes a fee for transferring balances issued by this account. Must be between 1 and 2, with up to 9 decimal places of precision. |
| require\_destination\_tag | Boolean | If true, require a destination tag to send payments to this account. (This is intended to protect users from accidentally omitting the destination tag in a payment to a gateway's hosted wallet.) |
| require_authorization | Boolean | If true, require authorization for users to hold balances issued by this account. (This prevents users unknown to a gateway from holding funds issued by that gateway.) |
| disallow_xrp | Boolean | If true, XRP should not be sent to this account. (Enforced in clients but not in the server, because it could cause accounts to become unusable if all their XRP were spent.) |
| disable_master | Boolean | If true, the master secret key cannot be used to sign transactions for this account. Can only be set to true if a Regular Key is defined for the account. |
| transaction_sequence | String (Quoted integer) | The sequence number of the next valid transaction for this account.  |
| email_hash | String | Hash of an email address to be used for generating an avatar image. Conventionally, clients use [Gravatar](http://en.gravatar.com/site/implement/hash/) to display this image. |
| message_key | String | A [secp256k1](https://en.bitcoin.it/wiki/Secp256k1) public key that should be used to encrypt secret messages to this account, as hex. |
| domain | String | The domain that holds this account, as lowercase ASCII. Clients can use this to verify the account in the [ripple.txt](https://wiki.ripple.com/Ripple.txt) or [host-meta](https://wiki.ripple.com/Gateway_Services) of the domain. |

*Note:* Some of the account setting fields cannot be modified by this method. For example, the `password_spent` flag is only enabled when the account uses a free SetRegularKey transaction, and only disabled when the account receives a transmission of XRP.

#### Response ####

```js
{
  "success": true,
  "settings": {
    "require_destination_tag": false,
    "require_authorization": false,
    "disallow_xrp": false,
    "email_hash": "98b4375e1d753e5b91627516f6d70977",
    "state": "pending",
    "ledger": "9248628",
    "hash": "81FA244915767DAF65B0ACF262C88ABC60E9437A4A1B728F7A9F932E727B82C6"
  }
}
```

The response is a JSON object containing the following fields:

| Field | Value | Description |
|-------|-------|-------------|
| hash | String | A unique hash that identifies the Ripple transaction to change settings |
| ledger | String (Quoted integer) | The sequence number of the ledger version where the settings-change transaction was applied. |
| settings | Object | The settings that were changed, as provided in the request. |




# PAYMENTS #

`ripple-rest` provides access to `ripple-lib`'s robust transaction submission processes. This means that it will set the fee, manage the transaction sequence numbers, sign the transaction with your secret, and resubmit the transaction up to 10 times if `rippled` reports an initial error that can be solved automatically.


## Prepare Payment ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/a268d7058b9bf20d48a1b61d86093756e5274512/api/payments.js#L484 "Source")

Get quotes for possible ways to make a particular payment.


```
GET /v1/accounts/{:source_address}/payments/paths/{:destination_address}/{:amount}
```

[Try it! >](https://ripple.com/build/rest-tool/#prepare-payment)

The following URL parameters are required by this API endpoint:

| Field | Type | Description |
|-------|------|-------------|
| `address` | String | The Ripple address for the account that would send the payment. |
| `destination_account` | String | The Ripple address for the account that would receive the payment. |
| `destination_amount` | String ([URL-formatted Amount](#amounts-in-urls)) | The amount that the destination account should receive. |

Optionally, you can also include the following as a query parameter:

| Field | Type | Description |
|-------|------|-------------|
| `source_currencies` | Comma-separated list of source currencies. Each should be an [ISO 4217 currency code](http://www.xe.com/iso4217.php), or a `{:currency}+{:counterparty}` string. | Filters possible payments to include only ones that spend the source account's balances in the specified currencies. If a counterparty is not specified, include all issuances of that currency held by the sending account. |

Before you make a payment, it is necessary to figure out the possible ways in which that payment can be made. This method gets a list possible ways to make a payment, but it does not affect the network. This method effectively performs a [ripple_path_find](rippled-apis.html#ripple-path-find) and constructs payment objects for the paths it finds.

You can then choose one of the returned payment objects, modify it as desired (for example, to set slippage values or tags), and then submit the payment for processing.

#### Response ####

```js
{
  "success": true,
  "payments": [
    {
      "source_account": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
      "source_tag": "",
      "source_amount": {
        "value": "1.008413509923106",
        "currency": "USD",
        "issuer": ""
      },
      "source_slippage": "0",
      "destination_account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      "destination_tag": "",
      "destination_amount": {
        "value": "1",
        "currency": "USD",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
      },
      "invoice_id": "",
      "paths": "[[{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"USD\",\"issuer\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"},{\"currency\":\"USD\",\"issuer\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
      "partial_payment": false,
      "no_direct_ripple": false
    },
    {
      "source_account": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
      "source_tag": "",
      "source_amount": {
        "value": "61.06103",
        "currency": "XRP",
        "issuer": ""
      },
      "source_slippage": "0",
      "destination_account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      "destination_tag": "",
      "destination_amount": {
        "value": "1",
        "currency": "USD",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
      },
      "invoice_id": "",
      "paths": "[[{\"currency\":\"USD\",\"issuer\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"rpDMez6pm6dBve2TJsmDpv7Yae6V5Pyvy2\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rpDMez6pm6dBve2TJsmDpv7Yae6V5Pyvy2\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rHAwwozJw6FHfnJfRQaFXrkGHocGoaNYSy\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rEtr3Kzh5MmhPbeNu6PDtQZsKBpgFEEEo5\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rKvPTQrD8ap1Y8TSmKjcK6G7q7Kvx7RAqQ\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
      "partial_payment": false,
      "no_direct_ripple": false
    }
  ]
}
```

You can then select the desired payment, modify it if necessary, and submit the payment object to the [`POST /v1/accounts/{address}/payments`](#submit-payment) endpoint for processing.

__NOTE:__ This command may be quite slow. If the command times out, please try it again.



## Submit Payment ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/a268d7058b9bf20d48a1b61d86093756e5274512/api/payments.js#L52 "Source")

Submit a payment object to be processed and executed.


```js
POST /v1/accounts/{address}/payments?validated=true

{
  "secret": "s...",
  "client_resource_id": "123",
  "last_ledger_sequence": "1...",
  "max_fee": "0.1",
  "fixed_fee": "0.01",
  "payment": {
    "source_account": "rBEXjfD3MuXKATePRwrk4AqgqzuD9JjQqv",
    "source_tag": "",
    "source_amount": {
      "value": "5.01",
      "currency": "USD",
      "issuer": ""
    },
    "source_slippage": "0",
    "destination_account": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
    "destination_tag": "",
    "destination_amount": {
      "value": "5",
      "currency": "USD",
      "issuer": ""
    },
    "invoice_id": "",
    "paths": "[[{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]",
    "partial_payment": false,
    "no_direct_ripple": false
  }
}
```


[Try it! >](https://ripple.com/build/rest-tool/#submit-payment)

The JSON body of the request includes the following parameters:

| Field | Type | Description |
|-------|------|-------------|
| payment | [Payment object](#payment_object) | The payment to send. You can generate a payment object using the [Prepare Payment](#prepare-payment) method. |
| client\_resource\_id | String | A unique identifier for this payment. You can generate one using the [`GET /v1/uuid`](#calculating_a_uuid) method. |
| secret | String | A secret key for your Ripple account. This is either the master secret, or a regular secret, if your account has one configured. |
| last\_ledger\_sequence | String | (Optional) A string representation of a ledger sequence number. If this parameter is not set, it defaults to the current ledger sequence plus an appropriate buffer. |
| max\_fee | String | (Optional) The maximum transaction fee to allow, as a decimal amount of XRP. |
| fixed\_fee | String | (Optional) The exact transaction fee the payer wishes to pay to the server, as a decimal amount of XRP. |

__DO NOT SUBMIT YOUR SECRET TO AN UNTRUSTED REST API SERVER__ -- The secret key can be used to send transactions from your account, including spending all the balances it holds. For the public server, only use test accounts.

*Note:* The transaction fee is determined as follows:

1. If `fixed_fee` is included, that exact value is used for the transaction fee. Otherwise, the transaction fee is set dynamically based on the server's current fee.
2. If `max_fee` is included and the transaction fee is higher than `max_fee`, then the transaction is rejected without being submitted. This is true regardless of whether the fee was fixed or dynamically set. Otherwise, the transaction is submitted to the `rippled` server with the specified fee.
3. If the transaction succeeds, the sending account loses the whole amount of the transaction fee, even if it was higher than the server's current fee. 
4. If the transaction fails because the fee was not high enough, Ripple-REST automatically resubmits it later. In this case, return to step 1.

Consequently, you can use `max_fee` as a "set-it-and-forget-it" safeguard on the fees you are willing to pay.

Optionally, you can include the following as a URL query parameter:

| Field | Type | Description |
|-------|------|-------------|
| validated | Boolean | If `true`, the server waits to respond until the payment has been successfully validated by the network and returns the payment object. Otherwise, the server responds immediately with a message indicating that the transaction was received for processing. |


#### Response ####

The response can take two formats, depending on the `validated` query parameter:

* If `validated` is set to `true`, then the response matches the format from [Confirm Payment](#confirm-payment).
* If `validated` is omitted or set to `false`, then the response is a JSON object as follows:

```js
{
  "success": true,
  "client_resource_id": "123",
  "status_url": ".../v1/accounts/r1.../payments/123"
}
```

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | A value of `true` only indicates that the request was received, not that the transaction was processed. |
| client_resource_id | String | The client resource ID provided in the request |
| status_url | String | A URL that you can GET to check the status of the request. This refers to the [Confirm Payment](#confirm-payment) method. |



## Confirm Payment ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/a268d7058b9bf20d48a1b61d86093756e5274512/api/payments.js#L270 "Source")

Retrieve the details of a payment, including the current state of the transaction and the result of transaction processing.


```
GET /v1/accounts/{:address}/payments/{:id}
```

[Try it! >](https://ripple.com/build/rest-tool/#confirm-payment)

The following URL parameters are required by this API endpoint:

| Field | Type | Description |
|-------|------|-------------|
| address | String | The Ripple account address of an account involved in the transaction. |
| id | String | A unique identifier for the transaction: either a client resource ID or a transaction hash. |

#### Response ####

```js
{
  "success": true,
  "payment": {
    "source_account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "source_tag": "",
    "source_amount": {
      "value": "0.00001",
      "currency": "XRP",
      "issuer": ""
    },
    "source_slippage": "0",
    "destination_account": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
    "destination_tag": "",
    "destination_amount": {
      "value": "0.00000005080000000000001",
      "currency": "USD",
      "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc"
    },
    "invoice_id": "",
    "paths": "[]",
    "no_direct_ripple": false,
    "partial_payment": true,
    "direction": "outgoing",
    "result": "tesSUCCESS",
    "timestamp": "2014-09-17T21:47:00.000Z",
    "fee": "0.00001",
    "balance_changes": [{
      "currency": "XRP",
      "value": "-0.00002",
      "issuer": ""
    }],
    "source_balance_changes": [{
      "currency": "XRP",
      "value": "-0.00002",
      "issuer": ""
    }],
    "destination_balance_changes": [{
      "currency": "USD",
      "value": "5.08e-8",
      "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc"
    }],
    "order_changes": [],
    "destination_amount_submitted": {
      "value": "0.01",
      "currency": "USD",
      "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc"
    },
    "source_amount_submitted": {
      "value": "0.00001",
      "currency": "XRP",
      "issuer": ""
    }
  },
  "client_resource_id": "",
  "hash": "9D591B18EDDD34F0B6CF4223A2940AEA2C3CC778925BABF289E0011CD8FA056E",
  "ledger": "8924146",
  "state": "validated"
}
```

| Field | Type | Description |
|-------|------|-------------|
| payment | Object | A [payment object](#payment-objects) for the transaction. |
| hash | String | The hash of the payment transaction |
| ledger | String | The sequence number of the ledger version that includes this transaction. |

If the `state` field has the value `"validated"`, then the payment has been finalized, and is included in the shared global ledger. However, this does not necessarily mean that it succeeded. Check the `payment.result` field for a value of `"tesSUCCESS"` to see if the payment was successfully executed. If the `payment.partial_payment` flag is *true*, then you should also consult the `payment.destination_balance_changes` array to see how much currency was actually delivered to the destination account.

Processing a payment can take several seconds to complete, depending on the [consensus process](consensus-whitepaper.html). If the payment does not exist yet, or has not been validated, you should wait a few seconds before checking again.



## Get Payment History ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/a268d7058b9bf20d48a1b61d86093756e5274512/api/payments.js#L394 "Source")

Retrieve a selection of payments that affected the specified account.


```
GET /v1/accounts/{:address}/payments
```

[Try it! >](https://ripple.com/build/rest-tool/#get-payment-history)

The following URL parameters are required by this API endpoint:

| Field | Type | Description |
|-------|------|-------------|
| address | String | The Ripple account address of an account involved in the transaction. |

Optionally, you can also include the following query parameters:

| Field | Type | Description |
|-------|------|-------------|
| source_account | String (Address) | If provided, only include payments sent by a given account. |
| destination_account | String (Address) | If provided, only include payments received by a given account. |
| exclude_failed | Boolean | If true, only include successful transactions. Defaults to false. |
| direction | String | If provided, only include payments of the given type. Valid values include `"incoming"` (payments received by this account) and `"outgoing"` (payments sent by this account). |
| earliest_first | Boolean | If true, sort results with the oldest payments first. Defaults to false (sort with the most recent payments first). |
| start\_ledger | Integer (Ledger sequence number) | If provided, exclude payments from ledger versions older than the given ledger. |
| end\_ledger | Integer (Ledger sequence number) | If provided, exclude payments from ledger versions newer than the given ledger. |
| results\_per\_page | Integer | The maximum number of payments to be returned at once.  Defaults to 10. |
| page | Integer | The page number for the results to return, if more than `results_per_page` are available. The first page of results is page `1`, the second page is number `2`, and so on.  Defaults to `1`. |

#### Response ####

```js
{
  "success": true,
  "payments": [{
    "payment": {
      "source_account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
      "source_tag": "",
      "source_amount": {
        "value": "20",
        "currency": "XRP",
        "issuer": ""
      },
      "source_slippage": "0",
      "destination_account": "raKEEVSGnKSD9Zyvxu4z6Pqpm4ABH8FS6n",
      "destination_tag": "",
      "destination_amount": {
        "value": "20",
        "currency": "XRP",
        "issuer": ""
      },
      "invoice_id": "",
      "paths": "[]",
      "no_direct_ripple": false,
      "partial_payment": false,
      "direction": "outgoing",
      "result": "tesSUCCESS",
      "timestamp": "2015-02-09T23:31:40.000Z",
      "fee": "0.012",
      "balance_changes": [{
        "currency": "XRP",
        "value": "-20.012",
        "issuer": ""
      }],
      "source_balance_changes": [{
        "currency": "XRP",
        "value": "-20.012",
        "issuer": ""
      }],
      "destination_balance_changes": [{
        "currency": "XRP",
        "value": "20",
        "issuer": ""
      }],
      "order_changes": []
    },
    "client_resource_id": "",
    "hash": "1D381C0FCA00E8C34A6D4D3A91DAC9F3697B4E66BC49ED3D9B2D6F57D7F15E2E",
    "ledger": "11620700",
    "state": "validated"
  }
]
```

If the length of the `payments` array is equal to `results_per_page`, then there may be more results. To get them, increment the `page` query paramter and run the request again.

*Note:* It is not more efficient to specify more filter values, because Ripple-REST has to retrieve the full list of payments from the `rippled` before it can filter them.

# ORDERS #

## Place Order ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/59ea02d634ac4a308db2ba21781efbc02f5ccf53/api/orders.js#L161 "Source")

(New in [Ripple-REST v1.3.2](https://github.com/ripple/ripple-rest/releases/tag/1.3.2-rc4))

Places an order to exchange currencies.



```js
POST /v1/accounts/{:address}/orders?validated=true
{
    "secret": "sneThnzgBgxc3zXPG....",
    "order": {
      "type": "sell",
      "taker_pays": {
        currency: "JPY",
        counterparty: "rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6",
        value: "4000"
      },
      "taker_gets": {
        currency: "USD",
        counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
        value: ".25"
      }
    }
}
```


[Try it! >](https://ripple.com/build/rest-tool/#place-order)

The following URL parameters are required by this API endpoint:

| Field | Type | Description |
|-------|------|-------------|
| address | String | The Ripple account address the account creating the order. |

The following parameters are required in the JSON body of the request:

| Field | Value | Description |
|-------|-------|-------------|
| secret | String | A secret key for your Ripple account. This is either the master secret, or a regular secret, if your account has one configured. |
| order | Object ([Order](#order-objects)) | The order to place. |

Optionally, you can include the following as a URL query parameter:

| Field | Type | Description |
|-------|------|-------------|
| validated | String | `true` or `false`. When set to `true`, will force the request to wait until the trustline transaction has been successfully validated by the server. A validated transaction will have the `state` attribute set to `"validated"` in the response. |

__DO NOT SUBMIT YOUR SECRET TO AN UNTRUSTED REST API SERVER__ -- The secret key can be used to send transactions from your account, including spending all the balances it holds. For the public server, only use test accounts.

#### Response ####

```js
{
  "success": true,
  "order": {
    "hash": "71AE74B03DE3B9A06C559AD4D173A362D96B7D2A5AA35F56B9EF21543D627F34",
    "ledger": "9592219",
    "state": "validated",
    "account": "sneThnzgBgxc3zXPG....",
    "taker_pays": {
      "currency": "JPY",
      "counterparty": "rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6",
      "value": "4000"
    },
    "taker_gets": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": ".25"
    },
    "fee": "0.012",
    "type": "sell",
    "sequence": 99
  }
}
```

## Cancel Order ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/59ea02d634ac4a308db2ba21781efbc02f5ccf53/api/orders.js#L250 "Source")

Deletes a previous order to exchange currencies.



```
DELETE /v1/accounts/{:address}/orders/{:order}?validated=true
{
    "secret": "sneThnzgBgxc3zXPG...."
}
```


[Try it! >](https://ripple.com/build/rest-tool/#cancel-order)

The following URL parameters are required by this API endpoint:

| Field | Type | Description |
|-------|------|-------------|
| address | String | The Ripple account address of an account involved in the transaction. |
| order | Integer | The `sequence` number of the order to cancel. |

The following parameters are required in the JSON body of the request:

| Field | Value | Description |
|-------|-------|-------------|
| secret | String | A secret key for your Ripple account. This is either the master secret, or a regular secret, if your account has one configured. |

*Note:* Some older client libraries do not support a body for the DELETE method. If this is a problem for you, please [file an issue in Ripple Labs' bug tracker](https://ripplelabs.atlassian.net/browse/RLJS).

Optionally, you can include the following as a URL query parameter:

| Field | Type | Description |
|-------|------|-------------|
| validated | String | `true` or `false`. When set to `true`, will force the request to wait until the trustline transaction has been successfully validated by the server. A validated transaction will have the `state` attribute set to `"validated"` in the response. |

__DO NOT SUBMIT YOUR SECRET TO AN UNTRUSTED REST API SERVER__ -- The secret key can be used to send transactions from your account, including spending all the balances it holds. For the public server, only use test accounts.

#### Response ####

```js
{
  "success": true,
  "order": {
    "hash": "71AE74B03DE3B9A06C559AD4D173A362D96B7D2A5AA35F56B9EF21543D627F34",
    "ledger": "9592219",
    "state": "validated",
    "account": "sneThnzgBgxc3zXPG....",
    "fee": "0.012",
    "offer_sequence": 99,
    "sequence": 100
  }
}
```

## Get Account Orders ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/59ea02d634ac4a308db2ba21781efbc02f5ccf53/api/orders.js#L38 "Source")

Retrieves all open currency-exchange orders associated with the Ripple address.



```
GET /v1/accounts/{:address}/orders
```


[Try it! >](https://ripple.com/build/rest-tool/#get-account-orders)

The following URL parameters are required by this API endpoint:

| Field | Value | Description |
|-------|-------|-------------|
| address | String | The Ripple account address whose orders to look up. |

Optionally, you can also include the following query parameters:

| Field | Value | Description |
|-------|-------|-------------|
| marker | String | Start position in response paging. |
| limit | String (Integer) | (Defaults to 200) Max results per response. Cannot be less than 10. Cannot be greater than 400. |
| ledger | String | Ledger to request paged results from. Use the ledger's hash. |

*Note:* Pagination using `limit` and `marker` requires a consistent ledger version, so you must also provide the `ledger` query parameter to use pagination. `marker` will be present in the response when there are additional pages to page through.

#### Response ####

The response is an object with a `orders` array, where each member is a [order object](#order-objects).

```js
{
  "success": true,
  "ledger": 11561783,
  "validated": true,
  "orders": [
    {
      "type": "buy",
      "taker_gets": {
        "currency": "CAD",
        "counterparty": "rLr7umFScvEZnj3AJzzZjm25yCZYh3tMwc",
        "value": "11205.2494363431"
      },
      "taker_pays": {
        "currency": "USD",
        "counterparty": "rDZBotqkN4MywSxm9HDtX4m7V6SRkFo7By",
        "value": "9933.731769807718"
      },
      "sequence": 11,
      "passive": false
    },
    {
      "type": "sell",
      "taker_gets": {
        "currency": "USD",
        "counterparty": "rDZBotqkN4MywSxm9HDtX4m7V6SRkFo7By",
        "value": "9229.29"
      },
      "taker_pays": {
        "currency": "CAD",
        "counterparty": "rLr7umFScvEZnj3AJzzZjm25yCZYh3tMwc",
        "value": "10447.55628"
      },
      "sequence": 12,
      "passive": false
    },
    {
      "type": "buy",
      "taker_gets": {
        "currency": "CAD",
        "counterparty": "rLr7umFScvEZnj3AJzzZjm25yCZYh3tMwc",
        "value": "5600"
      },
      "taker_pays": {
        "currency": "USD",
        "counterparty": "rDZBotqkN4MywSxm9HDtX4m7V6SRkFo7By",
        "value": "5000"
      },
      "sequence": 13,
      "passive": false
    },
    {
      "type": "buy",
      "taker_gets": {
        "currency": "USD",
        "counterparty": "rDZBotqkN4MywSxm9HDtX4m7V6SRkFo7By",
        "value": "4.7"
      },
      "taker_pays": {
        "currency": "XRP",
        "counterparty": "",
        "value": "997.876857"
      },
      "sequence": 14,
      "passive": false
    },
    {
      "type": "sell",
      "taker_gets": {
        "currency": "XRP",
        "counterparty": "",
        "value": "999"
      },
      "taker_pays": {
        "currency": "USD",
        "counterparty": "rDZBotqkN4MywSxm9HDtX4m7V6SRkFo7By",
        "value": "4.74525"
      },
      "sequence": 15,
      "passive": false
    },
    {
      "type": "buy",
      "taker_gets": {
        "currency": "CAD",
        "counterparty": "rLr7umFScvEZnj3AJzzZjm25yCZYh3tMwc",
        "value": "5.35"
      },
      "taker_pays": {
        "currency": "XRP",
        "counterparty": "",
        "value": "998.134328"
      },
      "sequence": 16,
      "passive": false
    },
    {
      "type": "sell",
      "taker_gets": {
        "currency": "XRP",
        "counterparty": "",
        "value": "999"
      },
      "taker_pays": {
        "currency": "CAD",
        "counterparty": "rLr7umFScvEZnj3AJzzZjm25yCZYh3tMwc",
        "value": "5.96403"
      },
      "sequence": 17,
      "passive": false
    },
    {
      "type": "buy",
      "taker_gets": {
        "currency": "CAD",
        "counterparty": "rLr7umFScvEZnj3AJzzZjm25yCZYh3tMwc",
        "value": "1103.64"
      },
      "taker_pays": {
        "currency": "USD",
        "counterparty": "rDZBotqkN4MywSxm9HDtX4m7V6SRkFo7By",
        "value": "976.6725663716827"
      },
      "sequence": 18,
      "passive": false
    },
    {
      "type": "sell",
      "taker_gets": {
        "currency": "USD",
        "counterparty": "rDZBotqkN4MywSxm9HDtX4m7V6SRkFo7By",
        "value": "986.89"
      },
      "taker_pays": {
        "currency": "CAD",
        "counterparty": "rLr7umFScvEZnj3AJzzZjm25yCZYh3tMwc",
        "value": "1116.17259"
      },
      "sequence": 19,
      "passive": false
    },
    {
      "type": "sell",
      "taker_gets": {
        "currency": "USD",
        "counterparty": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
        "value": "2"
      },
      "taker_pays": {
        "currency": "CAD",
        "counterparty": "rLr7umFScvEZnj3AJzzZjm25yCZYh3tMwc",
        "value": "2"
      },
      "sequence": 21,
      "passive": false
    }
  ]
}

```

## Get Order Transaction ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/59ea02d634ac4a308db2ba21781efbc02f5ccf53/api/orders.js#L505 "Source")

Get the details of an order transaction. An order transaction either [places an order](#place-order) or [cancels an order](#cancel-order).



```
GET /v1/accounts/{:address}/orders/{:hash}
```

[Try it! >](https://ripple.com/build/rest-tool/#get-order-transaction)

The following URL parameters are required by this API endpoint:

| Field | Value | Description |
|-------|-------|-------------|
| address | String | The Ripple account address whose orders to look up. |
| hash | String | The transaction hash for the order |


#### Response ####

An example response for an order transaction to place an order:

```js
{
  "success": true,
  "hash": "D53A3B99AC0C3CAF35D72178390ACA94CD42479A98CEA438EEAFF338E5FEB76D",
  "ledger": 11349675,
  "validated": true,
  "timestamp": "2015-01-26T17:49:30.000Z",
  "fee": "0.012",
  "action": "order_create",
  "direction": "outgoing",
  "order": {
    "account": "rEQWVz1qN4DWw5J17s3DgXQzUuVYDSpK6M",
    "taker_pays": {
      "currency": "XRP",
      "counterparty": "",
      "value": "10000000"
    },
    "taker_gets": {
      "currency": "JPY",
      "counterparty": "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN",
      "value": "0.0001"
    },
    "passive": false,
    "immediate_or_cancel": false,
    "fill_or_kill": false,
    "type": "buy",
    "sequence": 26
  },
  "balance_changes": [
    {
      "counterparty": "",
      "currency": "XRP",
      "value": "-0.012"
    }
  ],
  "order_changes": [
    {
      "taker_pays": {
        "currency": "XRP",
        "counterparty": "",
        "value": "10000000"
      },
      "taker_gets": {
        "currency": "JPY",
        "counterparty": "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN",
        "value": "0.0001"
      },
      "sequence": 26,
      "status": "created"
    }
  ]
}

```

An example response for an order transaction that cancels an order:

```js
{
  "success": true,
  "hash": "3D948699072B40312AE313E7E8297EED83080C9A4D5B564BCACF0951ABF00AC5",
  "ledger": 11236693,
  "validated": true,
  "timestamp": "2015-01-20T21:46:00.000Z",
  "fee": "0.012",
  "action": "order_cancel",
  "direction": "outgoing",
  "order": {
    "account": "rEQWVz1qN4DWw5J17s3DgXQzUuVYDSpK6M",
    "type": "cancel",
    "sequence": 22,
    "cancel_sequence": 20
  },
  "balance_changes": [{
    "counterparty": "",
    "currency": "XRP",
    "value": "-0.012"
  }],
  "order_changes": [{
    "taker_pays": {
      "currency": "XRP",
      "counterparty": "",
      "value": "0"
    },
    "taker_gets": {
      "currency": "JPY",
      "counterparty": "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN",
      "value": "0"
    },
    "sequence": 20,
    "status": "canceled"
  }]
}
```

The response includes the original [`order`](#order-objects), if the `action` is `order_create`.

For transactions that cancel orders, the `order` object describes the transaction that canceled the original order.

The response also includes `balance_changes` and [`order changes`](order-change-objects)
for the perspective account (e.g., the Ripple account address used in the URI).

The `direction` of the transaction is either `incoming`, `outgoing` or `unaffected`. Outgoing transactions are made by the perspective account. Incoming transactions affect the perspective account.

## Get Order Book ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/59ea02d634ac4a308db2ba21781efbc02f5ccf53/api/orders.js#L38 "Source")

Retrieves the top of the order book for a currency pair.


```
GET /v1/accounts/{:address}/order_book/{:base}/{:counter}
```

[Try it! >](https://ripple.com/build/rest-tool/#get-order-book)

The following URL parameters are required by this API endpoint:

| Field | Value | Description |
|-------|-------|-------------|
| address | String | The Ripple account address whose orders to look up. |
| base | String | The base currency as `currency+counterparty` (e.g., `USD+`)|
| counter | String | The counter currency as `currency+counterparty` (e.g., `BTC+`)|

Optionally, you can also include the following query parameters:

| Field | Value | Description |
|-------|-------|-------------|
| limit | String (Integer) | (Defaults to 200) Max results per response. Cannot be less than 10. Cannot be greater than 400. |


#### Response ####

The response includes `bids` and `asks` arrays that contain [bid objects](#bid-objects)

```js
{
  "success": true,
  "order_book": "BTC+rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B/USD+rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
  "ledger": "11082710",
  "validated": true,
  "bids": [{
    "price": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "265.60000000000017358109"
    },
    "taker_gets_funded": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "610.8241466511631"
    },
    "taker_gets_total": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "610.8241466511631"
    },
    "taker_pays_funded": {
      "currency": "BTC",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "2.299789708776968"
    },
    "taker_pays_total": {
      "currency": "BTC",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "2.299789708776968"
    },
    "order_maker": "r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ",
    "sequence": 550,
    "passive": false,
    "sell": false
  }, {
    "price": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "265.53485133502987091805"
    },
    "taker_gets_funded": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "57.55101250864556"
    },
    "taker_gets_total": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "57.55101250864556"
    },
    "taker_pays_funded": {
      "currency": "BTC",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "0.2167361919510613"
    },
    "taker_pays_total": {
      "currency": "BTC",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "0.2167361919510613"
    },
    "order_maker": "rQE5Z3FgVnRMbVfS6xiVQFgB4J3X162FVD",
    "sequence": 114646,
    "passive": false,
    "sell": false
  }],
  "asks": [{
    "price": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "267.73999242396369106028"
    },
    "taker_gets_funded": {
      "currency": "BTC",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "1.112931117688904"
    },
    "taker_gets_total": {
      "currency": "BTC",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "1.112931117688904"
    },
    "taker_pays_funded": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "297.9761690184206"
    },
    "taker_pays_total": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "297.9761690184206"
    },
    "order_maker": "rwmnMXpRXFqHLYzwyeggJQ8fu5bPyxqup1",
    "sequence": 145474,
    "passive": false,
    "sell": false
  }, {
    "price": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "269.5405478403477"
    },
    "taker_gets_funded": {
      "currency": "BTC",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "5205797604790419e-26"
    },
    "taker_gets_total": {
      "currency": "BTC",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "1"
    },
    "taker_pays_funded": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "0.00000001403173538341179"
    },
    "taker_pays_total": {
      "currency": "USD",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "value": "269.5405478403477"
    },
    "order_maker": "rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE",
    "sequence": 52688,
    "passive": false,
    "sell": true
  }]
}
```




# TRUSTLINES #


## Get Trustlines ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/develop/api/trustlines.js#L18 "Source")

Retrieves all trustlines associated with the Ripple address.


```
GET /v1/accounts/{:address}/trustlines
```

[Try it! >](https://ripple.com/build/rest-tool/#get-trustlines)

The following URL parameters are required by this API endpoint:

| Field | Value | Description |
|-------|-------|-------------|
| address | String | The Ripple account address whose trustlines to look up. |

Optionally, you can also include the following query parameters:

| Field | Value | Description |
|-------|-------|-------------|
| currency | String ([ISO4217 currency code](http://www.xe.com/iso4217.php)) | Filter results to include only trustlines for the given currency. |
| counterparty | String (Address) | Filter results to include only trustlines to the given account. |
| marker | String | Start position in response paging. |
| limit | String (Integer or 'all') | (Defaults to 200) Max results per response. Cannot be less than 10. Cannot be greater than 400. Use 'all' to return all results |
| ledger | String (ledger hash or sequence, or 'validated', 'current', or 'closed') | (Defaults to 'validated') Identifying ledger version to pull results from. |

*Note:* Pagination using `limit` and `marker` requires a consistent ledger version, so you must also provide the `ledger` query parameter to use pagination.

#### Response ####

The response is an object with a `lines` array, where each member is a [trustline object](#trustline-objects).

```js
{
  "success": true,
  "marker": "0C812C919D343EAE789B29E8027C62C5792C22172D37EA2B2C0121D2381F80E1",
  "limit": 200,
  "ledger": 10478339,
  "validated": true,
  "lines": [
    {
      "account": "rPs7nVbSops6xm4v77wpoPFf549cqjzUy9",
      "counterparty": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
      "currency": "USD",
      "trust_limit": "100",
      "reciprocated_trust_limit": "0",
      "account_allows_rippling": false,
      "counterparty_allows_rippling": true
    },
    {
      "account": "rPs7nVbSops6xm4v77wpoPFf549cqjzUy9",
      "counterparty": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs58B",
      "currency": "BTC",
      "trust_limit": "5",
      "reciprocated_trust_limit": "0",
      "account_allows_rippling": false,
      "counterparty_allows_rippling": true
    }
  ]
}
```

*Note:* `marker` will be present in the response when there are additional pages to page through.

## Grant Trustline ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/develop/api/trustlines.js#L88 "Source")

Creates or modifies a trustline.


```js
POST /v1/accounts/{:address}/trustlines?validated=true
{
    "secret": "sneThnzgBgxc3zXPG....",
    "trustline": {
        "limit": "110",
        "currency": "USD",
        "counterparty": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
        "account_allows_rippling": false
    }
}
```

[Try it! >](https://ripple.com/build/rest-tool/#grant-trustline)

The following parameters are required in the JSON body of the request:

| Field | Value | Description |
|-------|-------|-------------|
| secret | String | A secret key for your Ripple account. This is either the master secret, or a regular secret, if your account has one configured. |
| trustline | Object ([Trustline](#trustline-objects)) | The trustline object to set. Ignores fields not controlled by this account. Any fields that are omitted are unchanged. |

Optionally, you can include the following as a URL query parameter:

| Field | Type | Description |
|-------|------|-------------|
| validated | String | `true` or `false`. When set to `true`, will force the request to wait until the trustline transaction has been successfully validated by the server. A validated transaction will have the `state` attribute set to `"validated"` in the response. |

__DO NOT SUBMIT YOUR SECRET TO AN UNTRUSTED REST API SERVER__ -- The secret key can be used to send transactions from your account, including spending all the balances it holds. For the public server, only use test accounts.

*Note:* Since a trustline occupies space in the ledger, [a trustline increases the XRP the account must hold in reserve](https://wiki.ripple.com/Reserves). You cannot create more trustlines if you do not have sufficient XRP to pay the reserve. This applies to the account extending trust, not to the account receiving it. A trustline with a limit *and* a balance of 0 is equivalent to no trust line.

#### Response ####

A successful response uses the `201 Created` HTTP response code, and provides a JSON object that includes the trustline fields as saved, an identifying hash for the transaction that modified the trustline, and the sequence number of the ledger version that included the transaction.

```js
{
  "success": true,
  "trustline": {
    "account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "limit": "5",
    "currency": "USD",
    "counterparty": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
    "account_allows_rippling": false,
    "account_trustline_frozen": false,
    "state": "pending",
    "ledger": "9302926",
    "hash": "57695598CD32333F67A70DC6EBC3501D71569CE11C9803162CBA61990D89C1EE"
  }
}
```




# NOTIFICATIONS #

Notifications provide a mechanism to monitor for any kind of transactions that modify your Ripple account. Unlike the [Get Payment History](#get-payment-history) method, notifications include _all_ types of transactions, but each is described in less detail.

Notifications are sorted in order of when they occurred, so you can save the most recently-known transaction and easily iterate forward to find any notifications that are newer than that.


## Check Notifications ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/develop/api/notifications.js "Source")

Get a notification for the specific transaction hash, along with links to previous and next notifications, if available.


```
GET /v1/accounts/{:address}/notifications/{:id}
```

[Try it! >](https://ripple.com/build/rest-tool/#check-notifications)

The following URL parameters are required by this API endpoint:

| Field | Value | Description |
|-------|-------|-------------|
| address | String | The Ripple account address of an account involved in the transaction. |
| id | String | A unique identifier for the transaction this notification describes -- either a client resource ID or a Ripple transaction hash |

You can find a transaction `hash` in a few places:

* From the response when you submit a transaction (via [Submit Payment](#submit-payment), [Update Account Settings](#update-account-settings), or [Grant Trustline](#grant-trustline)
* From objects in the [payment history](#get-payment-history).
* From the `previous_hash` or `next_hash` fields of another Check Notifications response.

#### Response ####

A successful response contains a notification object, for example:

```js
{
  "success": true,
  "notification": {
    "account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "type": "payment",
    "direction": "outgoing",
    "state": "validated",
    "result": "tesSUCCESS",
    "ledger": "8924146",
    "hash": "9D591B18EDDD34F0B6CF4223A2940AEA2C3CC778925BABF289E0011CD8FA056E",
    "timestamp": "2014-09-17T21:47:00.000Z",
    "transaction_url": "http://api.ripple.com:5990/v1/accounts/rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn/payments/9D591B18EDDD34F0B6CF4223A2940AEA2C3CC778925BABF289E0011CD8FA056E",
    "previous_hash": "8496C20AEB453803CB80474B59AB1E8FAA26725561EFF5AF41BD588B325AFBA8",
    "previous_notification_url": "http://api.ripple.com:5990/v1/accounts/rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn/notifications/8496C20AEB453803CB80474B59AB1E8FAA26725561EFF5AF41BD588B325AFBA8",
    "next_hash": "AE79DE34230403EA2769B4DA21A0D4D2FD7A18518DBA0A4C5B6352AFD844D22A",
    "next_notification_url": "http://api.ripple.com:5990/v1/accounts/rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn/notifications/AE79DE34230403EA2769B4DA21A0D4D2FD7A18518DBA0A4C5B6352AFD844D22A"
  }
}
```

If the server has any notifications that are older than this one, the `previous_hash` field contains a hash you can use to call this method again to get the previous one. The `previous_notification_url` contains the same information, but already formatted into a URL you can perform a GET request on. If no older notifications are available, both fields are either omitted, or provided as an empty string.

The `next_hash` and `next_notification_url` fields work the same way, but they provide information on newer notifications instead.

*Caution:* If you are accessing the REST API through a proxy, you may not be able to access the URLs as provided. (See [RA-129](https://ripplelabs.atlassian.net/browse/RA-129) for status and details.)




# RIPPLED SERVER STATUS #

The following two endpoints can be used to check if the `ripple-rest` API is currently connected to a `rippled` server, and to retrieve information about the current status of the API.

## Check Connection ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/develop/api/info.js#L33 "Source")

Perform a simple ping to make sure that the server is working properly.


```
GET /v1/server/connected
```

[Try it! >](https://ripple.com/build/rest-tool/#check-connection)

#### Response ####

```js
{
  "success": true,
  "connected": true
}
```

If the server has any problems, for example with connecting to the `rippled` server, it returns an error message instead.

## Get Server Status ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/develop/api/info.js#L14 "Source")

Retrieve information about the current status of the Ripple-REST API and the `rippled` server it is connected to.


```
GET /v1/server
```

[Try it! >](https://ripple.com/build/rest-tool/#get-server-status)

#### Response ####

```js
{
  "success": true,
  "api_documentation_url": "https://github.com/ripple/ripple-rest",
  "rippled_server_url": "wss://s1.ripple.com:443",
  "rippled_server_status": {
    "build_version": "0.26.3-sp2",
    "complete_ledgers": "32570-9306249",
    "hostid": "MERT",
    "io_latency_ms": 1,
    "last_close": {
      "converge_time_s": 3.021,
      "proposers": 5
    },
    "load_factor": 1,
    "peers": 49,
    "pubkey_node": "n9LpPSgwfihQDRX68dykxtNCm4gi2dBEJCga7uwV7uztoRSswms8",
    "server_state": "full",
    "validated_ledger": {
      "age": 9,
      "base_fee_xrp": 0.00001,
      "hash": "7C3F4489091BAE5DCADE3B1A8A2C1E7E5C938FA4483660FD1A4098C4EC4805CD",
      "reserve_base_xrp": 20,
      "reserve_inc_xrp": 5,
      "seq": 9306249
    },
    "validation_quorum": 3
  }
}
```

The parameters in a successful response are as follows:

| Field | Value | Description |
|-------|-------|-------------|
| api\_documentation\_url | String | A URL that contains more information about the software, typically the [Ripple-REST Github Project](https://github.com/ripple/ripple-rest). |
| rippled_server_url | String | The URL of the `rippled` server that Ripple-REST is using to interface with the Ripple Network |
| rippled\_server\_status | Object | Various information about the `rippled` server |

The `rippled_server_status` object may have any of the following fields:

| Field | Value | Description |
|-------|-------|-------------|
| build_version | String | The `rippled` software version number |
| complete_ledgers | String | A range (possibly a disjointed range) of ledger versions that the server has on hand |
| hostid | String | The hostname of the machine running the `rippled` server |
| io\_latency\_ms | Number | The number of milliseconds spent waiting for I/O operations to complete. A high number indicates too much load on the server, which can be improved with more RAM and faster hard disks. |
| last\_close | Object | Some information about the most recently-closed ledger |
| last\_close.converge\_time\_s | Number | How many seconds it took to reach consensus on the this ledger version |
| last\_close.proposers | Number | How many trusted validators were involved in the consensus process for this ledger version |
| load\_factor | Number | The load factor the server is currently enforcing, as a multiplier for the base transaction fee. The load factor is determined by the highest of the individual server’s load factor, cluster’s load factor, and the overall network’s load factor. |
| peers | Number | How many other `rippled` servers this server is connected to |
| pubkey_node | String | Public key used to verify this node for internal communications; this key is automatically generated by the server the first time it starts up. (If deleted, the node can just create a new pair of keys.) |
| server_state | String | A string indicating to what extent the server is participating in the network. See [Possible Server States in the rippled documentation](rippled-apis#possible-server-states) for more details. |
| validated_ledger | Object | Information about the fully-validated ledger with the highest sequence number (the most recent) |
| validated_ledger.age | Unsigned Integer | The time since the ledger was closed, in seconds |
| validated_ledger.base_fee_xrp | Number | Base fee, in XRP. This may be represented in scientific notation such as 1e-05 for 0.00005 |
| validated_ledger.hash | String | Unique hash for the ledger, as hex |
| validated_ledger.reserve_base_xrp | Unsigned Integer | Minimum amount of XRP (not drops) necessary for every account to keep in reserve |
| validated_ledger.reserve_inc_xrp | Unsigned Integer | Amount of XRP (not drops) added to the account reserve for each object an account is responsible for in the ledger |
| validated_ledger.seq | Unsigned Integer | Identifying sequence number of this ledger version |
| validation_quorum | Number | Minimum number of trusted validations required in order to validate a ledger version. Some circumstances may cause the server to require more validations. |

<!--Note: keep the above table up-to-date with the server_info command in the rippled documentation -->


# UTILITIES #

## Retrieve Ripple Transaction ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/develop/api/transactions.js#L118 "Source")

Returns a Ripple transaction, in its complete, original format.


```
GET /v1/transactions/{:id}
```

[Try it! >](https://ripple.com/build/rest-tool/#retrieve-ripple-transaction)

The following URL parameters are required by this API endpoint:

| Field | Value | Description |
|-------|-------|-------------|
| hash | String | A unique identifier for the Ripple transaction to retrieve -- either a client resource ID or a Ripple transaction hash. |

#### Response ####

The result is a JSON object, whose `transaction` field has the requested transaction. See the [Transaction format documentation](transactions.html) for a complete explanation of the fields of a transaction.

```js
{
  "success": true,
  "transaction": {
    "Account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "Amount": {
      "currency": "USD",
      "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
      "value": "0.01"
    },
    "Destination": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
    "Fee": "10",
    "Flags": 131072,
    "SendMax": "10",
    "Sequence": 11,
    "SigningPubKey": "03AB40A0490F9B7ED8DF29D246BF2D6269820A0EE7742ACDD457BEA7C7D0931EDB",
    "TransactionType": "Payment",
    "TxnSignature": "304402206B62F24BA371DF6E8F2F5A4D0C006F4081494B8ED49F9B2C453FF50B58AB170702200886487FFD272799E5C88547692AD7DD48B04E10070F7A1F36D7AF73CCFB708D",
    "hash": "9D591B18EDDD34F0B6CF4223A2940AEA2C3CC778925BABF289E0011CD8FA056E",
    "inLedger": 8924146,
    "ledger_index": 8924146,
    "meta": {
      "AffectedNodes": [
        {
          "ModifiedNode": {
            "FinalFields": {
              "Account": "rUrgXPxenRbjnFDXKWUhH8mBJcQ2CyPfkG",
              "Balance": "20357167562",
              "Flags": 0,
              "OwnerCount": 44,
              "Sequence": 709
            },
            "LedgerEntryType": "AccountRoot",
            "LedgerIndex": "0193CB8318BDB270B775835373E8789F5357CEF712DF3275F92A8CEE97E352FE",
            "PreviousFields": {
              "Balance": "20357167552"
            },
            "PreviousTxnID": "41F8D5612778AC1318599217E53198940EF16063A3F4B73DECE33EA0901FA96A",
            "PreviousTxnLgrSeq": 8924070
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
              "Balance": "230999889",
              "Domain": "6D64756F31332E636F6D",
              "Flags": 0,
              "MessageKey": "0000000000000000000000070000000300",
              "OwnerCount": 0,
              "Sequence": 12
            },
            "LedgerEntryType": "AccountRoot",
            "LedgerIndex": "13F1A95D7AAB7108D5CE7EEAF504B2894B8C674E6D68499076441C4837282BF8",
            "PreviousFields": {
              "Balance": "230999909",
              "Sequence": 11
            },
            "PreviousTxnID": "8496C20AEB453803CB80474B59AB1E8FAA26725561EFF5AF41BD588B325AFBA8",
            "PreviousTxnLgrSeq": 8889845
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Balance": {
                "currency": "USD",
                "issuer": "rrrrrrrrrrrrrrrrrrrrBZbvji",
                "value": "-19.84529319487081"
              },
              "Flags": 2228224,
              "HighLimit": {
                "currency": "USD",
                "issuer": "rUrgXPxenRbjnFDXKWUhH8mBJcQ2CyPfkG",
                "value": "0"
              },
              "HighNode": "0000000000000002",
              "LowLimit": {
                "currency": "USD",
                "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
                "value": "0"
              },
              "LowNode": "0000000000000010"
            },
            "LedgerEntryType": "RippleState",
            "LedgerIndex": "2E103526973EF8CCE3340125DD66D6BF84DD8473EF693EC5E06B2ACBF2BAC155",
            "PreviousFields": {
              "Balance": {
                "currency": "USD",
                "issuer": "rrrrrrrrrrrrrrrrrrrrBZbvji",
                "value": "-19.84529324567081"
              }
            },
            "PreviousTxnID": "41F8D5612778AC1318599217E53198940EF16063A3F4B73DECE33EA0901FA96A",
            "PreviousTxnLgrSeq": 8924070
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Account": "rUrgXPxenRbjnFDXKWUhH8mBJcQ2CyPfkG",
              "BookDirectory": "3A574D1E645D05EA27A5D011AECF6C78FFB028AA9B584C245D06FE5809E78102",
              "BookNode": "0000000000000000",
              "Flags": 0,
              "OwnerNode": "0000000000000003",
              "Sequence": 696,
              "TakerGets": {
                "currency": "USD",
                "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
                "value": "15.2299999492"
              },
              "TakerPays": "2998031486"
            },
            "LedgerEntryType": "Offer",
            "LedgerIndex": "350327BB97B7707F4E7B8670C42F886E29B9C9615D4A8D93FC730DD17770D9B4",
            "PreviousFields": {
              "TakerGets": {
                "currency": "USD",
                "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
                "value": "15.23"
              },
              "TakerPays": "2998031496"
            },
            "PreviousTxnID": "41F8D5612778AC1318599217E53198940EF16063A3F4B73DECE33EA0901FA96A",
            "PreviousTxnLgrSeq": 8924070
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Balance": {
                "currency": "USD",
                "issuer": "rrrrrrrrrrrrrrrrrrrrBZbvji",
                "value": "-0.0100000508"
              },
              "Flags": 131072,
              "HighLimit": {
                "currency": "USD",
                "issuer": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
                "value": "100"
              },
              "HighNode": "0000000000000000",
              "LowLimit": {
                "currency": "USD",
                "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
                "value": "0"
              },
              "LowNode": "000000000000000B"
            },
            "LedgerEntryType": "RippleState",
            "LedgerIndex": "E3DC31319B6C121387EAE05253AF71CAF98360BF1419249DD1A218A9B4C121A9",
            "PreviousFields": {
              "Balance": {
                "currency": "USD",
                "issuer": "rrrrrrrrrrrrrrrrrrrrBZbvji",
                "value": "-0.01"
              }
            },
            "PreviousTxnID": "41F8D5612778AC1318599217E53198940EF16063A3F4B73DECE33EA0901FA96A",
            "PreviousTxnLgrSeq": 8924070
          }
        }
      ],
      "DeliveredAmount": {
        "currency": "USD",
        "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
        "value": "0.00000005080000000000001"
      },
      "TransactionIndex": 5,
      "TransactionResult": "tesSUCCESS"
    },
    "validated": true,
    "date": 464305620
  }
}
```


## Retrieve Transaction Fee ##
[[Source]<br>](https://github.com/ripple/ripple-rest/blob/develop/api/info.js#L42 "Source")

(New in [Ripple-REST v1.3.1](https://github.com/ripple/ripple-rest/releases/tag/1.3.1-rc1))

Retrieve the current transaction fee, in XRP, for the `rippled` server Ripple-REST is connected to. If Ripple-REST is connected to multiple rippled servers, returns the median fee among the connected servers.


```
GET /v1/transaction-fee
```

[Try it! >](https://ripple.com/build/rest-tool/#retrieve-transaction-fee)

#### Response ####

The response is a JSON object, whose `fee` field is a string containing a decimal amount of XRP that the `rippled` server requires to be destroyed in order to process and relay the transaction to the network.

```js
{
  "success": true,
  "fee": "0.012"
}
```


## Create Client Resource ID ##

Generate a universally-unique identifier suitable for use as the Client Resource ID for a payment.


```
GET /v1/uuid
```

[Try it! >](https://ripple.com/build/rest-tool/#generate-uuid)

#### Response ####

```js
{
  "success": true,
  "uuid": "a5a8fe40-3795-4b10-b2b6-f05f3ca31db9"
}
```
