# `ripple-simple.js`

A set of tools to simply connect to the Ripple network. The components are:

1. [ripple-simple.js Library](README.md#1-ripple-simplejs-library)
2. [Simplified REST API](README.md#2-simplified-rest-api)
3. [Command Line Tools](README.md#3-command-line-tools)





## 1. `ripple-simple.js` Library

Built on top of [`ripple-lib`](https://github.com/ripple/ripple-lib/), this library simplifies Ripple transaction submission and account activity analysis.

```js
var Simple = require('ripple-simple');

var simply = new Simple({
	// Simple options
});


// Simple Transaction Submission

simply.sendPayment(SimplePayment, callback);

simply.createOrder(SimpleOrder, callback);

simply.setTrust(SimpleTrust, callback);


// Simple Account Activity Analysis

simply.monitorAccount(rpAddress, function(transaction){ ... });

simply.confirmTransaction(txHash, function(status){ ... });

simply.getTransaction(txHash, function(transaction){ ... });

simply.getNextTransaction(txHash, function(transaction){ ... });

```


### Core features

1. Simplified transaction formats
2. Robust transaction submission 
3. Definitive transaction confirmation
4. Account activity monitoring
5. Optional connection to persistent data store



#### 1. Simplified transaction formats

##### Simplified Payment Transaction

```js
{
	srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
	dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',
	dstAmount: {
		value: 100.0,
		currency: 'XRP',
		issuer: '' // empty string for XRP, gateway address for all other currencies
	}
}
```

###### Standard parameters

* `srcAddress`
* `dstAddress`
* `srcAmount`
* `dstAmount`

###### Advanced parameters

* `slippage`
* `srcTag`
* `srcID`
* `dstTag`
* `dstID`
* `srcBalances`
* `txPaths`
* `expireAfter` // time or ledger_index?


##### Simplified Order Transaction

TODO

##### Simplified Trust Transaction

TODO




#### 2. Robust transaction submission

```js
simply.sendPayment({
	// Simplified Payment Transaction
}, function(err, res){
	// See below for err and res formats
});
```

```js
simply.createOrder({
	// Simplified 
}, function(err, res){
	
});
```

`ripple-simple.js` will submit transactions to the Ripple network and monitor

##### `err` format

[which errors should this throw, which should it handle?]

##### `res` format

[should this return 'submitted' or wait until it is processed and return 'processed'?]



#### 3. Definitive transaction confirmation

`ripple-simple.js` will definitively confirm whether particular transactions have entered the Ripple ledger, are pending submission or validation, or have failed.

```js
simply.confirmTransaction(txHash, function(status){
	
});
```

```js
simply.getTransaction(txHash, function(transaction){
	
});
```


#### 4. Account activity monitoring

`ripple-simple.js` can be used to monitor the Ripple network for incoming, outgoing, or other transactions that affect a particular account.

```js
simply.monitorAccount(srcAddress, function(transaction){
	
});
```

```js
simply.getNextTransaction(txHash, function(transaction){
	
});
```


#### 5. Optional connection to persistent data store

The `simply` instance can be created with a connection to a persistent database to maintain the pending transaction queue and account activity log even if the process dies.


```js
var simply = new Simple({
	db: {

	} 
});
```


## 2. Simplified REST API

This is an Express.js app that utilizes `ripple-simple.js` to provide robust transaction submission, definitive transaction confirmation, and account activity monitoring over HTTP.





## 3. Command Line Tools

Similar to the Simplified REST API, this toolset provides an interface to the `ripple-simple.js` functions.


