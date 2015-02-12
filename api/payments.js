var _                       = require('lodash');
var async                   = require('async');
var bignum                  = require('bignumber.js');
var ripple                  = require('ripple-lib');
var transactions            = require('./transactions');
var validator               = require('./lib/schema-validator');
var remote                  = require('./lib/remote.js');
var serverLib               = require('./lib/server-lib');
var utils                   = require('./lib/utils');
var remote                  = require('./lib/remote.js');
var dbinterface             = require('./lib/db-interface.js');
var config                  = require('./lib/config.js');
var RestToTxConverter       = require('./lib/rest-to-tx-converter.js');
var TxToRestConverter       = require('./lib/tx-to-rest-converter.js');
var SubmitTransactionHooks  = require('./lib/submit_transaction_hooks.js');
var respond                 = require('../server/response-handler.js');
var errors                  = require('./lib/errors.js');

var InvalidRequestError     = errors.InvalidRequestError;
var NetworkError            = errors.NetworkError;
var NotFoundError           = errors.NotFoundError;
var TimeOutError            = errors.TimeOutError;

var DEFAULT_RESULTS_PER_PAGE = 10;

module.exports = {
  submit: submitPayment,
  get: getPayment,
  getAccountPayments: getAccountPayments,
  getPathFind: getPathFind
};

/**
 *  Submit a payment in the ripple-rest format.
 *
 *  @global
 *  @param {/config/config-loader} config
 *
 *  @body
 *  @param {Payment} request.body.payment
 *  @param {String} request.body.secret
 *  @param {String} request.body.client_resource_id
 *  @param {Number String} req.body.last_ledger_sequence - last ledger sequence that this payment can end up in
 *  @param {Number String} req.body.max_fee - maximum fee the payer is willing to pay
 *  @param {Number String} req.body.fixed_fee - fixed fee the payer wants to pay the network for accepting this transaction
 *  
 *  @query
 *  @param {String "true"|"false"} request.query.validated Used to force request to wait until rippled has finished validating the submitted transaction
 *
 *  @param {Express.js Response} response
 *  @param {Express.js Next} next
 */
