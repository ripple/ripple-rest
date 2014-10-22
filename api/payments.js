var _                     = require('lodash');
var async                 = require('async');
var bignum                = require('bignumber.js');
var ripple                = require('ripple-lib');
var transactions          = require('./transactions');
var validator             = require('./../lib/schema-validator');
var serverLib             = require('./../lib/server-lib');
var utils                 = require('./../lib/utils');
var remote                = require('./../lib/remote.js');
var dbinterface           = require('./../lib/db-interface.js');
var config                = require('./../lib/config-loader.js');
var RestToLibTxConverter  = require('./../lib/rest_to_lib_transaction_converter.js');
var respond               = require('./../lib/response-handler.js');
var errors                = require('./../lib/errors.js');

var InvalidRequestError   = errors.InvalidRequestError;
var NetworkError          = errors.NetworkError;
var NotFoundError         = errors.NotFoundError;
var TimeOutError          = errors.TimeOutError;

var DEFAULT_RESULTS_PER_PAGE = 10;

module.exports = {
  submit: submitPayment,
  get: getPayment,
  getAccountPayments: getAccountPayments,
  getPathFind: getPathFind,
  _parsePaymentFromTx: parsePaymentFromTx
};

var paymentToTransactionConverter = new RestToLibTxConverter();

/**
 *  Submit a payment in the ripple-rest format.
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
    normalizeOptions,
    validatePayment,
    formatPayment,
    submitTransaction
  ];

  var params = {
    payment: request.body.payment,
    secret: request.body.secret,
    client_resource_id: request.body.client_resource_id,
    url_base: request.protocol + '://' + request.hostname + (config && config.get('port') ? ':' + config.get('port') : '')
  };

  async.waterfall(steps, function(error, client_resource_id) {
    if (error) {
      next(error);
    } else {
      respond.success(response, {
        client_resource_id: client_resource_id,
        status_url: params.url_base + '/v1/accounts/' + params.payment.source_account + '/payments/' + client_resource_id
      });
    }
  });

  function validateOptions(async_callback) {
    if (!params.payment) {
      async_callback(new InvalidRequestError('Missing parameter: payment. Submission must have payment object in JSON form'));
    }
    else if (!params.secret) {
      async_callback(new InvalidRequestError('Missing parameter: secret. Submission must have account secret to sign and submit payment'));
    }
    else if (!params.client_resource_id) {
      async_callback(new InvalidRequestError('Missing parameter: client_resource_id. All payments must be submitted with a client_resource_id to prevent duplicate payments'));
    }
    else if (!validator.isValid(params.client_resource_id, 'ResourceId')) {
      async_callback(new InvalidRequestError('Invalid parameter: client_resource_id. Must be a string of ASCII-printable characters. Note that 256-bit hex strings are disallowed because of the potential confusion with transaction hashes.'));
    }
    else {
      async_callback();
    }
  }

  function normalizeOptions(async_callback) {
    if (params.payment.destination_amount.currency !== 'XRP' && _.isEmpty(params.payment.destination_amount.issuer)) {
      params.payment.destination_amount.issuer = params.payment.destination_account;
    }

    async_callback();
  }

  function validatePayment(async_callback) {
    paymentIsValid(params.payment, function(error, payment){
      async_callback(error ? error : void(0));
    });
  }

  function formatPayment(async_callback) {
    paymentToTransactionConverter.convert(params.payment, function(error, transaction) {
      if (error) {
        async_callback(error);
      } else {
        async_callback(null, transaction);
      }
    });
  }

  function submitTransaction(transaction, async_callback) {
    params.transaction = transaction;
    transactions.submit(params, response, async_callback);
  }

}

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
    return callback(new InvalidRequestError('Invalid parameter: source_account. Must be a valid Ripple address'));
  }

  if (!validator.isValid(payment.destination_account, 'RippleAddress')) {
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
      async_callback(new InvalidRequestError(invalid));
    } else {
      async_callback();
    }
  };

  // If the transaction was not in the outgoing_transactions db, get it from rippled
  function getTransaction(async_callback) {
    transactions.getTransactionHelper(request, response, function(res, err) {
      async_callback(res, err);
    });
  };

  function checkIsPayment(transaction, async_callback) {
    var isPayment = transaction && /^payment$/i.test(transaction.TransactionType);

    if (isPayment) {
      async_callback(null, transaction);
    } else {
      async_callback(new InvalidRequestError('Not a payment. The transaction corresponding to the given identifier is not a payment.'));
    }
  };

  function formatTransaction(transaction, async_callback) {
    if (transaction) {
      var payment = parsePaymentFromTx(transaction,
        {
          account: options.account
        },
        async_callback);
      async_callback(null, payment);
    } else {
      async_callback(new NotFoundError('Payment Not Found. This may indicate that the payment was never validated and written into '
        + 'the Ripple ledger and it was not submitted through this ripple-rest instance. '
        + 'This error may also be seen if the databases of either ripple-rest '
        + 'or rippled were recently created or deleted.'));
    }
  };

  var steps = [
    validateOptions,
    getTransaction,
    checkIsPayment,
    formatTransaction
  ];

  async.waterfall(steps, function(error, payment) {
    if (error) {
      next(error);
    } else {
      respond.success(response, { payment: payment });
    }
  });
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

    // we're not passing in the async_callback to the parsePaymentFromTx
    // meaning there could be null entries in the payments array after the transactions processing
    // filter the empty payments out
    var payments = [];
    if (Array.isArray(transactions)) {
      for (var i=0; i < transactions.length; i++) {
        var parsedPayment = parsePaymentFromTx(transactions[i], { account: request.params.account });
        if (parsedPayment) {
          payments.push(parsedPayment);
        }
      }
    }

    async_callback(null, payments);
  };

  function attachResourceId(transactions, async_callback) {
    async.map(transactions, function(payment, async_map_callback) {
      if (!payment) {
        async_map_callback(new Error('No payment found'));
      }

      dbinterface.getTransaction({ hash: payment.hash }, function(error, db_entry) {
        if (error) {
          return async_map_callback(error);
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
    next(new InvalidRequestError('Missing parameter: source_account. Must be a valid Ripple address'));
    return;
  }

  if (!params.destination_account) {
    next(new InvalidRequestError('Missing parameter: destination_account. Must be a valid Ripple address'));
    return;
  }

  // Parse destination amount
  if (!request.params.destination_amount_string) {
    next(new InvalidRequestError('Missing parameter: destination_amount. Must be an amount string in the form value+currency+issuer'));
    return;
  }
  var destination_amount_array = request.params.destination_amount_string.split('+');
  params.destination_amount = {
    value:    (destination_amount_array.length >= 1 ? destination_amount_array[0] : ''),
    currency: (destination_amount_array.length >= 2 ? destination_amount_array[1] : ''),
    issuer:   (destination_amount_array.length >= 3 ? destination_amount_array[2] : '')
  };

  if (!validator.isValid(params.source_account, 'RippleAddress')) {
    next(new InvalidRequestError('Invalid parameter: source_account. Must be a valid Ripple address'));
    return;
  }

  if (!validator.isValid(params.destination_account, 'RippleAddress')) {
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
          next(new InvalidRequestError('Invalid parameter: source_currencies. Must be a list of valid currencies'));
          return;
        }
      } else {
        if (validator.isValid(source_currency_strings[c], 'Currency')) {
          params.source_currencies.push({ currency: source_currency_strings[c] });
        } else {
          next(new InvalidRequestError('Invalid parameter: source_currencies. Must be a list of valid currencies'));
          return;
        }

      }
    }
  }

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
      async_callback(new TimeOutError('Path request timeout'));
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
      async_callback(new NotFoundError('No paths found. ' +
        'The destination_account does not accept ' +
        params.destination_amount.currency +
        ', they only accept: ' +
        pathfind_results.destination_currencies.join(', ')));

    } else if (pathfind_results.source_currencies && pathfind_results.source_currencies.length > 0) {
      async_callback(new NotFoundError('No paths found.' +
        ' Please ensure that the source_account has sufficient funds to execute' +
        ' the payment in one of the specified source_currencies. If it does' +
        ' there may be insufficient liquidity in the network to execute' +
        ' this payment right now'));

    } else {
      async_callback(new NotFoundError('No paths found.' +
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

function parsePaymentFromTx(tx, options, callback) {

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (!options.account) {
    if (callback !== void(0)) {
      callback(new Error('Internal Error. must supply options.account'));
    }
    return;
  }
  if (tx.TransactionType !== 'Payment') {
    if (callback !== void(0)) {
      callback(new Error('Not a payment. The transaction corresponding to the given identifier is not a payment.'));
    }
    return;
  }
  if (tx.meta !== void(0) && tx.meta.TransactionResult !== void(0)) {
    if (tx.meta.TransactionResult === 'tejSecretInvalid') {
      if (callback !== void(0)) {
        callback(new Error('Invalid secret provided.'));
      }
      return;
    }
  }

  var Amount;
  var isPartialPayment = tx.Flags & 0x00020000 ? true : false;

  // if there is a DeliveredAmount we should use it over Amount
  // there should always be a DeliveredAmount if the partial payment flag is set
  // also there shouldn't be a DeliveredAmount if there's no partial payment flag
  if(isPartialPayment && tx.meta && tx.meta.DeliveredAmount) {
    Amount = tx.meta.DeliveredAmount;
  } else {
    Amount = tx.Amount;
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
      (typeof Amount === 'string' ?
        {
          value: utils.dropsToXrp(tx.Amount),
          currency: 'XRP',
          issuer: ''
        } :
        Amount)),
    source_slippage: '0',
    destination_account: tx.Destination,
    destination_tag: (tx.DestinationTag ? '' + tx.DestinationTag : ''),
    destination_amount: (typeof Amount === 'object' ?
      Amount :
      {
        value: utils.dropsToXrp(Amount),
        currency: 'XRP',
        issuer: ''
      }),
    // Advanced options
    invoice_id: tx.InvoiceID || '',
    paths: JSON.stringify(tx.Paths || []),
    no_direct_ripple: (tx.Flags & 0x00010000 ? true : false),
    partial_payment: isPartialPayment,
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
  if (Array.isArray(tx.Memos) && tx.Memos.length > 0) {
    payment.memos = [];
    for(var m=0; m<tx.Memos.length; m++) {
      payment.memos.push(tx.Memos[m].Memo);
    }
  }
  if (isPartialPayment && tx.meta && tx.meta.DeliveredAmount) {
    payment.destination_amount_submitted = (typeof tx.Amount === 'object' ?
      tx.Amount :
    {
      value: utils.dropsToXrp(tx.Amount),
      currency: 'XRP',
      issuer: ''
    });
    payment.source_amount_submitted = (tx.SendMax ?
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
        tx.Amount));
  }
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
          issuer: pathfind_results.destination_amount.issuer
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
