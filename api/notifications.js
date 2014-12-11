var _                   = require('lodash');
var async               = require('async');
var ripple              = require('ripple-lib');
var transactions        = require('./transactions');
var serverLib           = require('../lib/server-lib');
var remote              = require('./../lib/remote.js');
var config              = require('./../lib/config.js');
var NotificationParser  = require('./../lib/notification_parser.js');
var respond             = require('./../lib/response-handler.js');
var errors              = require('./../lib/errors.js');
var utils               = require('./../lib/utils.js');

module.exports = {
  getNotification: getNotification
};

/**
 *  Get a notification corresponding to the specified
 *  account and transaction identifier. Uses the res.json
 *  method to send errors or a notification back to the client.
 *
 *  @param {Remote} $.remote
 *  @param {/lib/db-interface} $.dbinterface
 *  @param {/lib/config-loader} $.config
 *  @param {RippleAddress} req.params.account
 *  @param {Hex-encoded String|ResourceId} req.params.identifier
 *  @param {Express.js Response} res
 *  @param {Express.js Next} next
 */
function getNotification(request, response, next) {
  getNotificationHelper(request, response, function(error, notification) {
    if (error) {
      return next(error);
    }

    var responseBody = {
      notification: notification
    };

    // Add urlBase to each url in notification
    var urlBase = utils.getUrlBase(request);
    Object.keys(responseBody.notification).forEach(function(key) {
      if (/url/.test(key) && responseBody.notification[key]) {
        responseBody.notification[key] = urlBase + responseBody.notification[key];
      }
    });

    // Move client_resource_id to response body instead of inside the Notification
    var client_resource_id = responseBody.notification.client_resource_id;
    delete responseBody.notification.client_resource_id;    
    if (client_resource_id) {
      responseBody.client_resource_id = client_resource_id;
    }

    respond.success(response, responseBody);
  });
}

/**
 *  Get a notification corresponding to the specified
 *  account and transaction identifier. Send errors back
 *  to the client using the res.json method or pass
 *  the notification json to the callback function.
 *
 *  @param {Remote} $.remote
 *  @param {/lib/db-interface} $.dbinterface
 *  @param {RippleAddress} req.params.account
 *  @param {Hex-encoded String|ResourceId} req.params.identifier
 *  @param {Express.js Response} res
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Notification} notification
 */
function getNotificationHelper(request, response, callback) {
  var account = request.params.account;
  var identifier = request.params.identifier

  if (!account) {
    return callback(new errors.InvalidRequestError('Missing parameter: account. Must be a valid Ripple Address'));
  }

  function getTransaction(async_callback) {
    transactions.getTransaction(request.params.account, request.params.identifier, async_callback);
  }

  function checkLedger(baseTransaction, async_callback) {
    serverLib.remoteHasLedger(remote, baseTransaction.ledger_index, function(error, remoteHasLedger) {
      if (error) {
        return async_callback(error);
      }
      if (remoteHasLedger) {
        async_callback(null, baseTransaction);
      } else {
        async_callback(new errors.NotFoundError('Cannot Get Notification. ' +
          'This transaction is not in the ripple\'s complete ledger set. ' +
          'Because there is a gap in the rippled\'s historical database it is ' +
          'not possible to determine the transactions that precede this one')
        );
      }
    });
  }

  function prepareNotificationDetails(baseTransaction, async_callback) {
    var notificationDetails = {
      account:         account,
      identifier:      identifier,
      transaction:     baseTransaction
    };

    // Move client_resource_id to notificationDetails from transaction
    if (baseTransaction.client_resource_id) {
      notificationDetails.client_resource_id = baseTransaction.client_resource_id;
    }
    attachPreviousAndNextTransactionIdentifiers(response, notificationDetails, async_callback);
  }

  // Parse the Notification object from the notificationDetails
  function parseNotificationDetails(notificationDetails, async_callback) {
    async_callback(null, NotificationParser.parse(notificationDetails));
  }

  var steps = [
    getTransaction,
    checkLedger,
    prepareNotificationDetails,
    parseNotificationDetails
  ];

  async.waterfall(steps, callback);
}

/**
 *  Find the previous and next transaction hashes or
 *  client_resource_ids using both the rippled and
 *  local database. Report errors to the client using res.json
 *  or pass the notificationDetails with the added fields
 *  back to the callback.
 *
 *  @param {Remote} $.remote
 *  @param {/lib/db-interface} $.dbinterface
 *  @param {Express.js Response} res
 *  @param {RippleAddress} notificationDetails.account
 *  @param {Ripple Transaction in JSON Format} notificationDetails.transaction
 *  @param {Hex-encoded String|ResourceId} notificationDetails.identifier
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Object with fields "account", "transaction", 
 *    "next_transaction_identifier", "next_hash",
 *    "previous_transaction_identifier", "previous_hash"} notificationDetails
 */
