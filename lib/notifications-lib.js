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

    // Validate parameters
    function(connected, async_callback) {
      if (!account) {
        async_callback(new Error('Missing parameter: account. Must be a valid Ripple address'));
        return;
      }

      if (validator.validate(account, 'RippleAddress').length > 0) {
        async_callback(new Error('Invalid parameter: account. Must be a valid Ripple address'));
        return;
      }

      if (!identifier) {
        async_callback(new Error('Missing parameter: identifier. Must supply transaction hash or client_resource_id to get notification'));
        return;
      }

      async_callback();
    },

    // If the identifier is a transaction hash, check the db to find if there is a corresponding client_resource_id
    // Otherwise, lookup the hash that corresponds to the given client_resource_id
    // Return an error if the client_resource_id cannot be found and mapped to a transaction hash
    function(async_callback) {
      if (validator.validate(identifier, 'Hash256').length === 0) {
        opts.hash = identifier;
      } else {
        // If identifier is a client_resource_id, make sure we find it in the local db
        opts.client_resource_id = identifier;
      }

      dbinterface.findTransaction(opts, function(err, db_entry){
        if (err) {
          async_callback(err);
          return;
        }

        if (db_entry) {
          if (db_entry.client_resource_id === opts.client_resource_id) {
            opts.hash = db_entry.hash;
          }
          if (db_entry.hash === opts.hash) {
            opts.client_resource_id = db_entry.client_resource_id || '';
          }
        } else {
          if (identifier === opts.client_resource_id) {
            async_callback(new Error('Transaction Not Found. Cannot get notification corresponding to the given client_resource_id because no such transaction was found in the local database. This may be because the transaction had an error on submission, or the transaction was not submitted to this ripple-rest instance, or the local database was deleted.'));
            return;
          }
        }

        async_callback(null, opts);
      });
    },

    // Get the transaction that corresponds to the given hash
    function(opts, async_callback) {
      var notification_details = {
        account: account
      };

      if (opts.client_resource_id) {
        notification_details.client_resource_id = opts.client_resource_id;
      }

      txlib.getTx(remote, opts.hash, function(err, tx){
        if (err) {
          async_callback(err);
          return;
        }

        if (tx) {
          notification_details.tx = tx;
          async_callback(null, notification_details);
        } else {
          // TODO check outgoing_transactions
          async_callback(new Erro('Transaction Not Found. Cannot get notification corresponding to the given hash. This error may be seen if the transaction was never or not yet validated and written into the Ripple Ledger, or if the rippled\'s database was recently created or deleted'));
        }
      });
    },

    // Get the previous transaction's identifier
    function(notification_details, async_callback) {
      getNextTx(remote, {
        account: account,
        previous_hash: notification_details.tx.hash,
        ledger_index: notification_details.tx.ledger_index,
        descending: true
      }, function(err, previous_tx){
        if (err) {
          async_callback(err);
          return;
        }

        if (previous_tx) {
          notification_details.previous_tx_identifier = previous_tx.hash;
        }

        async_callback(null, notification_details);
      });
    },

    // Get the next transaction's identifier
    function(notification_details, async_callback) {
      getNextTx(remote, {
        account: account,
        previous_hash: notification_details.tx.hash,
        ledger_index: notification_details.tx.ledger_index,
        descending: false
      }, function(err, next_tx){
        if (err) {
          async_callback(err);
          return;
        }

        if (next_tx) {
          notification_details.next_tx_identifier = next_tx.hash;
        }

        async_callback(null, notification_details);
      });
    },

    // Conver to the notification format
    function(notification_details, async_callback) {
      formatter.parseNotificationFromTx(notification_details, async_callback);
    }

  ];

  async.waterfall(steps, callback);
}

// function getNextTxFromRemoteOrDb(remote, dbinterface, opts, callback) {

//   var steps = [

//     function(async_callback) {
//       getNextTx(remote, opts, async_callback);
//     },

//     function(next_tx, async_callback) {

//     }

//   ];

// }


function getNextTx(remote, opts, callback) {

  var account = opts.account, 
    previous_hash = opts.hash || opts.previous_hash,
    ledger_index = opts.ledger || opts.ledger_index,
    descending = opts.descending;

  var steps = [

    function(async_callback) {
      serverlib.ensureConnected(remote, async_callback);
    },

    // If previous_hash is supplied, determine what ledger that was in
    function(connected, async_callback) {
      if (ledger_index) {
        async_callback(null, ledger_index);
      } else {
        txlib.getTx(remote, previous_hash, function(err, ledger){
          async_callback(err, ledger.ledger_index);
        });
      }
    },

    // Determine if that ledger is in the rippled's complete ledger set
    function(ledger_index, async_callback) {

      serverlib.remoteHasLedger(remote, ledger_index, function(err, remote_has_ledger){
        if (remote_has_ledger) {
          async_callback(null, ledger_index);
        } else {
          async_callback(new Error('Cannot get notification. The transaction corresponding to the given identifier is not in the rippled\'s complete ledger set so it is impossible to determine the next and previous notifications.'));
        } 
      });
    },

    // Count how many transactions that account had in the particular ledger
    function(ledger_index, async_callback) {
      accounttxlib.countTransactionsPerAccountInLedger(remote, account, ledger_index, function(err, num_transactions){
        async_callback(err, ledger_index, num_transactions);
      });
    },

    // Get one more transaction than the account had in the given ledger
    function(ledger_index, num_transactions_in_ledger, async_callback) {
      var params = buildAccountTxParams({
        account: account,
        limit: num_transactions_in_ledger + 1,
        descending: descending,
        previous_ledger_index: ledger_index
      });

      accounttxlib.getAccountTransactions(remote, params, async_callback);
    },

    // Find the transaction after the previous one, or return the first if no previous_hash was given
    function(transactions, async_callback) {

      if (transactions.length === 0) {
        async_callback();
        return;
      }

      if (previous_hash) {

        var prev_tx_index = _.findIndex(transactions, function(tx){ return tx.hash === previous_hash; });

        if (prev_tx_index === -1) {
          async_callback(new Error('Internal Error. Cannot find previous transaction hash amongst account_tx results'));
          return;
        }

        if (1 + prev_tx_index >= transactions.length) {
          async_callback();
          return;
        }

        async_callback(null, transactions[1 + prev_tx_index]);
      } else {
        async_callback(null, transactions[0]);
      }

    }

  ];

  async.waterfall(steps, callback);

}

function buildAccountTxParams(opts) {
  var params = {
    account: opts.account,
    limit: opts.limit
  };

  if (opts.descending) {
    params.descending = true;
    params.ledger_index_max = opts.previous_ledger_index;
    params.ledger_index_min = -1;
  } else {
    params.descending = false;
    params.ledger_index_max = -1;
    params.ledger_index_min = opts.previous_ledger_index;
  }

  return params;
}

module.exports.getNotification = getNotification;