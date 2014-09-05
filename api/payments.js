var _                     = require('lodash');
var async                 = require('async');
var bignum                = require('bignumber.js');
var ripple                = require('ripple-lib');
var validator             = require('../lib/schema-validator');
var transactions          = require('./transactions');
var serverLib             = require('../lib/server-lib');
var utils                 = require('../lib/utils');
var remote                = require(__dirname+'/../lib/remote.js');
var dbinterface           = require(__dirname+'/../lib/db-interface.js');
var config                = require(__dirname+'/../lib/config-loader.js');
var currency_schema       = require('../schemas/Currency.json');
var ripple_address_schema = require('../schemas/RippleAddress.json');
var RestToLibTransactionConverter = require(__dirname+'/../lib/rest_to_lib_transaction_converter.js');
var DEFAULT_RESULTS_PER_PAGE = 10;

module.exports = {
  submit: submitPayment,
  get: getPayment,
  getAccountPayments: getAccountPayments,
  getPathFind: getPathFind
};

var paymentToTransactionConverter = new RestToLibTransactionConverter();

/**
 *  Submit a payment in the ripple-rest format.
 *
 *  If the payment is successful response.json will be called with
 *  a status_code of 200, the client_resource_id, and a status_url.
 *  Otherwise, most errors will be reported immediately with 400 or
 *  500 status codes, or submission errors will be passed to next
 *
 *  @param {Remote} remote
 *  @param {/lib/db-interface} dbinterface
 *  @param {/config/config-loader} config
 *  @param {Payment} req.body.payment
 *  @param {String} req.body.secret
 *  @param {String} req.body.client_resource_id
 *  @param {Express.js Response} res
 *  @param {Express.js Next} next
 */
function submitPayment(request, response, next) {
  var steps = [
    validateOptions,
    validatePayment,
    ensureConnected,
    formatPayment,
    submitTransaction
  ];
  async.waterfall(steps, function(error, client_resource_id) {
    if (error) {
      next(error);
    } else {
      response.json(200, {
        success: true,
        client_resource_id: client_resource_id,
        status_url: params.url_base + '/v1/accounts/' + params.payment.source_account + '/payments/' + client_resource_id
      });
    }
  });
  var params = {
    payment: request.body.payment,
    secret: request.body.secret,
    client_resource_id: request.body.client_resource_id,
    url_base: request.protocol + '://' + request.host + (config && config.get('PORT') ? ':' + config.get('PORT') : '')
  };

  function validateOptions(async_callback) {
    if (!params.payment) {
      return response.json(400, {
        success: false,
        message: 'Missing parameter: payment. Submission must have payment object in JSON form'
      });
    }
    if (!params.secret) {
      return response.json(400, {
        success: false,
        message: 'Missing parameter: secret. Submission must have account secret to sign and submit payment'
      });
    }
    if (!params.client_resource_id) {
      return response.json(400, {
        success: false,
        message: 'Missing parameter: client_resource_id. All payments must be submitted with a client_resource_id to prevent duplicate payments'
      });
    }
    if (!validator.isValid(params.client_resource_id, 'ResourceId')) {
      return response.json(400, {
        success: false,
        message: 'Invalid parameter: client_resource_id. Must be a string of ASCII-printable characters. Note that 256-bit hex strings are disallowed because of the potential confusion with transaction hashes.'
      });
    }
    async_callback();
  };

  function validatePayment(async_callback) {
    paymentIsValid(params.payment, function(error, payment){
      if (error) {
        response.json(400, {
          success: false,
          message: error.message || error
        });
      } else {
        async_callback();
      }
    });
  };

  function ensureConnected(async_callback) {
    serverLib.ensureConnected(remote, function(error, connected) {
      if (connected) {
        async_callback();
      } else {
        response.json(500, {
          success: false,
          message: 'No connection to rippled'
        });
      }
    });
  };

  function formatPayment(async_callback) {
    paymentToTransactionConverter.convert(params.payment, function(error, transaction) {
      if (error) {
        response.json(400, {
          success: false,
          message: error.message
        });
      } else {
        async_callback(null, transaction);
      }
    });
  };

  function submitTransaction(transaction, async_callback) {
    params.transaction = transaction;
    transactions.submit(params, response, async_callback);
  };
};

