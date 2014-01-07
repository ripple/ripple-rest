# `ripple-simple.js` RESTful API Quickstart

## Resources

1. [POST /api/v1/address/:address/payment/:accountSecret](API.md#post-apiv1addressaddresspaymentaccountsecret) - Submit payment
2. [GET /api/v1/address/:address/nextTx/:txHash](API.md#get-apiv1addressaddressnexttxtxhash) - Get next transaction for an account
3. [GET /api/v1/address/:address/payment/:txHash](API.md#get-apiv1addressaddresspaymenttxhash) - Get specific transaction for an account

-----------

### POST /api/v1/address/:address/payment/:accountSecret

#### POST Data Example

__Route:__ /api/v1/address/rHb9CJAWyB4rj91VRWn96DkukG4bwdtyT/payment/s...

__Data:__
```js
{
	srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
	dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',

	srcValue: '3',
	srcCurrency: 'USD',
	srcIssuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
	srcSlippage: '0.50',

	dstValue: '100',
	dstCurrency: 'XRP',
	dstIssuer: '',
	dstSlippage: '0',
	dstTag: '120923965'
}
```

#### POST Response Example

```js
{
	// Original Values
	srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
	dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',

	srcValue: '3',
	srcCurrency: 'USD',
	srcIssuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
	srcSlippage: '0.50',

	dstValue: '100',
	dstCurrency: 'XRP',
	dstIssuer: '',
	dstSlippage: '0',
	dstTag: '120923965',

	// Generated Values
	// TODO: what goes here immediately?
}

```

See API Reference for all available fields.

-----------

### GET /api/v1/address/:address/next_tx/:txHash

#### Response JSON

Example for `/api/v1/address/:address/nextTx/510D7756D27B7C41108F3EC2D9C8045D2AA5D7DE7E864CDAB1E9D170497D6B2B`: 
```js
{
	txPrevHash: '510D7756D27B7C41108F3EC2D9C8045D2AA5D7DE7E864CDAB1E9D170497D6B2B',
	txHash: '70DF19B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E'
	txSeqNumber: 70,
	txType: 'paymentIncoming'
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

See API Reference for all available fields.

-----------

### GET /api/v1/address/:address/payment/:txHash

#### Response JSON

```js
{
	// Original Values
	srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
	dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',

	srcValue: '3',
	srcCurrency: 'USD',
	srcIssuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
	srcSlippage: '0.50',

	dstValue: '100',
	dstCurrency: 'XRP',
	dstIssuer: '',
	dstSlippage: '0',
	dstTag: '120923965',

	// Generated Values
	txHash: '61DE29B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E',
	txPrevHash: '510D7756D27B7C41108F3EC2D9C8045D2AA5D7DE7E864CDAB1E9D170497D6B2B',
	txFee: '0.00001',
	txSequence: 117,
	txValidated: true,
	txLedger: 4296180,
	txTimestamp: 1389099822,
	txResult: 'tesSUCCESS',
	srcDebit: '3.157',
	dstCredit: '100'
}
```
OR

`HTTP 404 Error` if transaction does not exist or has not been processed and written into the Ripple ledger

See Reference for all available fields.

-----------
