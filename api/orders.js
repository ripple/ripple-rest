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
  placeOrder: placeOrder,
  cancelOrder: cancelOrder
};

var paymentToTransactionConverter = new RestToLibTxConverter();

/**
 *  Submit an order to the ripple network
 *
 *  @body
 *  @param {Order} request.body.order - object that holds information about the order
 *  @param {String "buy"|"sell"} request.body.order.type - choose whether to submit a buy or sell order
 *  @param {String} request.body.order.taker_gets - the amount of a currency the taker receives for consuming this order
 *  @param {String} request.body.order.taker_pays - the amount of a currency the taker must pay for consuming this order
 *  @param {String} request.body.secret - YOUR secret key. Do NOT submit to an unknown ripple-rest server
 *  
 *  @query
 *  @param {String "true"|"false"} request.query.validated - used to force request to wait until rippled has finished validating the submitted transaction
 *
 *  @param {Express.js Response} response
 *  @param {Express.js Next} next
 */
function placeOrder(request, response, next) {
  var steps = [
    validateOptions,
    submitTransaction
  ];

  var options = request.params;

  Object.keys(request.body).forEach(function(param) {
    options[param] = request.body[param];
  });

  options.validated = request.query.validated === 'true';

  async.waterfall(steps, function(error, data) {
    if (error) {
      return next(error);
    }

    respond.success(response, data);
  });

  function validateOptions(async_callback) {
    if (!options.secret) {
      async_callback(new InvalidRequestError('Missing parameter: secret. Submission must have account secret to sign and submit payment'));
    } else if (!options.order) {
      async_callback(new InvalidRequestError('Missing parameter: order. Submission must have order object in JSON form'));
    } else if (!/^buy|sell$/.test(options.order.type)) {
      async_callback(new InvalidRequestError('Parameter must be "buy" or "sell": type'));
    } else if (!ripple.Amount.is_valid_full(options.order.taker_gets)) {
      async_callback(new InvalidRequestError('Parameter must be in the format "amount[/currency/issuer]": taker_gets'));
    } else if (!ripple.Amount.is_valid_full(options.order.taker_pays)) {
      async_callback(new InvalidRequestError('Parameter must be in the format "amount[/currency/issuer]": taker_pays'));
    } else {
      async_callback();
    }
  };

  function submitTransaction(async_callback) {
    var transaction = remote.transaction();

    function formatTransaction(message) {
      var summary = transaction.summary();
      var result = { 
        success: true,
        order: {
          account: message.tx_json.Account,
          taker_gets: message.tx_json.TakerGets,
          taker_pays: message.tx_json.TakerPays,
          fee: utils.dropsToXrp(message.tx_json.Fee),
          type: (message.tx_json.Flags & ripple.Transaction.flags.OfferCreate.Sell) > 0 ? 'sell' : 'buy',
          sequence: message.tx_json.Sequence
        }
      };

      if (summary.result) {
        result.order.hash = summary.result.transaction_hash;
        result.order.ledger = String(summary.submitIndex);
      }

      result.order.state = message.validated === true ? 'validated' : 'pending';

      async_callback(null, result);
    };

    transaction.secret(options.secret);
    transaction.offerCreate(options.account, ripple.Amount.from_json(options.order.taker_pays), ripple.Amount.from_json(options.order.taker_gets));

    if (options.order.type === 'sell') {
      transaction.set_flags('Sell');
    }

    transaction.once('proposed', function (message) {
      if (options.validated === false) {
        formatTransaction(message);
      }
    });

    transaction.once('final', function (message) {
      if (/^tes/.test(message.engine_result) && options.validated === true) {
        formatTransaction(message);
      }
    });

    transaction.once('error', function (message) {
      async_callback(message);
    });

    transaction.submit();
  };
};

/**
 *  Cancel an order in the ripple network
 *
 *  @url
 *  @param {Number String} request.params.sequence - sequence number of order to cancel
 *
 *  @query
 *  @param {String "true"|"false"} request.query.validated - used to force request to wait until rippled has finished validating the submitted transaction
 *
 *  @param {Express.js Response} response
 *  @param {Express.js Next} next
 */
function cancelOrder(request, response, next) {
  var steps = [
    validateOptions,
    submitTransaction
  ];

  var options = request.params;

  Object.keys(request.body).forEach(function(param) {
    options[param] = request.body[param];
  });

  options.validated = request.query.validated === 'true';

  async.waterfall(steps, function(error, data) {
    if (error) {
      return next(error);
    }

    respond.success(response, data);
  });

  function validateOptions(async_callback) {
    if (!options.secret) {
      async_callback(new InvalidRequestError('Missing parameter: secret. Submission must have account secret to sign and submit payment'));
    } else if (!(Number(options.sequence) >= 0)) {
      async_callback(new InvalidRequestError('Invalid parameter: sequence. Sequence must be a positive number'));
    } else {
      async_callback();
    }
  };

  function submitTransaction(async_callback) {
    var transaction = remote.transaction();

    function formatTransaction(message) {
      var summary = transaction.summary();
      var result = {
        success: true,
        order: {
          account: message.tx_json.Account,
          fee: utils.dropsToXrp(message.tx_json.Fee),
          offer_sequence: message.tx_json.OfferSequence,
          sequence: message.tx_json.Sequence
        }
      };

      if (summary.result) {
        result.order.hash = summary.result.transaction_hash;
        result.order.ledger = String(summary.submitIndex);
      }

      result.order.state = message.validated === true ? 'validated' : 'pending';

      async_callback(null, result);
    };

    transaction.secret(options.secret);
    transaction.offerCancel(options.account, options.sequence);

    transaction.once('proposed', function (message) {
      if (options.validated === false) {
        formatTransaction(message);
      }
    });

    transaction.once('final', function (message) {
      if (/^tes/.test(message.engine_result) && options.validated === true) {
        formatTransaction(message);
      }
    });

    transaction.once('error', function (message) {
      async_callback(message);
    });

    transaction.submit();
  };
};