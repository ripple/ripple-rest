##06/11/2014

##Version:
1.1.0

## Added features
- Add exclude_failed option to getAccountTransactions (defaults to false)
- Add protocol, host, and port (when applicable) to URLs returned to client
- Coveralls for testing

###Internal Changes
- Add JsDoc comments to transactions.js, payments.js, and notifications.js
- Centralize ripple-lib transaction submit and get functions in transactions.js
- Significantly simplify getAccountTransactions logic and parameters set by recursive call
- Test ripple-lib transaction functions
- Test transaction submission to ensure transaction is saved to the database every time its state is changed
- Test payment submission and retrieval
- Test notifications
- Move notification and payment formatter functions into notifications.js and payments.js, respectively
- Replace hard-coded server connection timeout value with exported variable in server-lib.js

###Bug Fixes
- Callback with error and entry for function to query database for transaction in getTransactionHelper
- Prevent second HTTP response for error after transaction proposed event in submitTransaction function
- Validate account in getTransaction
- Attach client_resource_id in getTransaction so it is correctly returned to client
- Strange pathfinding error message when no paths are found because of a lack of liquidity

##06/10/2014

###Version:
1.0.2

###Fixed bugs:
- GET /v1/accounts/{:account}/payments/{:hash} not responding

##06/04/2014

###Version: 
1.0.1

###Fixed bugs:
- Client resource id now properly returned
- XRP Pathfind bug
- Pathfinding error message
- missing invoide_id
- normalize account settings 
- notification timestamp formatting

###Added features:
- Travis.yml for Continuous Integration
- License
- Tests for balances, trust lines
- Add debug mode

