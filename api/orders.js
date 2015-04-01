/* globals Promise: true */
/* eslint-disable valid-jsdoc */
'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var ripple = require('ripple-lib');
var transactions = require('./transactions');
var SubmitTransactionHooks = require('./lib/submit_transaction_hooks.js');
var utils = require('./lib/utils');
var errors = require('./lib/errors.js');
var TxToRestConverter = require('./lib/tx-to-rest-converter.js');
var validator = require('./lib/schema-validator.js');
var bignum = require('bignumber.js');
var validate = require('./lib/validate');

var InvalidRequestError = errors.InvalidRequestError;

var OfferCreateFlags = {
  Passive: {name: 'passive', set: 'Passive'},
  ImmediateOrCancel: {name: 'immediate_or_cancel', set: 'ImmediateOrCancel'},
  FillOrKill: {name: 'fill_or_kill', set: 'FillOrKill'}
};

var DefaultPageLimit = 200;

/**
 * Get orders from the ripple network
 *
 *  @query
 *  @param {String} [request.query.limit]
 *    - Set a limit to the number of results returned
 *  @param {String} [request.query.marker]
 *    - Used to paginate results
 *  @param {String} [request.query.ledger]
 *     - The ledger index to query against
 *     - (required if request.query.marker is present)
 *
 *  @url
 *  @param {RippleAddress} request.params.account
 *     - The ripple address to query orders
 *
 */
function getOrders(account, options, callback) {
  var self = this;

  validate.address(account);
  validate.ledger(options.ledger, true);
  validate.limit(options.limit, true);
  validate.paging(options, true);

  function getAccountOrders(prevResult) {
    var isAggregate = options.limit === 'all';
    if (prevResult && (!isAggregate || !prevResult.marker)) {
      return Promise.resolve(prevResult);
    }

    var promise = new Promise(function(resolve, reject) {
      var accountOrdersRequest;
      var marker;
      var ledger;
      var limit;

      if (prevResult) {
        marker = prevResult.marker;
        limit = prevResult.limit;
        ledger = prevResult.ledger_index;
      } else {
        marker = options.marker;
        limit = validator.isValid(options.limit, 'UINT32') ?
          Number(options.limit) : DefaultPageLimit;
        ledger = utils.parseLedger(options.ledger);
      }

      accountOrdersRequest = self.remote.requestAccountOffers({
        account: account,
        marker: marker,
        limit: limit,
        ledger: ledger
      });

      accountOrdersRequest.once('error', reject);
      accountOrdersRequest.once('success', function(nextResult) {
        nextResult.offers = prevResult ?
          nextResult.offers.concat(prevResult.offers) : nextResult.offers;
        resolve(nextResult);
      });
      accountOrdersRequest.request();
    });

    return promise.then(getAccountOrders);
  }

  function getParsedOrders(offers) {
    return _.reduce(offers, function(orders, off) {
      var sequence = off.seq;
      var type = off.flags & ripple.Remote.flags.offer.Sell ? 'sell' : 'buy';
      var passive = (off.flags & ripple.Remote.flags.offer.Passive) !== 0;

      var taker_gets = utils.parseCurrencyAmount(off.taker_gets);
      var taker_pays = utils.parseCurrencyAmount(off.taker_pays);

      orders.push({
        type: type,
        taker_gets: taker_gets,
        taker_pays: taker_pays,
        sequence: sequence,
        passive: passive
      });

      return orders;
    }, []);
  }

  function respondWithOrders(result) {
    var promise = new Promise(function(resolve) {
      var orders = {};

      if (result.marker) {
        orders.marker = result.marker;
      }

      orders.limit = result.limit;
      orders.ledger = result.ledger_index;
      orders.validated = result.validated;
      orders.orders = getParsedOrders(result.offers);

      resolve(callback(null, orders));
    });

    return promise;
  }

  getAccountOrders()
    .then(respondWithOrders)
    .catch(callback);
}

/**
 *  Submit an order to the ripple network
 *
 *  More information about order flags can be found at
 *  https://ripple.com/build/transactions/#offercreate-flags
 *
 *  @body
 *  @param {Order} request.body.order
 *         - Object that holds information about the order
 *  @param {String "buy"|"sell"} request.body.order.type
 *         - Choose whether to submit a buy or sell order
 *  @param {Boolean} [request.body.order.passive]
 *         - Set whether order is passive
 *  @param {Boolean} [request.body.order.immediate_or_cancel]
 *         - Set whether order is immediate or cancel
 *  @param {Boolean} [request.body.order.fill_or_kill]
 *         - Set whether order is fill or kill
 *  @param {String} request.body.order.taker_gets
 *         - Amount of a currency the taker receives for consuming this order
 *  @param {String} request.body.order.taker_pays
 *         - Amount of a currency the taker must pay for consuming this order
 *  @param {String} request.body.secret
 *         - YOUR secret key. Do NOT submit to an unknown ripple-rest server
 *
 *  @query
 *  @param {String "true"|"false"} request.query.validated
 *         - used to force request to wait until rippled has finished
 *         - validating the submitted transaction
 */