function submitPayment(request, response, next) {
  var params = request.params;

  Object.keys(request.body).forEach(function(param) {
    params[param] = request.body[param];
  });

  params.max_fee = Number(request.body.max_fee) > 0 ? utils.xrpToDrops(request.body.max_fee) : void(0);
  params.fixed_fee = Number(request.body.fixed_fee) > 0 ? utils.xrpToDrops(request.body.fixed_fee) : void(0);

  if (params.payment.destination_amount && params.payment.destination_amount.currency !== 'XRP' && _.isEmpty(params.payment.destination_amount.issuer)) {
    params.payment.destination_amount.issuer = params.payment.destination_account;
  }

  var options = {
    secret: params.secret,
    validated: request.query.validated === 'true',
    blockDuplicates: true,
    clientResourceId: params.client_resource_id,
    saveTransaction: true
  };

  var hooks = {
    validateParams: validateParams,
    initializeTransaction: initializeTransaction,
    formatTransactionResponse: formatTransactionResponse,
    setTransactionParameters: setTransactionParameters
  };

  transactions.submit(options, new SubmitTransactionHooks(hooks), function(err, payment) {
    if (err) {
      return next(err);
    }

    respond.success(response, payment);
  });

  function validateParams(callback) {
    var payment = params.payment;

    if (!payment) {
      return callback(new InvalidRequestError('Missing parameter: payment. Submission must have payment object in JSON form'));
    }
    if (!params.client_resource_id) {
      return callback(new InvalidRequestError('Missing parameter: client_resource_id. All payments must be submitted with a client_resource_id to prevent duplicate payments'));
    }
    if (!validator.isValid(params.client_resource_id, 'ResourceId')) {
      return callback(new InvalidRequestError('Invalid parameter: client_resource_id. Must be a string of ASCII-printable characters. Note that 256-bit hex strings are disallowed because of the potential confusion with transaction hashes.'));
    }

    if (!ripple.UInt160.is_valid(payment.source_account)) {
      return callback(new InvalidRequestError('Invalid parameter: source_account. Must be a valid Ripple address'));
    }

    if (!ripple.UInt160.is_valid(payment.destination_account)) {
      return callback(new InvalidRequestError('Invalid parameter: destination_account. Must be a valid Ripple address'));
    }
    // Tags
    if (payment.source_tag && (!validator.isValid(payment.source_tag, 'UINT32'))) {
      return callback(new InvalidRequestError('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer'));
    }
    if (payment.destination_tag && (!validator.isValid(payment.destination_tag, 'UINT32'))) {
      return callback(new InvalidRequestError('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer'));
    }

    // Amounts
    // destination_amount is required, source_amount is optional
    if (!payment.destination_amount || (!validator.isValid(payment.destination_amount, 'Amount'))) {
      return callback(new InvalidRequestError('Invalid parameter: destination_amount. Must be a valid Amount object'));
    }
    if (payment.source_amount && (!validator.isValid(payment.source_amount, 'Amount'))) {
      return callback(new InvalidRequestError('Invalid parameter: source_amount. Must be a valid Amount object'));
    }

    // No issuer for XRP
    if (payment.destination_amount && payment.destination_amount.currency.toUpperCase() === 'XRP' && payment.destination_amount.issuer) {
      return callback(new InvalidRequestError('Invalid parameter: destination_amount. XRP cannot have issuer'));
    }
    if (payment.source_amount && payment.source_amount.currency.toUpperCase() === 'XRP' && payment.source_amount.issuer) {
      return callback(new InvalidRequestError('Invalid parameter: source_amount. XRP cannot have issuer'));
    }

    // Must have issuer for non-XRP payments
    if (payment.destination_amount && payment.destination_amount.currency.toUpperCase() !== 'XRP' && !payment.destination_amount.issuer) {
      return callback(new InvalidRequestError('Invalid parameter: destination_amount. Non-XRP payment must have an issuer'));
    }

    // Slippage
    if (payment.source_slippage && !validator.isValid(payment.source_slippage, 'FloatString')) {
      return callback(new InvalidRequestError('Invalid parameter: source_slippage. Must be a valid FloatString'));
    }

    // Advanced options

    // Invoice id
    if (payment.invoice_id && !validator.isValid(payment.invoice_id, 'Hash256')) {
      return callback(new InvalidRequestError('Invalid parameter: invoice_id. Must be a valid Hash256'));
    }

    // paths
    if (payment.paths) {
      if (typeof payment.paths === 'string') {
        try {
          JSON.parse(payment.paths);
        } catch (exception) {
          return callback(new InvalidRequestError('Invalid parameter: paths. Must be a valid JSON string or object'));
        }
      } else if (typeof payment.paths === 'object') {
        try {
          JSON.parse(JSON.stringify(payment.paths));
        } catch (exception) {
          return callback(new InvalidRequestError('Invalid parameter: paths. Must be a valid JSON string or object'));
        }
      }
    }

    // partial payment
    if (payment.hasOwnProperty('partial_payment') && typeof payment.partial_payment !== 'boolean') {
      return callback(new InvalidRequestError('Invalid parameter: partial_payment. Must be a boolean'));
    }

    // direct ripple
    if (payment.hasOwnProperty('no_direct_ripple') && typeof payment.no_direct_ripple !== 'boolean') {
      return callback(new InvalidRequestError('Invalid parameter: no_direct_ripple. Must be a boolean'));
    }

    // memos
    if (payment.hasOwnProperty('memos')) {
      if (!Array.isArray(payment.memos)) {
        return callback(new InvalidRequestError('Invalid parameter: memos. Must be an array with memo objects'));
      }

      if (payment.memos.length === 0) {
        return callback(new InvalidRequestError('Invalid parameter: memos. Must contain at least one Memo object, otherwise omit the memos property'));
      }

      for (var m = 0; m < payment.memos.length; m++) {
        var memo = payment.memos[m];
        if (memo.MemoType && !/(undefined|string)/.test(typeof memo.MemoType)) {
          return callback(new InvalidRequestError('Invalid parameter: MemoType. MemoType must be a string'));
        }
        if (!/(undefined|string)/.test(typeof memo.MemoData)) {
          return callback(new InvalidRequestError('Invalid parameter: MemoData. MemoData must be a string'));
        }
        if (!memo.MemoData && !memo.MemoType) {
          return callback(new InvalidRequestError('Missing parameter: MemoData or MemoType. For a memo object MemoType or MemoData are both optional, as long as one of them is present'));
        }
      }
    }

    callback(null);
  };

  function initializeTransaction(callback) {
    RestToTxConverter.convert(params.payment, function(error, transaction) {
      if (error) {
        return callback(error);
      }

      callback(null, transaction);
    });
  };

  function formatTransactionResponse(message, meta, callback) {
    if (meta.state === 'validated') {
      var transaction = message.tx_json;
      transaction.meta = message.metadata;
      transaction.ledger_index = transaction.inLedger = message.ledger_index;

      return formatPaymentHelper(params.payment.source_account, transaction, callback);
    }

    var urlBase = utils.getUrlBase(request);
    callback(null, {
      client_resource_id: params.client_resource_id,
      status_url: urlBase + '/v1/accounts/' + params.payment.source_account + '/payments/' + params.client_resource_id
    });
  };

  function setTransactionParameters(transaction) {
    var ledgerIndex;
    var maxFee = Number(params.max_fee);
    var fixedFee = Number(params.fixed_fee);

    if (Number(params.last_ledger_sequence) > 0) {
      ledgerIndex = Number(params.last_ledger_sequence);
    } else {
      ledgerIndex = Number(remote._ledger_current_index) + transactions.DEFAULT_LEDGER_BUFFER;
    }

    transaction.lastLedger(ledgerIndex);

    if (maxFee >= 0) {
      transaction.maxFee(maxFee);
    }

    if (fixedFee >= 0) {
      transaction.setFixedFee(fixedFee);
    }

    transaction.clientID(params.client_resource_id);
  };
};

