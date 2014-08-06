var _          = require('lodash');
var async      = require('async');
var ripple     = require('ripple-lib');
var server_lib = require('../lib/server-lib');
var validator  = require('../lib/schema-validator');
var remote     = require(__dirname+'/../lib/remote.js');
var dbinterface = require(__dirname+'/../lib/db-interface.js');

module.exports = {
  DEFAULT_RESULTS_PER_PAGE: 10,
  NUM_TRANSACTION_TYPES: 5,
  DEFAULT_LEDGER_BUFFER: 6,
  submit: submitTransaction,
  get: getTransaction,
  getTransactionHelper: getTransactionHelper,
  getAccountTransactions: getAccountTransactions
};

/**
 *  Submit a normal ripple-lib transaction, blocking duplicates
 *  for payments and orders.
 *
 *  @param {Remote} remote
 *  @param {/lib/db-interface} dbinterface
 *  @param {Transaction} data.transaction
 *  @param {String} data.secret
 *  @param {String} data.client_resource_id
 *  @param {Express.js Response} res Used to send error messages directly to the client
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error Submission Error
 *  @param {submission response} response The response received from the 'proposed' event
 */
function submitTransaction(server, data, response, callback) {

  function ensureConnected(async_callback) {
    server_lib.ensureConnected(remote, function(error, connected) {
      if (connected) {
        async_callback();
      } else if (error) {
        response.json(500, {
          success: false,
          message: error.message
        });
      } else {
        response.json(500, {
          success: false,
          message: 'No connection to rippled'
        });
      }
    });
  };

  function prepareTransaction(async_callback) {
    data.transaction.secret(data.secret);
    data.transaction.clientID(data.client_resource_id);
    async_callback(null, data.transaction);
  };

  function blockDuplicates(transaction, async_callback) {    
    var type = transaction.tx_json.TransactionType;
    if (type !== 'Payment' && type !== 'OfferCreate' && type !== 'OfferCancel') {
      return async_callback(null, transaction);
    }
    dbinterface.getTransaction({
      source_account: transaction.tx_json.Account,
      client_resource_id: data.client_resource_id,
      type: transaction.tx_json.TransactionType.toLowerCase()
    }, function(error, db_record) {
        if (error) {
          return async_callback(error);
        }
        if (db_record && db_record.state !== 'failed') {
          response.json(500, {
            success: false,
            message: 'Duplicate Transaction. ' +
            'A record already exists in the database for a transaction of this type ' +
            'with the same client_resource_id. If this was not an accidental resubmission ' +
            'please submit the transaction again with a unique client_resource_id'
          });
        } else {
          async_callback(null, transaction);
        }
    });
  };

  function submitTransaction(transaction, async_callback) {
    transaction.remote = remote;
    transaction.lastLedger(Number(remote._ledger_current_index) + module.exports.DEFAULT_LEDGER_BUFFER);
    transaction.once('error', async_callback);
    transaction.once('proposed', function() {
      transaction.removeListener('error', async_callback);
      async_callback(null, transaction._clientID);
    });
    transaction.submit();
  };

  var steps = [
    ensureConnected,
    prepareTransaction,
    blockDuplicates,
    submitTransaction
  ];
  async.waterfall(steps, callback);
};

/**
 *  Wrapper around getTransactionHelper function that is
 *  meant to be used directly as a client-facing function.
 *  Unlike getTransactionHelper, it will call next with any errors
 *  and send a JSON response to the client on success.
 *
 *  See getTransactionHelper for parameter details
 */
function getTransaction(server, request, response, next) {
  getTransactionHelper(server, request, response, function(error, transaction) {
    if (error) {
      next(error);
    } else {
      res.json(200, {
        success: true,
        transaction: transaction
      });
    }
  });
};

/**
 *  Retrieve a transaction from the Remote and local database
 *  based on the account and either hash or client_resource_id.
 *
 *  Note that if any errors are encountered while executing this function
 *  they will be sent back to the client through the res. If the query is
 *  successful it will be passed to the callback function which can either
 *  send the transaction directly back to the client (e.g. in the case of
 *  getTransaction) or can process the transaction more (e.g. in the case
 *  of the Notification or Payment related functions).
 *
 *  @param {Remote} remote
 *  @param {/lib/db-interface} dbinterface
 *  @param {RippleAddress} req.params.account
 *  @param {Hex-encoded String|ASCII printable character String} req.params.identifier
 *  @param {Express.js Response} res
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Transaction} transaction
 */
