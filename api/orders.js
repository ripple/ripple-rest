var _                     = require('lodash');
var ripple                = require('ripple-lib');
var transactions          = require('./transactions');
var respond               = require('./../lib/response-handler.js');
var utils                 = require('./../lib/utils');
var errors                = require('./../lib/errors.js');

var InvalidRequestError   = errors.InvalidRequestError;

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
  var params = request.params;

  Object.keys(request.body).forEach(function(param) {
    params[param] = request.body[param];
  });

  var options = {
    secret: params.secret,
    validated: request.query.validated === 'true'
  };

  var hooks = {
    validateParams: validateParams,
    formatTransactionResponse: formatTransactionResponse,
    setTransactionParameters: setTransactionParameters
  }

  transactions.submit(options, hooks, function(err, placedOrder) {
    if (err) {
      return next(err);
    }

    respond.success(response, placedOrder);
  });
  
  function validateParams(async_callback) {
    if (!params.order) {
      async_callback(new InvalidRequestError('Missing parameter: order. Submission must have order object in JSON form'));
    } else if (!/^buy|sell$/.test(params.order.type)) {
      async_callback(new InvalidRequestError('Parameter must be "buy" or "sell": type'));
    } else if (!ripple.Amount.is_valid_full(params.order.taker_gets)) {
      async_callback(new InvalidRequestError('Parameter must be in the format "amount[/currency/issuer]": taker_gets'));
    } else if (!ripple.Amount.is_valid_full(params.order.taker_pays)) {
      async_callback(new InvalidRequestError('Parameter must be in the format "amount[/currency/issuer]": taker_pays'));
    } else {
      async_callback();
    }
  };

  function formatTransactionResponse(message, meta, async_callback) {
    var result = {};
    _.extend(meta, {
      account: message.tx_json.Account,
      taker_gets: message.tx_json.TakerGets,
      taker_pays: message.tx_json.TakerPays,
      fee: utils.dropsToXrp(message.tx_json.Fee),
      type: (message.tx_json.Flags & ripple.Transaction.flags.OfferCreate.Sell) > 0 ? 'sell' : 'buy',
      sequence: message.tx_json.Sequence
    });

    result.order = meta;

    async_callback(null, result);
  };

  function setTransactionParameters(transaction) {
    transaction.offerCreate(params.account, ripple.Amount.from_json(params.order.taker_pays), ripple.Amount.from_json(params.order.taker_gets));

    if (params.order.type === 'sell') {
      transaction.set_flags('Sell');
    }
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
  var params = request.params;

  Object.keys(request.body).forEach(function(param) {
    params[param] = request.body[param];
  });

  var options = {
    secret: params.secret,
    validated: request.query.validated === 'true'
  };

  var hooks = {
    validateParams: validateParams,
    formatTransactionResponse: formatTransactionResponse,
    setTransactionParameters: setTransactionParameters
  }

  transactions.submit(options, hooks, function(err, canceledOrder) {
    if (err) {
      return next(err);
    }

    respond.success(response, canceledOrder);
  });

  function validateParams(async_callback) {
    if (!(Number(params.sequence) >= 0)) {
      async_callback(new InvalidRequestError('Invalid parameter: sequence. Sequence must be a positive number'));
    } else {
      async_callback();
    }
  };

  function formatTransactionResponse(message, meta, async_callback) {
    var result = {};
    _.extend(meta, {
      account: message.tx_json.Account,
      fee: utils.dropsToXrp(message.tx_json.Fee),
      offer_sequence: message.tx_json.OfferSequence,
      sequence: message.tx_json.Sequence
    });

    result.order = meta;

    async_callback(null, result);
  };

  function setTransactionParameters(transaction) {
    transaction.offerCancel(params.account, params.sequence);
  };
};

module.exports = {
  placeOrder: placeOrder,
  cancelOrder: cancelOrder
};