/**
 *  Check that the given payment is valid. If not
 *  pass an error to the callback. Otherwise call
 *  the callback with (null, true)
 *
 *  @param {Payment} payment
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {Boolean} is_valid Only defined if there is no error
 */
function paymentIsValid(payment, callback) {
  // Ripple addresses
  if (!validator.isValid(payment.source_account, 'RippleAddress')) {
    return callback(new TypeError('Invalid parameter: source_account. Must be a valid Ripple address'));
  }
  if (!validator.isValid(payment.destination_account, 'RippleAddress')) {
    return callback(new TypeError('Invalid parameter: destination_account. Must be a valid Ripple address'));
  }
  // Tags
  if (payment.source_tag && (!validator.isValid(payment.source_tag, 'UINT32'))) {
    return callback(new TypeError('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer'));
  }
  if (payment.destination_tag && (!validator.isValid(payment.destination_tag, 'UINT32'))) {
    return callback(new TypeError('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer'));
  }

  // Amounts
  // destination_amount is required, source_amount is optional
  if (!payment.destination_amount || (!validator.isValid(payment.destination_amount, 'Amount'))) {
    return callback(new TypeError('Invalid parameter: destination_amount. Must be a valid Amount object'));
  }
  if (payment.source_amount && (!validator.isValid(payment.source_amount, 'Amount'))) {
    return callback(new TypeError('Invalid parameter: source_amount. Must be a valid Amount object'));
  }

  // No issuer for XRP
  if (payment.destination_amount && payment.destination_amount.currency.toUpperCase() === 'XRP' && payment.destination_amount.issuer) {
    return callback(new TypeError('Invalid parameter: destination_amount. XRP cannot have issuer'));
  }
  if (payment.source_amount && payment.source_amount.currency.toUpperCase() === 'XRP' && payment.source_amount.issuer) {
    return callback(new TypeError('Invalid parameter: source_amount. XRP cannot have issuer'));
  }

  // Slippage
  if (payment.source_slippage && !validator.isValid(payment.source_slippage, 'FloatString')) {
    return callback(new TypeError('Invalid parameter: source_slippage. Must be a valid FloatString'));
  }

  // Advanced options
  if (payment.invoice_id && !validator.isValid(payment.invoice_id, 'Hash256')) {
    return callback(new TypeError('Invalid parameter: invoice_id. Must be a valid Hash256'));
  }
  if (payment.paths) {
    if (typeof payment.paths === 'string') {
      try {
        JSON.parse(payment.paths);
      } catch (exception) {
        return callback(new TypeError('Invalid parameter: paths. Must be a valid JSON string or object'));
      }
    } else if (typeof payment.paths === 'object') {
      try {
        JSON.parse(JSON.stringify(payment.paths));
      } catch (exception) {
        return callback(new TypeError('Invalid parameter: paths. Must be a valid JSON string or object'));
      }
    }
  }
  if (payment.hasOwnProperty('partial_payment') && typeof payment.partial_payment !== 'boolean') {
    return callback(new TypeError('Invalid parameter: partial_payment. Must be a boolean'));
  }
  if (payment.hasOwnProperty('no_direct_ripple') && typeof payment.no_direct_ripple !== 'boolean') {
    return callback(new TypeError('Invalid parameter: no_direct_ripple. Must be a boolean'));
  }
  callback(null, true);
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


  function validateOptions(async_callback) {
    var invalid;
    if (!options.account) {
      invalid = 'Missing parameter: account. Must provide account to get payment details';
    }
    if (!validator.isValid(options.account, 'RippleAddress')) {
      invalid = 'Invalid parameter: account. Must be a valid Ripple address';
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
      return response.json(400, {
        success: false,
        message: invalid
      });
    }
    async_callback();
  };

  function ensureConnected(async_callback) {
    serverLib.ensureConnected(remote, function(error, connected) {
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

  // If the transaction was not in the outgoing_transactions db, get it from rippled
  function getTransaction(async_callback) {
    transactions.getTransactionHelper(request, response, async_callback);
  };

  function checkIsPayment(transaction, async_callback) {
    var isPayment = transaction && /^payment$/i.test(transaction.TransactionType);

    if (isPayment) {
      async_callback(null, transaction);
    } else {
      response.json(400, {
        success: false,
        message: 'Not a payment. The transaction corresponding to the given identifier is not a payment.'
      });
    }
  };

  function formatTransaction(transaction, async_callback) {
    if (transaction) {
      var payment = parsePaymentFromTx(transaction, {
        account: options.account
      });
      async_callback(null, payment);
    } else {
      response.json(404, {
        success: false,
        message: 'Payment Not Found. This may indicate that the payment was never validated and written into '
        + 'the Ripple ledger and it was not submitted through this ripple-rest instance. '
        + 'This error may also be seen if the databases of either ripple-rest '
        + 'or rippled were recently created or deleted.'
      });
    }
  };

  var steps = [
    validateOptions,
    ensureConnected,
    getTransaction,
    checkIsPayment,
    formatTransaction
  ];

  async.waterfall(steps, function(error, payment) {
    if (error) {
      next(error);
    } else {
      response.json(200, {
        success: true,
        payment: payment
      });
    }
  });
};

/**
 *  Parse a Payment from the standard ripple
 *  transaction JSON format.
 *
 *  @param {ripple Transaction in JSON format} tx
 *  @param {RippleAddress} options.account Required to determine "direction"
 *  @returns {Payment}
 */
function parsePaymentFromTx(tx, options) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (!options.account) {
    callback(new Error('Internal Error. must supply options.account'));
    return;
  }

  if (tx.TransactionType !== 'Payment') {
    callback(new Error('Not a payment. The transaction corresponding to the given identifier is not a payment.'));
    return;
  }

  var payment = {

    // User supplied
    source_account: tx.Account,
    source_tag: (tx.SourceTag ? '' + tx.SourceTag : ''),
    source_amount: (tx.SendMax ?
      (typeof tx.SendMax === 'object' ?
        tx.SendMax :
        {
          value: utils.dropsToXrp(tx.SendMax),
          currency: 'XRP',
          issuer: ''
        }) :
      (typeof tx.Amount === 'string' ?
        {
          value: utils.dropsToXrp(tx.Amount),
          currency: 'XRP',
          issuer: ''
        } :
        tx.Amount)),
    source_slippage: '0',

    destination_account: tx.Destination,
    destination_tag: (tx.DestinationTag ? '' + tx.DestinationTag : ''),
    destination_amount: (typeof tx.Amount === 'object' ?
      tx.Amount :
      {
        value: utils.dropsToXrp(tx.Amount),
        currency: 'XRP',
        issuer: ''
      }),

    // Advanced options
    invoice_id: tx.InvoiceID || '',
    paths: JSON.stringify(tx.Paths || []),
    no_direct_ripple: (tx.Flags & 0x00010000 ? true : false),
    partial_payment: (tx.Flags & 0x00020000 ? true : false),

    // Generated after validation
    direction: (options.account ?
      (options.account === tx.Account ?
        'outgoing' :
        (options.account === tx.Destination ?
          'incoming' :
          'passthrough')) :
      ''),
    state: tx.state || (tx.meta.TransactionResult === 'tesSUCCESS' ? 'validated' : 'failed'),
    result: tx.meta.TransactionResult || '',
    ledger: '' + (tx.inLedger || tx.ledger_index),
    hash: tx.hash || '',
    timestamp: (tx.date ? new Date(ripple.utils.time.fromRipple(tx.date)).toISOString() : ''),
    fee: utils.dropsToXrp(tx.Fee) || '',
    source_balance_changes: [],
    destination_balance_changes: []

  };

  // Add source_balance_changes
  utils.parseBalanceChanges(tx, tx.Account).forEach(function(amount){
    if (amount.value < 0) {
      payment.source_balance_changes.push(amount);
    }
  });

  // Add destination_balance_changes
  utils.parseBalanceChanges(tx, tx.Destination).forEach(function(amount){
    if (amount.value > 0) {
      payment.destination_balance_changes.push(amount);
    }
  });

  return payment;
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
 *  @param {String} req.query.direction Possible values are "incoming", "outgoing"
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

  function getTransactions(async_callback) {
    var options = {
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

    transactions.getAccountTransactions(options, response, async_callback);
  };

  function formatTransactions(transactions, async_callback) {
    var payments = _.map(transactions, function(transaction) {
      return parsePaymentFromTx(transaction, { account: request.params.account });
    });
    async_callback(null, payments);
  };

  function attachResourceId(transactions, async_callback) {
    async.map(transactions, function(payment, async_map_callback) {
      dbinterface.getTransaction({ hash: payment.hash }, function(error, db_entry) {
        if (error) {
          return callback(error);
        }
        var client_resource_id = '';
        if (db_entry && db_entry.client_resource_id) {
          client_resource_id = db_entry.client_resource_id;
        }
        async_map_callback(null, {
          client_resource_id: client_resource_id,
          payment: payment
        });
      });
    }, async_callback);
  };

  var steps = [
    getTransactions,
    formatTransactions,
    attachResourceId
  ];

  async.waterfall(steps, function(error, payments) {
    if (error) {
      next(error);
    } else {
      response.json(200, {
        success: true,
        payments: payments
      });
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
 *  @param {Array of currencies written as "USD r...,XRP,..."} req.query.source_currencies Note that Express.js middleware replaces "+" signs with spaces. Clients should use "+" signs but the values here will end up as spaces
 *  @param {RippleAddress} req.params.destination_account
 *  @param {Amount written as "1+USD+r..."} req.params.destination_amount_string
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
    return response.json(400, {
      success: false,
      message: 'Missing parameter: source_account. ' +
      'Must be a valid Ripple address' });
  }

  if (!params.destination_account) {
    return response.json(400, {
      success: false,
      message: 'Missing parameter: destination_account. ' +
        'Must be a valid Ripple address'
    });
  }

  // Parse destination amount
  if (!request.params.destination_amount_string) {
    return response.json(400, {
      success: false,
      message: 'Missing parameter: destination_amount. ' +
      'Must be an amount string in the form value+currency+issuer'
    });
  }
  var destination_amount_array = request.params.destination_amount_string.split('+');
  params.destination_amount = {
    value:    (destination_amount_array.length >= 1 ? destination_amount_array[0] : ''),
    currency: (destination_amount_array.length >= 2 ? destination_amount_array[1] : ''),
    issuer:   (destination_amount_array.length >= 3 ? destination_amount_array[2] : '')
  };

  if (!validator.isValid(params.source_account, 'RippleAddress')) {
    return response.json(400, {
      success: false,
      message: 'Invalid parameter: source_account. ' +
      'Must be a valid Ripple address'
    });
  }

  if (!validator.isValid(params.destination_account, 'RippleAddress')) {
    return response.json(400, {
      success: false,
      message: 'Invalid parameter: destination_account. ' +
      'Must be a valid Ripple address'
    });
  }

  if (!validator.isValid(params.destination_amount, 'Amount')) {
    return response.json(400, {
      success: false,
      message: 'Invalid parameter: destination_amount. ' +
      'Must be an amount string in the form value+currency+issuer'
    });
  }

  // Parse source currencies
  // Note that the source_currencies should be in the form
  // "USD r...,BTC,XRP". The issuer is optional but if provided should be
  // separated from the currency by a single space.
  if (request.query.source_currencies) {
    var source_currency_strings = request.query.source_currencies.split(',');
    for (var c = 0; c < source_currency_strings.length; c++) {
      // Remove leading and trailing spaces
      source_currency_strings[c] = source_currency_strings[c].replace(/(^[ ])|([ ]$)/g, '');
      // If there is a space, there should be a valid issuer after the space
      if (/ /.test(source_currency_strings[c])) {
        var currency_issuer_array = source_currency_strings[c].split(' '),
        currency_object = {
          currency: currency_issuer_array[0],
          issuer: currency_issuer_array[1]
        };
        if (validator.isValid(currency_object.currency, 'Currency') && validator.isValid(currency_object.issuer, 'RippleAddress')) {
          params.source_currencies.push(currency_object);
        } else {
          return response.json(400, {
            success: false,
            message: 'Invalid parameter: source_currencies. ' +
            'Must be a list of valid currencies'
          });
        }
      } else {
        if (validator.isValid(source_currency_strings[c], 'Currency')) {
          params.source_currencies.push({ currency: source_currency_strings[c] });
        } else {
          return response.json(400, {
            success: false,
            message: 'Invalid parameter: source_currencies. ' +
            'Must be a list of valid currencies'
          });
        }

      }
    }
  }

  function ensureConnected(async_callback) {
    serverLib.ensureConnected(remote, function(error, connected) {
      if (connected) {
        async_callback();
      } else {
        response.json(500, {
          success: false,
          message: 'No connection to rippled'
        });
      }
    });
  };

  function prepareOptions(async_callback) {
    var pathfind_params = {
      src_account: params.source_account,
      dst_account: params.destination_account,
      dst_amount: (params.destination_amount.currency === 'XRP' ?
        utils.xrpToDrops(params.destination_amount.value) :
        params.destination_amount)
    };
    if (typeof pathfind_params.dst_amount === 'object' && !pathfind_params.dst_amount.issuer) {
      pathfind_params.dst_amount.issuer = pathfind_params.dst_account;
    }
    if (params.source_currencies.length > 0) {
      pathfind_params.src_currencies = params.source_currencies;
    }
    async_callback(null, pathfind_params);
  };

  function findPath(pathfind_params, async_callback) {
    var request = remote.requestRipplePathFind(pathfind_params);
    request.once('error', async_callback);
    request.once('success', function(pathfind_results) {
      pathfind_results.source_account     = pathfind_params.src_account;
      pathfind_results.source_currencies  = pathfind_params.src_currencies;
      pathfind_results.destination_amount = pathfind_params.dst_amount;
      async_callback(null, pathfind_results);
    });

    function reconnectRippled() {
      remote.disconnect(function() {
        remote.connect();
      });
    };
    request.timeout(serverLib.CONNECTION_TIMEOUT, function() {
      request.removeAllListeners();
      reconnectRippled();
      response.json(502, {
        success: false,
        message: 'Path request timeout'
      });
    });
    request.request();
  };

  function addDirectXrpPath(pathfind_results, async_callback) {
    // Check if destination_amount is XRP and if destination_account accepts XRP
    if (typeof pathfind_results.destination_amount.currency === 'string' || pathfind_results.destination_currencies.indexOf('XRP') === -1) {
      return async_callback(null, pathfind_results);
    }
    // Check source_account balance
    remote.requestAccountInfo(pathfind_results.source_account, function(error, result) {
      if (error) {
        return async_callback(new Error('Cannot get account info for source_account. ' + error));
      }
      if (!result || !result.account_data || !result.account_data.Balance) {
        return async_callback(new Error('Internal Error. Malformed account info : ' + JSON.stringify(result)));
      }
      // Add XRP "path" only if the source_account has enough money to execute the payment
      if (bignum(result.account_data.Balance).greaterThan(pathfind_results.destination_amount)) {
        pathfind_results.alternatives.unshift({
          paths_canonical:  [],
          paths_computed:   [],
          source_amount:    pathfind_results.destination_amount
        });
      }
      async_callback(null, pathfind_results);
    });
  };

  function formatPath(pathfind_results, async_callback) {
    if (pathfind_results.alternatives && pathfind_results.alternatives.length > 0) {
      var payment_options = parsePaymentsFromPathfind(pathfind_results);
      return async_callback(null, payment_options);
    }
    if (pathfind_results.destination_currencies.indexOf(params.destination_amount.currency) === -1) {
      response.json(404, {
        success: false,
        message: 'No paths found. ' +
          'The destination_account does not accept ' +
          params.destination_amount.currency +
          ', they only accept: ' +
          pathfind_results.destination_currencies.join(', ')
      });
    } else if (pathfind_results.source_currencies && pathfind_results.source_currencies.length > 0) {
      response.json(404, {
        success: false,
        message: 'No paths found.' +
          ' Please ensure that the source_account has sufficient funds to execute' +
          ' the payment in one of the specified source_currencies. If it does' +
          ' there may be insufficient liquidity in the network to execute' +
          ' this payment right now'
      });
    } else {
      response.json(404, {
        success: false,
        message: 'No paths found.' +
          ' Please ensure that the source_account has sufficient funds to execute' +
          ' the payment. If it does there may be insufficient liquidity in the' +
          ' network to execute this payment right now'
      });
    }
  };
  var steps = [
    ensureConnected,
    prepareOptions,
    findPath,
    addDirectXrpPath,
    formatPath
  ];
  async.waterfall(steps, function(error, payments) {
    if (error) {
      next(error);
    } else {
      response.json(200, {
        success: true,
        payments: payments
      });
    }
  });
};

/**
 *  Validate and parse the pathfinding parameters.
 *
 *  @param {RippleAddress} params.source_account
 *  @param {RippleAddress} params.destination_account
 *  @param {Amount} params.destination_amount
 *  @param {Array of Currencies} params.source_currencies
 */
function parseParams(params, callback) {
  var source_currencies = [];
  if (!validator.isValid(params.source_account, 'RippleAddress')) {
    return callback(new TypeError('Invalid parameter: source_account. Must be a valid Ripple address'));
  }
  if (!validator.isValid(params.destination_account, 'RippleAddress')) {
    return callback(new TypeError('Invalid parameter: destination_account. Must be a valid Ripple address'));
  }
  if (!validator.isValid(params.destination_amount, 'Amount')) {
    return callback(new TypeError('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }'));
  }
  // Parse source currencies
  if (typeof params.source_currencies === 'object') {
    params.source_currencies.forEach(function(currency_string) {
      // Note that express middleware replaces '+' with ' ' in the query string
      if (/ /.test(currency_string)) {
        var currency_issuer_array = currency_string.split(' '),
        currency_object = {
          currency: currency_issuer_array[0],
          issuer: currency_issuer_array[1]
        };
        var validCurrency = validator.isValid(currency_object.currency, 'Currency')
                        || validator.isValid(currency_object.issuer, 'RippleAddress')
        if (!validCurrency) {
          return callback(new TypeError('Invalid parameter: source_currencies. Must be a list of valid currencies'));
        } else {
          source_currencies.push(currency_object);
        }
      } else {
        if (!validator.isValid(currency_string, 'Currency')) {
          return callback(new TypeError('Invalid parameter: source_currencies. Must be a list of valid currencies'));
        } else {
          source_currencies.push({ currency: currency_string });
        }
      }
    });
  }
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
  if (source_currencies.length > 0) {
    pathfindParams.src_currencies = source_currencies;
  }
  callback(null, pathfindParams);
};

/**
 *  Since ripple_path_find does not return XRP to XRP paths,
 *  add the direct XRP "path", if the source account has a sufficient balance
 *
 *  @param {Remote} remote
 *  @param {rippled Pathfind results} pathfind_results
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {rippled Pathfind results with XRP path added} pathfind_results
 */
function addDirectXrpPath(pathfind_results, callback) {
  // Check if destination_account accepts XRP
  if (pathfind_results.destination_currencies.indexOf('XRP') === -1) {
    return callback(null, pathfind_results);
  }

  // Check source_account balance
  remote.requestAccountInfo(pathfind_results.source_account, function(error, result) {
    if (error) {
      return callback(new Error('Cannot get account info for source_account. ' + error));
    }

    if (!result || !result.account_data || !result.account_data.Balance) {
      return callback(new Error('Internal Error. Malformed account info : ' + JSON.stringify(result)));
    }

    // Add XRP "path" only if the source_account has enough money to execute the payment
    if (bignum(result.account_data.Balance).greaterThan(pathfind_results.destination_amount)) {
      pathfind_results.alternatives.unshift({
        paths_canonical:  [],
        paths_computed:   [],
        source_amount:    pathfind_results.destination_amount
      });
    }
    callback(null, pathfind_results);
  });
};

function parsePaymentFromTx(tx, options) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (!options.account) {
    callback(new Error('Internal Error. must supply options.account'));
    return;
  }
  if (tx.TransactionType !== 'Payment') {
    callback(new Error('Not a payment. The transaction corresponding to the given identifier is not a payment.'));
    return;
  }
  var payment = {
    // User supplied
    source_account: tx.Account,
    source_tag: (tx.SourceTag ? '' + tx.SourceTag : ''),
    source_amount: (tx.SendMax ?
      (typeof tx.SendMax === 'object' ?
        tx.SendMax :
        {
          value: utils.dropsToXrp(tx.SendMax),
          currency: 'XRP',
          issuer: ''
        }) :
      (typeof tx.Amount === 'string' ?
        {
          value: utils.dropsToXrp(tx.Amount),
          currency: 'XRP',
          issuer: ''
        } :
        tx.Amount)),
    source_slippage: '0',
    destination_account: tx.Destination,
    destination_tag: (tx.DestinationTag ? '' + tx.DestinationTag : ''),
    destination_amount: (typeof tx.Amount === 'object' ?
      tx.Amount :
      {
        value: utils.dropsToXrp(tx.Amount),
        currency: 'XRP',
        issuer: ''
      }),
    // Advanced options
    invoice_id: tx.InvoiceID || '',
    paths: JSON.stringify(tx.Paths || []),
    no_direct_ripple: (tx.Flags & 0x00010000 ? true : false),
    partial_payment: (tx.Flags & 0x00020000 ? true : false),
    // Generated after validation
    direction: (options.account ?
      (options.account === tx.Account ?
        'outgoing' :
        (options.account === tx.Destination ?
          'incoming' :
          'passthrough')) :
      ''),
    state: tx.state || tx.meta ? (tx.meta.TransactionResult === 'tesSUCCESS' ? 'validated' : 'failed') : '',
    result: tx.meta ? tx.meta.TransactionResult : '',
    ledger: '' + (tx.inLedger || tx.ledger_index),
    hash: tx.hash || '',
    timestamp: (tx.date ? new Date(ripple.utils.toTimestamp(tx.date)).toISOString() : ''),
    fee: utils.dropsToXrp(tx.Fee) || '',
    source_balance_changes: [],
    destination_balance_changes: []
  };
  // Add source_balance_changes
  utils.parseBalanceChanges(tx, tx.Account).forEach(function(amount){
    if (amount.value < 0) {
      payment.source_balance_changes.push(amount);
    }
  });
  // Add destination_balance_changes
  utils.parseBalanceChanges(tx, tx.Destination).forEach(function(amount){
    if (amount.value > 0) {
      payment.destination_balance_changes.push(amount);
    }
  });
  return payment;
};
/**
 *  Convert the pathfind results returned from rippled into an
 *  array of payments in the ripple-rest format. The client should be
 *  able to submit any of the payments in the array back to ripple-rest.
 *
 *  @param {rippled Pathfind results} pathfind_results
 *  @param {Amount} options.destination_amount Since this is not returned by rippled in the pathfind results it can either be added to the results or included in the options here
 *  @param {RippleAddress} options.source_account Since this is not returned by rippled in the pathfind results it can either be added to the results or included in the options here
 *
 *  @returns {Array of Payments} payments
 */
function parsePaymentsFromPathfind(pathfind_results, options) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (options && options.destination_amount) {
    pathfind_results.destination_amount = options.destination_amount;
  }
  if (options && options.source_account) {
    pathfind_results.source_account = options.source_account;
  }
  var payments = [];
  pathfind_results.alternatives.forEach(function(alternative){
    var payment = {
      source_account: pathfind_results.source_account,
      source_tag: '',
      source_amount: (typeof alternative.source_amount === 'string' ?
      {
        value: utils.dropsToXrp(alternative.source_amount),
        currency: 'XRP',
        issuer: ''
      } :
      {
        value: alternative.source_amount.value,
        currency: alternative.source_amount.currency,
        issuer: (alternative.source_amount.issuer === pathfind_results.source_account ?
          '' :
          alternative.source_amount.issuer)
      }),
      source_slippage: '0',
      destination_account: pathfind_results.destination_account,
      destination_tag: '',
      destination_amount: (typeof pathfind_results.destination_amount === 'string' ?
        {
          value: utils.dropsToXrp(pathfind_results.destination_amount),
          currency: 'XRP',
          issuer: ''
        } :
        {
          value: pathfind_results.destination_amount.value,
          currency: pathfind_results.destination_amount.currency,
          issuer: (pathfind_results.destination_amount.issuer === pathfind_results.destination_account ?
            '' :
            pathfind_results.destination_amount.issuer)
        }),
      invoice_id: '',
      paths: JSON.stringify(alternative.paths_computed),
      partial_payment: false,
      no_direct_ripple: false
    };
    payments.push(payment);
  });
  return payments;
};