function getTransactionHelper(server, request, response, callback) {
  var options = server.options || {
    account: request.params.account,
    identifier: request.params.identifier
  };
  var steps = [
    validateOptions,
    ensureConnected,
    queryTransaction,
    checkIfRelatedToAccount,
    attachResourceID,
    attachDate
  ];
  async.waterfall(steps, callback);
  function validateOptions(async_callback) {
    if (options.account && !validator.isValid(options.account, 'RippleAddress')) {
      return response.json(400, {
        success: false,
        message: 'Invalid parameter: account. Must be a valid Ripple Address'
      });
    }
    if (!options.identifier) {
      response.json(400, {
        success: false,
        message: 'Missing parameter: identifier'
      });
    } else if (validator.isValid(options.identifier, 'Hash256')) {
      options.hash = options.identifier;
      async_callback();
    } else if (validator.isValid(options.identifier, 'ResourceId')) {
      options.client_resource_id = options.identifier;
      async_callback();
    } else {
      response.json(400, {
        success: false,
        message: 'Parameter not a valid transaction hash or client_resource_id: identifier'
      });
    }
  };

  function ensureConnected(async_callback) {
    server_lib.ensureConnected(remote, function(error, connected){
      if (connected) {
        async_callback();
      } else if (error) {
        response.json(500, {
          success: false,
          message: error.message
        });
      } else {
        response.json(500, {
          success: false,
          message: 'No connection to rippled'
        });
      }
    });
  };

  function queryTransaction(async_callback) {
    dbinterface.getTransaction(options, function(error, entry) {
      if (error) {
        return async_callback(error);
      }
      if (entry && entry.client_resource_id) {
        options.client_resource_id = entry.client_resource_id;
      }

      if (entry && entry.transaction) {
        async_callback(null, entry.transaction);
      } else if (options.hash) {
        remote.requestTx(options.hash, function(error, transaction){
          if (entry && transaction) {
            transaction.client_resource_id = entry.client_resource_id;
          }
          async_callback(error, transaction);
        });
      } else {
        response.json(404, {
          success: false,
          message: 'Transaction not found'
        });
      }
    });
  };

  function checkIfRelatedToAccount(transaction, async_callback) {

    if (options.account) {
      var transaction_string = JSON.stringify(transaction);
      var account_regex = new RegExp(options.account);
      if (!account_regex.test(transaction_string)) {
        return response.json(400, {
          success: false,
          message: 'Transaction specified did not affect the given account'
        });
      }
    }

    async_callback(null, transaction);
  };

  function attachResourceID(transaction, async_callback) {
    if (transaction && options.client_resource_id) {
      transaction.client_resource_id = options.client_resource_id;
    }
    async_callback(null, transaction);
  };

  function attachDate(transaction, async_callback) {
    if (!transaction || transaction.date || !transaction.ledger_index) {
      return async_callback(null, transaction);
    }
    remote.requestLedger(transaction.ledger_index, function(error, ledger_res) {
      if (error) {
        return response.json(404, {
          success: false,
          message: 'Transaction ledger not found'
        });
      }
      if (typeof ledger_res.ledger.close_time === 'number') {
        transaction.date = ripple.utils.time.fromRipple(ledger_res.ledger.close_time);
      }
      async_callback(null, transaction);
    });
  };

};

/**
 *  Recursively get transactions for the specified account from 
 *  the Remote and local database. If options.min is set, this will
 *  recurse until it has retrieved that number of transactions or
 *  it has reached the end of the account's transaction history.
 *
 *  @param {Remote} remote
 *  @param {/lib/db-interface} dbinterface
 *  @param {RippleAddress} options.account
 *  @param {Number} [-1] options.ledger_index_min
 *  @param {Number} [-1] options.ledger_index_max
 *  @param {Boolean} [false] options.earliest_first
 *  @param {Boolean} [false] options.binary
 *  @param {Boolean} [false] options.exclude_failed
 *  @param {Number} [DEFAULT_RESULTS_PER_PAGE] options.min
 *  @param {Number} [DEFAULT_RESULTS_PER_PAGE] options.max
 *  @param {Array of Strings} options.types Possible values are "payment", "offercreate", "offercancel", "trustset", "accountset"
 *  @param {opaque value} options.marker
 *  @param {Array of Transactions} options.previous_transactions Included automatically when this function is called recursively
 *  @param {Express.js Response} res
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Array of transactions in JSON format} transactions
 */
