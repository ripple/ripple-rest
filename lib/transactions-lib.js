var async     = require('async');
var _         = require('lodash');
var serverlib = require('./server-lib');
var validator = require('./schema-validator');

var DEFAULT_RESULTS_PER_PAGE = 10;
var NUM_TRANSACTION_TYPES = 5;

function getTransaction(remote, dbinterface, opts, callback) {
  if (opts.identifier) {
    if (validator.isValid(opts.identifier, 'Hash256')) {
      opts.hash = opts.identifier;
    } else if (validator.isValid(opts.identifier, 'ResourceId')) {
      opts.client_resource_id = opts.identifier;
    } else {
      callback(new Error('Invalid Parameter: hash or client_resource_id. Must provide a transaction hash or a client_resource_id to lookup a notification'));
    }
  }

  var steps = [

    function(async_callback) {
      serverlib.ensureConnected(remote, async_callback);
    },

    function(connected, async_callback) {
      dbinterface.getTransaction(opts, async_callback);
    },

    function(db_entry, async_callback) {
      if (db_entry && db_entry.transaction) {
        async_callback(null, db_entry.transaction);
      } else if (db_entry) {
        remote.requestTx(db_entry.hash, async_callback);
      } else if (opts.hash) {
        remote.requestTx(opts.hash, async_callback);
      } else {
        async_callback({ remote: { error: 'txnNotFound' } });
      }
    },

    function(transaction, async_callback) {
      if (transaction && opts.client_resource_id) {
        transaction.client_resource_id = opts.client_resource_id;
      }

      async_callback(null, transaction);
    },

    function(transaction, async_callback) {
      if (!transaction || transaction.date || !transaction.ledger_index) {
        return async_callback(null, transaction);
      }

      remote.requestLedger(transaction.ledger_index, function(err, res){
        if (err) {
          return async_callback(err);
        }

        transaction.date = res.ledger.close_time;
        async_callback(null, transaction);
      });
    }

  ];

  async.waterfall(steps, function(err, transaction) {
    if (err) {
      if (err.remote && err.remote.error === 'txnNotFound') {
        callback(new Error('Transaction Not Found. No transaction corresponding to the given hash or client_resource_id was found either in the local ripple-rest database or in the rippled\'s database. This may indicate that the transaction was never or not yet validated and written into the Ripple Ledger, or this error may be seen if either the ripple-rest or rippled database were recently created or deleted. ' + JSON.stringify(err)));
      } else {
        callback(err);
      }
      return;
    }

    callback(null, transaction);
  });
};

/**
 *  Get all failed and validated transactions for the specified account
 *  from the local database as well as the rippled.
 *
 *  opts:
 *    account
 *    source_account
 *    destination_account
 *    ledger_index or ledger_index_min / ledger_index_max
 *    descending
 *    max
 *    min
 *    offset
 *    exclude_failed
 *    types
 */

 // TODO Refactor this code and clean up the logic
function getAccountTransactions(remote, dbinterface, opts, callback, previous_transactions) {
  if (!opts.max) {
    opts.max = DEFAULT_RESULTS_PER_PAGE;
  }
  if (!opts.min) {
    opts.min = DEFAULT_RESULTS_PER_PAGE;
  }

  // Limit will be set if this function is called recursively
  if (!opts.limit) {
    if (opts.types && opts.types.length < NUM_TRANSACTION_TYPES) {
      opts.limit = 2 * Math.max(opts.max, DEFAULT_RESULTS_PER_PAGE);
    } else {
      opts.limit = opts.max;
    }
  }

  var steps = [

    function(async_callback) {
      serverlib.ensureConnected(remote, async_callback);
    },

    // Get transactions from rippled and local db
    function(connected, async_callback) {
      getLocalAndRemoteTransactions(remote, dbinterface, opts, async_callback);
    },

    // Filter results so that they are unique and match the given parameters
    function(transactions, async_callback) {
      var filtered = filterTransactions(transactions, opts);
      async_callback(null, filtered);
    },

    // Sort results
    function(transactions, async_callback) {
      transactions.sort(_.partialRight(compareTransactions, opts.descending));
      async_callback(null, transactions);
    }

  ];

  async.waterfall(steps, function(err, transactions){
    if (err) {
      callback(err);
      return;
    }

    // Combine transactions with previous_transactions from previous
    // recursive call of this function
    if (previous_transactions && previous_transactions.length > 0) {
      transactions = previous_transactions.concat(transactions);
    }

    // Handle offset
    if (opts.offset && opts.offset > 0) {
      var offset_remaining = opts.offset - transactions.length;
      transactions = transactions.slice(opts.offset);
      opts.offset = offset_remaining;
    }

    // Truncate results if there are too many
    if (transactions.length > opts.max) {
      transactions = transactions.slice(0, opts.max);
    }

    // If there are enough transactions, send them back to the client
    // Otherwise recur
    if (!opts.min || transactions.length >= opts.min || !opts.marker) {
      callback(null, transactions);
    } else {
      setImmediate(function(){
        getAccountTransactions(remote, dbinterface, opts, callback, transactions);
      });
    }

  });
}

