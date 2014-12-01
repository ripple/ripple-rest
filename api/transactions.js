var _           = require('lodash');
var async       = require('async');
var ripple      = require('ripple-lib');
var validator   = require('./../lib/schema-validator');
var remote      = require('./../lib/remote.js');
var dbinterface = require('./../lib/db-interface.js');
var respond     = require('./../lib/response-handler.js');
var errors      = require('./../lib/errors.js');

/**
 *  Submit a normal ripple-lib transaction, blocking duplicates for payments and orders.
 *  
 *  @param {Object} options                     - Holds various options
 *  @param {String} options.secret              - Secret of the user wishing to submit a transaction
 *  @param {Boolean} [options.validated]        - Used to wait until transaction has been validated before returning response to client
 *  @param {Boolean} [options.blockDuplicates]  - Used to block duplicate transactions
 *  @param {String}  [options.clientResourceId] - Used in conjunction with blockDuplicates to identify duplicate transactions. Must be present if blockDuplicates is true
 *  @param {Boolean} [options.saveTransaction]  - Used to save transaction on state and postsubmit events
 *  @param {Object} hooks                       - Used to hold methods defined by caller to customize transaction submit
 *  @param {ValidateParamsHook} hooks.validateParams
 *  @param {FormatTransactionResponseHook} hooks.formatTransactionResponse
 *  @param {SetTransactionParametersHook} hooks.setTransactionParameters
 *  @param {InitializeTransactionHook} [hooks.initializeTransaction]
 *  
 *  @callback
 *  @param {Error} error
 *  @param {Object} transaction - Transaction data received from ripple
 */

/**
 *  Used to validate request parameters asyncronously
 *  @function ValidateParamsHook
 *  @param {Function} async_callback
 *
 *  @callback
 *  @param {Error} error
 */

/**
 *  Used to format messages received from ripple-lib which will be returned to client
 *  @function FormatTransactionResponseHook
 *  @param {Object} message                              - Response object from ripple
 *  @param {Object} meta                                 - Object that holds metadata about the transaction
 *  @param {String} meta.hash                            - Hash of the transaction
 *  @param {String} meta.ledger                          - Ledger sequence that the transaction is being considered for
 *  @param {String "validated"|"pending"} meta.validated - String that holds whether transaction is validated
 *  @param {Function} async_callback
 *  
 *  @callback
 *  @param {Error} error
 *  @param {Object} result - Object that is returned to the client 
 */

/**
 *  Used to set appropriate parameters on transaction
 *  @function SetTransactionParametersHook
 *  @param {Transaction} transaction - Transaction object that is used to submit requests to ripple
 *
 *  @returns undefined
 */

 /**
 *  Used to override default transaction initialization (Optional)
 *  @function InitializeTransactionHook
 *  @param {Function} async_callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Transaction} transaction - Transaction object that is used to submit requests to ripple
 */

function submitTransaction(options, hooks, callback) {
  var meta = {};

  var steps = [
    // General options validation is performed here before passing the options to the caller to validate
    function(callback) {
      if (!options.secret) {
        return callback(new errors.InvalidRequestError('Parameter missing: secret'));
      }

      hooks.validateParams(callback);
    },
    // Transaction object initialization is performed here
    function(callback) {
      // Transactions are normally constructed with remote.transaction().
      // However, if the caller wants to override this behavior and provide their own transaction object,
      // they can do so by passing in hooks.initializeTransaction and pass their transaction through the callback 
      if (typeof hooks.initializeTransaction === 'function') {
        return hooks.initializeTransaction(callback);
      }
        
      callback(null, remote.transaction());
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
        if (message.engine_result === 'tesSUCCESS' && options.validated === false) {
          formatTransactionResponseWrapper(transaction, message, callback);
        } else {
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
        }
      });

      transaction.once('final', function(message) {
        if (/^tes/.test(message.engine_result) && options.validated === true) {
          formatTransactionResponseWrapper(transaction, message, callback);
        }
      });

      if (options.saveTransaction === true) {
        transaction.on('postsubmit', function() {
          dbinterface.saveTransaction(transaction.summary());
        });
      }

      transaction.submit();
    }
  ];

  function formatTransactionResponseWrapper(transaction, message, callback) {
    var summary = transaction.summary();

    transaction.removeListener('error', callback);

    if (options.saveTransaction === true) {
      transaction.on('state', function() {
        dbinterface.saveTransaction(transaction.summary());
      });
    }

    if (summary.result) {
      meta.hash = summary.result.transaction_hash;
      meta.ledger = String(summary.submitIndex)
    }

    meta.state = message.validated === true ? 'validated' : 'pending';

    hooks.formatTransactionResponse(message, meta, callback);
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
        if (db_record && db_record.state !== 'failed') {
          return callback(new errors.ApiError('Duplicate Transaction. ' +
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
 *  Helper that parses bit flags from ripple response
 *  
 *  @param {Number} responseFlags - Integer flag on the ripple response
 *  @param {Object} flags         - Object with parameter name and bit flag value pairs
 * 
 *  @returns {Object} parsedFlags - Object with parameter name and boolean flags depending on response flag
 */
function parseFlagsFromResponse(responseFlags, flags) {
  var parsedFlags = {};

  for (var flagName in flags) {
    var flag = flags[flagName];
    parsedFlags[flag.name] = Boolean(responseFlags & flag.value);
  }

  return parsedFlags;
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

    transaction.setFlags(value ? flag.set : flag.unset);
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
function getTransactionAndRespond(request, response, next) {
  getTransaction(request.params.account, request.params.identifier, function(error, transaction) {
    if (error) {
      next(error);
    } else {
      respond.success(response, { transaction: transaction });
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
    if (account && !validator.isValid(account, 'RippleAddress')) {
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
      var transaction_string = JSON.stringify(transaction);
      var account_regex = new RegExp(options.account);
      if (!account_regex.test(transaction_string)) {
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

    remote.requestLedger(transaction.ledger_index, function(error, ledger_res) {
      if (error) {
        return async_callback(new errors.NotFoundError('Transaction ledger not found'));
      }

      if (typeof ledger_res.ledger.close_time === 'number') {
        transaction.date = ledger_res.ledger.close_time;
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
function getAccountTransactions(options, response, callback) {
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
    options.limit = Math.max(options.max, module.exports.DEFAULT_RESULTS_PER_PAGE);
  }

  function validateOptions(async_callback) {
    if (!options.account) {
      return async_callback(new errors.InvalidRequestError('Missing parameter: account. ' +
        'Must supply a valid Ripple Address to query account transactions')
      );
    }

    if (!validator.isValid(options.account, 'RippleAddress')) {
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
        getAccountTransactions(options, response, callback);
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

module.exports = {
  DEFAULT_RESULTS_PER_PAGE: 10,
  NUM_TRANSACTION_TYPES: 5,
  DEFAULT_LEDGER_BUFFER: 3,
  submit: submitTransaction,
  get: getTransactionAndRespond,
  getTransaction: getTransaction,
  getAccountTransactions: getAccountTransactions,
  setTransactionBitFlags: setTransactionBitFlags,
  parseFlagsFromResponse: parseFlagsFromResponse
};