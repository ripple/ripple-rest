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
var TxToRestConverter = require('./lib/tx-to-rest-converter.js');
var validate = require('./lib/validate');
var convertAmount = require('./transaction/utils').convertAmount;
var createPaymentTransaction =
  require('./transaction').createPaymentTransaction;
var renameCounterpartyToIssuer =
  require('./transaction/utils').renameCounterpartyToIssuer;
var xrpToDrops = require('./transaction/utils').xrpToDrops;
var transact = require('./transact');

var errors = require('./lib/errors');
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
    var clientResourceID = _transaction.client_resource_id || '';
    var hash = _transaction.hash || '';

    var ledger = !_.isUndefined(transaction.inLedger) ?
      String(_transaction.inLedger) : String(_transaction.ledger_index);

    var state = _transaction.validated === true ? 'validated' : 'pending';

    return {
      client_resource_id: clientResourceID,
      hash: hash,
      ledger: ledger,
      state: state
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
    urlBase, options, callback) {
  var self = this;
  var max_fee = Number(options.max_fee) > 0 ?
    xrpToDrops(options.max_fee) : undefined;
  var fixed_fee = Number(options.fixed_fee) > 0 ?
    xrpToDrops(options.fixed_fee) : undefined;

  // these checks are done at the top of the function because we cannot
  // raise exceptions inside callbacks
  validate.addressAndMaybeSecret({address: account, secret: secret});
  validate.payment(payment);
  validate.client_resource_id(clientResourceID);
  validate.options(options);

  function formatTransactionResponse(message, meta, _callback) {
    if (meta.state === 'validated') {
      var transaction = message.tx_json;
      transaction.meta = message.metadata;
      transaction.validated = message.validated;
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

  function _createPaymentTransaction(remote, _callback) {
    var transaction;
    try {
      transaction = createPaymentTransaction(account, payment);
    } catch (err) {
      _callback(err);
      return;
    }

    var ledgerIndex;
    var maxFee = Number(max_fee);
    var fixedFee = Number(fixed_fee);

    if (Number(options.last_ledger_sequence) > 0) {
      ledgerIndex = Number(options.last_ledger_sequence);
    } else {
      ledgerIndex = Number(remote._ledger_current_index)
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
    _callback(null, transaction);
  }

  var _options = {
    validated: options.validated,
    clientResourceId: clientResourceID,
    blockDuplicates: true,
    saveTransaction: true
  };

  var converter = formatTransactionResponse;
  async.waterfall([
    _.partial(_createPaymentTransaction, self.remote),
    function(transaction, _callback) {
      try {   // for case of missing secret and submit=false not set
        transact(transaction, self, secret, _options, converter, _callback);
      } catch (err) {
        _callback(err);
      }
    }
  ], callback);
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

  validate.address(account);
  validate.paymentIdentifier(identifier);

  // If the transaction was not in the outgoing_transactions db,
  // get it from rippled
  function getTransaction(_callback) {
    transactions.getTransaction(self, account, identifier, {}, _callback);
  }

  var steps = [
    getTransaction,
    _.partial(formatPaymentHelper, account)
  ];

  async.waterfall(steps, callback);
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
      max: options.results_per_page,
      offset: (options.results_per_page || DEFAULT_RESULTS_PER_PAGE)
              * ((options.page || 1) - 1),
      types: ['payment'],
      earliestFirst: options.earliest_first
    };

    transactions.getAccountTransactions(self,
      _.merge(options, args), _callback);
  }

  function formatTransactions(_transactions, _callback) {
    if (!Array.isArray(_transactions)) {
      return _callback(null);
    }
    async.map(_transactions,
      _.partial(formatPaymentHelper, account),
      _callback
    );
  }

  function attachResourceId(_transactions, _callback) {
    async.map(_transactions, function(paymentResult, async_map_callback) {
      var hash = paymentResult.hash;

      self.db.getTransaction({hash: hash}, function(error, db_entry) {
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

  function formatResponse(_transactions, _callback) {
    _callback(null, {payments: _transactions});
  }

  var steps = [
    getTransactions,
    _.partial(utils.attachDate, self),
    formatTransactions,
    attachResourceId,
    formatResponse
  ];

  async.waterfall(steps, callback);
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

  var destination_amount = renameCounterpartyToIssuer(
    utils.parseCurrencyQuery(destination_amount_string || ''));

  validate.pathfind({
    source_account: source_account,
    destination_account: destination_account,
    destination_amount: destination_amount,
    source_currency_strings: source_currency_strings
  });

  var source_currencies = [];
  // Parse source currencies
  // Note that the source_currencies should be in the form
  // "USD r...,BTC,XRP". The issuer is optional but if provided should be
  // separated from the currency by a single space.
  if (source_currency_strings) {
    var sourceCurrencyStrings = source_currency_strings.split(',');
    for (var c = 0; c < sourceCurrencyStrings.length; c++) {
      // Remove leading and trailing spaces
      sourceCurrencyStrings[c] = sourceCurrencyStrings[c].replace(
                                                        /(^[ ])|([ ]$)/g, '');
      // If there is a space, there should be a valid issuer after the space
      if (/ /.test(sourceCurrencyStrings[c])) {
        var currencyIssuerArray = sourceCurrencyStrings[c].split(' ');
        var currencyObject = {
          currency: currencyIssuerArray[0],
          issuer: currencyIssuerArray[1]
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
      dst_amount: convertAmount(destination_amount)
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

  function formatResponse(payments, _callback) {
    _callback(null, {payments: payments});
  }

  var steps = [
    prepareOptions,
    findPath,
    addDirectXrpPath,
    formatPath,
    formatResponse
  ];

  async.waterfall(steps, callback);
}

module.exports = {
  submit: utils.wrapCatch(submitPayment),
  get: getPayment,
  getAccountPayments: getAccountPayments,
  getPathFind: getPathFind
};
