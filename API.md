# `ripple-simple.js` RESTful API

## Resources

1. [GET /api/v1/address/:address/nextTx/:txHash](API.md#get-apiv1addressaddressnexttxtxhash)
2. [GET /api/v1/address/:address/payment/:txHash](API.md#get-apiv1addressaddresspaymenttxhash)
3. [POST /api/v1/address/:address/payment/:signingKey](API.md#post-apiv1addressaddresspaymentsigningkey)

### GET /api/v1/address/:address/nextTx/:txHash

#### Request JSON

None

#### Response JSON

```js
{
	txType: 'paymentIncoming', // see below for txType values
	txSeqNumber: 70,
	txHash: '70DF19B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E'
}
```
OR
```js
{
	txType: 'none',
	txSeqNumber: -1,
	txHash: ''
}
```

##### `txType` values:
+ `'paymentIncoming'`
+ `'paymentOutgoingConfirmation'`
+ `'paymentOutgoingCancellation'`
+ `'paymentRippledThrough'`
+ `'orderPlaced'`
+ `'orderTaken'`
+ `'orderCancelled'`
+ `'trustlineChangeIncoming'`
+ `'trustlineChangeOutgoing'`
+ `'accountSet'`
+ `'none'`




### GET /api/v1/address/:address/payment/:txHash

#### Request JSON

None

#### Response JSON

```js

```
OR

`HTTP 404 Error`



### POST /api/v1/address/:address/payment/:signingKey