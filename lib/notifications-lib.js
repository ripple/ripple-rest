var async                 = require('async');
var _                     = require('lodash');
var validator             = require('./schema-validator');
var notificationformatter = require('./formatters/notification-formatter');
var transactionslib       = require('./transactions-lib');
var serverlib             = require('./server-lib');


function getNotification(remote, dbinterface, opts, callback) {
  var account = opts.account,
    identifier = opts.identifier;

  if (!opts.account) {
    callback(new Error('Missing Parameter: account. Must be a valid Ripple address'));
    return;
  }

  if (validator.validate(opts.account, 'RippleAddress').length > 0) {
    callback(new Error('Invalid Parameter: account. Must be a valid Ripple address'));
    return;
  }

  if (!opts.identifier) {
    callback(new Error('Missing Parameter: hash or client_resource_id. Must provide a transaction hash or a client_resource_id to lookup a notification'));
    return;
  }

  if (validator.validate(opts.identifier, 'Hash256').length > 0 && validator.validate(opts.identifier, 'ResourceId').length > 0) {
    callback(new Error('Invalid Parameter: hash or client_resource_id. Must provide a transaction hash or a client_resource_id to lookup a notification'));
    return;
  }

  var steps = [

    function(async_callback) {
      serverlib.ensureConnected(remote, async_callback);
    },

    function(connected, async_callback) {
      transactionslib.getTransaction(remote, dbinterface, opts, async_callback);
    },

    function(base_transaction, async_callback) {
      serverlib.remoteHasLedger(remote, base_transaction.ledger_index, function(err, remote_has_ledger){
        if (err) {
          async_callback(err);
          return;
        }

        if (remote_has_ledger) {
          async_callback(null, base_transaction);
        } else {
          async_callback(new Error('Cannot Get Notification. This transaction is not in the ripple\'s complete ledger set. Because there is a gap in the rippled\'s historical database it is not possible to determine the transactions that precede this one'));
        }
      });
    },

    function(base_transaction, async_callback) {
      var notification_details = {
        account: opts.account,
        identifier: opts.identifier,
        transaction: base_transaction,
        types: opts.types,
        exclude_failed: opts.exclude_failed
      };

      async_callback(null, notification_details);
    },

    function(notification_details, async_callback) {
      attachPreviousAndNextTransactionIdentifiers(remote, dbinterface, notification_details, async_callback);
    },

    function(notification_details, async_callback) {
      notificationformatter.parseNotificationFromTransaction(notification_details, opts, async_callback);
    }

  ];

  async.waterfall(steps, callback);

}


/**
 *  Find all of the possible previous and next transactions, both from the rippled
 *  and from the local failures saved in the outgoing_transactions table. Once
 *  those have been arranged, find the base transaction amongst them and attach
 *  the hash or client_resource_ids of the previous and next ones
 */
function attachPreviousAndNextTransactionIdentifiers(remote, dbinterface, notification_details, callback) {

  var steps = [

    function(async_callback) {
      transactionslib.countAccountTransactionsInLedger(remote, dbinterface, {
        account: notification_details.account, 
        ledger_index: notification_details.transaction.ledger_index
      }, async_callback);
    },

    function(num_transactions_in_ledger, async_callback) {

      async.concat([
        {
          descending: true,
          num_transactions_in_ledger: num_transactions_in_ledger,
        }, 
        {
          descending: false,
          num_transactions_in_ledger: num_transactions_in_ledger
        }
      ], function(opts, concat_callback){

        getPossibleNextTransactions(remote, dbinterface, notification_details, opts, concat_callback);

      }, async_callback);

    },

    function(all_possible_transactions, async_callback) {
      all_possible_transactions.push(notification_details.transaction);

      var possibilities = _.uniq(all_possible_transactions, function(tx){ 
        return tx.hash; 
      });

      possibilities.sort(function(a, b){
        if (a.ledger_index === b.ledger_index) {

          if (a.date <= b.date) {
            return -1;
          } else {
            return 1;
          }

        } else if (a.ledger_index < b.ledger_index) {
          return -1;
        } else {
          return 1;
        }

      });

      async_callback(null, possibilities);

    },

    function(possibilities, async_callback) {

      var base_transaction_index = _.findIndex(possibilities, function(possibility){
        if (notification_details.transaction.hash && possibility.hash === notification_details.transaction.hash) {
          return true;
        }

        if (notification_details.transaction.client_resource_id && possibility.client_resource_id === notification_details.transaction.client_resource_id) {
          return true;
        }

        return false;
      });

      if (base_transaction_index > 0) {
        var previous_transaction = possibilities[base_transaction_index - 1];
        notification_details.previous_transaction_identifier = (previous_transaction.from_local_db ? previous_transaction.client_resource_id : previous_transaction.hash);
      }

      if (base_transaction_index + 1 < possibilities.length) {
        var next_transaction = possibilities[base_transaction_index + 1];
        notification_details.next_transaction_identifier = (next_transaction.from_local_db ? next_transaction.client_resource_id : next_transaction.hash);
      }

      async_callback(null, notification_details);

    }

  ];

  async.waterfall(steps, callback);
}

/**
 *  Determine how many transactions the same account had in this one ledger
 *  then get one more than that number of transactions with either the
 *  ledger_index_min or ledger_index_max set to this ledger index
 */
function getPossibleNextTransactions(remote, dbinterface, notification_details, opts, callback) {

  var params = {
    account: notification_details.account,
    max: opts.num_transactions_in_ledger + 1,
    min: opts.num_transactions_in_ledger + 1,
    types: notification_details.types || opts.types,
    exclude_failed: notification_details.exclude_failed
  };

  if (opts.descending) {
    params.descending = true;
    params.ledger_index_max = notification_details.transaction.ledger_index;
    params.ledger_index_min = -1;
  } else {
    params.descending = false;
    params.ledger_index_max = -1;
    params.ledger_index_min = notification_details.transaction.ledger_index;
  }

  transactionslib.getAccountTransactions(remote, dbinterface, params, callback);

}


module.exports.getNotification = getNotification;