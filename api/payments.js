var _                = require('lodash');
var async            = require('async');
var bignum           = require('bignumber.js');
var validator        = require('../lib/schema-validator');
var paymentformatter = require('../lib/formatters/payment-formatter');
var transactionslib  = require('../lib/transactions-lib');
var serverlib        = require('../lib/server-lib');
var utils            = require('../lib/utils');

var DEFAULT_RESULTS_PER_PAGE = 10;

exports.getPayment = getPayment;

function getPayment($, req, res, next) {
  var remote = $.remote;
  var dbinterface = $.dbinterface;

  var opts = {
    account: req.params.account,
    identifier: req.params.identifier
  }

  function validateOptions(callback) {
    if (!opts.account) {
      return res.json(400, { success: false, message: 'Missing parameter: account. Must provide account to get payment details' });
    }

    if (!validator.isValid(opts.account, 'RippleAddress')) {
      return res.json(400, { success: false, message: 'Invalid parameter: account. Must be a valid Ripple address' });
    }

    if (!opts.identifier) {
      return res.json(400, { success: false, messge: 'Missing parameter: hash or client_resource_id. Must provide transaction hash or client_resource_id to get payment details' });
    }

    var hasIdentifier = validator.isValid(opts.identifier, 'Hash256') || validator.isValid(opts.identifier, 'ResourceId')

    if (!hasIdentifier) {
      return res.json(400, { success: false, message: 'Invalid Parameter: hash or client_resource_id. Must provide a transaction hash or client_resource_id to get payment details' });
    }

    callback();
  };

  function ensureConnected(callback) {
    serverlib.ensureConnected(remote, callback);
  };

  // If the transaction was not in the outgoing_transactions db, get it from rippled
  function getTransaction(connected, callback) {
    if (!connected) {
      return res.json(500, { success: false, message: 'No connection to rippled' });
    }

    transactionslib.getTransaction(remote, dbinterface, opts, callback);
  };

  function checkIsPayment(transaction, callback) {
    var isPayment = transaction && /^payment$/i.test(transaction.TransactionType);

    if (isPayment) {
      callback(null, transaction);
    } else {
      res.json(404, {
        success: false,
        message: 'Not a payment. The transaction corresponding to the given identifier is not a payment.'
      });
    }
  };

  function formatTransaction(transaction, callback) {
    if (transaction) {
      paymentformatter.parsePaymentFromTx(transaction, { account: opts.account }, callback);
    } else {
      res.json(404, {
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

  async.waterfall(steps, function(err, payment) {
    if (err) {
      next(err);
    } else {
      res.json({ success: true, payment: payment });
    }
  });
};

exports.getBulkPayments = getBulkPayments;

function getBulkPayments($, req, res, next) {
  var remote = $.remote;
  var dbinterface = $.dbinterface;

  var params = {
    account: req.params.account,
    source_account: req.query.source_account,
    destination_account: req.query.destination_account,
    exclude_failed: (req.query.exclude_failed === 'true'),
    start_ledger: req.query.start_ledger,
    end_ledger: req.query.end_ledger,
    earliest_first: (req.query.earliest_first === 'true'),
    results_per_page: req.query.results_per_page,
    page: req.query.page
  }

  function getTransactions(callback) {
    transactionslib.getAccountTransactions(remote, dbinterface, {
      account: params.account,
      source_account: params.source_account,
      destination_account: params.destination_account,
      start_ledger: params.start_ledger,
      end_ledger: params.end_ledger,
      descending: !params.earliest_first,
      exclude_failed: params.exclude_failed,
      min: params.results_per_page,
      max: params.results_per_page,
      offset: (params.results_per_page || DEFAULT_RESULTS_PER_PAGE) * ((params.page || 1) - 1),
      types: [ 'payment' ]
    }, callback);
  };

  function formatTransactions(transactions, callback) {
    async.map(transactions, function(transaction, map_callback) {
      paymentformatter.parsePaymentFromTx(transaction, { account: params.account }, map_callback);
    }, callback);
  };

  function attachResourceId(transactions, callback) {
    async.map(transactions, _.partial(attachClientResourceId, dbinterface), callback);
  };

  var steps = [
    getTransactions,
    formatTransactions,
    attachResourceId
  ];

  async.waterfall(steps, function(err, payments) {
    if (err) {
      next(err);
    } else {
      res.json({ success: true, payments: payments });
    }
  });
};

function attachClientResourceId(dbinterface, payment, callback) {
  dbinterface.getTransaction({ hash: payment.hash }, function(err, db_entry) {
    if (err) {
      return callback(err);
    }

    var client_resource_id = '';

    if (db_entry && db_entry.client_resource_id) {
      client_resource_id = db_entry.client_resource_id;
    }

    callback(null, {
      client_resource_id: client_resource_id,
      payment: payment
    });
  });
};

exports.getPathFind = getPathFind;

function getPathFind($, req, res, next) {
  var remote = $.remote;
  var dbinterface = $.dbinterface;

  var params = {
    source_account: req.params.account,
    source_currencies_string: req.param('source_currencies'),
    destination_account: req.params.destination_account,
    destination_amount_string: req.params.destination_amount_string,
  }

//  destination_amount_array,
//  destination_amount,
//  source_currencies

  function validateOptions(callback) {
    if (typeof params.source_currencies_string === 'string' && params.source_currencies_string.length >= 3) {
      params.source_currencies = params.source_currencies_string.split(',');
    }

    if (typeof params.destination_amount_string !== 'string' || params.destination_amount_string.length === 0) {
      return res.json(400, { success: false, message: 'Invalid Parameter: destination_amount. Must supply a string in the form value+currency+issuer' });
    }

    params.destination_amount_array = params.destination_amount_string.split('+');

    params.destination_amount = {
      value: params.destination_amount_array[0],
      currency: params.destination_amount_array[1],
      issuer: (params.destination_amount_array.length >= 3 ? params.destination_amount_array[2] : '')
    };

    callback();
  };

  function ensureConnected(callback) {
    serverlib.ensureConnected(remote, callback);
  };

  // If the transaction was not in the outgoing_transactions db, get it from rippled
  function prepareOptions(connected, callback) {
    if (!connected) {
      return res.json(500, { success: false, message: 'No connection to rippled' });
    }

    parseParams(params, function(err, pathfind_params) {
      if (err) {
        res.json(400, { success: false, message: err.message });
      } else {
        callback(null, pathfind_params);
      }
    });
  };

  function findPath(pathfind_params, callback) {
    remote.requestRipplePathFind(pathfind_params, function(err, path_res) {
      if (err) {
        return callback(err);
      }

      path_res.source_account = pathfind_params.src_account;
      path_res.source_currencies = pathfind_params.src_currencies;
      path_res.destination_amount = pathfind_params.dst_amount;
      callback(null, path_res);
    });
  };

  function checkAddXRPPath(path_res, callback) {
    // Check if we may need to add in the direct XRP path
    if (typeof path_res.destination_amount === 'string' && (!path_res.source_currencies || ~(params.source_currencies.indexOf('XRP')))) {
      addDirectXrpPath(remote, path_res, callback);
    } else {
      callback(null, path_res);
    }
  };

  function formatPath(path_res, callback) {
    if (path_res.alternatives && path_res.alternatives.length > 0) {
      return paymentformatter.parsePaymentsFromPathfind(path_res, callback);
    }

    if (~path_res.destination_currencies.indexOf(params.destination_amount.currency)) {
      res.json(404, { success: false, message: 'No paths found.' +
        'The destination_account does not accept ' +
        params.destination_amount.currency +
        ', they only accept: ' +
        path_res.destination_currencies.join(', ') });
    } else if (path_res.source_currencies &&
      path_res.source_currencies.length > 0) {
      res.json(404, { success: false, message: 'No paths found.' +
        ' Please ensure that the source_account has sufficient funds to exectue' +
        ' the payment in one of the specified source_currencies. If it does' +
        ' there may be insufficient liquidity in the network to execute' +
        ' this payment right now' });
    } else {
      res.json(404, { success: false, message: 'No paths found.' +
        ' Please ensure that the source_account has sufficient funds to exectue' +
        ' the payment. If it does there may be insufficient liquidity in the' +
        ' network to execute this payment right now' });
    }
  };

  var steps = [
    validateOptions,
    ensureConnected,
    prepareOptions,
    findPath,
    checkAddXRPPath,
    formatPath
  ];

  async.waterfall(steps, function(err, payments) {
    if (err) {
      next(err);
    } else {
      res.json(200, { success: true, payments: payments });
    }
  });
};

exports.parseParams = parseParams;

function parseParams(params, callback) {
  var source_currencies = [ ];

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
 *  add the direct XRP "path", if applicable
 */

function addDirectXrpPath(remote, path_res, callback) {
  // Check if destination_account accepts XRP
  if (~path_res.destination_currencies.indexOf('XRP')) {
    return callback(null, path_res);
  }

  // Check source_account balance
  remote.requestAccountInfo(path_res.source_account, function(err, res) {
    if (err) {
      return callback(new Error('Cannot get account info for source_account. ' + err));
    }

    if (!res || !res.account_data || !res.account_data.Balance) {
      return callback(new Error('Internal Error. Malformed account info : ' + JSON.stringify(res)));
    }

    // Add XRP "path" only if the source_account has enough money to execute the payment
    if (bignum(res.account_data.Balance).greaterThan(path_res.destination_amount)) {
      path_res.alternatives.unshift({
        paths_canonical:  [ ],
        paths_computed:   [ ],
        source_amount:    path_res.destination_amount
      });
    }

    callback(null, path_res);
  });
};

