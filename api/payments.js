/* eslint-disable valid-jsdoc */
'use strict';
var _ = require('lodash');
var async = require('async');
var bignum = require('bignumber.js');
var ripple = require('ripple-lib');
var transactions = require('./transactions');
var validator = require('./lib/schema-validator');
var serverLib = require('./lib/server-lib');
var utils = require('./lib/utils');
var dbinterface = require('./lib/db-interface.js');
var RestToTxConverter = require('./lib/rest-to-tx-converter.js');
var TxToRestConverter = require('./lib/tx-to-rest-converter.js');
var SubmitTransactionHooks = require('./lib/submit_transaction_hooks.js');
var errors = require('./lib/errors.js');

var InvalidRequestError = errors.InvalidRequestError;
var NotFoundError = errors.NotFoundError;
var TimeOutError = errors.TimeOutError;

var DEFAULT_RESULTS_PER_PAGE = 10;

/**
 * Formats the local database transaction into ripple-rest Payment format
 *
 * @param {RippleAddress} account
 * @param {Transaction} transaction
 * @param {Function} callback
 *
 * @callback
 * @param {Error} error
 * @param {RippleRestTransaction} transaction
 */
function formatPaymentHelper(account, transaction, callback) {
  function checkIsPayment(_callback) {
    var isPayment = transaction
                  && /^payment$/i.test(transaction.TransactionType);

    if (isPayment) {
      _callback(null, transaction);
    } else {
      _callback(new InvalidRequestError('Not a payment. The transaction '
        + 'corresponding to the given identifier is not a payment.'));
    }
  }

  function getPaymentMetadata(_transaction) {
    return {
      client_resource_id: _transaction.client_resource_id || '',
      hash: _transaction.hash || '',
      ledger: !_.isUndefined(transaction.inLedger)
        ? String(_transaction.inLedger) : String(_transaction.ledger_index),
      state: _transaction.state || _transaction.meta
        ? (_transaction.meta.TransactionResult === 'tesSUCCESS'
            ? 'validated' : 'failed') : ''
    };
  }

  function formatTransaction(_transaction, _callback) {
    if (_transaction) {
      TxToRestConverter.parsePaymentFromTx(_transaction, {account: account},
          function(err, parsedPayment) {
        if (err) {
          return _callback(err);
        }

        var result = {
          payment: parsedPayment
        };

        _.extend(result, getPaymentMetadata(_transaction));

        return _callback(null, result);
      });
    } else {
      _callback(new NotFoundError('Payment Not Found. This may indicate that '
        + 'the payment was never validated and written into the Ripple ledger '
        + 'and it was not submitted through this ripple-rest instance. '
        + 'This error may also be seen if the databases of either ripple-rest '
        + 'or rippled were recently created or deleted.'));
    }
  }

  var steps = [
    checkIsPayment,
    formatTransaction
  ];

  async.waterfall(steps, callback);
}


/**
 * Submit a payment in the ripple-rest format.
 *
 * @global
 * @param {/config/config-loader} config
 *
 * @body
 * @param {Payment} request.body.payment
 * @param {String} request.body.secret
 * @param {String} request.body.client_resource_id
 * @param {Number String} req.body.last_ledger_sequence
 *          - last ledger sequence that this payment can end up in
 * @param {Number String} req.body.max_fee
 *          - maximum fee the payer is willing to pay
 * @param {Number String} req.body.fixed_fee - fixed fee the payer wants to pay
 *             the network for accepting this transaction
 *
 * @query
 * @param {String "true"|"false"} request.query.validated - used to force
 *          request to wait until rippled has finished validating the
 *          submitted transaction
 */
