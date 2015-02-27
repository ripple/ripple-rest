var _           = require('lodash');
var async       = require('async');
var ripple      = require('ripple-lib');
var validator   = require('./lib/schema-validator');
var remote      = require('./lib/remote.js');
var dbinterface = require('./lib/db-interface.js');
var errors      = require('./lib/errors.js');

/**
 *  Submit a normal ripple-lib transaction, blocking duplicates for payments and orders.
 *  
 *  @param {Object} options                     - Holds various options
 *  @param {String} options.secret              - Secret of the user wishing to submit a transaction
 *  @param {Boolean} [options.validated]        - Used to wait until transaction has been validated before returning response to client
 *  @param {Boolean} [options.blockDuplicates]  - Used to block duplicate transactions
 *  @param {String}  [options.clientResourceId] - Used in conjunction with blockDuplicates to identify duplicate transactions. Must be present if blockDuplicates is true
 *  @param {Boolean} [options.saveTransaction]  - Used to save transaction on state and postsubmit events
 *  @param {SubmitTransactionHooks} hooks       - Used to hold methods defined by caller to customize transaction submit
 *  
 *  @callback
 *  @param {Error} error
 *  @param {Object} transaction - Transaction data received from ripple
 */

function submitTransaction(options, hooks, callback) {
  var steps = [
    // General options validation is performed here before passing the options to the caller to validate
    function(callback) {
      if (!options.secret) {
        return callback(new errors.InvalidRequestError('Parameter missing: secret'));
      }

      hooks.validateParams(callback);
    },
    // Transaction object is constructed here
    function(callback) {
      return hooks.initializeTransaction(callback);
    },
    // Duplicate blocking is performed here
    function(transaction, callback) {
      transaction.remote = remote;
      
      if (options.blockDuplicates === true) {
        blockDuplicates(transaction, options, callback);
      } else {
        callback(null, transaction);
      }
    },
    // Transaction parameters are set, listeners are registered, and is submitted here
    function(transaction, callback) {
      try {
        transaction.secret(options.secret);

        hooks.setTransactionParameters(transaction);
      } catch (exception) {
        return callback(exception);
      }

      transaction.once('error', callback);

      transaction.once('submitted', function(message) {
        if (message.result.slice(0, 3) === 'tec' && options.validated !== true) {
          return formatTransactionResponseWrapper(transaction, message, options.validated, callback);
        }

        // Handle erred transactions that should not make it into ledger (all
        // errors that aren't tec-class). This function is called before the
        // transaction `error` listener.
        switch (message.engine_result) {
          case 'terNO_ACCOUNT':
          case 'terNO_AUTH':
          case 'terNO_LINE':
          case 'terINSUF_FEE_B':
            // The transaction needs to be aborted. Preserve the original ter-
            // class error for presentation to the client
            transaction.removeListener('error', callback);
            transaction.once('error', function() {
              callback(message);
            });
            transaction.abort();
            break;
        }
      });

      transaction.once('proposed', function(message) {
        if (options.validated !== true) {
          formatTransactionResponseWrapper(transaction, message, options.validated, callback);
        }
      });

      transaction.once('success', function(message) {
        if (options.validated === true) {
          formatTransactionResponseWrapper(transaction, message, options.validated, callback);
        }
      });

      if (options.saveTransaction === true) {
        transaction.on('state', function() {
          var transactionSummary = transaction.summary();
          if (transactionSummary.submitIndex !== void(0)) {
            dbinterface.saveTransaction(transactionSummary);
          }
        });

        transaction.on('postsubmit', function() {
          dbinterface.saveTransaction(transaction.summary());
        });
      }

      transaction.submit();
    }
  ];

  function formatTransactionResponseWrapper(transaction, message, waitForValidated, callback) {
    var summary = transaction.summary();

    transaction.removeListener('error', callback);

    var meta = {};

    if (summary.result) {
      meta.hash = summary.result.transaction_hash;
      meta.ledger = String(summary.submitIndex)
    }

    meta.state = message.validated === true ? 'validated' : 'pending';

    hooks.formatTransactionResponse(message, meta, callback, waitForValidated);
  };

  function blockDuplicates(transaction, options, callback) {
    dbinterface.getTransaction({
      source_account: transaction.tx_json.Account,
      client_resource_id: options.clientResourceId,
      type: transaction.tx_json.TransactionType.toLowerCase()
    }, function(error, db_record) {
        if (error) {
          return callback(error);
        }
        if (db_record) {
          return callback(new errors.DuplicateTransactionError('Duplicate Transaction. ' +
            'A record already exists in the database for a transaction of this type ' +
            'with the same client_resource_id. If this was not an accidental resubmission ' +
            'please submit the transaction again with a unique client_resource_id')
          );
        }

        callback(null, transaction);
    });
  };

  async.waterfall(steps, callback);
};

