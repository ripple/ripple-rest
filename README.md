# `ripple-simple.js`

A set of tools to simply connect to the Ripple network. The components are:

1. [ripple-simple.js Library](README.md#1-ripple-simplejs-library)
2. [Simplified REST API](README.md#2-simplified-rest-api)
3. [Command Line Tools](README.md#3-command-line-Tools)







## 1. `ripple-simple.js` Library

Built on top of [`ripple-lib`](https://github.com/ripple/ripple-lib/), this library simplifies Ripple transaction submission and account activity analysis. 

Core features include:

* Simplified transaction formats
* Robust transaction submission 
* Definitive transaction confirmation
* Account activity monitoring
* Optional connection to persistent data store





## 2. Simplified REST API

This is an Express.js app that utilizes `ripple-simple.js` to provide robust transaction submission, definitive transaction confirmation, and account activity monitoring over HTTP.





## 3. Command Line Tools

Similar to the Simplified REST API, this toolset provides an interface to the `ripple-simple.js` functions.


