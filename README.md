# `ripple-simple.js`

A set of tools to simply connect to the Ripple network. The components are:

1. [ripple-simple.js Library](README.md#1-ripple-simplejs-library)
2. [Simplified REST API](README.md#2-simplified-rest-api)
3. [Command Line Tools](README.md#3-command-line-tools)





## 1. `ripple-simple.js` Library

Built on top of [`ripple-lib`](https://github.com/ripple/ripple-lib/), this library simplifies Ripple transaction submission and account activity analysis.



### Including in Node.js

```js
var ripple = require('ripple-simple');

var simply = new ripple.Simply({
	srcAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'
});
```



### Including in a webpage

TODO



### Core features

* Simplified transaction formats
* Robust transaction submission 
* Definitive transaction confirmation
* Account activity monitoring
* Optional connection to persistent data store



#### Simplified transaction formats

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

Available parameters:

* srcAddress
* dstAddress
* srcAmount
* dstAmount
* srcTag
* srcID
* dstTag
* dstID
* srcBalances





## 2. Simplified REST API

This is an Express.js app that utilizes `ripple-simple.js` to provide robust transaction submission, definitive transaction confirmation, and account activity monitoring over HTTP.





## 3. Command Line Tools

Similar to the Simplified REST API, this toolset provides an interface to the `ripple-simple.js` functions.