function submitPayment(account, payment, clientResourceID, secret,
    lastLedgerSequence, urlBase, options, callback) {
  var self = this;
  var max_fee = Number(options.max_fee) > 0 ?
    utils.xrpToDrops(options.max_fee) : undefined;
  var fixed_fee = Number(options.fixed_fee) > 0 ?
    utils.xrpToDrops(options.fixed_fee) : undefined;

  var params = {
    secret: secret,
    validated: options.validated,
    clientResourceId: clientResourceID,
    blockDuplicates: true,
    saveTransaction: true
  };


  function validateParams(_callback) {
    if (!payment) {
      return _callback(new InvalidRequestError('Missing parameter: payment. '
        + 'Submission must have payment object in JSON form'));
    }
    if (!clientResourceID) {
      return _callback(new InvalidRequestError('Missing parameter: '
        + 'client_resource_id. All payments must be submitted with a '
        + 'client_resource_id to prevent duplicate payments'));
    }
    if (!validator.isValid(clientResourceID, 'ResourceId')) {
      return _callback(new InvalidRequestError('Invalid parameter: '
        + 'client_resource_id. Must be a string of ASCII-printable characters. '
        + 'Note that 256-bit hex strings are disallowed because of the '
        + 'potential confusion with transaction hashes.'));
    }

    if (!ripple.UInt160.is_valid(payment.source_account)) {
      return _callback(new InvalidRequestError('Invalid parameter: '
        + 'source_account. Must be a valid Ripple address'));
    }

    if (!ripple.UInt160.is_valid(payment.destination_account)) {
      return _callback(new InvalidRequestError('Invalid parameter: '
        + 'destination_account. Must be a valid Ripple address'));
    }
    // Tags
    if (payment.source_tag &&
        (!validator.isValid(payment.source_tag, 'UINT32'))) {
      return _callback(new InvalidRequestError('Invalid parameter: source_tag. '
        + 'Must be a string representation of an unsiged 32-bit integer'));
    }
    if (payment.destination_tag
        && (!validator.isValid(payment.destination_tag, 'UINT32'))) {
      return _callback(new InvalidRequestError('Invalid parameter: '
        + 'destination_tag. Must be a string representation of an unsiged '
        + '32-bit integer'));
    }

    // Amounts
    // destination_amount is required, source_amount is optional
    if (!payment.destination_amount
        || (!validator.isValid(payment.destination_amount, 'Amount'))) {
      return _callback(new InvalidRequestError('Invalid parameter: '
        + 'destination_amount. Must be a valid Amount object'));
    }
    if (payment.source_amount
        && (!validator.isValid(payment.source_amount, 'Amount'))) {
      return _callback(new InvalidRequestError(
          'Invalid parameter: source_amount. Must be a valid Amount object'));
    }

    // No counterparty for XRP
    if (payment.destination_amount
        && payment.destination_amount.currency.toUpperCase() === 'XRP'
        && payment.destination_amount.counterparty) {
      return _callback(new InvalidRequestError(
        'Invalid parameter: destination_amount. XRP cannot have counterparty'));
    }
    if (payment.source_amount
        && payment.source_amount.currency.toUpperCase() === 'XRP'
        && payment.source_amount.counterparty) {
      return _callback(new InvalidRequestError(
        'Invalid parameter: source_amount. XRP cannot have counterparty'));
    }

    // Slippage
    if (payment.source_slippage
        && !validator.isValid(payment.source_slippage, 'FloatString')) {
      return _callback(new InvalidRequestError(
        'Invalid parameter: source_slippage. Must be a valid FloatString'));
    }

    // Advanced options

    // Invoice id
    if (payment.invoice_id
        && !validator.isValid(payment.invoice_id, 'Hash256')) {
      return _callback(new InvalidRequestError(
        'Invalid parameter: invoice_id. Must be a valid Hash256'));
    }

    // paths
    if (payment.paths) {
      if (typeof payment.paths === 'string') {
        try {
          JSON.parse(payment.paths);
        } catch (exception) {
          return _callback(new InvalidRequestError(
            'Invalid parameter: paths. Must be a valid JSON string or object'));
        }
      } else if (typeof payment.paths === 'object') {
        try {
          JSON.parse(JSON.stringify(payment.paths));
        } catch (exception) {
          return _callback(new InvalidRequestError(
            'Invalid parameter: paths. Must be a valid JSON string or object'));
        }
      }
    }

    // partial payment
    if (payment.hasOwnProperty('partial_payment')
        && typeof payment.partial_payment !== 'boolean') {
      return _callback(new InvalidRequestError(
        'Invalid parameter: partial_payment. Must be a boolean'));
    }

    // direct ripple
    if (payment.hasOwnProperty('no_direct_ripple')
        && typeof payment.no_direct_ripple !== 'boolean') {
      return _callback(new InvalidRequestError(
        'Invalid parameter: no_direct_ripple. Must be a boolean'));
    }

    // memos
    if (payment.hasOwnProperty('memos')) {
      if (!Array.isArray(payment.memos)) {
        return _callback(new InvalidRequestError(
          'Invalid parameter: memos. Must be an array with memo objects'));
      }

      if (payment.memos.length === 0) {
        return _callback(new InvalidRequestError('Invalid parameter: memos. '
          + 'Must contain at least one Memo object, '
          + 'otherwise omit the memos property'));
      }

      for (var m = 0; m < payment.memos.length; m++) {
        var memo = payment.memos[m];
        if (memo.MemoType && !/(undefined|string)/.test(typeof memo.MemoType)) {
          return _callback(new InvalidRequestError(
            'Invalid parameter: MemoType. MemoType must be a string'));
        }
        if (!/(undefined|string)/.test(typeof memo.MemoData)) {
          return _callback(new InvalidRequestError(
            'Invalid parameter: MemoData. MemoData must be a string'));
        }
        if (!memo.MemoData && !memo.MemoType) {
          return _callback(new InvalidRequestError('Missing parameter: '
            + 'MemoData or MemoType. For a memo object MemoType or MemoData '
            + 'are both optional, as long as one of them is present'));
        }
      }
    }

    _callback(null);
  }

  function initializeTransaction(_callback) {
    RestToTxConverter.convert(payment, function(error, transaction) {
      if (error) {
        return _callback(error);
      }

      _callback(null, transaction);
    });
  }

  function formatTransactionResponse(message, meta, _callback) {
    if (meta.state === 'validated') {
      var transaction = message.tx_json;
      transaction.meta = message.metadata;
      transaction.ledger_index = transaction.inLedger = message.ledger_index;

      return formatPaymentHelper(payment.source_account, transaction,
                                 _callback);
    }

    _callback(null, {
      client_resource_id: clientResourceID,
      status_url: urlBase + '/v1/accounts/' + payment.source_account
        + '/payments/' + clientResourceID
    });
  }

  function setTransactionParameters(transaction) {
    var ledgerIndex;
    var maxFee = Number(max_fee);
    var fixedFee = Number(fixed_fee);

    if (Number(lastLedgerSequence) > 0) {
      ledgerIndex = Number(lastLedgerSequence);
    } else {
      ledgerIndex = Number(self.remote._ledger_current_index)
        + transactions.DEFAULT_LEDGER_BUFFER;
    }

    transaction.lastLedger(ledgerIndex);

    if (maxFee >= 0) {
      transaction.maxFee(maxFee);
    }

    if (fixedFee >= 0) {
      transaction.setFixedFee(fixedFee);
    }

    transaction.clientID(clientResourceID);
  }

  var hooks = {
    validateParams: validateParams,
    initializeTransaction: initializeTransaction,
    formatTransactionResponse: formatTransactionResponse,
    setTransactionParameters: setTransactionParameters
  };

  transactions.submit(this.remote, params, new SubmitTransactionHooks(hooks),
      function(err, paymentResult) {
    if (err) {
      return callback(err);
    }

    callback(null, paymentResult);
  });
}

