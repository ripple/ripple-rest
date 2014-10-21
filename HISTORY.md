## 1.3.0

+ Memo field support

+ Freeze support

+ New endpoint to generate an address/secret pair, `/account/new`

+ New configuration, you will have to change your config file

+ New database interface, support for sqlite in memory or persistent through config path

+ Deprecated Postgres support

+ Transitioned to Express4

+ Refactored response and error handling, improves consistency of response messages

+ Expose `router` and `remote` as `RippleRestPlugin` to use as a plugin for other modules

+ Centralize connection checking, improves consistency of connected responses

+ Centralize logging using winston, timestamps on all logs

+ New test-suite

+ Log all connected servers, add reconnect to servers on SIGHUP

+ Tied api version to major package version and added package version to index page `/` or `/v1`

+ Update ripple-lib which fixes several stability problems and crashes

+ Fix: issue where forcible server connectivity check would cause permanent server disconnect

+ Fix: show index page while hitting root `/`

+ Fix: issue with notification parsing

+ Fix: check and validate issuer upon payment

+ Fix: database reset on startup

+ Fix: Check tx.meta exists before accessing

+ Fix: Allow browser-based client to make POST to ripple-rest server

+ Fix: Occasional crash on getting payments for account

+ Code refactor and cleanup


## 1.2.5

+ Fix: Check that tx.meta exists before accessing

+ Fix: Case where ripple-rest would crash when rippled could not be connected to


## 1.2.4

+ Change rconsole logging from stderr to stdout

+ Add timestamps to HTTP(S) request logging

+ Fix database reset on startup


## 1.2.1
07/29/2014

##Added Features
+ Enable invoiceID

##Bug Fixes
+ Do not limit the amount of account transactions per ledger to 10,
  fixing the issue where no incoming transactions were ever notified.

## 1.2.0
07/16/2014

##Added features
+ Return 502 Bad Gateway middleware when remote is not connected to rippled.

##Bug Fixes
+ 502 Middleware fixes the crash-on-startup bug when clients try to connect before
  ripple rest is connected to rippled.


## 1.1.2
07/10/2014

##Added features
+ Code climate integration badge
+ capistrano scripts for server deployment
+ new version of ripple-lib

##Bug Fixes
+ Setting SendMax on payments
+ Fix broken outgoing payments endpoint

##1.1.1
06/18/2014

##Added features
+ Add Istanbul code coverage tests
+ Refactor out express app object
+ Add a few integration tests using superagent

##Bug Fixes
+ Return 500 instead of 200 on invalid ripple address


## 1.1.0
06/11/2014

## Added features
+ Add exclude_failed option to getAccountTransactions (defaults to false)
+ Add protocol, host, and port (when applicable) to URLs returned to client
+ Coveralls for testing

###Internal Changes
+ Add JsDoc comments to transactions.js, payments.js, and notifications.js
+ Centralize ripple-lib transaction submit and get functions in transactions.js
+ Significantly simplify getAccountTransactions logic and parameters set by recursive call
+ Test ripple-lib transaction functions
+ Test transaction submission to ensure transaction is saved to the database every time its state is changed
+ Test payment submission and retrieval
+ Test notifications
+ Move notification and payment formatter functions into notifications.js and payments.js, respectively
+ Replace hard-coded server connection timeout value with exported variable in server-lib.js

###Bug Fixes
+ Callback with error and entry for function to query database for transaction in getTransactionHelper
+ Prevent second HTTP response for error after transaction proposed event in submitTransaction function
+ Validate account in getTransaction
+ Attach client_resource_id in getTransaction so it is correctly returned to client
+ Strange pathfinding error message when no paths are found because of a lack of liquidity


## 1.0.2
06/10/2014

###Fixed bugs:
+ GET /v1/accounts/{:account}/payments/{:hash} not responding


## 1.0.1
06/04/2014

###Fixed bugs:
+ Client resource id now properly returned
+ XRP Pathfind bug
+ Pathfinding error message
+ missing invoide_id
+ normalize account settings
+ notification timestamp formatting

###Added features:
+ Travis.yml for Continuous Integration
+ License
+ Tests for balances, trust lines
+ Add debug mode