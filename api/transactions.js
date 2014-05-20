var ripple    = require('ripple-lib');
var async     = require('async');
var _         = require('lodash');
var server_lib = require('../lib/server-lib');
var validator = require('../lib/schema-validator');

var DEFAULT_RESULTS_PER_PAGE = 10;
var NUM_TRANSACTION_TYPES = 5;

exports.get = getTransaction;
exports.getTransaction = _getTransaction;

function _getTransaction($, req, res, callback) {
  var opts = $.opts || {
    account: req.params.account,
    identifier: req.params.identifier
  };

  function validateOptions(async_callback) {
    if (!opts.identifier) {
      res.json(400, { success: false, message: 'Missing parameter: identifier' });
    } else if (validator.isValid(opts.identifier, 'Hash256')) {
      opts.hash = opts.identifier;
      async_callback();
    } else if (validator.isValid(opts.identifier, 'ResourceId')) {
      opts.client_resource_id = opts.identifier;
      async_callback();
    } else {
      res.json(400, { success: false, message: 'Parameter not a valid transaction hash: identifier' });
    }
  };

  function ensureConnected(async_callback) {
    server_lib.ensureConnected($.remote, function(err, connected){
      if (!connected) {
        return res.json(500, { success: false, message: 'No connection to rippled' });
      } else {
        async_callback(err);
      }
    });
  };

  function queryTransaction(async_callback) {
    $.dbinterface.getTransaction(opts, function(error, entry) {
      if (entry && entry.transaction) {
        // If the whole transaction was found in the database,
        // pass it back to the callback
        async_callback(null, entry.transaction);
      } else if (opts.hash) {
        $.remote.requestTx(opts.hash, function(err, transaction){

          // If some record for the transaction was found in the database
          // attach the client_resource_id to the transaction retrieved from rippled
          if (entry && transaction) {
            transaction.client_resource_id = entry.client_resource_id;
          }

          async_callback(err, transaction);
        });
      } else {
        res.json(404, { success: false, message: 'Transaction not found' });
      }
    });
  };

  function attachResourceID(transaction, async_callback) {
    if (transaction && opts.client_resource_id) {
      transaction.client_resource_id = opts.client_resource_id;
    }
    async_callback(null, transaction);
  };

  function attachDate(transaction, async_callback) {
    if (!transaction || transaction.date || !transaction.ledger_index) {
      return async_callback(null, transaction);
    }

    $.remote.requestLedger(transaction.ledger_index, function(err, res) {
      if (err) {
        return res.json(404, { success: false, message: 'Transaction ledger not found' });
      }

      if (typeof res.ledger.close_time === 'number') {
        transaction.date = ripple.utils.time.fromRipple(res.ledger.close_time);
      }

      async_callback(null, transaction);
    });
  };

  var steps = [
    validateOptions,
    ensureConnected,
    queryTransaction,
    attachResourceID,
    attachDate
  ];

  async.waterfall(steps, callback);
};

function getTransaction($, req, res, next) {
  _getTransaction($, req, res, function(err, transaction) {
    if (err) {
      next(err);
    } else {
      res.json(200, { success: true, transaction: transaction });
    }
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

exports.getAccountTransactions = getAccountTransactions;

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

  function ensureConnected(async_callback) {
    server_lib.ensureConnected(remote, async_callback);
  };

  function queryTransactions(connected, async_callback) {
    // Get transactions from rippled and local db
    getLocalAndRemoteTransactions(remote, dbinterface, opts, async_callback);
  };

  function filterTransactions(transactions, async_callback) {
    // Filter results so that they are unique and match the given parameters
    async_callback(null, transactionFilter(transactions, opts));
  };

  function sortTransactions(transactions, async_callback) {
    // Sort results
    transactions.sort(_.partialRight(compareTransactions, opts.descending));
    async_callback(null, transactions);
  };

  var steps = [
    ensureConnected,
    queryTransactions,
    filterTransactions,
    sortTransactions
  ];

  async.waterfall(steps, function(err, transactions) {
    if (err) {
      return callback(err);
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
    // Otherwise recurse
    if (!opts.min || transactions.length >= opts.min || !opts.marker) {
      callback(null, transactions);
    } else {
      setImmediate(function() {
        getAccountTransactions(remote, dbinterface, opts, callback, transactions);
      });
    }
  });
};

function getLocalAndRemoteTransactions(remote, dbinterface, opts, callback) {
  function queryRippled(callback) {
    getAccountTx(remote, opts, function(err, results) {
      if (err) {
        callback(err);
      } else {
        // Set marker so that when this function is called again
        // recursively it starts from the last place it left off
        opts.marker = results.marker;

        callback(null, results.transactions);
      }
    });
  };

  function queryDB(callback) {
    if (opts.exclude_failed) {
      callback(null, [ ]);
    } else {
      dbinterface.getFailedTransactions(opts, callback);
    }
  };

  var transaction_sources = [ queryRippled, queryDB ];

  async.parallel(transaction_sources, function(err, results) {
    if (err) {
      return callback(err);
    }

    var results = results[0].concat(results[1]);
    var transactions = _.uniq(results, function(tx) {
      return tx.hash;
    });

    callback(null, transactions);
  });
};

function transactionFilter(transactions, opts) {
  var filtered = transactions.filter(function(transaction) {
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

    return true;
  });

  return filtered;
};

/**
 *  Order two transactions based on their ledger_index and date
 */

function compareTransactions(a, b, descending) {
  var a_index = a.ledger || a.ledger_index;
  var b_index = b.ledger || b.ledger_index;
  var a_less_than_b = true;

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

  return a_less_than_b ? -1 : 1;
};

function getAccountTx(remote, opts, callback) {
  var params = {
    account: opts.account,
    ledger_index_min: opts.ledger_index_min || opts.ledger_index || -1,
    ledger_index_max: opts.ledger_index_max || opts.ledger_index || -1,
    limit: opts.limit || DEFAULT_RESULTS_PER_PAGE,
    forward: (opts.hasOwnProperty('descending') ? !opts.descending : true),
    marker: opts.marker
  };

  if (opts.binary) params.binary = true;

  remote.requestAccountTx(params, function(err, account_tx_results) {
    if (err) {
      return callback(err);
    }

    var transactions = [ ];

    account_tx_results.transactions.forEach(function(tx_entry) {
      if (!tx_entry.validated) return;
      var tx = tx_entry.tx;
      tx.meta = tx_entry.meta;
      transactions.push(tx);
    });

    callback(null, {
      transactions: transactions,
      marker: account_tx_results.marker
    });
  });
};

exports.countAccountTransactionsInLedger = countAccountTransactionsInLedger;

function countAccountTransactionsInLedger(remote, dbinterface, opts, callback) {
  getAccountTransactions(remote, dbinterface, {
    account: opts.account,
    ledger_index_min: opts.ledger_index,
    ledger_index_max: opts.ledger_index,
    binary: true
  }, function(err, transactions) {
      if (err) {
        callback(err);
      } else {
        callback(null, transactions.length);
      }
  });
};