/**
 * Retrieve the details of a particular payment from the Remote or
 * the local database and return it in the ripple-rest Payment format.
 *
 * @param {Remote} remote
 * @param {/lib/db-interface} dbinterface
 * @param {RippleAddress} req.params.account
 * @param {Hex-encoded String|ASCII printable character String}
 *            req.params.identifier
 */
function getPayment(account, identifier, callback) {
  var self = this;

  function validateOptions(_callback) {
    var invalid;
    if (!account) {
      invalid = 'Missing parameter: account. Must provide account to get '
        + 'payment details';
    }
    if (!ripple.UInt160.is_valid(account)) {
      invalid = 'Parameter is not a valid Ripple address: account';
    }
    if (!identifier) {
      invalid = 'Missing parameter: hash or client_resource_id. Must provide ' +
        'transaction hash or client_resource_id to get payment details';
    }
    if (!validator.isValid(identifier, 'Hash256') &&
      !validator.isValid(identifier, 'ResourceId')) {
        invalid = 'Invalid Parameter: hash or client_resource_id. Must '
        + 'provide a transaction hash or client_resource_id to get payment '
        + 'details';
    }
    if (invalid) {
      _callback(new InvalidRequestError(invalid));
    } else {
      _callback();
    }
  }

  // If the transaction was not in the outgoing_transactions db,
  // get it from rippled
  function getTransaction(_callback) {
    transactions.getTransaction(self.remote, account, identifier,
        function(error, transaction) {
      _callback(error, transaction);
    });
  }

  var steps = [
    validateOptions,
    getTransaction,
    function (transaction, _callback) {
      return formatPaymentHelper(account, transaction, _callback);
    }
  ];

  async.waterfall(steps, function(error, result) {
    if (error) {
      callback(error);
    } else {
      callback(null, result);
    }
  });
}

