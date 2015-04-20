/* eslint-disable valid-jsdoc */
'use strict';
var _ = require('lodash');
var async = require('async');
var transactions = require('./transactions');
var serverLib = require('./lib/server-lib');
var NotificationParser = require('./lib/notification_parser.js');
var errors = require('./lib/errors.js');
var utils = require('./lib/utils.js');
var validate = require('./lib/validate.js');

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
 *  @param {Object} notificationDetails
 **/

function attachPreviousAndNextTransactionIdentifiers(api,
    notificationDetails, topCallback) {

  // Get all of the transactions affecting the specified
  // account in the given ledger. This is done so that
  // we can query for one more than that number on either
  // side to ensure that we'll find the next and previous
  // transactions, no matter how many transactions the
  // given account had in the same ledger
  function getAccountTransactionsInBaseTransactionLedger(callback) {
    var params = {
      account: notificationDetails.account,
      ledger_index_min: notificationDetails.transaction.ledger_index,
      ledger_index_max: notificationDetails.transaction.ledger_index,
      exclude_failed: false,
      max: 99999999,
      limit: 200 // arbitrary, just checking number of transactions in ledger
    };

    transactions.getAccountTransactions(api, params, callback);
  }

  // All we care about is the count of the transactions
  function countAccountTransactionsInBaseTransactionledger(txns, callback) {
    callback(null, txns.length);
  }

  // Query for one more than the numTransactionsInLedger
  // going forward and backwards to get a range of transactions
  // that will definitely include the next and previous transactions
  function getNextAndPreviousTransactions(numTransactionsInLedger, callback) {
    async.concat([false, true], function(earliestFirst, concat_callback) {
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

      transactions.getAccountTransactions(api, params, concat_callback);

    }, callback);

  }

  // Sort the transactions returned by ledger_index and remove duplicates
  function sortTransactions(allTransactions, callback) {
    allTransactions.push(notificationDetails.transaction);

    var txns = _.uniq(allTransactions, function(tx) {
      return tx.hash;
    });

    txns.sort(utils.compareTransactions);

    callback(null, txns);
  }

  // Find the baseTransaction amongst the results. Because the
  // transactions have been sorted, the next and previous transactions
  // will be the ones on either side of the base transaction
  function findPreviousAndNextTransactions(txns, callback) {

    // Find the index in the array of the baseTransaction
    var baseTransactionIndex = _.findIndex(txns, function(possibility) {
      if (possibility.hash === notificationDetails.transaction.hash) {
        return true;
      } else if (possibility.client_resource_id &&
        (possibility.client_resource_id ===
          notificationDetails.transaction.client_resource_id ||
        possibility.client_resource_id === notificationDetails.identifier)) {
        return true;
      }
      return false;
    });

    // The previous transaction is the one with an index in
    // the array of baseTransactionIndex - 1
    if (baseTransactionIndex > 0) {
      var previous_transaction = txns[baseTransactionIndex - 1];
      notificationDetails.previous_transaction_identifier =
        (previous_transaction.from_local_db ?
          previous_transaction.client_resource_id : previous_transaction.hash);
      notificationDetails.previous_hash = previous_transaction.hash;
    }

    // The next transaction is the one with an index in
    // the array of baseTransactionIndex + 1
    if (baseTransactionIndex + 1 < txns.length) {
      var next_transaction = txns[baseTransactionIndex + 1];
      notificationDetails.next_transaction_identifier =
        (next_transaction.from_local_db ?
            next_transaction.client_resource_id : next_transaction.hash);
      notificationDetails.next_hash = next_transaction.hash;
    }

    callback(null, notificationDetails);
  }

  var steps = [
    getAccountTransactionsInBaseTransactionLedger,
    countAccountTransactionsInBaseTransactionledger,
    getNextAndPreviousTransactions,
    sortTransactions,
    findPreviousAndNextTransactions
  ];

  async.waterfall(steps, topCallback);
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
function getNotificationHelper(api, account, identifier, urlBase, topCallback) {

  function getTransaction(callback) {
    try {
      transactions.getTransaction(api, account, identifier, {}, callback);
    } catch(err) {
      callback(err);
    }
  }

  function checkLedger(baseTransaction, callback) {
    serverLib.remoteHasLedger(api.remote, baseTransaction.ledger_index,
        function(error, remoteHasLedger) {
      if (error) {
        return callback(error);
      }
      if (remoteHasLedger) {
        callback(null, baseTransaction);
      } else {
        callback(new errors.NotFoundError('Cannot Get Notification. ' +
          'This transaction is not in the ripple\'s complete ledger set. ' +
          'Because there is a gap in the rippled\'s historical database it ' +
          'is not possible to determine the transactions that precede this one')
        );
      }
    });
  }

  function prepareNotificationDetails(baseTransaction, callback) {
    var notificationDetails = {
      account: account,
      identifier: identifier,
      transaction: baseTransaction
    };

    // Move client_resource_id to notificationDetails from transaction
    if (baseTransaction.client_resource_id) {
      notificationDetails.client_resource_id =
        baseTransaction.client_resource_id;
    }
    attachPreviousAndNextTransactionIdentifiers(api, notificationDetails,
      callback);
  }

  // Parse the Notification object from the notificationDetails
  function parseNotificationDetails(notificationDetails, callback) {
    callback(null, NotificationParser.parse(notificationDetails, urlBase));
  }

  function formatNotificationResponse(notificationDetails, callback) {
    var responseBody = {
      notification: notificationDetails
    };

    // Move client_resource_id to response body instead of inside
    // the Notification
    var client_resource_id = responseBody.notification.client_resource_id;
    delete responseBody.notification.client_resource_id;
    if (client_resource_id) {
      responseBody.client_resource_id = client_resource_id;
    }

    callback(null, responseBody);
  }


  var steps = [
    getTransaction,
    checkLedger,
    prepareNotificationDetails,
    parseNotificationDetails,
    formatNotificationResponse
  ];

  async.waterfall(steps, topCallback);
}

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
 */
function getNotification(account, identifier, urlBase, callback) {
  validate.address(account);
  validate.paymentIdentifier(identifier);

  return getNotificationHelper(this, account, identifier, urlBase, callback);
}

/**
 *  Get a notifications corresponding to the specified
 *  account.
 *
 *  This function calls transactions.getAccountTransactions
 *  recursively to retrieve results_per_page number of transactions
 *  and filters the results using client-specified parameters.
 *
 *  @param {RippleAddress} account
 *  @param {string} urlBase - The url to use for the transaction status URL
 *
 *  @param {string} options.source_account
 *  @param {Number} options.ledger_min
 *  @param {Number} options.ledger_max
 *  @param {string} [false] options.earliest_first
 *  @param {string[]} options.types - @see transactions.getAccountTransactions
 *
 */
// TODO: If given ledger range, check for ledger gaps
function getNotifications(account, urlBase, options, callback) {
  validate.address(account);

  var self = this;

  function getTransactions(_callback) {

    var resultsPerPage = options.results_per_page ||
      transactions.DEFAULT_RESULTS_PER_PAGE;
    var offset = resultsPerPage * ((options.page || 1) - 1);

    var args = {
      account: account,
      direction: options.direction,
      min: resultsPerPage,
      max: resultsPerPage,
      ledger_index_min: options.ledger_min,
      ledger_index_max: options.ledger_max,
      offset: offset,
      earliestFirst: options.earliest_first
    };

    transactions.getAccountTransactions(self, args, _callback);
  }

  function parseNotifications(baseTransactions, _callback) {
    var numTransactions = baseTransactions.length;

    function parseNotification(transaction, __callback) {
      var args = {
        account: account,
        identifier: transaction.hash,
        transaction: transaction
      };

      // Attaching previous and next identifiers
      var idx = baseTransactions.indexOf(transaction);
      var previous = baseTransactions[idx + 1];
      var next = baseTransactions[idx - 1];

      if (!options.earliest_first) {
        args.previous_hash = previous ? previous.hash : undefined;
        args.next_hash = next ? next.hash : undefined;
      } else {
        args.previous_hash = next ? next.hash : undefined;
        args.next_hash = previous ? previous.hash : undefined;
      }

      args.previous_transaction_identifier = args.previous_hash;
      args.next_transaction_identifier = args.next_hash;

      var firstAndPaging = options.page &&
        (options.earliest_first ?
         args.previous_hash === undefined : args.next_hash === undefined);

      var last = idx === numTransactions - 1;

      if (firstAndPaging || last) {
        attachPreviousAndNextTransactionIdentifiers(self, args,
          function(err, _args) {
            return __callback(err, NotificationParser.parse(_args, urlBase));
          }
        );
      } else {
        return __callback(null, NotificationParser.parse(args, urlBase));
      }
    }

    return async.map(baseTransactions, parseNotification, _callback);
  }

  function formatResponse(notifications, _callback) {
    _callback(null, {notifications: notifications});
  }

  var steps = [
    getTransactions,
    _.partial(utils.attachDate, self),
    parseNotifications,
    formatResponse
  ];

  return async.waterfall(steps, callback);
}

module.exports = {
  getNotification: getNotification,
  getNotifications: getNotifications
};
