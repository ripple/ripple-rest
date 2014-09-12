var _                   = require('lodash');
var async               = require('async');
var ripple              = require('ripple-lib');
var transactions        = require('./transactions');
var server_lib          = require('../lib/server-lib');
var remote              = require('./../lib/remote.js');
var config              = require('./../lib/config-loader.js');
var NotificationParser  = require('./../lib/notification_parser.js');
var respond             = require('./../lib/response-handler.js');
var errors              = require('./../lib/errors.js');

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

    // Add url_base to each url in notification
    var url_base = request.protocol + '://' + request.hostname + (config && config.get('port') ? ':' + config.get('port') : '');
    Object.keys(responseBody.notification).forEach(function(key){
      if (/url/.test(key) && responseBody.notification[key]) {
        responseBody.notification[key] = url_base + responseBody.notification[key];
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
    return next(new errors.InvalidRequestError('Missing parameter: account. Must be a valid Ripple Address'));
  }

  function getTransaction(async_callback) {
    transactions.getTransactionHelper(request, response, async_callback);
  }

  function checkLedger(base_transaction, async_callback) {
    server_lib.remoteHasLedger(remote, base_transaction.ledger_index, function(error, remote_has_ledger) {
      if (error) {
        return async_callback(error);
      }
      if (remote_has_ledger) {
        async_callback(null, base_transaction);
      } else {
        next(new errors.NotFoundError('Cannot Get Notification. ' +
          'This transaction is not in the ripple\'s complete ledger set. ' +
          'Because there is a gap in the rippled\'s historical database it is ' +
          'not possible to determine the transactions that precede this one')
        );
      }
    });
  }

  function prepareNotificationDetails(base_transaction, async_callback) {
    var notification_details = {
      account:         account,
      identifier:      identifier,
      transaction:     base_transaction
    };

    // Move client_resource_id to notification_details from transaction
    if (base_transaction.client_resource_id) {
      notification_details.client_resource_id = base_transaction.client_resource_id;
    }
    attachPreviousAndNextTransactionIdentifiers(response, notification_details, async_callback);
  }

  // Parse the Notification object from the notification_details
  function parseNotificationDetails(notification_details, async_callback) {
    async_callback(null, NotificationParser.parse(notification_details));
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
 *  or pass the notification_details with the added fields
 *  back to the callback.
 *
 *  @param {Remote} $.remote
 *  @param {/lib/db-interface} $.dbinterface
 *  @param {Express.js Response} res
 *  @param {RippleAddress} notification_details.account
 *  @param {Ripple Transaction in JSON Format} notification_details.transaction
 *  @param {Hex-encoded String|ResourceId} notification_details.identifier
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Object with fields "account", "transaction", 
 *    "next_transaction_identifier", "next_hash",
 *    "previous_transaction_identifier", "previous_hash"} notification_details
 */
function attachPreviousAndNextTransactionIdentifiers(response, notification_details, callback) {

  // Get all of the transactions affecting the specified
  // account in the given ledger. This is done so that 
  // we can query for one more than that number on either 
  // side to ensure that we'll find the next and previous
  // transactions, no matter how many transactions the  
  // given account had in the same ledger
  function getAccountTransactionsInBaseTransactionLedger(async_callback) {
    var params = {
      account: notification_details.account,
      ledger_index_min: notification_details.transaction.ledger_index,
      ledger_index_max: notification_details.transaction.ledger_index,
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

  // Query for one more than the num_transactions_in_ledger
  // going forward and backwards to get a range of transactions
  // that will definitely include the next and previous transactions
  function getNextAndPreviousTransactions(num_transactions_in_ledger, async_callback) {
    async.concat([false, true], function(earliest_first, async_concat_callback){
      var params = {
        account: notification_details.account,
        max: num_transactions_in_ledger + 1,
        min: num_transactions_in_ledger + 1,
        limit: num_transactions_in_ledger + 1,
        earliest_first: earliest_first
      };

      // In rippled -1 corresponds to the first or last ledger
      // in its database, depending on whether it is the min or max value
      if (params.earliest_first) {
        params.ledger_index_max = -1;
        params.ledger_index_min = notification_details.transaction.ledger_index;
      } else {
        params.ledger_index_max = notification_details.transaction.ledger_index;
        params.ledger_index_min = -1;
      }

      transactions.getAccountTransactions(params, response, async_concat_callback);

    }, async_callback);

  }

  // Sort the transactions returned by ledger_index and remove duplicates
  function sortTransactions(all_possible_transactions, async_callback) {
    all_possible_transactions.push(notification_details.transaction);

    var transactions = _.uniq(all_possible_transactions, function(tx) {
      return tx.hash;
    });

    // Sort transactions in ascending order (earliest_first) by ledger_index
    transactions.sort(function(a, b) {
      if (a.ledger_index === b.ledger_index) {
        return a.date <= b.date ? -1 : 1;
      } else {
        return a.ledger_index < b.ledger_index ? -1 : 1;
      }
    });

    async_callback(null, transactions);
  }

  // Find the base_transaction amongst the results. Because the
  // transactions have been sorted, the next and previous transactions
  // will be the ones on either side of the base transaction
  function findPreviousAndNextTransactions(transactions, async_callback) {

    // Find the index in the array of the base_transaction
    var base_transaction_index = _.findIndex(transactions, function(possibility) {
      if (possibility.hash === notification_details.transaction.hash) {
        return true;
      } else if (possibility.client_resource_id &&
        (possibility.client_resource_id === notification_details.transaction.client_resource_id ||
        possibility.client_resource_id === notification_details.identifier)) {
        return true;
      } else {
        return false;
      }
    });

    // The previous transaction is the one with an index in
    // the array of base_transaction_index - 1
    if (base_transaction_index > 0) {
      var previous_transaction = transactions[base_transaction_index - 1];
      notification_details.previous_transaction_identifier = (previous_transaction.from_local_db ? previous_transaction.client_resource_id : previous_transaction.hash);
      notification_details.previous_hash = previous_transaction.hash;
    }

    // The next transaction is the one with an index in
    // the array of base_transaction_index + 1
    if (base_transaction_index + 1 < transactions.length) {
      var next_transaction = transactions[base_transaction_index + 1];
      notification_details.next_transaction_identifier = (next_transaction.from_local_db ? next_transaction.client_resource_id : next_transaction.hash);
      notification_details.next_hash = next_transaction.hash;
    }

    async_callback(null, notification_details);
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