/**
 *  Retrieve the details of a particular payment from the Remote or
 *  the local database and return it in the ripple-rest Payment format.
 *
 *  @param {Remote} remote
 *  @param {/lib/db-interface} dbinterface
 *  @param {RippleAddress} req.params.account
 *  @param {Hex-encoded String|ASCII printable character String} req.params.identifier
 *  @param {Express.js Response} res
 *  @param {Express.js Next} next
 */
function getPayment(request, response, next) {
  var options = {
    account: request.params.account,
    identifier: request.params.identifier
  };

  function validateOptions(callback) {
    var invalid;
    if (!options.account) {
      invalid = 'Missing parameter: account. Must provide account to get payment details';
    }
    if (!ripple.UInt160.is_valid(options.account)) {
      invalid = 'Parameter is not a valid Ripple address: account';
    }
    if (!options.identifier) {
      invalid = 'Missing parameter: hash or client_resource_id. '+
        'Must provide transaction hash or client_resource_id to get payment details';
    }
    if (!validator.isValid(options.identifier, 'Hash256') &&
      !validator.isValid(options.identifier, 'ResourceId')) {
        invalid = 'Invalid Parameter: hash or client_resource_id. ' +
        'Must provide a transaction hash or client_resource_id to get payment details';
    }
    if (invalid) {
      callback(new InvalidRequestError(invalid));
    } else {
      callback();
    }
  };

  // If the transaction was not in the outgoing_transactions db, get it from rippled
  function getTransaction(callback) {
    transactions.getTransaction(request.params.account, request.params.identifier, function(error, transaction) {
      callback(error, transaction);
    });
  };


  var steps = [
    validateOptions,
    getTransaction,
    function (transaction, callback) {
      return formatPaymentHelper(options.account, transaction, callback);
    }
  ];

  async.waterfall(steps, function(error, result) {
    if (error) {
      next(error);
    } else {
      respond.success(response, result);
    }
  });
};

/**
 *  Formats the local database transaction into ripple-rest Payment format
 *
 *  @param {RippleAddress} account
 *  @param {Transaction} transaction
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {RippleRestTransaction} transaction
 */
