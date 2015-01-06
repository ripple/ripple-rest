var _                       = require('lodash');
var Promise                 = require('bluebird');
var ripple                  = require('ripple-lib');
var remote                  = require('./../lib/remote.js');
var transactions            = require('./transactions');
var SubmitTransactionHooks  = require('./../lib/submit_transaction_hooks.js');
var respond                 = require('./../lib/response-handler.js');
var utils                   = require('./../lib/utils');
var errors                  = require('./../lib/errors.js');
var TxToRestConverter       = require('./../lib/tx-to-rest-converter.js');
var validator               = require('./../lib/schema-validator.js');

const InvalidRequestError   = errors.InvalidRequestError;

const OfferCreateFlags = {
  Passive:            { name: 'passive', set: 'Passive' },
  ImmediateOrCancel:  { name: 'immediate_or_cancel', set: 'ImmediateOrCancel' },
  FillOrKill:         { name: 'fill_or_kill', set: 'FillOrKill' } 
};

const DefaultPageLimit = 200;

/**
 * Get orders from the ripple network
 *
 *  @query
 *  @param {String} [request.query.limit]    - Set a limit to the number of results returned
 *  @param {String} [request.query.marker]   - Used to paginate results
 *  @param {String} [request.query.ledger]   - The ledger index to query aginst (required if request.query.marker is present)
 *
 *  @url
 *  @param {String} request.params.address  - The ripple address to query orders
 *
 *  @param {Express.js Response} response
 *  @param {Express.js Next} next
 */
function getOrders(request, response, next) {
  var options = request.params;

  options.isAggregate = request.param('limit') === 'all';

  Object.keys(request.query).forEach(function(param) {
    options[param] = request.query[param];
  });

  validateOptions(options)
  .then(getAccountOrders)
  .then(respondWithOrders)
  .catch(next);

  function validateOptions(options) {
    if (!ripple.UInt160.is_valid(options.account)) {
      return Promise.reject(new InvalidRequestError('Parameter is not a valid Ripple address: account'));
    }

    return Promise.resolve(options);
  };

  function getAccountOrders(options, prevResult) {
    if (prevResult && (!options.isAggregate || !prevResult.marker)) {
      return Promise.resolve(prevResult);
    }

    var promise = new Promise(function(resolve, reject) {
      var accountOrdersRequest;
      var marker;
      var ledger;
      var limit;

      if (prevResult) {
        marker = prevResult.marker;
        limit  = prevResult.limit;
        ledger = prevResult.ledger_index;
      } else {
        marker = request.query.marker;
        limit  = validator.isValid(request.query.limit, 'UINT32') ? Number(request.query.limit) : DefaultPageLimit;
        ledger = utils.parseLedger(request.query.ledger);
      }

      accountOrdersRequest = remote.requestAccountOffers({
        account: options.account,
        marker: marker,
        limit: limit,
        ledger: ledger
      });

      accountOrdersRequest.once('error', reject);
      accountOrdersRequest.once('success', function(nextResult) {
        nextResult.offers = prevResult ? nextResult.offers.concat(prevResult.offers) : nextResult.offers;
        resolve([options, nextResult]);
      });
      accountOrdersRequest.request();
    });

    return promise.spread(getAccountOrders);
  };

  function getParsedOrders(offers) {
    return _.reduce(offers, function(orders, off) {
      var taker_gets = utils.parseCurrencyAmount(off.taker_gets);
      var taker_pays = utils.parseCurrencyAmount(off.taker_pays);

      orders.push({
        taker_gets: taker_gets,
        taker_pays: taker_pays
      });

      return orders;
    },[]);
  }

  function respondWithOrders(result) {
    var promise = new Promise(function (resolve, reject) {
      var orders = {};

      if (result.marker) {
        orders.marker = result.marker;
      }

      orders.limit     = result.limit;
      orders.ledger    = result.ledger_index;
      orders.validated = result.validated;
      orders.orders    = getParsedOrders(result.offers);

      resolve(respond.success(response, orders));
    });

    return promise;
  }

};