function getAccountTransactions(server, options, response, callback) {
  var steps = [
    validateOptions,
    ensureConnected,
    queryTransactions,
    filterTransactions,
    sortTransactions,
    mergeAndTruncateResults
  ];
  async.waterfall(steps, asyncWaterfallCallback);
  if (!options.min) {
    options.min = module.exports.DEFAULT_RESULTS_PER_PAGE;
  }
  if (!options.max) {
    options.max = Math.max(options.min, module.exports.DEFAULT_RESULTS_PER_PAGE);
  }
  if (!options.limit) {
    options.limit = Math.max(options.max, module.exports.DEFAULT_RESULTS_PER_PAGE);
  }

  function validateOptions(async_callback) {
    if (!options.account) {
      return response.json(400, {
        success: false,
        message: 'Missing parameter: account. ' +
        'Must supply a valid Ripple Address to query account transactions'
      });
    }
    if (!validator.isValid(options.account, 'RippleAddress')) {
      return response.json(400, {
        success: false,
        message: 'Invalid parameter: account. ' +
        'Must supply a valid Ripple Address to query account transactions'
      });
    }
    async_callback();
  };

  function ensureConnected(async_callback) {
    server_lib.ensureConnected(remote, function(error, connected){
      if (connected) {
        async_callback();
      } else if (error) {
        response.json(500, {
          success: false,
          message: error.message
        });
      } else {
        response.json(500, {
          success: false,
          message: 'No connection to rippled'
        });
      }
    });
  };

  function queryTransactions(async_callback) {
    getLocalAndRemoteTransactions(server, options, async_callback);
  };

  function filterTransactions(transactions, async_callback) {
    async_callback(null, transactionFilter(transactions, options));
  };

  function sortTransactions(transactions, async_callback) {
    transactions.sort(function(first, second) {
      return compareTransactions(first, second, options.earliest_first);
    });
    async_callback(null, transactions);
  };

  function mergeAndTruncateResults(transactions, async_callback) {
    if (options.previous_transactions && options.previous_transactions.length > 0) {
      transactions = options.previous_transactions.concat(transactions);
    }
    if (options.offset && options.offset > 0) {
      var offset_remaining = options.offset - transactions.length;
      transactions = transactions.slice(options.offset);
      options.offset = offset_remaining;
    }
    if (transactions.length > options.max) {
      transactions = transactions.slice(0, options.max);
    }
    async_callback(null, transactions);
  };

  function asyncWaterfallCallback(error, transactions) {
    if (error) {
      return callback(error);
    }
    if (!options.min || transactions.length >= options.min || !options.marker) {
      callback(null, transactions);
    } else {
      options.previous_transactions = transactions;
      setImmediate(function() {
        getAccountTransactions(server, options, response, callback);
      });
    }
  };
};

/**
 *  Retrieve transactions from the Remote as well as the local database.
 *
 *  @param {Remote} remote
 *  @param {/lib/db-interface} dbinterface
 *  @param {RippleAddress} options.account
 *  @param {Number} [-1] options.ledger_index_min
 *  @param {Number} [-1] options.ledger_index_max
 *  @param {Boolean} [false] options.earliest_first
 *  @param {Boolean} [false] options.binary
 *  @param {Boolean} [false] options.exclude_failed
 *  @param {opaque value} options.marker
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Array of transactions in JSON format} transactions
 */
