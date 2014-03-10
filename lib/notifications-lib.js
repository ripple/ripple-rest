var async        = require('async');
var validator    = require('./schema-validator');
var formatter    = require('./formatter');
var txlib        = require('./tx-lib');
var serverlib    = require('./server-lib');
var accounttxlib = require('./account-tx-lib');
var _            = require('lodash');


function getNotification(remote, dbinterface, opts, callback) {

  var account = opts.account,
    identifier = opts.identifier;

  var steps = [

    function(async_callback) {
      serverlib.ensureConnected(remote, async_callback);
    },

    function(connected, async_callback) {
      getBaseTransaction(remote, dbinterface, {
        account: account,
        identifier: identifier
      }, async_callback);
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
      attachPreviousAndNextTransactionIdentifiers(remote, dbinterface, base_transaction, async_callback);
    },

    function(notification_details, async_callback) {
      notification_details.account = account;
      formatter.parseNotificationFromTx(notification_details, async_callback);
    }

  ];

  async.waterfall(steps, callback);

}

/**
 *  Get the base transaction represented by this transaction, either from
 *  the rippled or from the local database if it was a local failure
 */
function getBaseTransaction(remote, dbinterface, opts, callback) {

  var account = opts.account,
    identifier = opts.identifier;

  var steps = [

    function(async_callback) {
      var identifiers = {
        account: account
      };

      if (validator.validate(identifier, 'Hash256').length === 0) {
        identifiers.hash = identifier;
      } else {
        identifiers.client_resource_id = identifier;
      }

      dbinterface.findTransaction(identifiers, function(err, db_entry){
        if (err) {
          async_callback(err);
          return;
        }

        if (db_entry) {

          if (!identifiers.hash && db_entry.hash) {
            identifiers.hash = db_entry.hash;
          }

          if (!identifiers.client_resource_id && db_entry.client_resource_id) {
            identifiers.client_resource_id = db_entry.client_resource_id;
          }

        }
        async_callback(null, identifiers);
      });
    }, 

    function(identifiers, async_callback) {
      if (!identifiers.hash) {
        async_callback(null, identifiers, null);
        return;
      }

      txlib.getTx(remote, identifiers.hash, function(err, tx){
        if (err) {
          if (err.remote.error === 'txnNotFound') {
            async_callback(null, identifiers, null);
          } else {
            async_callback(err);
          }
          return;
        }

        if (identifiers.client_resource_id) {
          tx.client_resource_id = identifiers.client_resource_id;
        }

        async_callback(null, identifiers, tx);
      });
    },

    function(identifiers, tx, async_callback) {
      if (tx) {
        async_callback(null, tx);
        return;
      }

      dbinterface.getOutgoingTransaction(identifiers, function(err, tx_from_db){
        if (err) {
          async_callback(err);
          return;
        }

        tx_from_db.from_local_db = true;
        async_callback(null, tx_from_db);
      });
    },

    function(tx, async_callback) {
      if (!tx) {
        async_callback(new Error('Transaction Not Found. No transaction matching the given identifier was found in the rippled database, nor in this ripple-rest instance\'s local database of outgoing transactions. This may mean that the transaction was never or not yet validated and written into the Ripple Ledger and it was not submitted through this ripple-rest instance. This error may also occur if the databases of either ripple-rest or rippled have been recently created or deleted'));
        return;
      }

      async_callback(null, tx);
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
function attachPreviousAndNextTransactionIdentifiers(remote, dbinterface, base_transaction, callback) {

  var steps = [

    function(async_callback) {

      async.concat([{descending: true}, {descending: false}], function(opts, concat_callback){

        getPossibleNextTransactionsFromRippled(remote, base_transaction, opts, concat_callback);

      }, async_callback);

    },

    function(possible_transactions, async_callback) {
      dbinterface.getFailedTransactions({
        account: base_transaction.Account
      }, function(err, failed_transactions){
        if (err) {
          async_callback(err);
          return;
        }

        failed_transactions.forEach(function(failed_tx){
          failed_tx.from_local_db = true;
          possible_transactions.push(failed_tx);
        });

        async_callback(null, possible_transactions);
      });
    },

    function(all_possible_transactions, async_callback) {

      var possibilities = _.uniq(all_possible_transactions, function(tx){ return tx.hash; });

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

      var base_transaction_index = _.findIndex(possibilities, function(possibility){
        if (base_transaction.hash && possibility.hash === base_transaction.hash) {
          return true;
        }

        if (base_transaction.client_resource_id && possibility.client_resource_id === base_transaction.client_resource_id) {
          return true;
        }

        return false;
      });

      if (base_transaction_index === -1) {
        throw(new Error('Base transaction not found amongst results. Results' + JSON.stringify(possibilities)));
      }

      var notification_details = {
        tx: base_transaction
      };

      if (base_transaction_index > 0) {
        var previous_transaction = possibilities[base_transaction_index - 1];
        notification_details.previous_tx_identifier = (previous_transaction.from_local_db ? previous_transaction.client_resource_id : previous_transaction.hash);
      }

      if (base_transaction_index + 1 < possibilities.length) {
        var next_transaction = possibilities[base_transaction_index + 1];
        notification_details.next_tx_identifier = (next_transaction.from_local_db ? next_transaction.client_resource_id : next_transaction.hash);
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
function getPossibleNextTransactionsFromRippled(remote, base_transaction, opts, callback) {

  var steps = [

    function(async_callback) {
      accounttxlib.countAccountTransactionsInLedger(remote, base_transaction.Account, base_transaction.ledger_index, async_callback);
    },

    function(num_transactions_in_ledger, async_callback) {
      var params = {
        account: base_transaction.Account,
        limit: num_transactions_in_ledger + 1
      };

      if (opts.descending) {
        params.descending = true;
        params.ledger_index_max = base_transaction.ledger_index;
        params.ledger_index_min = -1;
      } else {
        params.descending = false;
        params.ledger_index_max = -1;
        params.ledger_index_min = base_transaction.ledger_index;
      }

      accounttxlib.getAccountTransactions(remote, params, async_callback);
    }

  ];

  async.waterfall(steps, callback);
}


module.exports.getNotification = getNotification;