#### POST Data 

##### Payment Object Basic Fields

| Field         | Required | Description
|---------------|----------|----------
| `srcAddress`  | yes | Ripple address of sender
| `dstAddress`  | yes | Ripple address of recipient
| `dstValue`    | [see Notes below](API.md#notes-on-srcvalue-srccurrency-srcissuer-dstvalue-dstcurrency-dstissuer) | Amount recipient will receive (e.g. `'100.0'`)
| `dstCurrency` | [see Notes below](API.md#notes-on-srcvalue-srccurrency-srcissuer-dstvalue-dstcurrency-dstissuer) | Currency that recipient will receive
| `dstIssuer`   | [see Notes below](API.md#notes-on-srcvalue-srccurrency-srcissuer-dstvalue-dstcurrency-dstissuer) | Ripple address of issuer of currency that recipient will receive or `''` for XRP
| `srcValue`	| [see Notes below](API.md#notes-on-srcvalue-srccurrency-srcissuer-dstvalue-dstcurrency-dstissuer) | Amount that will be sent (e.g. `'100.0'`) 
| `srcCurrency` | [see Notes below](API.md#notes-on-srcvalue-srccurrency-srcissuer-dstvalue-dstcurrency-dstissuer) | Currency that will be sent (e.g. `'USD'` or `'XRP'`)
| `srcIssuer`   | [see Notes below](API.md#notes-on-srcvalue-srccurrency-srcissuer-dstvalue-dstcurrency-dstissuer) | Ripple address of issuer of currency that will be sent

##### Payment Object Additional Fields

| Field         | Required | Description
|---------------|----------|----------
| `srcSlippage` | no, default: `'0'`| Source account will never send more than `srcValue` + `srcSlippage`
| `dstSlippage` | no, default: `'0'`| Destination account will never receive less than `dstValue` - `dstSlippage`
| `srcTag` 		| no, default: `''` | UINT32 that refers to 'sub-accounts' of the source address
| `dstTag` 		| no, default: `''` | UINT32 that Refers to 'sub-accounts' of the destination address
| `srcID`  		| no, default: `''` | Used for sender accounting *(not currently stored in Ripple Network Ledger)*
| `dstID`  		| no, default: `''` | Used for recipient accounting and invoicing
| `txPaths` 	| no, default: `''` | Supply paths from manual path-find
| `srcBalances` | no, default: `''` | For hosted wallets, supply a string representation of array of amount objects in priority order


##### *Notes on `srcValue`, `srcCurrency`, `srcIssuer`, `dstValue`, `dstCurrency`, `dstIssuer`

Either or both of the `src` and `dst` sets of values can be specified, depending on which of the following circumstances the payment fits into:
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
		```js
		{
			srcValue: '' // the srcValue field could be omitted or the srcSlippage set to a very high value
			srcCurrency: 'USD',
			srcIssuer: 'r...',

			dstValue: '5',
			dstCurrency: 'USD',
			dstIssuer: 'r...',
			dstSlippage: '0'
		}
		```
	3. I want Bob to receive __exactly__ 5 USD. I’m willing to spend __any amount__ of __any currency__.
		```js
		{
			dstValue: '5',
			dstCurrency: 'USD',
			dstIssuer: 'r...',
			dstSlippage: '0'
		}
		```
* __Pay (receiver pays for conversion and fees)__
	1. I’m willing to pay __exactly__ 5 USD. I want Bob to receive __any amount__ of USD.
		```js
		{
			srcValue: '5'
			srcCurrency: 'USD',
			srcIssuer: 'r...',
			srcSlippage: '0'

			dstValue: '', // the dstValue field could be omitted or the dstSlippage set to a very high value
			dstCurrency: 'USD',
			dstIssuer: 'r...',
		}
		```
	2. I’m willing to pay __no more than__ 5 USD. I want Bob to receive __no more than__ 5 USD.
		```js
		{
			srcValue: '0'
			srcCurrency: 'USD',
			srcIssuer: 'r...',
			srcSlippage: '5'

			dstValue: '5',
			dstCurrency: 'USD',
			dstIssuer: 'r...',
			dstSlippage: '0'
		}
		```
	3. I’m willing to pay __no more than__ 5 USD. I want Bob to receive __no more than__ 5 USD, and Bob is willing to accept __no less than__ 4.95 USD
		```js
		{
			srcValue: '0'
			srcCurrency: 'USD',
			srcIssuer: 'r...',
			srcSlippage: '5'

			dstValue: '5',
			dstCurrency: 'USD',
			dstIssuer: 'r...',
			dstSlippage: '0.05'
		}
		```



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