function getLocalAndRemoteTransactions(remote, dbinterface, opts, callback) {
  var transaction_sources = [

    function(parallel_callback){
      getAccountTx(remote, opts, function(err, results){
        if (err) {
          parallel_callback(err);
          return;
        }

        // Set marker so that when this function is called again
        // recursively it starts from the last place it left off
        opts.marker = results.marker;

        parallel_callback(null, results.transactions);
      });
    },

    function(parallel_callback) {
      if (opts.exclude_failed) {
        parallel_callback(null, []);
      } else {
        dbinterface.getFailedTransactions(opts, parallel_callback);
      }
    }

  ];

  async.parallel(transaction_sources, function(err, results){
    if (err) {
      callback(err);
      return;
    }

    var transactions = _.uniq(results[0].concat(results[1]), function(tx){ 
      return tx.hash; 
    });

    callback(null, transactions);
  });
}

function filterTransactions(transactions, opts) {

  var filtered = _.filter(transactions, function(transaction){

    if (opts.exclude_failed) {
      if (transaction.state === 'failed' || 
        (transaction.meta && transaction.meta.TransactionResult !== 'tesSUCCESS')) {
        return false;
      }
    }

    if (opts.types && opts.types.length > 0) {
      if (opts.types.indexOf(transaction.TransactionType.toLowerCase()) === -1) {
        return false;
      }
    }

    if (opts.source_account) {
      if (transaction.Account !== opts.source_account) {
        return false;
      }
    }
    if (opts.destination_account) {
      if (transaction.Destination !== opts.destination_account) {
        return false;
      }
    }

    if (opts.direction) {
      if (opts.direction === 'outgoing' && transaction.Account !== opts.account) {
        return false;
      }
      if (opts.direction === 'incoming' && transaction.Destination && transaction.Destination !== opts.account) {
        return false;
      }
    }

    return true;

  });

  return filtered;
}

/**
 *  Order two transactions based on their ledger_index and date
 */
function compareTransactions(a, b, descending) {
  var a_index = a.ledger || a.ledger_index,
    b_index = b.ledger || b.ledger_index,
    a_less_than_b = true;

  if (a_index === b_index) {

    if (a.date <= b.date) {
      a_less_than_b = true;
    } else {
      a_less_than_b = false;
    }

  } else if (a_index < b_index) {
    a_less_than_b = true;
  } else {
    a_less_than_b = false;
  }

  // If the results are meant to be descending, swap this value
  if (descending) {
    a_less_than_b = !a_less_than_b;
  }

  if (a_less_than_b) {
    return -1;
  } else {
    return 1;
  }

}

function getAccountTx(remote, opts, callback) {
  var params = {
    account: opts.account,
    ledger_index_min: opts.ledger_index_min || opts.ledger_index || -1,
    ledger_index_max: opts.ledger_index_max || opts.ledger_index || -1,
    limit: opts.limit || DEFAULT_RESULTS_PER_PAGE,
    forward: (opts.hasOwnProperty('descending') ? !opts.descending : true),
    marker: opts.marker
  };

  remote.requestAccountTx(params, function(err, account_tx_results){
    if (err) {
      callback(err);
      return;
    }

    var transactions = [];

    if (opts.binary) {
      transactions = account_tx_results.transactions;
    } else {

      account_tx_results.transactions.forEach(function(tx_entry){
        if (!tx_entry.validated) {
          return;
        }

        var tx = tx_entry.tx;
        tx.meta = tx_entry.meta;
        transactions.push(tx);
      });

    }

    callback(null, {
      transactions: transactions,
      marker: account_tx_results.marker
    });
  });
}

function countAccountTransactionsInLedger(remote, dbinterface, opts, callback) {
  getAccountTransactions(remote, dbinterface, {
    account: opts.account,
    ledger_index_min: opts.ledger_index,
    ledger_index_max: opts.ledger_index
  }, function(err, transactions){
    if (err) {
      return callback(err);
    }

    callback(null, transactions.length);
  });
}

module.exports.getTransaction                   = getTransaction;
module.exports.getAccountTransactions           = getAccountTransactions;
module.exports.countAccountTransactionsInLedger = countAccountTransactionsInLedger;
