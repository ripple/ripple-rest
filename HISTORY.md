## 1.3.0

#### Added features

+ Freeze support ([pull 167](https://github.com/ripple/ripple-rest/pull/167) and [pull 178](https://github.com/ripple/ripple-rest/pull/178))

+ Memo field support ([pull 154](https://github.com/ripple/ripple-rest/pull/154)) 

+ Add `destination_amount_submitted` and `source_amount_submitted` to Payment ([0d3599b](https://github.com/ripple/ripple-rest/commit/0d3599b4057c5cb884eade6bc11c978f8770c943) and [67134e3](https://github.com/ripple/ripple-rest/commit/67134e3ef57b808fc193f2f62579c5681aeb49cc))

+ New endpoint to generate an address/secret pair, `/wallet/new`

+ Expose `router` and `remote` as `RippleRestPlugin` to use as a plugin for other modules

+ Log all connected servers, add reconnect to servers on SIGHUP


#### Breaking changes

+ Endpoints renamed and deprecated ([6802423](https://github.com/ripple/ripple-rest/commit/6802423245d8eff7a8b35248c8c261db62422dfb))

+ New configuration, you will have to change your config file. [Documented changes](https://github.com/ripple/ripple-rest/blob/develop/docs/server-configuration.md)

+ Refactored response and error handling, improves consistency of response messages. **The response and error message format has changed.**

+ New database interface, support for sqlite in memory or persistent through config path in `config.json`

+ Deprecated Postgres support. Support sqlite only


#### Changes

+ Add protection against POODLE ([cb4f12c](https://github.com/ripple/ripple-rest/commit/cb4f12c72f2a7c756651ada49c0cb68454e75587))

+ Fix: always set issuer on `destination_amount` for path results ([1b0c731](https://github.com/ripple/ripple-rest/commit/1b0c73162c2c52469e147f99f72ea4d0f94e3132))

+ Transitioned to Express4

+ Centralize connection checking, improves consistency of connected responses

+ Centralize logging using winston, timestamps on all logs

+ New test-suite

+ Tied api version to major package version and added package version to index page `/` or `/v1`

+ Update ripple-lib which fixes several stability problems and crashes

+ Code refactor and cleanup


#### Fixes

+ Fix: improper SetFlag/ClearFlag collision error message ([d26ec5e](https://github.com/ripple/ripple-rest/commit/d26ec5eeb459d41e27415d9e827f34e32116c234))

+ Fix: `tec` transaction errors represented as success, resulting in false positives ([d14c51c](https://github.com/ripple/ripple-rest/commit/d14c51c2064efd9cc13b0e81742a6488f50c3d98)) 

+ Fix: issue where forcible server connectivity check would cause permanent server disconnect

+ Fix: show index page while hitting root `/`

+ Fix: issue with notification parsing

+ Fix: check and validate issuer upon payment

+ Fix: database reset on startup

+ Fix: Check tx.meta exists before accessing

+ Fix: Allow browser-based client to make POST to ripple-rest server

+ Fix: Occasional crash on getting payments for account




## 1.2.5

+ Fix: Check that tx.meta exists before accessing

+ Fix: Case where ripple-rest would crash when rippled could not be connected to




## 1.2.4

+ Change rconsole logging from stderr to stdout

+ Add timestamps to HTTP(S) request logging

+ Fix database reset on startup


## 1.2.1
07/29/2014

#### Added Features
+ Enable invoiceID

#### Bug Fixes
+ Do not limit the amount of account transactions per ledger to 10,
  fixing the issue where no incoming transactions were ever notified.

## 1.2.0
07/16/2014

#### Added features
+ Return 502 Bad Gateway middleware when remote is not connected to rippled.

#### Bug Fixes
+ 502 Middleware fixes the crash-on-startup bug when clients try to connect before
  ripple rest is connected to rippled.


## 1.1.2
07/10/2014

#### Added features
+ Code climate integration badge
+ capistrano scripts for server deployment
+ new version of ripple-lib

#### Bug Fixes
+ Setting SendMax on payments
+ Fix broken outgoing payments endpoint

##1.1.1
06/18/2014

#### Added features
+ Add Istanbul code coverage tests
+ Refactor out express app object
+ Add a few integration tests using superagent

#### Bug Fixes
+ Return 500 instead of 200 on invalid ripple address


## 1.1.0
06/11/2014

####  Added features
+ Add exclude_failed option to getAccountTransactions (defaults to false)
+ Add protocol, host, and port (when applicable) to URLs returned to client
+ Coveralls for testing

**Internal Changes**
+ Add JsDoc comments to transactions.js, payments.js, and notifications.js
+ Centralize ripple-lib transaction submit and get functions in transactions.js
+ Significantly simplify getAccountTransactions logic and parameters set by recursive call
+ Test ripple-lib transaction functions
+ Test transaction submission to ensure transaction is saved to the database every time its state is changed
+ Test payment submission and retrieval
+ Test notifications
+ Move notification and payment formatter functions into notifications.js and payments.js, respectively
+ Replace hard-coded server connection timeout value with exported variable in server-lib.js

#### #Bug Fixes
+ Callback with error and entry for function to query database for transaction in getTransactionHelper
+ Prevent second HTTP response for error after transaction proposed event in submitTransaction function
+ Validate account in getTransaction
+ Attach client_resource_id in getTransaction so it is correctly returned to client
+ Strange pathfinding error message when no paths are found because of a lack of liquidity


## 1.0.2
06/10/2014

#### Fixed bugs:
+ GET /v1/accounts/{:account}/payments/{:hash} not responding


## 1.0.1
06/04/2014

#### Fixed bugs:
+ Client resource id now properly returned
+ XRP Pathfind bug
+ Pathfinding error message
+ missing invoide_id
+ normalize account settings
+ notification timestamp formatting

#### Added features:
+ Travis.yml for Continuous Integration
+ License
+ Tests for balances, trust lines
+ Add debug mode