var async     = require('async');
var _         = require('lodash');
var serverlib = require('./server-lib');
var validator = require('./schema-validator');

function getTransaction (remote, dbinterface, opts, callback) {
  if (opts.identifier) {
    if (validator.validate(opts.identifier, 'Hash256').length === 0) {
      opts.hash = opts.identifier;
    } else if (validator.validate(opts.identifier, 'ResourceId').length === 0){
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
        async_callback(null, transaction);
        return;
      }

      remote.requestLedger(transaction.ledger_index, function(err, res){
        if (err) {
          async_callback(err);
          return;
        }

        transaction.date = res.ledger.close_time;
        async_callback(null, transaction);
      });
    }

  ];

  async.waterfall(steps, function(err, transaction){
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
  
}

/**
 *  Get all failed and validated transactions for the specified account
 *  from the local database as well as the rippled.
 *
 *  opts:
 *    account
 *    ledger_index or ledger_index_min / ledger_index_max
 *    descending
 *    max
 *    min
 *    exclude_failed
 *    types
 */
function getAccountTransactions(remote, dbinterface, opts, callback, previous_transactions) {
  if (!opts.max) {
    opts.max = 10;
  }

  // Limit will be set if this function is called recursively
  if (!opts.limit) {
    if (opts.types && opts.types.length < 5) {
      opts.limit = Math.max(opts.max * 2, 20);
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

      var transaction_sources = [

        function(parallel_callback){
          getAccountTx(remote, opts, function(err, results){
            if (err) {
              parallel_callback(err);
              return;
            }
            if (results && results.marker) {
              opts.marker = results.marker;
            }
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

      async.parallel(transaction_sources, async_callback);
    },

    // Filter results
    function(results, async_callback) {
      var transactions = _.uniq(results[0].concat(results[1]), function(tx){ 
        return tx.hash; 
      });

      if (opts.types || opts.exclude_failed) {
        transactions = _.filter(transactions, function(transaction){

          if (opts.exclude_failed) {
            if (transaction.state === 'failed' || (transaction.meta && transaction.meta.TransactionResult !== 'tesSUCCESS')) {
              return false;
            }
          }

          if (opts.types && opts.types.length > 0) {
            if (opts.types.indexOf(transaction.TransactionType.toLowerCase()) === -1) {
              return false;
            }
          }

          return true;

        });
      }

      async_callback(null, transactions);
    },

    // Sort results
    function(transactions, async_callback) {
      transactions.sort(function(a, b){
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

      async_callback(null, transactions);
    }

  ];

  async.waterfall(steps, function(err, transactions){
    if (err) {
      callback(err);
      return;
    }

    if (previous_transactions && previous_transactions.length > 0) {
      transactions = previous_transactions.concat(transactions);
    }

    if (transactions.length > opts.max) {
      transactions = transactions.slice(0, opts.max);
    }

    if (!opts.min || transactions.length >= opts.min || !opts.marker) {
      callback(null, transactions);
    } else {
      console.log('Calling getAccountTransactions again with opts: ', opts);
      setImmediate(function(){
        getAccountTransactions(remote, dbinterface, opts, callback, transactions);
      });
    }

  });
}

function getAccountTx(remote, opts, callback) {
  var params = {
    account: opts.account,
    ledger_index_min: opts.ledger_index_min || opts.ledger_index || -1,
    ledger_index_max: opts.ledger_index_max || opts.ledger_index || -1,
    limit: opts.limit || 10,
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
      callback(err);
      return;
    }

    callback(null, transactions.length);
  });
}

module.exports.getTransaction                   = getTransaction;
module.exports.getAccountTransactions           = getAccountTransactions;
module.exports.countAccountTransactionsInLedger = countAccountTransactionsInLedger;
