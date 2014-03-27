var _                = require('lodash');
var async            = require('async');
var bignum           = require('bignumber.js');
var equal            = require('deep-equal');
var ripple           = require('ripple-lib'); 
var validator        = require('./schema-validator');
var paymentformatter = require('./formatters/payment-formatter');
var transactionslib  = require('./transactions-lib');
var serverlib        = require('./server-lib');
var utils            = require('./utils');


function getPayment(remote, dbinterface, opts, callback) {

  var steps = [

    function(async_callback) {
      serverlib.ensureConnected(remote, async_callback);
    },

    // Check input
    function(connected, async_callback) {
      if (!opts.account) {
        async_callback(new Error('Missing parameter: account. Must provide account to get payment details'));
        return;
      }

      if (validator.validate(opts.account, 'RippleAddress').length > 0) {
        async_callback(new Error('Invalid parameter: account. Must be a valid Ripple address'));
        return;
      }

      if (!opts.identifier) {
        async_callback(new Error('Missing parameter: hash or client_resource_id. Must provide transaction hash or client_resource_id to get payment details'));
        return;
      }

      if (validator.validate(opts.identifier, 'Hash256').length > 0 && validator.validate(opts.identifier, 'ResourceId').length > 0) {
        async_callback(new Error('Invalid Parameter: hash or client_resource_id. Must provide a transaction hash or client_resource_id to get payment details'));
        return;
      }

      async_callback(null, opts);
    },

    // If the transaction was not in the outgoing_transactions db, get it from rippled
    function(opts, async_callback) {
      transactionslib.getTransaction(remote, dbinterface, opts, async_callback);
    },

    function(transaction, async_callback) {
      if (!transaction.TransactionType || transaction.TransactionType.toLowerCase() !== 'payment') {
        async_callback(new Error('Not a payment. The transaction corresponding to the given identifier is not a payment.'));
      } else {
        async_callback(null, transaction);
      }
    },

    function(transaction, async_callback) {
      if (transaction) {
        paymentformatter.parsePaymentFromTx(transaction, {account: opts.account}, async_callback);
      } else {
        async_callback(new Error('Payment Not Found. This may indicate that the payment was never validated and written into the Ripple ledger and it was not submitted through this ripple-rest instance. This error may also be seen if the databases of either ripple-rest or rippled were recently created or deleted.'));
      }
    }

  ];

  async.waterfall(steps, callback);  
}


function getPathfind(remote, params, callback) {

  var steps = [

    function(async_callback) {
      serverlib.ensureConnected(remote, async_callback);
    },

    function(connected, async_callback) {
      parseParams(params, async_callback);
    },

    function(pathfind_params, async_callback) {
      remote.requestRipplePathFind(pathfind_params, function(err, pathfind_res){
        if (err) {
          async_callback(err);
          return;
        }

        pathfind_res.source_account = pathfind_params.src_account;
        pathfind_res.source_currencies = pathfind_params.src_currencies;
        pathfind_res.destination_amount = pathfind_params.dst_amount;
        async_callback(null, pathfind_res);
      });
    },

    function(pathfind_res, async_callback) {
      // Check if we may need to add in the direct XRP path
      if (typeof pathfind_res.destination_amount === 'string' && (!pathfind_res.source_currencies || params.source_currencies.indexOf('XRP') !== -1)) {
        addDirectXrpPath(remote, pathfind_res, async_callback);
      } else {
        async_callback(null, pathfind_res);
      }
    },

    function(pathfind_res, async_callback) {
      if (pathfind_res.alternatives && pathfind_res.alternatives.length > 0) {
        paymentformatter.parsePaymentsFromPathfind(pathfind_res, async_callback);
      } else {
        if (pathfind_res.destination_currencies.indexOf(params.destination_amount.currency) === -1) {
          async_callback(('No paths found. The destination_account does not accept ' + params.destination_amount.currency + ', they only accept: ' + pathfind_res.destination_currencies.join(', ')));
        } else if (pathfind_res.source_currencies && pathfind_res.source_currencies.length > 0) { 
          async_callback(new Error('No paths found. Please ensure that the source_account has sufficient funds to exectue the payment in one of the specified source_currencies. If it does there may be insufficient liquidity in the network to execute this payment right now'))
        } else {
          async_callback(new Error('No paths found. Please ensure that the source_account has sufficient funds to exectue the payment. If it does there may be insufficient liquidity in the network to execute this payment right now'));
        }
      }
    }

  ];

  async.waterfall(steps, callback);
}



function parseParams(params, callback) {

  var source_currencies = [];

  if (validator.validate(params.source_account, 'RippleAddress').length > 0) {
    callback(new TypeError('Invalid parameter: source_account. Must be a valid Ripple address'));
    return;
  }

  if (validator.validate(params.destination_account, 'RippleAddress').length > 0) {
    callback(new TypeError('Invalid parameter: destination_account. Must be a valid Ripple address'));
    return;
  }

  if (validator.validate(params.destination_amount, 'Amount').length > 0) {
    callback(new TypeError('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }'));
    return;
  }

  // Parse source currencies
  if (typeof params.source_currencies === 'object') {
    for (var c = 0; c < params.source_currencies.length; c++) {
      var currency_string = params.source_currencies[c];

      // Note that express middleware replaces '+' with ' ' in the query string

      if (currency_string.indexOf(' ') === -1) {

        if (validator.validate(currency_string, 'Currency').length > 0) {
          callback(new TypeError('Invalid parameter: source_currencies. Must be a list of valid currencies'));
          return;
        } else {
          source_currencies.push({
            currency: currency_string
          });
        }

      } else {
        var currency_issuer_array = currency_string.split(' '),
          currency_object = {
            currency: currency_issuer_array[0],
            issuer: currency_issuer_array[1]
          };

        if (validator.validate(currency_object.currency, 'Currency').length > 0 || validator.validate(currency_object.issuer, 'RippleAddress').length > 0) {
          callback(new TypeError('Invalid parameter: source_currencies. Must be a list of valid currencies'));
          return;
        } else {
          source_currencies.push(currency_object);
        }

      }
    }
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
}

/**
 *  Since ripple_path_find does not return XRP to XRP paths,
 *  add the direct XRP "path", if applicable
 */
function addDirectXrpPath(remote, pathfind_res, callback) {

  // Check if destination_account accepts XRP
  if (pathfind_res.destination_currencies.indexOf('XRP') === -1) {
    callback(null, pathfind_res);
    return;
  }

  // Check source_account balance
  remote.requestAccountInfo(pathfind_res.source_account, function(err, res){
    if (err) {
      callback(new Error('Cannot get account info for source_account. ' + err));
      return;
    }

    if (!res || !res.account_data || !res.account_data.Balance) {
      callback(new Error('Internal Error. Malformed account info : ' + JSON.stringify(res)));
      return;
    }

    // Add XRP "path" only if the source_account has enough money to execute the payment
    if (bignum(res.account_data.Balance).greaterThan(pathfind_res.destination_amount)) {
      pathfind_res.alternatives.unshift({
        paths_canonical: [],
        paths_computed: [],
        source_amount: pathfind_res.destination_amount
      });
    }

    callback(null, pathfind_res);

  });
   
}


module.exports.getPathfind = getPathfind;
module.exports.parseParams = parseParams;
module.exports.getPayment  = getPayment;