function placeOrder(account, order, secret, options, callback) {
  var params = {
    secret: secret,
    validated: options.validated
  };

  if (order) {
    utils.renameCounterpartyToIssuer(order.taker_gets);
    utils.renameCounterpartyToIssuer(order.taker_pays);
  }
  validate.addressAndSecret({address: account, secret: secret});
  validate.order(order);
  validate.validated(options.validated, true);

  function setTransactionParameters(transaction) {
    var takerPays = order.taker_pays.currency !== 'XRP'
      ? order.taker_pays : utils.xrpToDrops(order.taker_pays.value);
    var takerGets = order.taker_gets.currency !== 'XRP'
      ? order.taker_gets : utils.xrpToDrops(order.taker_gets.value);

    transaction.offerCreate(account, ripple.Amount.from_json(takerPays),
      ripple.Amount.from_json(takerGets));

    transactions.setTransactionBitFlags(transaction, {
      input: order,
      flags: OfferCreateFlags
    });

    if (order.type === 'sell') {
      transaction.setFlags('Sell');
    }
  }

  var hooks = {
    formatTransactionResponse: TxToRestConverter.parseSubmitOrderFromTx,
    setTransactionParameters: setTransactionParameters
  };

  transactions.submit(this, params, new SubmitTransactionHooks(hooks),
      function(err, placedOrder) {
    if (err) {
      return callback(err);
    }

    callback(null, placedOrder);
  });
}

/**
 *  Cancel an order in the ripple network
 *
 *  @url
 *  @param {Number String} request.params.sequence
 *          - sequence number of order to cancel
 *
 *  @query
 *  @param {String "true"|"false"} request.query.validated
 *      - used to force request to wait until rippled has finished
 *        validating the submitted transaction
 */
function cancelOrder(account, sequence, secret, options, callback) {
  var params = {
    secret: secret,
    validated: options.validated
  };

  validate.sequence(sequence);
  validate.address(account);

  function setTransactionParameters(transaction) {
    transaction.offerCancel(account, sequence);
  }

  var hooks = {
    formatTransactionResponse: TxToRestConverter.parseCancelOrderFromTx,
    setTransactionParameters: setTransactionParameters
  };

  transactions.submit(this, params, new SubmitTransactionHooks(hooks),
      function(err, canceledOrder) {
    if (err) {
      return callback(err);
    }

    callback(null, canceledOrder);
  });
}

/**
 *  Get the most recent spapshot of the order book for a currency pair
 *
 *  @url
 *  @param {RippleAddress} request.params.account
 *      - The ripple address to use as point-of-view
 *        (returns unfunded orders for this account)
 *  @param {String ISO 4217 Currency Code + RippleAddress} request.params.base
 *      - Base currency as currency+issuer
 *  @param {String ISO 4217 Currency Code + RippleAddress}
 *      request.params.counter - Counter currency as currency+issuer
 *
 *  @query
 *  @param {String} [request.query.limit]
 *      - Set a limit to the number of results returned
 *
 *  @param {Express.js Request} request
 */