function attachPreviousAndNextTransactionIdentifiers(response, notificationDetails, callback) {

  // Get all of the transactions affecting the specified
  // account in the given ledger. This is done so that 
  // we can query for one more than that number on either 
  // side to ensure that we'll find the next and previous
  // transactions, no matter how many transactions the  
  // given account had in the same ledger
  function getAccountTransactionsInBaseTransactionLedger(async_callback) {
    var params = {
      account: notificationDetails.account,
      ledger_index_min: notificationDetails.transaction.ledger_index,
      ledger_index_max: notificationDetails.transaction.ledger_index,
      exclude_failed: false,
      max: 99999999,
      limit: 200 // arbitrary, just checking number of transactions in ledger
    };

    transactions.getAccountTransactions(params, response, async_callback);
  }

  // All we care about is the count of the transactions
  function countAccountTransactionsInBaseTransactionledger(transactions, async_callback) {
    async_callback(null, transactions.length);
  }

  // Query for one more than the numTransactionsInLedger
  // going forward and backwards to get a range of transactions
  // that will definitely include the next and previous transactions
  function getNextAndPreviousTransactions(numTransactionsInLedger, async_callback) {
    async.concat([false, true], function(earliestFirst, async_concat_callback){
      var params = {
        account: notificationDetails.account,
        max: numTransactionsInLedger + 1,
        min: numTransactionsInLedger + 1,
        limit: numTransactionsInLedger + 1,
        earliestFirst: earliestFirst
      };

      // In rippled -1 corresponds to the first or last ledger
      // in its database, depending on whether it is the min or max value
      if (params.earliestFirst) {
        params.ledger_index_max = -1;
        params.ledger_index_min = notificationDetails.transaction.ledger_index;
      } else {
        params.ledger_index_max = notificationDetails.transaction.ledger_index;
        params.ledger_index_min = -1;
      }

      transactions.getAccountTransactions(params, response, async_concat_callback);

    }, async_callback);

  }

  // Sort the transactions returned by ledger_index and remove duplicates
  function sortTransactions(allTransactions, async_callback) {
    allTransactions.push(notificationDetails.transaction);

    var transactions = _.uniq(allTransactions, function(tx) {
      return tx.hash;
    });

    // Sort transactions in ascending order (earliestFirst) by ledger_index
    transactions.sort(function(a, b) {
      if (a.ledger_index === b.ledger_index) {
        return a.date <= b.date ? -1 : 1;
      } else {
        return a.ledger_index < b.ledger_index ? -1 : 1;
      }
    });

    async_callback(null, transactions);
  }

  // Find the baseTransaction amongst the results. Because the
  // transactions have been sorted, the next and previous transactions
  // will be the ones on either side of the base transaction
  function findPreviousAndNextTransactions(transactions, async_callback) {

    // Find the index in the array of the baseTransaction
    var baseTransactionIndex = _.findIndex(transactions, function(possibility) {
      if (possibility.hash === notificationDetails.transaction.hash) {
        return true;
      } else if (possibility.client_resource_id &&
        (possibility.client_resource_id === notificationDetails.transaction.client_resource_id ||
        possibility.client_resource_id === notificationDetails.identifier)) {
        return true;
      } else {
        return false;
      }
    });

    // The previous transaction is the one with an index in
    // the array of baseTransactionIndex - 1
    if (baseTransactionIndex > 0) {
      var previous_transaction = transactions[baseTransactionIndex - 1];
      notificationDetails.previous_transaction_identifier = (previous_transaction.from_local_db ? previous_transaction.client_resource_id : previous_transaction.hash);
      notificationDetails.previous_hash = previous_transaction.hash;
    }

    // The next transaction is the one with an index in
    // the array of baseTransactionIndex + 1
    if (baseTransactionIndex + 1 < transactions.length) {
      var next_transaction = transactions[baseTransactionIndex + 1];
      notificationDetails.next_transaction_identifier = (next_transaction.from_local_db ? next_transaction.client_resource_id : next_transaction.hash);
      notificationDetails.next_hash = next_transaction.hash;
    }

    async_callback(null, notificationDetails);
  };

  var steps = [
    getAccountTransactionsInBaseTransactionLedger,
    countAccountTransactionsInBaseTransactionledger,
    getNextAndPreviousTransactions,
    sortTransactions,
    findPreviousAndNextTransactions
  ];

  async.waterfall(steps, callback);
}