function getLocalAndRemoteTransactions(server, options, callback) {

  function queryRippled(callback) {
    getAccountTx(remote, options, function(error, results) {
      if (error) {
        callback(error);
      } else {
        // Set marker so that when this function is called again
        // recursively it starts from the last place it left off
        options.marker = results.marker;

        callback(null, results.transactions);
      }
    });
  };

  function queryDB(callback) {
    if (options.exclude_failed) {
      callback(null, []);
    } else {
      dbinterface.getFailedTransactions(options, callback);
    }
  };

  var transaction_sources = [ 
    queryRippled, 
    queryDB
  ];
  async.parallel(transaction_sources, function(error, source_results) {
    if (error) {
      return callback(error);
    }
    var results = source_results[0].concat(source_results[1]);
    var transactions = _.uniq(results, function(tx) {
      return tx.hash;
    });
    callback(null, transactions);
  });
};

/**
 *  Filter transactions based on the given set of options.
 *  
 *  @param {Array of transactions in JSON format} transactions
 *  @param {Boolean} [false] options.exclude_failed
 *  @param {Array of Strings} options.types Possible values are "payment", "offercreate", "offercancel", "trustset", "accountset"
 *  @param {RippleAddress} options.source_account
 *  @param {RippleAddress} options.destination_account
 *  @param {String} options.direction Possible values are "incoming", "outgoing"
 *
 *  @returns {Array of transactions in JSON format} filtered_transactions
 */
function transactionFilter(transactions, options) {
  var filtered_transactions = transactions.filter(function(transaction) {
    if (options.exclude_failed) {
      if (transaction.state === 'failed' || (transaction.meta && transaction.meta.TransactionResult !== 'tesSUCCESS')) {
        return false;
      }
    }
    if (options.types && options.types.length > 0) {
      if (options.types.indexOf(transaction.TransactionType.toLowerCase()) === -1) {
        return false;
      }
    }
    if (options.source_account) {
      if (transaction.Account !== options.source_account) {
        return false;
      }
    }
    if (options.destination_account) {
      if (transaction.Destination !== options.destination_account) {
        return false;
      }
    }
    if (options.direction) {
      if (options.direction === 'outgoing' && transaction.Account !== options.account) {
        return false;
      }
      if (options.direction === 'incoming' && transaction.Destination && transaction.Destination !== options.account) {
        return false;
      }
    }
    return true;
  });
  return filtered_transactions;
};

/**
 *  Order two transactions based on their ledger_index.
 *  If two transactions took place in the same ledger, sort
 *  them based on a lexicographical comparison of their hashes
 *  to ensure the ordering is deterministic.
 *
 *  @param {transaction in JSON format} first
 *  @param {transaction in JSON format} second
 *  @param {Boolean} [false] earliest_first
 *  @returns {Number} comparison Returns -1 or 1
 */
function compareTransactions(first, second, earliest_first) {
  var first_index = first.ledger || first.ledger_index;
  var second_index = second.ledger || second.ledger_index;
  var first_less_than_second = true;
  if (first_index === second_index) {
    if (first.hash <= second.hash) {
      first_less_than_second = true;
    } else {
      first_less_than_second = false;
    }
  } else if (first_index < second_index) {
    first_less_than_second = true;
  } else {
    first_less_than_second = false;
  }
  if (earliest_first) {
    if (first_less_than_second) {
      return -1;
    } else {
      return 1;
    }
  } else  {
    if (first_less_than_second) {
      return 1;
    } else {
      return -1;
    }
  }
};

/**
 *  Wrapper around the standard ripple-lib requestAccountTx function
 *
 *  @param {Remote} remote
 *  @param {RippleAddress} options.account
 *  @param {Number} [-1] options.ledger_index_min
 *  @param {Number} [-1] options.ledger_index_max
 *  @param {Boolean} [false] options.earliest_first
 *  @param {Boolean} [false] options.binary
 *  @param {opaque value} options.marker
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Array of transactions in JSON format} response.transactions
 *  @param {opaque value} response.marker
 */
function getAccountTx(remote, options, callback) {
  var params = {
    account: options.account,
    ledger_index_min: options.ledger_index_min || options.ledger_index || -1,
    ledger_index_max: options.ledger_index_max || options.ledger_index || -1,
    limit: options.limit || DEFAULT_RESULTS_PER_PAGE,
    forward: options.earliest_first,
    marker: options.marker
  };
  if (options.binary) {
    params.binary = true;
  }
  remote.requestAccountTx(params, function(error, account_tx_results) {
    if (error) {
      return callback(error);
    }
    var transactions = [];
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