function getOrderBook(account, base, counter, options, callback) {
  var self = this;

  var params = _.merge(options, {
    validated: true,
    order_book: base + '/' + counter,
    base: utils.parseCurrencyQuery(base),
    counter: utils.parseCurrencyQuery(counter)
  });
  validate.address(account);
  validate.orderbook(params);
  validate.validated(options.validated, true);

  function getLastValidatedLedger(parameters) {
    var promise = new Promise(function(resolve, reject) {
      var ledgerRequest = self.remote.requestLedger('validated');

      ledgerRequest.once('success', function(res) {
        parameters.ledger = res.ledger.ledger_index;
        resolve(parameters);
      });

      ledgerRequest.once('error', reject);
      ledgerRequest.request();
    });

    return promise;
  }

  function getBookOffers(taker_gets, taker_pays, parameters) {
    var promise = new Promise(function(resolve, reject) {
      var bookOffersRequest = self.remote.requestBookOffers({
        taker_gets: {currency: taker_gets.currency,
                     issuer: taker_gets.counterparty},
        taker_pays: {currency: taker_pays.currency,
                     issuer: taker_pays.counterparty},
        ledger: parameters.ledger,
        limit: parameters.limit,
        taker: account
      });

      bookOffersRequest.once('success', resolve);
      bookOffersRequest.once('error', reject);
      bookOffersRequest.request();
    });

    return promise;
  }

  function getBids(parameters) {
    var taker_gets = parameters.counter;
    var taker_pays = parameters.base;

    return getBookOffers(taker_gets, taker_pays, parameters);
  }

  function getAsks(parameters) {
    var taker_gets = parameters.base;
    var taker_pays = parameters.counter;

    return getBookOffers(taker_gets, taker_pays, parameters);
  }

  function getBidsAndAsks(parameters) {
    return Promise.join(
      getBids(parameters),
      getAsks(parameters),
      function(bids, asks) {
        return [bids, asks, parameters];
      }
    );
  }

  function getParsedBookOffers(offers, isAsk) {
    return offers.reduce(function(orderBook, off) {
      var price;
      var order_maker = off.Account;
      var sequence = off.Sequence;

      // Transaction Flags
      var passive = (off.Flags & ripple.Remote.flags.offer.Passive) !== 0;
      var sell = (off.Flags & ripple.Remote.flags.offer.Sell) !== 0;

      var taker_gets_total = utils.parseCurrencyAmount(off.TakerGets);
      var taker_gets_funded = off.taker_gets_funded ?
        utils.parseCurrencyAmount(off.taker_gets_funded) : taker_gets_total;

      var taker_pays_total = utils.parseCurrencyAmount(off.TakerPays);
      var taker_pays_funded = off.taker_pays_funded ?
        utils.parseCurrencyAmount(off.taker_pays_funded) : taker_pays_total;

      if (isAsk) {
        price = {
          currency: taker_pays_total.currency,
          counterparty: taker_pays_total.counterparty,
          value: bignum(taker_pays_total.value).div(
                        bignum(taker_gets_total.value))
        };
      } else {
        price = {
          currency: taker_gets_total.currency,
          counterparty: taker_gets_total.counterparty,
          value: bignum(taker_gets_total.value).div(
                        bignum(taker_pays_total.value))
        };
      }

      price.value = price.value.toString();

      orderBook.push({
        price: price,
        taker_gets_funded: taker_gets_funded,
        taker_gets_total: taker_gets_total,
        taker_pays_funded: taker_pays_funded,
        taker_pays_total: taker_pays_total,
        order_maker: order_maker,
        sequence: sequence,
        passive: passive,
        sell: sell
      });

      return orderBook;
    }, []);
  }

  function respondWithOrderBook(bids, asks, parameters) {
    var promise = new Promise(function(resolve) {
      var orderBook = {
        order_book: parameters.order_book,
        ledger: parameters.ledger,
        validated: parameters.validated,
        bids: getParsedBookOffers(bids.offers),
        asks: getParsedBookOffers(asks.offers, true)
      };

      resolve(callback(null, orderBook));
    });

    return promise;
  }

  getLastValidatedLedger(params)
  .then(getBidsAndAsks)
  .spread(respondWithOrderBook)
  .catch(callback);
}

/**
 *  Get an Order transaction (`OfferCreate` or `OfferCancel`)
 *
 *  @url
 *  @param {RippleAddress} request.params.account
 *  @param {String} request.params.identifier
 *
 *  @param {Express.js Request} request
 */
function getOrder(account, identifier, callback) {
  var self = this;

  validate.address(account);
  validate.identifier(identifier);

  function getOrderTx() {
    return new Promise(function(resolve, reject) {
      var txRequest = self.remote.requestTx({
        hash: identifier
      });

      txRequest.once('error', reject);
      txRequest.once('transaction', function(res) {
        if (res.TransactionType !== 'OfferCreate'
            && res.TransactionType !== 'OfferCancel') {
          reject(new InvalidRequestError('Invalid parameter: identifier. '
            + 'The transaction corresponding to the given identifier '
            + 'is not an order'));
        } else {
          var options = {
            account: account,
            identifier: identifier
          };
          resolve(TxToRestConverter.parseOrderFromTx(res, options));
        }
      });
      txRequest.request();
    });
  }

  function respondWithOrder(order) {
    return new Promise(function(resolve) {
      resolve(callback(null, order));
    });
  }

  getOrderTx()
  .then(respondWithOrder)
  .catch(callback);
}

module.exports = {
  getOrders: getOrders,
  placeOrder: placeOrder,
  cancelOrder: cancelOrder,
  getOrderBook: getOrderBook,
  getOrder: getOrder
};
