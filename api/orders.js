var _                     = require('lodash');
var Promise               = require('bluebird');
var ripple                = require('ripple-lib');
var remote                = require('./../lib/remote.js');
var transactions          = require('./transactions');
var respond               = require('./../lib/response-handler.js');
var utils                 = require('./../lib/utils');
var errors                = require('./../lib/errors.js');

var InvalidRequestError   = errors.InvalidRequestError;

function getOrders(request, response, next) {
  var options = request.params;

  Object.keys(request.query).forEach(function(param) {
    options[param] = request.query[param];
  });

  options.limit = options.limit || request.body.limit;

  validateOptions(options)
  .then(getAccountOrders)
  .then(function (result) {
    var orders = {};

    if (result.marker) {
      orders.marker = result.marker;
    }

    orders.orders = result.offers;

    respond.success(response, orders);
  })
  .catch(next);

  function validateOptions(options) {
    var promise = new Promise(function(resolve) {
      if (!ripple.UInt160.is_valid(options.account)) {
        throw new errors.InvalidRequestError('Parameter is not a valid Ripple address: account');
      }

      resolve(options);
    });

    return promise
  };

  function getAccountOrders(options) {
    var promise = new Promise(function(resolve, reject) {
      var accountOrdersRequest;
      var marker = request.query.marker;
      var limit = /^[0-9]*$/.test(request.query.limit) ? Number(request.query.limit) : void(0);
      var ledger = /^[0-9]*$/.test(request.query.ledger) ? Number(request.query.ledger) : void(0);

      accountOrdersRequest = remote.requestAccountOffers({
        account: options.account,
        marker: marker,
        limit: limit,
        ledger: ledger
      });

      accountOrdersRequest.once('error', reject);
      accountOrdersRequest.once('success', resolve);
      accountOrdersRequest.request();
    });

    return promise;
  };
};

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
    var takerGetsJSON, takerPaysJSON;

    if (_.isObject(params.order)) {
      takerGetsJSON = ripple.Amount.from_json(params.order.taker_gets);
      takerPaysJSON = ripple.Amount.from_json(params.order.taker_pays);
    }

    if (!params.order) {
      return async_callback(new InvalidRequestError('Missing parameter: order. Submission must have order object in JSON form'));
    } else if (!/^buy|sell$/.test(params.order.type)) {
      return async_callback(new InvalidRequestError('Parameter must be "buy" or "sell": type'));
    } else if (!takerGetsJSON._currency || !takerGetsJSON.is_valid() || (!takerGetsJSON._is_native && !takerGetsJSON.is_valid_full())) {
      async_callback(new InvalidRequestError('Parameter must be in the format "amount[/currency/issuer]": taker_gets'));
    } else if (!takerPaysJSON._currency || !takerPaysJSON.is_valid() || (!takerPaysJSON._is_native && !takerPaysJSON.is_valid_full())) {
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
  getOrders: getOrders,
  placeOrder: placeOrder,
  cancelOrder: cancelOrder
};