function formatPaymentHelper(account, transaction, callback) {
  function checkIsPayment(callback) {
    var isPayment = transaction && /^payment$/i.test(transaction.TransactionType);

    if (isPayment) {
      callback(null, transaction);
    } else {
      callback(new InvalidRequestError('Not a payment. The transaction corresponding to the given identifier is not a payment.'));
    }
  };

  function getPaymentMetadata(transaction) {
    return {
      client_resource_id: transaction.client_resource_id || '',
      hash: transaction.hash || '',
      ledger: !_.isUndefined(transaction.inLedger) ? String(transaction.inLedger) : String(transaction.ledger_index),
      state: transaction.state || transaction.meta ? (transaction.meta.TransactionResult === 'tesSUCCESS' ? 'validated' : 'failed') : ''
    };
  }

  function formatTransaction(transaction, callback) {
    if (transaction) {
      TxToRestConverter.parsePaymentFromTx(transaction, { account: account }, function(err, parsedPayment) {
        if (err) {
          return callback(err);
        }

        var result = {
          payment: parsedPayment
        };

        _.extend(result, getPaymentMetadata(transaction));

        return callback(null, result);
      });
    } else {
      callback(new NotFoundError('Payment Not Found. This may indicate that the payment was never validated and written into '
        + 'the Ripple ledger and it was not submitted through this ripple-rest instance. '
        + 'This error may also be seen if the databases of either ripple-rest '
        + 'or rippled were recently created or deleted.'));
    }
  };

  var steps = [
    checkIsPayment,
    formatTransaction
  ];

  async.waterfall(steps, callback);
};

/**
 *  Retrieve the details of multiple payments from the Remote
 *  and the local database.
 *
 *  This function calls transactions.getAccountTransactions
 *  recursively to retrieve results_per_page number of transactions
 *  and filters the results by type "payment", along with the other
 *  client-specified parameters.
 *
 *  @param {Remote} remote
 *  @param {/lib/db-interface} dbinterface
 *  @param {RippleAddress} req.params.account
 *  @param {RippleAddress} req.query.source_account
 *  @param {RippleAddress} req.query.destination_account
 *  @param {String "incoming"|"outgoing"} req.query.direction
 *  @param {Number} [-1] req.query.start_ledger
 *  @param {Number} [-1] req.query.end_ledger
 *  @param {Boolean} [false] req.query.earliest_first
 *  @param {Boolean} [false] req.query.exclude_failed
 *  @param {Number} [20] req.query.results_per_page
 *  @param {Number} [1] req.query.page
 *  @param {Express.js Response} res
 *  @param {Express.js Next} next
 */
function getAccountPayments(request, response, next) {
  var options;

  function getTransactions(callback) {
    options = {
      account: request.params.account,
      source_account: request.query.source_account,
      destination_account: request.query.destination_account,
      direction: request.query.direction,
      ledger_index_min: request.query.start_ledger,
      ledger_index_max: request.query.end_ledger,
      earliest_first: (request.query.earliest_first === 'true'),
      exclude_failed: (request.query.exclude_failed === 'true'),
      min: request.query.results_per_page,
      max: request.query.results_per_page,
      offset: (request.query.results_per_page || DEFAULT_RESULTS_PER_PAGE) * ((request.query.page || 1) - 1),
      types: [ 'payment' ]
    };

    transactions.getAccountTransactions(options, response, callback);
  };

  function attachDate(transactions, callback) {
    var groupedTx = _.groupBy(transactions, function(tx) {
      return tx.ledger_index;
    });

    async.each(_.keys(groupedTx), function(ledger, next) {
      remote.requestLedger({ 
        ledger_index: Number(ledger) 
      }, function(err, data) {
        if (err) {
          return next(err);
        }

        _.each(groupedTx[ledger], function(tx) {
          tx.date = data.ledger.close_time;
        })

        return next(null);
      });
    }, function(err) {
      if (err) {
        return callback(err);
      }

      return callback(null, transactions);
    });
  }

  function formatTransactions(transactions, callback) {
    if (!Array.isArray(transactions)) {
      return callback(null);
    } else {
      async.map(transactions,
        function (transaction, async_map_callback) {
          return formatPaymentHelper(options.account, transaction, async_map_callback);
        },
        callback
      );
    }
  };

  function attachResourceId(transactions, callback) {
    async.map(transactions, function(paymentResult, async_map_callback) {
      var hash = paymentResult.hash;
      var payment = paymentResult.payment;

      dbinterface.getTransaction({ hash: hash }, function(error, db_entry) {
        if (error) {
          return async_map_callback(error);
        }
        var client_resource_id = '';
        if (db_entry && db_entry.client_resource_id) {
          client_resource_id = db_entry.client_resource_id;
        }

        paymentResult.client_resource_id = client_resource_id;

        async_map_callback(null, paymentResult);
      });
    }, callback);
  };

  var steps = [
    getTransactions,
    attachDate,
    formatTransactions,
    attachResourceId
  ];

  async.waterfall(steps, function(error, payments) {
    if (error) {
      next(error);
    } else {
      respond.success(response, { payments: payments });
    }
  });
};

