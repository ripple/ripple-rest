var _ = require('lodash');
var async = require('async');
var ripple = require('ripple-lib');
var transactions = require('./transactions');
var validator = require('../lib/schema-validator');
var server_lib = require('../lib/server-lib');

module.exports = {
  get: getNotification,
  getNotification: getNotification,
  getNextNotification: getNextNotification
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
function getNotification($, req, res, next) {
  getNotificationHelper($, req, res, function(err, notification) {
    if (err) {
      return next(err);
    }

    var response = {
      success: true,
      notification: notification
    };

    // Add url_base to each url in notification
    var url_base = req.protocol + '://' + req.host + ($.config && $.config.get('PORT') ? ':' + $.config.get('PORT') : '');
    Object.keys(response.notification).forEach(function(key){
      if (/url/.test(key) && response.notification[key]) {
        response.notification[key] = url_base + response.notification[key];
      }
    });

    // Move client_resource_id to response body instead of inside the Notification
    var client_resource_id = response.notification.client_resource_id;
    delete response.notification.client_resource_id;    
    if (client_resource_id) {
      response.client_resource_id = client_resource_id;
    }

    res.json(200, response);
  });
};

/**
 *  (Deprecated) Get the notification for the transaction
 *  following the one corresponding to the given identifier
 */
function getNextNotification($, req, res, next) {
  getNotificationHelper($, req, res, function(err, notification) {
    if (err) {
      next(err);
    } else if (notification.next_notification_url) {
      res.redirect(notification.next_notification_url);
    } else {
      // No next notification
    }
  });
};

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
function getNotificationHelper($, req, res, callback) {

  var opts = {
    account: req.params.account,
    identifier: req.params.identifier
  };

  // Get the base transaction corresponding to the given identifier
  // Note that getTransaction also handles parameter validation and
  // checks the status of the connection to rippled
  function getTransaction(async_callback) {
    transactions.getTransactionHelper($, req, res, async_callback);
  };

  // Check that the rippled has the ledger containing the
  // base transaction in its complete ledger set. If it does
  // not we cannot return a notification because there may be
  // gaps in the ledger history that cause the previous and
  // next transactions to be reported incorrectly
  function checkLedger(base_transaction, async_callback) {
    server_lib.remoteHasLedger($.remote, base_transaction.ledger_index, function(err, remote_has_ledger) {
      if (err) {
        return async_callback(err);
      }

      if (remote_has_ledger) {
        async_callback(null, base_transaction);
      } else {
        res.json(500, { success: false, message: 'Cannot Get Notification. ' +
          'This transaction is not in the ripple\'s complete ledger set. ' +
          'Because there is a gap in the rippled\'s historical database it is ' +
          'not possible to determine the transactions that precede this one' });
      }
    });
  };

  // Assemble the notification details
  // into the format expected by the parseNotification
  // function, including attaching the previous
  // and next transaction identifiers
  function prepareNotificationDetails(base_transaction, async_callback) {
    var notification_details = {
      account:         opts.account,
      identifier:      opts.identifier,
      transaction:     base_transaction
    };

    // Move client_resource_id to notification_details from transaction
    if (base_transaction.client_resource_id) {
      notification_details.client_resource_id = base_transaction.client_resource_id;
    }

    attachPreviousAndNextTransactionIdentifiers($, res, notification_details, async_callback);
  };

  // Parse the Notification object from the notification_details
  function parseNotificationDetails(notification_details, async_callback) {
    var notification = parseNotification(notification_details);
    async_callback(null, notification);
  };

  var steps = [
    getTransaction,
    checkLedger,
    prepareNotificationDetails,
    parseNotificationDetails
  ];

  async.waterfall(steps, callback);
};

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
function attachPreviousAndNextTransactionIdentifiers($, res, notification_details, callback) {

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
      limit: 200 // arbitrary, just checking number of transactions in ledger
    };

    transactions.getAccountTransactions($, params, res, async_callback);
  };

  // All we care about is the count of the transactions
  function countAccountTransactionsInBaseTransactionledger(transactions, async_callback) {
    async_callback(null, transactions.length);
  };

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

      transactions.getAccountTransactions($, params, res, async_concat_callback);

    }, async_callback);

  };

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
  };

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
};

/**
 *  Convert a Ripple transaction in the JSON format, 
 *  along with some additional pieces of information, 
 *  into a Notification object.
 *
 *  @param {Ripple Transaction in JSON Format} notification_details.transaction
 *  @param {RippleAddress} notification_details.account
 *  @param {Hex-encoded String|ResourceId} notification_details.previous_transaction_identifier
 *  @param {Hex-encoded String|ResourceId} notification_details.next_transaction_identifier
 *  
 *  @returns {Notification}
 */
function parseNotification(notification_details){
  var transaction = notification_details.transaction, 
    account = notification_details.account, 
    previous_transaction_identifier = notification_details.previous_transaction_identifier,
    next_transaction_identifier = notification_details.next_transaction_identifier;

  var notification = {
    account: account,
    type: transaction.TransactionType.toLowerCase(),
    direction: '', // set below
    state: (transaction.meta ? (transaction.meta.result === 'tesSUCCESS' ? 'validated' : 'failed') : ''),
    result: (transaction.meta ? transaction.meta.TransactionResult : ''),
    ledger: '' + transaction.ledger_index,
    hash: transaction.hash,
    timestamp: '' + new Date(transaction.date).toISOString(),
    transaction_url: '', // set below
    previous_hash: notification_details.previous_hash,
    previous_notification_url: '', // set below
    next_hash: notification_details.next_hash,
    next_notification_url: '', // set below
    client_resource_id: notification_details.client_resource_id
  };

  // Set direction
  if (account === transaction.Account) {
    notification.direction = 'outgoing';
  } else if (transaction.TransactionType === 'Payment' && transaction.Destination !== account) {
    notification.direction = 'passthrough';
  } else {
    notification.direction = 'incoming';
  }

  // Set transaction_url based on type
  if (notification.type === 'payment') {
    notification.transaction_url = '/v1/accounts/' + notification.account + '/payments/' + (transaction.from_local_db ? notification.client_resource_id : notification.hash);
  } else {
    // TODO add support for lookup by client_resource_id for transaction endpoint
    notification.transaction_url = '/v1/transaction/' + notification.hash;
  }

  // Change type to resource name
  if (notification.type === 'offercreate' || notification.type === 'offercancel') {
    notification.type = 'order';
  } else if (notification.type === 'trustset') {
    notification.type = 'trustline';
  } else if (notification.type === 'accountset') {
    notification.type = 'settings';
  }
  
  if (next_transaction_identifier) {
    notification.next_notification_url = '/v1/accounts/' +
      notification.account +
      '/notifications/' +
      next_transaction_identifier;
  }
  if (previous_transaction_identifier) {
    notification.previous_notification_url = '/v1/accounts/' +
      notification.account +
      '/notifications/' +
      previous_transaction_identifier;
  }

  return notification;
}
