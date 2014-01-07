# Simplified Payment API Quickstart

## Resources

1. [POST /api/v1/address/:address/payment/:accountSecret](API.md#post-apiv1addressaddresspaymentaccountsecret) - Submit payment
2. [GET /api/v1/address/:address/nextTx/:txHash](API.md#get-apiv1addressaddressnexttxtxhash) - Get next transaction for an account
3. [GET /api/v1/address/:address/payment/:txHash](API.md#get-apiv1addressaddresspaymenttxhash) - Get specific transaction for an account

-----------

### POST /api/v1/address/:address/payment/:accountSecret

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
	srcTxID: '115',
	srcTag: '2409238',

	dstValue: '100',
	dstCurrency: 'XRP',
	dstIssuer: '',
	dstSlippage: '0',
	dstTxID: '238',
	dstTag: '120923965'
}
```

__Response:__

```js
{
	// Original Values
	srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
	dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',

	srcValue: '3',
	srcCurrency: 'USD',
	srcIssuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
	srcSlippage: '0.50',
	srcTxID: '115',
	srcTag: '2409238',

	dstValue: '100',
	dstCurrency: 'XRP',
	dstIssuer: '',
	dstSlippage: '0',
	dstTxID: '238',
	dstTag: '120923965',

	// Generated Values
	txSstatus: 'tx_queued',
	txHash: '61DE29B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E',
	txPrevHash: '510D7756D27B7C41108F3EC2D9C8045D2AA5D7DE7E864CDAB1E9D170497D6B2B',
	txFee: '0.00001',
	txSequence: '117'

	// Additional fields will be added once transaction is processed and written into the Ripple ledger
}

```

See API Reference for all available fields.

-----------

### GET /api/v1/address/:address/nextTx/:txHash

*should you be able to query by srcTxID or txSeqNumber?*


__Route:__ `/api/v1/address/rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh/nextTx/510D7756D27B7C41108F3EC2D9C8045D2AA5D7DE7E864CDAB1E9D170497D6B2B` 

__Response:__

... if payment succeeded:
```js
{
	txType: 'paymentIncoming',
	txPrevHash: '510D7756D27B7C41108F3EC2D9C8045D2AA5D7DE7E864CDAB1E9D170497D6B2B',
	txHash: '70DF19B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E'
	txSeqNumber: '70',
	srcTxID: '115',
	txResult: 'tesSUCCESS'
}
```
... or if that transaction hasn't been processed yet:
```js
{
	txType: 'none',
	txPrevHash: '70DF19B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E',
	txHash: '',
	txSeqNumber: '70',
	srcTxID: '115',
	txResult: ''
}
```
... or if that payment failed:
```js
{
	txType: 'paymentFailed',
	txPrevHash: '510D7756D27B7C41108F3EC2D9C8045D2AA5D7DE7E864CDAB1E9D170497D6B2B',
	txHash: '70DF19B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E', // TODO: would it report the hash?
	txSeqNumber: '70',
	srcTxID: '115',
	txResult: 'tecUNFUNDED_PAYMENT'
}
```

See API Reference for all available fields.

-----------

### GET /api/v1/address/:address/payment/:txHash

__Route:__ /api/v1/address/rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh/payment/70DF19B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E

__Response:__

```js
{
	// Original Values
	srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
	dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',

	srcValue: '3',
	srcCurrency: 'USD',
	srcIssuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
	srcSlippage: '0.50',
	srcTxID: '115',
	srcTag: '2409238',

	dstValue: '100',
	dstCurrency: 'XRP',
	dstIssuer: '',
	dstSlippage: '0',
	dstTxID: '238',
	dstTag: '120923965',

	// Generated Values
	txSstatus: 'tx_queued',
	txHash: '61DE29B67CD4E2EAB171D4E5982B34511DB0E9FC00458834F5C05A4686597F4E',
	txPrevHash: '510D7756D27B7C41108F3EC2D9C8045D2AA5D7DE7E864CDAB1E9D170497D6B2B',
	txFee: '0.00001',
	txSequence: '117'

	// Parsed From Transaction Ledger Entry
	txValidated: 'true',
	txLedger: '4296180',
	txTimestamp: '1389099822',
	txResult: 'tesSUCCESS',
	srcDebit: '3.157',
	dstCredit: '100'
}
```
OR

`HTTP 404 Error` if transaction does not exist or has not been processed and written into the Ripple ledger

See Reference for all available fields.

-----------
