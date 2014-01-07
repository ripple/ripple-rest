# `ripple-simple.js` RESTful API

## Resources

1. [GET /api/v1/address/:address/nextTx/:txHash](API.md#get-apiv1addressaddressnexttxtxhash) - Get next transaction for an account
2. [GET /api/v1/address/:address/payment/:txHash](API.md#get-apiv1addressaddresspaymenttxhash) - Get specific transaction for an account
3. [POST /api/v1/address/:address/payment/:signingKey](API.md#post-apiv1addressaddresspaymentsigningkey) - Submit payment

-----------

### GET /api/v1/address/:address/nextTx/:txHash

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


-----------

### GET /api/v1/address/:address/payment/:txHash

#### Response JSON

```js
{
	// Original fields:
	srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
	dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',
	srcAmount: {
		value: '<3.00',
		currency: 'USD',
		issuer: 'r...'
	},
	dstAmount: {
		value: '100',
		currency: 'XRP',
		issuer: ''
	},
	txStatus: 'tx_queued'

	// Generated fields:
	txHash: '61DE29B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E',
	txFee: '10',
	txSequence: 117,
	txValidated: true,
	txLedger: 4296180,
	txTimestamp: 1389099822,
	txResult: 'tesSUCCESS',
	srcDebit: {
		value: '2.97',
		currency: 'USD',
		issuer: 'r...'
	},
	dstCredit: {
		value: '100',
		currency: 'XRP',
		issuer: ''
	}
}
```
OR

`HTTP 404 Error` if transaction does not exist or has not been processed and written into the Ripple ledger


-----------

### POST /api/v1/address/:address/payment/:signingKey

#### Request JSON

```js
{
	srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
	dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',
	// see below for notes about srcAmount and dstAmount
	srcAmount: {
		value: '<3.00',
		currency: 'USD',
		issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
	},
	dstAmount: {
		value: '100',
		currency: 'XRP',
		issuer: ''
	}
}
```

##### Required Parameters
+ `srcAddress`
+ `dstAddress`
+ `srcAmount` AND/OR `dstAmount` - one or both can be specified, depending on which of the following circumstances the payment fits into:
	* __Send (sender pays for conversion and fees)__
		1. I want Bob to receive __exactly__ 5 USD. I’m willing to spend __no more than__ 5 USD.
			+ `srcAmount`: `{ value: '<5', currency: 'USD', issuer: 'r...' }`
			+ `dstAmount`: `{ value: '5',   currency: 'USD', issuer: 'r...' }`
		2. I want Bob to receive __exactly__ 5 USD. I’m willing to spend __any amount__ of USD.
			+ `srcAmount`: `{ value: '', currency: 'USD', issuer: 'r...' }`
			+ `dstAmount`: `{ value: '5',   currency: 'USD', issuer: 'r...' }`
		3. I want Bob to receive __exactly__ 5 USD. I’m willing to spend __any amount__ of __any currency__.
			+ `dstAmount`: `{ value: '5',   currency: 'USD', issuer: 'r...' }`
	* __Pay (receiver pays for conversion and fees)__
		1. I’m willing to pay __exactly__ 5 USD. I want Bob to receive __any amount__ of USD.
			+ `srcAmount`: `{ value: '5', currency: 'USD', issuer: 'r...' }`
			+ `dstAmount`: `{ value: '',   currency: 'USD', issuer: 'r...' }`
		2. I’m willing to pay __no more than__ 5 USD. I want Bob to receive __no more than__ 5 USD.
			+ `srcAmount`: `{ value: '<5', currency: 'USD', issuer: 'r...' }`
			+ `dstAmount`: `{ value: '<5',   currency: 'USD', issuer: 'r...' }`
		3. I’m willing to pay __no more than__ 5 USD. I want Bob to receive __no more than__ 5 USD, and Bob is willing to accept __no less than__ 4.95 USD
			+ `srcAmount`: `{ value: '<5', currency: 'USD', issuer: 'r...' }`
			+ `dstAmount`: `{ value: '4.95-5',   currency: 'USD', issuer: 'r...' }`

###### Amount Object Rules
+ amounts can be left undefined
+ if defined, amount objects must always have fields for `value`, `currency`, and `issuer`
+ in the case of XRP, `issuer` is `''` (the empty string)
+ `value` strings can take the following forms (where `'#'` indicates a positive floating point number) :
	* `''` - equates to `'>0'`
	* `'#'` - exact value
	* `'#-#'` - range of values (inclusive)
	* `'<#'` - less than (inclusive)
	* `'>#'` - greater than (inclusive)

##### Optional Parameters
+ `srcTag` - TODO: what is the format for the tags and IDs?
+ `dstTag`
+ `srcID`
+ `dstID`
+ `srcBalances` - for hosted wallets, supply an array of amount objects in priority order (e.g. `[{value: '978.50', currency: 'USD', issuer: 'r...'}, {value: '513', currency: 'EUR', issuer: 'r...'}]` to have an account's USD balance be considered before its EUR balance)
+ `txPaths` - supply paths from manual path-find
	* TODO: what is the format for these?



#### Response JSON

```js
{
	// Original fields:
	srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
	dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',
	srcAmount: {
		value: '<3.00',
		currency: 'USD',
		issuer: 'r...'
	},
	dstAmount: {
		value: '100',
		currency: 'XRP',
		issuer: ''
	},
	txStatus: 'tx_queued',
	txHash: '61DE29B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E'
}
```

TODO: if the transaction has only been queued by the time the API sends the response (which seems probable) should we have it just return the status and the txHash? Also, if the txFee changes before the transaction is processed and written into the ledger, won't the hash change? If the hash changes, how will the client look up the status of a transaction they submitted a little while ago?

-----------