/**
 *  Helper that sets bit flags on transactions
 *
 *  @param {Transaction} transaction      - Transaction object that is used to submit requests to ripple
 *  @param {Object} options
 *  @param {Object} options.flags         - Holds flag names to set on transaction when parameter values are true or false on input
 *  @param {Object} options.input         - Holds parameter values
 *  @param {String} options.clear_setting - Used to check if parameter values besides false mean false
 *
 *
 *  @returns undefined
 */

function setTransactionBitFlags(transaction, options) {
  for (var flagName in options.flags) {
    var flag = options.flags[flagName];

    // Set transaction flags
    if (!(flag.name in options.input)) {
      continue;
    }

    var value = options.input[flag.name];

    if (value === options.clear_setting) {
      value = false;
    }

    if (flag.unset) {
      transaction.setFlags(value ? flag.set : flag.unset);
    } else if (flag.set && value) {
      transaction.setFlags(flag.set);
    }
  }
};

/**
 *  Wrapper around getTransaction function that is
 *  meant to be used directly as a client-facing function.
 *  Unlike getTransaction, it will call next with any errors
 *  and send a JSON response to the client on success.
 *
 *  See getTransaction for parameter details
 */
function getTransactionAndRespond(account, identifier, callback) {
  getTransaction(account, identifier, function(error, transaction) {
    if (error) {
      callback(error);
    } else {
      callback(null, { transaction: transaction });
    }
  });
};

/**
 *  Retrieve a transaction from the Remote and local database
 *  based on the account and either hash or client_resource_id.
 *
 *  Note that if any errors are encountered while executing this function
 *  they will be sent back to the client through the res. If the query is
 *  successful it will be passed to the callback function
 *  
 *  @global
 *  @param {Remote} remote
 *  @param {/lib/db-interface} dbinterface
 *
 *  @param {RippleAddress} account
 *  @param {Hex-encoded String|ASCII printable character String} identifier
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Transaction} transaction
 */
