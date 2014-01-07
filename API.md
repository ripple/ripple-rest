# `ripple-simple.js` RESTful API

## Resources

1. [POST /api/v1/address/:address/payment/:signingKey](API.md#post-apiv1addressaddresspaymentsigningkey) - Submit payment
2. [GET /api/v1/address/:address/nextTx/:txHash](API.md#get-apiv1addressaddressnexttxtxhash) - Get next transaction for an account
3. [GET /api/v1/address/:address/payment/:txHash](API.md#get-apiv1addressaddresspaymenttxhash) - Get specific transaction for an account



-----------

### POST /api/v1/address/:address/payment/:accountSecret


#### POST Parameters

| Field         | Required | Type      | Description
|---------------|----------|-----------|----------
| `srcAddress`  | yes | Ripple address |
| `dstAddress`  | yes | Ripple address |
| `dstValue`    | [see Notes below](API.md#notes-on-srcvalue-srccurrency-srcissuer-dstvalue-dstcurrency-dstissuer) | string representation of floating point number | Amount recipient will receive (e.g. `'100.0'`)
| `dstCurrency` | [see Notes below](API.md#notes-on-srcvalue-srccurrency-srcissuer-dstvalue-dstcurrency-dstissuer) | string | Currency that recipient will receive (e.g. `'USD'` or `'XRP'`, note that for non-`'XRP'` values recipient must have a trustline in this currency)
| `dstIssuer`   | [see Notes below](API.md#notes-on-srcvalue-srccurrency-srcissuer-dstvalue-dstcurrency-dstissuer) | gateway Ripple address or `''` for XRP | string | Issuer of currency that recipient will receive (note that for currencies other than `'XRP'` recipient must have a trustline with this gateway)
| `srcValue`	| [see Notes below](API.md#notes-on-srcvalue-srccurrency-srcissuer-dstvalue-dstcurrency-dstissuer) | string representation of floating point number | Amount you will send (e.g. `'100.0'`) 
| `srcCurrency` | [see Notes below](API.md#notes-on-srcvalue-srccurrency-srcissuer-dstvalue-dstcurrency-dstissuer) | string | Currency that you will send (e.g. `'USD'` or `'XRP'`)
| `srcIssuer`   | [see Notes below](API.md#notes-on-srcvalue-srccurrency-srcissuer-dstvalue-dstcurrency-dstissuer) | gateway Ripple address or `''` for XRP
| `srcSlippage` | no, defaults to `'0'`| string representation of floating point number | Source account will never send more than `srcValue` + `srcSlippage`
| `dstSlippage` | no, defaults to `'0'`| string representation of floating point number | Destination account will never receive less than `dstValue` - `dstSlippage`
| `srcTag` 		| no, defaults to `''` | string representation of a UINT32 for 'sub-accounts' of the address
| `dstTag` 		| no, defaults to `''` | string representation of a UINT32 for 'sub-accounts' of the address
| `srcID`  		| no, defaults to `''` | string | Used for sender accounting *(not currently stored in Ripple Network Ledger)*
| `dstID`  		| no, defaults to `''` | string | Used for recipient accounting and invoicing
| `txPaths` 	| no, defaults to `''` | string | Supply paths from manual path-find
| `srcBalances` | no, defaults to `''` | string | For hosted wallets, supply a string representation of array of amount objects in priority order


##### Notes on `srcValue`, `srcCurrency`, `srcIssuer`, `dstValue`, `dstCurrency`, `dstIssuer`

`src` AND/OR `dst` values can be specified, depending on which of the following circumstances the payment fits into:
	* __Send (sender pays for conversion and fees)__
		1. "I want Bob to receive __exactly__ 5 USD. I’m willing to spend __no more than__ 5 USD."
			```js
			{
				srcValue: '5'
				srcCurrency: 'USD',
				srcIssuer: 'r...',
				srcSlippage: '0'

				dstValue: '5',
				dstCurrency: 'USD',
				dstIssuer: 'r...',
				dstSlippage: '0'
			}
			```
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

### GET /api/v1/address/:address/next_tx/:txHash

#### Response JSON

Example for `/api/v1/address/:address/nextTx/510D7756D27B7C41108F3EC2D9C8045D2AA5D7DE7E864CDAB1E9D170497D6B2B`: 
```js
{
	txPrevHash: '510D7756D27B7C41108F3EC2D9C8045D2AA5D7DE7E864CDAB1E9D170497D6B2B',
	txHash: '70DF19B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E'
	txSeqNumber: 70,
	txType: 'paymentIncoming' // see below for txType values

}
```
OR
```js
{
	txPrevHash: '70DF19B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E',
	txHash: '',
	txSeqNumber: -1,
	txType: 'none'
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
	srcValue: 3.00,
	srcCurrency: 'USD',
	srcIssuer: 'r...',
	srcSlippage: 0.01,
	dstValue: 100,
	dstCurrency: 'XRP',
	dstIssuer: '',

	txStatus: 'tx_processed',

	// Generated fields:
	txHash: '61DE29B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E',
	txPrevHash: '510D7756D27B7C41108F3EC2D9C8045D2AA5D7DE7E864CDAB1E9D170497D6B2B',
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
