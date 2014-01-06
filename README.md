# `ripple-simple.js`

A set of tools to simply connect to the Ripple network. The components are:

1. [ripple-simple.js Library](README.md#1-ripple-simplejs-library)
2. [Simplified REST API](README.md#2-simplified-rest-api)
3. [Command Line Tools](README.md#3-command-line-tools)





## 1. `ripple-simple.js` Library

Built on top of [`ripple-lib`](https://github.com/ripple/ripple-lib/), this library simplifies Ripple transaction submission and account activity analysis.


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
	srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', // optional if ripple.Simply is intialized with srcAddress
	dstAddress: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',
	dstAmount: {
		value: 100.0,
		currency: 'XRP',
		issuer: '' // empty string for XRP, gateway address for all other currencies
	}
}
```

###### Standard parameters

* srcAddress
* dstAddress
* srcAmount
* dstAmount

###### Advanced parameters

* slippage
* srcTag
* srcID
* dstTag
* dstID
* srcBalances
* txPaths
* expireAfter // time or ledger_index?




##### Simplified Trade Transaction

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

##### `err` format


##### `res` format



#### 3. Definitive transaction confirmation


#### 4. Account activity monitoring


#### 5. Optional connection to persistent data store





## 2. Simplified REST API

This is an Express.js app that utilizes `ripple-simple.js` to provide robust transaction submission, definitive transaction confirmation, and account activity monitoring over HTTP.





## 3. Command Line Tools

Similar to the Simplified REST API, this toolset provides an interface to the `ripple-simple.js` functions.