/**
 *  Get a ripple path find, a.k.a. payment options,
 *  for a given set of parameters and respond to the
 *  client with an array of fully-formed Payments.
 *
 *  @param {Remote} remote
 *  @param {/lib/db-interface} dbinterface
 *  @param {RippleAddress} req.params.source_account
 *  @param {Amount Array ["USD r...,XRP,..."]} req.query.source_currencies Note that Express.js middleware replaces "+" signs with spaces. Clients should use "+" signs but the values here will end up as spaces
 *  @param {RippleAddress} req.params.destination_account
 *  @param {Amount "1+USD+r..."} req.params.destination_amount_string
 *  @param {Express.js Response} res
 *  @param {Express.js Next} next
 */
function getPathFind(request, response, next) {

  // Parse and validate parameters
  var params = {
    source_account: request.params.account,
    destination_account: request.params.destination_account,
    destination_amount: {},
    source_currencies: []
  };

  if (!params.source_account) {
    next(new InvalidRequestError('Missing parameter: source_account. Must be a valid Ripple address'));
    return;
  }

  if (!params.destination_account) {
    next(new InvalidRequestError('Missing parameter: destination_account. Must be a valid Ripple address'));
    return;
  }

  if (!ripple.UInt160.is_valid(params.source_account)) {
    return next(new errors.InvalidRequestError('Parameter is not a valid Ripple address: account'));
  }

  if (!ripple.UInt160.is_valid(params.destination_account)) {
    return next(new errors.InvalidRequestError('Parameter is not a valid Ripple address: destination_account'));
  }

  // Parse destination amount
  if (!request.params.destination_amount_string) {
    next(new InvalidRequestError('Missing parameter: destination_amount. Must be an amount string in the form value+currency+issuer'));
    return;
  }

  params.destination_amount = utils.parseCurrencyQuery(request.params.destination_amount_string);

  if (!ripple.UInt160.is_valid(params.source_account)) {
    next(new InvalidRequestError('Invalid parameter: source_account. Must be a valid Ripple address'));
    return;
  }

  if (!ripple.UInt160.is_valid(params.destination_account)){
    next(new InvalidRequestError('Invalid parameter: destination_account. Must be a valid Ripple address'));
    return;
  }

  if (!validator.isValid(params.destination_amount, 'Amount')) {
    next(new InvalidRequestError('Invalid parameter: destination_amount. Must be an amount string in the form value+currency+issuer'));
    return;
  }

  // Parse source currencies
  // Note that the source_currencies should be in the form
  // "USD r...,BTC,XRP". The issuer is optional but if provided should be
  // separated from the currency by a single space.
  if (request.query.source_currencies) {
    var sourceCurrencyStrings = request.query.source_currencies.split(',');
    for (var c = 0; c < sourceCurrencyStrings.length; c++) {
      // Remove leading and trailing spaces
      sourceCurrencyStrings[c] = sourceCurrencyStrings[c].replace(/(^[ ])|([ ]$)/g, '');
      // If there is a space, there should be a valid issuer after the space
      if (/ /.test(sourceCurrencyStrings[c])) {
        var currencyIssuerArray = sourceCurrencyStrings[c].split(' ');
        var currencyObject = {
          currency: currencyIssuerArray[0],
          issuer: currencyIssuerArray[1]
        };
        if (validator.isValid(currencyObject.currency, 'Currency') && ripple.UInt160.is_valid(currencyObject.issuer)) {
          params.source_currencies.push(currencyObject);
        } else {
          next(new InvalidRequestError('Invalid parameter: source_currencies. Must be a list of valid currencies'));
          return;
        }
      } else {
        if (validator.isValid(sourceCurrencyStrings[c], 'Currency')) {
          params.source_currencies.push({ currency: sourceCurrencyStrings[c] });
        } else {
          next(new InvalidRequestError('Invalid parameter: source_currencies. Must be a list of valid currencies'));
          return;
        }
      }
    }
  }

  function prepareOptions(callback) {
    var pathfindParams = {
      src_account: params.source_account,
      dst_account: params.destination_account,
      dst_amount: (params.destination_amount.currency === 'XRP' ?
        utils.xrpToDrops(params.destination_amount.value) :
        params.destination_amount)
    };
    if (typeof pathfindParams.dst_amount === 'object' && !pathfindParams.dst_amount.issuer) {
      pathfindParams.dst_amount.issuer = pathfindParams.dst_account;
    }
    if (params.source_currencies.length > 0) {
      pathfindParams.src_currencies = params.source_currencies;
    }
    callback(null, pathfindParams);
  };

  function findPath(pathfindParams, callback) {
    var request = remote.requestRipplePathFind(pathfindParams);
    request.once('error', callback);
    request.once('success', function(pathfindResults) {
      pathfindResults.source_account     = pathfindParams.src_account;
      pathfindResults.source_currencies  = pathfindParams.src_currencies;
      pathfindResults.destination_amount = pathfindParams.dst_amount;
      callback(null, pathfindResults);
    });

    function reconnectRippled() {
      remote.disconnect(function() {
        remote.connect();
      });
    };
    request.timeout(serverLib.CONNECTION_TIMEOUT, function() {
      request.removeAllListeners();
      reconnectRippled();
      callback(new TimeOutError('Path request timeout'));
    });
    request.request();
  };

  function addDirectXrpPath(pathfindResults, callback) {
    // Check if destination_amount is XRP and if destination_account accepts XRP
    if (typeof pathfindResults.destination_amount.currency === 'string' || pathfindResults.destination_currencies.indexOf('XRP') === -1) {
      return callback(null, pathfindResults);
    }
    // Check source_account balance
    remote.requestAccountInfo({account: pathfindResults.source_account}, function(error, result) {
      if (error) {
        return callback(new Error('Cannot get account info for source_account. ' + error));
      }
      if (!result || !result.account_data || !result.account_data.Balance) {
        return callback(new Error('Internal Error. Malformed account info : ' + JSON.stringify(result)));
      }
      // Add XRP "path" only if the source_account has enough money to execute the payment
      if (bignum(result.account_data.Balance).greaterThan(pathfindResults.destination_amount)) {
        pathfindResults.alternatives.unshift({
          paths_canonical:  [],
          paths_computed:   [],
          source_amount:    pathfindResults.destination_amount
        });
      }
      callback(null, pathfindResults);
    });
  };

  function formatPath(pathfindResults, callback) {
    if (pathfindResults.alternatives && pathfindResults.alternatives.length > 0) {
      return TxToRestConverter.parsePaymentsFromPathFind(pathfindResults, callback);
    }
    if (pathfindResults.destination_currencies.indexOf(params.destination_amount.currency) === -1) {
      callback(new NotFoundError('No paths found. ' +
        'The destination_account does not accept ' +
        params.destination_amount.currency +
        ', they only accept: ' +
        pathfindResults.destination_currencies.join(', ')));

    } else if (pathfindResults.source_currencies && pathfindResults.source_currencies.length > 0) {
      callback(new NotFoundError('No paths found.' +
        ' Please ensure that the source_account has sufficient funds to execute' +
        ' the payment in one of the specified source_currencies. If it does' +
        ' there may be insufficient liquidity in the network to execute' +
        ' this payment right now'));

    } else {
      callback(new NotFoundError('No paths found.' +
        ' Please ensure that the source_account has sufficient funds to execute' +
        ' the payment. If it does there may be insufficient liquidity in the' +
        ' network to execute this payment right now'));
    }
  };
  var steps = [
    prepareOptions,
    findPath,
    addDirectXrpPath,
    formatPath
  ];
  async.waterfall(steps, function(error, payments) {
    if (error) {
      next(error);
    } else {
      respond.success(response, { payments: payments });
    }
  });
};