/**
 * Retrieve the details of multiple payments from the Remote
 * and the local database.
 *
 * This function calls transactions.getAccountTransactions
 * recursively to retrieve results_per_page number of transactions
 * and filters the results by type "payment", along with the other
 * client-specified parameters.
 *
 * @param {Remote} remote
 * @param {/lib/db-interface} dbinterface
 * @param {RippleAddress} req.params.account
 * @param {RippleAddress} req.query.source_account
 * @param {RippleAddress} req.query.destination_account
 * @param {String "incoming"|"outgoing"} req.query.direction
 * @param {Number} [-1] req.query.start_ledger
 * @param {Number} [-1] req.query.end_ledger
 * @param {Boolean} [false] req.query.earliest_first
 * @param {Boolean} [false] req.query.exclude_failed
 * @param {Number} [20] req.query.results_per_page
 * @param {Number} [1] req.query.page
 */
function getAccountPayments(account, source_account, destination_account,
    direction, options, callback) {
  var self = this;

  function getTransactions(_callback) {
    var args = {
      account: account,
      source_account: source_account,
      destination_account: destination_account,
      direction: direction,
      min: options.results_per_page,
      max: options.results_par_page,
      offset: (options.results_per_page || DEFAULT_RESULTS_PER_PAGE)
              * ((options.page || 1) - 1),
      types: ['payment']
    };

    transactions.getAccountTransactions(self.remote,
      _.merge(options, args), _callback);
  }

  function attachDate(_transactions, _callback) {
    var groupedTx = _.groupBy(_transactions, function(tx) {
      return tx.ledger_index;
    });

    async.each(_.keys(groupedTx), function(ledger, next) {
      self.remote.requestLedger({
        ledger_index: Number(ledger)
      }, function(err, data) {
        if (err) {
          return next(err);
        }

        _.each(groupedTx[ledger], function(tx) {
          tx.date = data.ledger.close_time;
        });

        return next(null);
      });
    }, function(err) {
      if (err) {
        return _callback(err);
      }

      return _callback(null, _transactions);
    });
  }

  function formatTransactions(_transactions, _callback) {
    if (!Array.isArray(_transactions)) {
      return _callback(null);
    }
    async.map(_transactions,
      function (transaction, async_map_callback) {
        return formatPaymentHelper(account, transaction, async_map_callback);
      },
      _callback
    );

  }

  function attachResourceId(_transactions, _callback) {
    async.map(_transactions, function(paymentResult, async_map_callback) {
      var hash = paymentResult.hash;

      dbinterface.getTransaction({hash: hash}, function(error, db_entry) {
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
    }, _callback);
  }

  var steps = [
    getTransactions,
    attachDate,
    formatTransactions,
    attachResourceId
  ];

  async.waterfall(steps, function(error, payments) {
    if (error) {
      callback(error);
    } else {
      callback(null, {payments: payments});
    }
  });
}

/**
 * Get a ripple path find, a.k.a. payment options,
 * for a given set of parameters and respond to the
 * client with an array of fully-formed Payments.
 *
 * @param {Remote} remote
 * @param {/lib/db-interface} dbinterface
 * @param {RippleAddress} req.params.source_account
 * @param {Amount Array ["USD r...,XRP,..."]} req.query.source_currencies
 *          - Note that Express.js middleware replaces "+" signs with spaces.
 *            Clients should use "+" signs but the values here will end up
 *            as spaces
 * @param {RippleAddress} req.params.destination_account
 * @param {Amount "1+USD+r..."} req.params.destination_amount_string
 */
function getPathFind(source_account, destination_account,
    destination_amount_string, source_currency_strings, callback) {
  var self = this;
  if (!source_account) {
    callback(new InvalidRequestError(
      'Missing parameter: source_account. Must be a valid Ripple address'));
    return;
  }

  if (!destination_account) {
    callback(new InvalidRequestError('Missing parameter: destination_account. '
      + 'Must be a valid Ripple address'));
    return;
  }

  if (!ripple.UInt160.is_valid(source_account)) {
    callback(new errors.InvalidRequestError(
      'Parameter is not a valid Ripple address: account'));
    return;
  }

  if (!ripple.UInt160.is_valid(destination_account)) {
    callback(new errors.InvalidRequestError(
      'Parameter is not a valid Ripple address: destination_account'));
    return;
  }

  // Parse destination amount
  if (!destination_amount_string) {
    callback(new InvalidRequestError('Missing parameter: destination_amount. '
      + 'Must be an amount string in the form value+currency+counterparty'));
    return;
  }

  var destination_amount = utils.parseCurrencyQuery(destination_amount_string);

  if (!ripple.UInt160.is_valid(source_account)) {
    callback(new InvalidRequestError(
      'Invalid parameter: source_account. Must be a valid Ripple address'));
    return;
  }

  if (!ripple.UInt160.is_valid(destination_account)) {
    callback(new InvalidRequestError('Invalid parameter: destination_account. '
      + 'Must be a valid Ripple address'));
    return;
  }

  if (!validator.isValid(destination_amount, 'Amount')) {
    callback(new InvalidRequestError('Invalid parameter: destination_amount. '
      + 'Must be an amount string in the form value+currency+counterparty'));
    return;
  }

  var source_currencies = [];
  // Parse source currencies
  // Note that the source_currencies should be in the form
  // "USD r...,BTC,XRP". The counterparty is optional but if provided should be
  // separated from the currency by a single space.
  if (source_currency_strings) {
    var sourceCurrencyStrings = source_currency_strings.split(',');
    for (var c = 0; c < sourceCurrencyStrings.length; c++) {
      // Remove leading and trailing spaces
      sourceCurrencyStrings[c] = sourceCurrencyStrings[c].replace(
                                                        /(^[ ])|([ ]$)/g, '');
      // If there is a space, there should be a valid issuer after the space
      if (/ /.test(sourceCurrencyStrings[c])) {
        var currencyCounterpartyArray = sourceCurrencyStrings[c].split(' ');
        var currencyObject = {
          currency: currencyCounterpartyArray[0],
          issuer: currencyCounterpartyArray[1]
        };
        if (validator.isValid(currencyObject.currency, 'Currency')
            && ripple.UInt160.is_valid(currencyObject.issuer)) {
          source_currencies.push(currencyObject);
        } else {
          callback(new InvalidRequestError('Invalid parameter: '
            + 'source_currencies. Must be a list of valid currencies'));
          return;
        }
      } else if (validator.isValid(sourceCurrencyStrings[c], 'Currency')) {
          source_currencies.push({currency: sourceCurrencyStrings[c]});
      } else {
        callback(new InvalidRequestError('Invalid parameter: '
          + 'source_currencies. Must be a list of valid currencies'));
        return;
      }
    }
  }

  function prepareOptions(_callback) {
    var pathfindParams = {
      src_account: source_account,
      dst_account: destination_account,
      dst_amount: utils.txFromRestAmount(destination_amount)
    };
    if (typeof pathfindParams.dst_amount === 'object'
          && !pathfindParams.dst_amount.issuer) {
      // Convert blank issuer to sender's address
      // (Ripple convention for 'any issuer')
      // https://ripple.com/build/transactions/
      //     #special-issuer-values-for-sendmax-and-amount
      // https://ripple.com/build/ripple-rest/#counterparties-in-payments

      pathfindParams.dst_amount.issuer = pathfindParams.dst_account;
    }
    if (source_currencies.length > 0) {
      pathfindParams.src_currencies = source_currencies;
    }
    _callback(null, pathfindParams);
  }

  function findPath(pathfindParams, _callback) {
    var request = self.remote.requestRipplePathFind(pathfindParams);
    request.once('error', _callback);
    request.once('success', function(pathfindResults) {
      pathfindResults.source_account = pathfindParams.src_account;
      pathfindResults.source_currencies = pathfindParams.src_currencies;
      pathfindResults.destination_amount = pathfindParams.dst_amount;
      _callback(null, pathfindResults);
    });

    function reconnectRippled() {
      self.remote.disconnect(function() {
        self.remote.connect();
      });
    }
    request.timeout(serverLib.CONNECTION_TIMEOUT, function() {
      request.removeAllListeners();
      reconnectRippled();
      _callback(new TimeOutError('Path request timeout'));
    });
    request.request();
  }

  function addDirectXrpPath(pathfindResults, _callback) {
    // Check if destination_amount is XRP and if destination_account accepts XRP
    if (typeof pathfindResults.destination_amount.currency === 'string'
          || pathfindResults.destination_currencies.indexOf('XRP') === -1) {
      return _callback(null, pathfindResults);
    }
    // Check source_account balance
    self.remote.requestAccountInfo({account: pathfindResults.source_account},
        function(error, result) {
      if (error) {
        return _callback(new Error(
          'Cannot get account info for source_account. ' + error));
      }
      if (!result || !result.account_data || !result.account_data.Balance) {
        return _callback(new Error('Internal Error. Malformed account info : '
                                  + JSON.stringify(result)));
      }
      // Add XRP "path" only if the source_account has enough money
      // to execute the payment
      if (bignum(result.account_data.Balance).greaterThan(
                                      pathfindResults.destination_amount)) {
        pathfindResults.alternatives.unshift({
          paths_canonical: [],
          paths_computed: [],
          source_amount: pathfindResults.destination_amount
        });
      }
      _callback(null, pathfindResults);
    });
  }

  function formatPath(pathfindResults, _callback) {
    if (pathfindResults.alternatives
            && pathfindResults.alternatives.length > 0) {
      return TxToRestConverter.parsePaymentsFromPathFind(pathfindResults,
                                                         _callback);
    }
    if (pathfindResults.destination_currencies.indexOf(
            destination_amount.currency) === -1) {
      _callback(new NotFoundError('No paths found. ' +
        'The destination_account does not accept ' +
        destination_amount.currency +
        ', they only accept: ' +
        pathfindResults.destination_currencies.join(', ')));

    } else if (pathfindResults.source_currencies
               && pathfindResults.source_currencies.length > 0) {
      _callback(new NotFoundError('No paths found. Please ensure' +
        ' that the source_account has sufficient funds to execute' +
        ' the payment in one of the specified source_currencies. If it does' +
        ' there may be insufficient liquidity in the network to execute' +
        ' this payment right now'));

    } else {
      _callback(new NotFoundError('No paths found.' +
        ' Please ensure that the source_account has sufficient funds to' +
        ' execute the payment. If it does there may be insufficient liquidity' +
        ' in the network to execute this payment right now'));
    }
  }

  var steps = [
    prepareOptions,
    findPath,
    addDirectXrpPath,
    formatPath
  ];

  async.waterfall(steps, function(error, payments) {
    if (error) {
      callback(error);
    } else {
      callback(null, {payments: payments});
    }
  });
}

module.exports = {
  submit: submitPayment,
  get: getPayment,
  getAccountPayments: getAccountPayments,
  getPathFind: getPathFind
};
