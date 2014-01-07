# `ripple-simple.js` RESTful API

## Resources

### GET /api/v1/address/:address/next_tx/:txHash

#### Request JSON

None

#### Response JSON

```js
{
	txType: 'paymentIncoming',
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

* `txType` - one of the following:
	+ paymentIncoming
	+ paymentOutgoingConfirmation
	+ paymentOutgoingCancellation
	+ paymentRippledThrough
	+ orderPlaced
	+ orderTaken
	+ orderCancelled
	+ trustlineIncoming
	+ trustlineOutgoing
	+ none

### GET /api/v1/address/:address/payment/:txHash

### POST /api/v1/address/:address/payment/:signingKey