/**
 *  Submit an order to the ripple network
 *
 *  More information about order flags can be found at https://ripple.com/build/transactions/#offercreate-flags
 *
 *  @body
 *  @param {Order} request.body.order                         - Object that holds information about the order
 *  @param {String "buy"|"sell"} request.body.order.type      - Choose whether to submit a buy or sell order
 *  @param {Boolean} [request.body.order.passive]             - Set whether order is passive
 *  @param {Boolean} [request.body.order.immediate_or_cancel] - Set whether order is immediate or cancel
 *  @param {Boolean} [request.body.order.fill_or_kill]        - Set whether order is fill or kill
 *  @param {String} request.body.order.taker_gets             - Amount of a currency the taker receives for consuming this order
 *  @param {String} request.body.order.taker_pays             - Amount of a currency the taker must pay for consuming this order
 *  @param {String} request.body.secret                       - YOUR secret key. Do NOT submit to an unknown ripple-rest server
 *  
 *  @query
 *  @param {String "true"|"false"} request.query.validated    - used to force request to wait until rippled has finished validating the submitted transaction
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
    formatTransactionResponse: TxToRestConverter.parseSubmitOrderFromTx,
    setTransactionParameters: setTransactionParameters
  };

  transactions.submit(options, new SubmitTransactionHooks(hooks), function(err, placedOrder) {
    if (err) {
      return next(err);
    }

    respond.success(response, placedOrder);
  });
  
  function validateParams(callback) {
    if (!params.order) {
      return callback(new InvalidRequestError('Missing parameter: order. Submission must have order object in JSON form'));
    } else if (!ripple.UInt160.is_valid(params.account)) {
      return callback(new errors.InvalidRequestError('Parameter is not a valid Ripple address: account'));
    } else if (!/^buy|sell$/.test(params.order.type)) {
      return callback(new InvalidRequestError('Parameter must be "buy" or "sell": type'));
    } else if (!_.isUndefined(params.order.passive) && !_.isBoolean(params.order.passive)) {
      return callback(new InvalidRequestError('Parameter must be a boolean: passive'));
    } else if (!_.isUndefined(params.order.immediate_or_cancel) && !_.isBoolean(params.order.immediate_or_cancel)) {
      return callback(new InvalidRequestError('Parameter must be a boolean: immediate_or_cancel'));
    } else if (!_.isUndefined(params.order.fill_or_kill) && !_.isBoolean(params.order.fill_or_kill)) {
      return callback(new InvalidRequestError('Parameter must be a boolean: fill_or_kill'));
    } else if (!params.order.taker_gets || (!validator.isValid(params.order.taker_gets, 'Amount')) || (!params.order.taker_gets.issuer && params.order.taker_gets.currency !== 'XRP')) {
      callback(new InvalidRequestError('Parameter must be a valid Amount object: taker_gets'));
    } else if (!params.order.taker_pays || (!validator.isValid(params.order.taker_pays, 'Amount')) || (!params.order.taker_pays.issuer && params.order.taker_pays.currency !== 'XRP')) {
      callback(new InvalidRequestError('Parameter must be a valid Amount object: taker_pays'));
    } else {
      callback();
    }
  };

  function setTransactionParameters(transaction) {
    var takerPays = params.order.taker_pays.currency !== 'XRP' ? params.order.taker_pays : utils.xrpToDrops(params.order.taker_pays.value);
    var takerGets = params.order.taker_gets.currency !== 'XRP' ? params.order.taker_gets : utils.xrpToDrops(params.order.taker_gets.value);

    transaction.offerCreate(params.account, ripple.Amount.from_json(takerPays), ripple.Amount.from_json(takerGets));

    transactions.setTransactionBitFlags(transaction, {
      input: params.order,
      flags: OfferCreateFlags
    });

    if (params.order.type === 'sell') {
      transaction.setFlags('Sell');
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
    formatTransactionResponse: TxToRestConverter.parseCancelOrderFromTx,
    setTransactionParameters: setTransactionParameters
  }

  transactions.submit(options, new SubmitTransactionHooks(hooks), function(err, canceledOrder) {
    if (err) {
      return next(err);
    }

    respond.success(response, canceledOrder);
  });

  function validateParams(callback) {
    if (!(Number(params.sequence) >= 0)) {
      callback(new InvalidRequestError('Invalid parameter: sequence. Sequence must be a positive number'));
    } else if (!ripple.UInt160.is_valid(params.account)) {
      callback(new InvalidRequestError('Parameter is not a valid Ripple address: account'));
    } else {
      callback();
    }
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