function getTransaction(account, identifier, callback) {
  var options = {};

  var steps = [
    validateOptions,
    queryTransaction,
    checkIfRelatedToAccount,
    attachResourceID,
    attachDate
  ];

  async.waterfall(steps, callback);

  function validateOptions(async_callback) {
    if (account && !ripple.UInt160.is_valid(account)) {
      return callback(new errors.InvalidRequestError('Invalid parameter: account. Must be a valid Ripple Address'));
    }

    if (!_.isString(identifier)) {
      return callback(new errors.InvalidRequestError('Missing parameter: identifier'));
    }

    if (validator.isValid(identifier, 'Hash256')) {
      options.hash = identifier;
      async_callback();
    } else if (validator.isValid(identifier, 'ResourceId')) {
      options.client_resource_id = identifier;
      async_callback();
    } else {
      return callback(new errors.InvalidRequestError('Parameter not a valid transaction hash or client_resource_id: identifier'));
    }
  };

  function queryTransaction(async_callback) {
    dbinterface.getTransaction(options, function(error, entry) {
      if (error) {
        return async_callback(error);
      }

      var requestHash = options.hash;
      var dbEntryHash = '';

      if (!entry && !requestHash) {
        // Transaction hash was not supplied in the request and a matching
        // database entry was not found. There are no transaction hashes to
        // look up
        return async_callback(new errors.InvalidRequestError('Transaction not found. A transaction hash was not supplied and there were no entries matching the client_resource_id.'));
      }

      if (entry) {
        // Check that the hash present in the database entry matches the one
        // supplied in the request
        dbEntryHash = entry.hash || (entry.transaction || {}).hash;

        if (requestHash && requestHash !== dbEntryHash) {
          // Requested hash and retrieved hash do not match
          return async_callback(new errors.InvalidRequestError('Transaction not found. Hashes do not match'));
        }
      }

      // Request transaction based on either the hash supplied in the request
      // or the hash found in the database
      remote.requestTx(requestHash || dbEntryHash, function(error, transaction) {
        if (error) {
          return async_callback(error);
        }

        // we found a transaction
        if (entry && transaction) {
          transaction.client_resource_id = entry.client_resource_id;
        }

        return async_callback(null, transaction);
      });
    });
  };

  function checkIfRelatedToAccount(transaction, async_callback) {
    if (options.account) {
      var transactionString = JSON.stringify(transaction);
      var account_regex = new RegExp(options.account);
      if (!account_regex.test(transactionString)) {
        return async_callback(new errors.InvalidRequestError('Transaction specified did not affect the given account'));
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

    remote.requestLedger(transaction.ledger_index, function(error, ledgerRequest) {
      if (error) {
        return async_callback(new errors.NotFoundError('Transaction ledger not found'));
      }

      if (typeof ledgerRequest.ledger.close_time === 'number') {
        transaction.date = ledgerRequest.ledger.close_time;
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
 *  @param {Boolean} [false] options.earliestFirst
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
function getAccountTransactions(options, callback) {
  var steps = [
    validateOptions,
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
    options.limit = module.exports.DEFAULT_LIMIT;
  }

  function validateOptions(async_callback) {
    if (!options.account) {
      return async_callback(new errors.InvalidRequestError('Missing parameter: account. ' +
        'Must supply a valid Ripple Address to query account transactions')
      );
    }

    if (!ripple.UInt160.is_valid(options.account)) {
      return async_callback(new errors.InvalidRequestError('Invalid parameter: account. ' +
        'Must supply a valid Ripple Address to query account transactions')
      );
    }

    async_callback();
  };

  function queryTransactions(async_callback) {
    getLocalAndRemoteTransactions(options, async_callback);
  };

  function filterTransactions(transactions, async_callback) {
    async_callback(null, transactionFilter(transactions, options));
  };

  function sortTransactions(transactions, async_callback) {
    transactions.sort(function(first, second) {
      return compareTransactions(first, second, options.earliestFirst);
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
        getAccountTransactions(options, callback);
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
 *  @param {Boolean} [false] options.earliestFirst
 *  @param {Boolean} [false] options.binary
 *  @param {Boolean} [false] options.exclude_failed
 *  @param {opaque value} options.marker
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Array of transactions in JSON format} transactions
 */
function getLocalAndRemoteTransactions(options, callback) {

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

  var transactionSources = [ 
    queryRippled, 
    queryDB
  ];

  async.parallel(transactionSources, function(error, sourceResults) {
    if (error) {
      return callback(error);
    }
    var results = sourceResults[0].concat(sourceResults[1]);
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
 *  @param {Boolean} [false] earliestFirst
 *  @returns {Number} comparison Returns -1 or 1
 */
function compareTransactions(first, second, earliestFirst) {
  var firstIndex = first.ledger || first.ledger_index;
  var secondIndex = second.ledger || second.ledger_index;
  var firstLessThanSecond = true;
  if (firstIndex === secondIndex) {
    if (first.hash <= second.hash) {
      firstLessThanSecond = true;
    } else {
      firstLessThanSecond = false;
    }
  } else if (firstIndex < secondIndex) {
    firstLessThanSecond = true;
  } else {
    firstLessThanSecond = false;
  }
  if (earliestFirst) {
    if (firstLessThanSecond) {
      return -1;
    } else {
      return 1;
    }
  } else  {
    if (firstLessThanSecond) {
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
 *  @param {Boolean} [false] options.earliestFirst
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
    forward: options.earliestFirst,
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

module.exports = {
  DEFAULT_LIMIT: 200,
  DEFAULT_RESULTS_PER_PAGE: 10,
  NUM_TRANSACTION_TYPES: 5,
  DEFAULT_LEDGER_BUFFER: 3,
  submit: submitTransaction,
  get: getTransactionAndRespond,
  getTransaction: getTransaction,
  getAccountTransactions: getAccountTransactions,
  setTransactionBitFlags: setTransactionBitFlags
};
