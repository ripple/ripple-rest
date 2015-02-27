var _                       = require('lodash');
var Promise                 = require('bluebird');
var ripple                  = require('ripple-lib');
var remote                  = require('./lib/remote.js');
var transactions            = require('./transactions');
var SubmitTransactionHooks  = require('./lib/submit_transaction_hooks.js');
var utils                   = require('./lib/utils');
var errors                  = require('./lib/errors.js');
var TxToRestConverter       = require('./lib/tx-to-rest-converter.js');
var validator               = require('./lib/schema-validator.js');
var bignum                  = require('bignumber.js');

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
 *  @param {String} [request.query.ledger]   - The ledger index to query against (required if request.query.marker is present)
 *
 *  @url
 *  @param {RippleAddress} request.params.account  - The ripple address to query orders
 *
 */
function getOrders(account, options, callback) {
  validateOptions(options)
  .then(getAccountOrders)
  .then(respondWithOrders)
  .catch(callback);

  function validateOptions(options) {
    if (!ripple.UInt160.is_valid(account)) {
      return Promise.reject(new InvalidRequestError('Parameter is not a valid Ripple address: account'));
    }

    return Promise.resolve(options);
  };

  function getAccountOrders(options, prevResult) {
    const isAggregate = options.limit === 'all';
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
        limit  = prevResult.limit;
        ledger = prevResult.ledger_index;
      } else {
        marker = options.marker;
        limit  = validator.isValid(options.limit, 'UINT32') ? Number(options.limit) : DefaultPageLimit;
        ledger = utils.parseLedger(options.ledger);
      }

      accountOrdersRequest = remote.requestAccountOffers({
        account: account,
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
      var sequence = off.seq;
      var passive = off.flags === ripple.Remote.flags.offer.Passive;
      var type = off.flags === ripple.Remote.flags.offer.Sell ? 'sell' : 'buy'

      var taker_gets = utils.parseCurrencyAmount(off.taker_gets);
      var taker_pays = utils.parseCurrencyAmount(off.taker_pays);

      orders.push({
        type: type,
        taker_gets: taker_gets,
        taker_pays: taker_pays,
        sequence: sequence,
        passive: passive,
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

      resolve(callback(null, orders));
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
 */
function placeOrder(account, order, secret, options, callback) {
  var params = {
    secret: secret,
    validated: options.validated
  };

  var hooks = {
    validateParams: validateParams,
    formatTransactionResponse: TxToRestConverter.parseSubmitOrderFromTx,
    setTransactionParameters: setTransactionParameters
  };

  transactions.submit(params, new SubmitTransactionHooks(hooks), function(err, placedOrder) {
    if (err) {
      return callback(err);
    }

    callback(null, placedOrder);
  });

  function validateParams(callback) {
    if (!order) {
      return callback(new InvalidRequestError('Missing parameter: order. Submission must have order object in JSON form'));
    } else {
      if (order.taker_gets && order.taker_gets.currency !== 'XRP') {
        order.taker_gets.issuer = order.taker_gets.counterparty;
        delete order.taker_gets.counterparty;
      }

      if (order.taker_pays && order.taker_pays.currency !== 'XRP') {
        order.taker_pays.issuer = order.taker_pays.counterparty;
        delete order.taker_pays.counterparty;
      }
    }

    if (!ripple.UInt160.is_valid(account)) {
      return callback(new errors.InvalidRequestError('Parameter is not a valid Ripple address: account'));
    } else if (!/^buy|sell$/.test(order.type)) {
      return callback(new InvalidRequestError('Parameter must be "buy" or "sell": type'));
    } else if (!_.isUndefined(order.passive) && !_.isBoolean(order.passive)) {
      return callback(new InvalidRequestError('Parameter must be a boolean: passive'));
    } else if (!_.isUndefined(order.immediate_or_cancel) && !_.isBoolean(order.immediate_or_cancel)) {
      return callback(new InvalidRequestError('Parameter must be a boolean: immediate_or_cancel'));
    } else if (!_.isUndefined(order.fill_or_kill) && !_.isBoolean(order.fill_or_kill)) {
      return callback(new InvalidRequestError('Parameter must be a boolean: fill_or_kill'));
    } else if (!order.taker_gets || (!validator.isValid(order.taker_gets, 'Amount')) || (!order.taker_gets.issuer && order.taker_gets.currency !== 'XRP')) {
      callback(new InvalidRequestError('Parameter must be a valid Amount object: taker_gets'));
    } else if (!order.taker_pays || (!validator.isValid(order.taker_pays, 'Amount')) || (!order.taker_pays.issuer && order.taker_pays.currency !== 'XRP')) {
      callback(new InvalidRequestError('Parameter must be a valid Amount object: taker_pays'));
    } else {
      callback();
    }
  };

  function setTransactionParameters(transaction) {
    var takerPays = order.taker_pays.currency !== 'XRP' ? order.taker_pays : utils.xrpToDrops(order.taker_pays.value);
    var takerGets = order.taker_gets.currency !== 'XRP' ? order.taker_gets : utils.xrpToDrops(order.taker_gets.value);

    transaction.offerCreate(account, ripple.Amount.from_json(takerPays), ripple.Amount.from_json(takerGets));

    transactions.setTransactionBitFlags(transaction, {
      input: order,
      flags: OfferCreateFlags
    });

    if (order.type === 'sell') {
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
 */
function cancelOrder(account, sequence, secret, options, callback) {
  var params = {
    secret: secret,
    validated: options.validated
  };

  var hooks = {
    validateParams: validateParams,
    formatTransactionResponse: TxToRestConverter.parseCancelOrderFromTx,
    setTransactionParameters: setTransactionParameters
  }

  transactions.submit(params, new SubmitTransactionHooks(hooks), function(err, canceledOrder) {
    if (err) {
      return callback(err);
    }

    callback(null, canceledOrder);
  });

  function validateParams(callback) {
    if (!(Number(sequence) >= 0)) {
      callback(new InvalidRequestError('Invalid parameter: sequence. Sequence must be a positive number'));
    } else if (!ripple.UInt160.is_valid(account)) {
      callback(new InvalidRequestError('Parameter is not a valid Ripple address: account'));
    } else {
      callback();
    }
  };

  function setTransactionParameters(transaction) {
    transaction.offerCancel(account, sequence);
  };
};

/**
 *  Get the most recent spapshot of the order book for a currency pair
 *
 *  @url
 *  @param {RippleAddress} request.params.account - The ripple address to use as point-of-view (returns unfunded orders for this account)
 *  @param {String ISO 4217 Currency Code + RippleAddress} request.params.base    - Base currency as currency+issuer
 *  @param {String ISO 4217 Currency Code + RippleAddress} request.params.counter - Counter currency as currency+issuer
 *
 *  @query
 *  @param {String} [request.query.limit] - Set a limit to the number of results returned
 *
 *  @param {Express.js Request} request
 */
function getOrderBook(account, base, counter, options, callback) {
  parseParameters()
  .then(validateParameters)
  .then(getLastValidatedLedger)
  .then(getBidsAndAsks)
  .spread(respondWithOrderBook)
  .catch(callback);

  function parseParameters() {
    var parameters = _.merge(options, {
      validated: true,
      order_book: base + '/' + counter,
      base: utils.parseCurrencyQuery(base),
      counter: utils.parseCurrencyQuery(counter)
    });

    return Promise.resolve(parameters);
  }

  function validateParameters(parameters) {
    return new Promise(function(resolve, reject) {
      if (!ripple.UInt160.is_valid(account)) {
        reject(new InvalidRequestError('Parameter is not a valid Ripple address: account'));
      }

      if (!parameters.base.currency) {
        reject(new InvalidRequestError('Invalid parameter: base. Must be a currency string in the form currency+counterparty'));
      }

      if (!validator.isValid(parameters.base.currency, 'Currency')) {
        reject(new InvalidRequestError('Invalid parameter: base. Must be a currency string in the form currency+counterparty'));
      }

      if (parameters.base.currency !== 'XRP'
          && (!parameters.base.counterparty
              || !ripple.UInt160.is_valid(parameters.base.counterparty))) {
        reject(new InvalidRequestError('Invalid parameter: base. Must be a currency string in the form currency+counterparty'));
      }

      if (!parameters.counter.currency) {
        reject(new InvalidRequestError('Invalid parameter: counter. Must be a currency string in the form currency+counterparty'));
      }

      if (!validator.isValid(parameters.counter.currency, 'Currency')) {
        reject(new InvalidRequestError('Invalid parameter: counter. Must be a currency string in the form currency+counterparty'));
      }

      if (parameters.counter.currency !== 'XRP'
          && (!parameters.counter.counterparty
              || !ripple.UInt160.is_valid(parameters.counter.counterparty))) {
        reject(new InvalidRequestError('Invalid parameter: counter. Must be a currency string in the form currency+counterparty'));
      }

      if (parameters.counter.currency === 'XRP'
          && parameters.counter.counterparty) {
        reject(new InvalidRequestError('Invalid parameter: counter. XRP cannot have counterparty'));
      }

      if (parameters.base.currency === 'XRP' && parameters.base.counterparty) {
        reject(new InvalidRequestError('Invalid parameter: base. XRP cannot have counterparty'));
      }

      resolve(parameters);
    });
  }

  function getLastValidatedLedger(parameters) {
    var promise = new Promise(function (resolve, reject) {
      var ledgerRequest = remote.requestLedger('validated');

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
    var promise = new Promise(function (resolve, reject) {
      var bookOffersRequest = remote.requestBookOffers({
        taker_gets: { currency: taker_gets.currency, issuer: taker_gets.counterparty },
        taker_pays: { currency: taker_pays.currency, issuer: taker_pays.counterparty },
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
        return [bids,asks, parameters];
      }
    );
  }

  function respondWithOrderBook(bids, asks, parameters) {
    var promise = new Promise(function (resolve, reject) {
      var orderBook = {
        order_book: parameters.order_book,
        ledger: parameters.ledger,
        validated: parameters.validated,
        bids:  getParsedBookOffers(bids.offers),
        asks:  getParsedBookOffers(asks.offers, true)
      };

      resolve(callback(null, orderBook));
    });

    return promise;
  }

  function getParsedBookOffers(offers, isAsk) {
    return offers.reduce(function(orderBook, off) {
      var price;
      var order_maker = off.Account;
      var sequence = off.Sequence;

      // Transaction Flags
      var passive = off.Flags === ripple.Remote.flags.offer.Passive;
      var sell = off.Flags === ripple.Remote.flags.offer.Sell;

      var taker_gets_total =  utils.parseCurrencyAmount(off.TakerGets);
      var taker_gets_funded = off.taker_gets_funded ? utils.parseCurrencyAmount(off.taker_gets_funded) : taker_gets_total;

      var taker_pays_total =  utils.parseCurrencyAmount(off.TakerPays);
      var taker_pays_funded = off.taker_pays_funded ? utils.parseCurrencyAmount(off.taker_pays_funded) : taker_pays_total;

      if (isAsk) {
        price = {
          currency: taker_pays_total.currency,
          counterparty: taker_pays_total.counterparty,
          value: bignum(taker_pays_total.value).div(bignum(taker_gets_total.value))
        };
      } else {
        price = {
          currency: taker_gets_total.currency,
          counterparty: taker_gets_total.counterparty,
          value: bignum(taker_gets_total.value).div(bignum(taker_pays_total.value))
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
  validateOptions()
  .then(getOrderTx)
  .then(respondWithOrder)
  .catch(callback);

  function validateOptions() {
    return new Promise(function(resolve, reject) {
      if (!ripple.UInt160.is_valid(account)) {
        reject(new InvalidRequestError('Parameter is not a valid Ripple address: account'));
      }
      if (!validator.isValid(identifier, 'Hash256')) {
        reject(new InvalidRequestError('Parameter is not a valid transaction hash: identifier'));
      }

      resolve();
    });
  }

  function getOrderTx() {
    return new Promise(function(resolve, reject) {
      var txRequest = remote.requestTx({
        hash: identifier
      });

      txRequest.once('error', reject);
      txRequest.once('transaction', function(res) {
        if (res.TransactionType !== 'OfferCreate' && res.TransactionType !== 'OfferCancel') {
          reject(new InvalidRequestError('Invalid parameter: identifier. The transaction corresponding to the given identifier is not an order'));
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
    return new Promise(function(resolve, reject) {
      resolve(callback(null, order));
    });
  }
}

module.exports = {
  getOrders: getOrders,
  placeOrder: placeOrder,
  cancelOrder: cancelOrder,
  getOrderBook: getOrderBook,
  getOrder: getOrder
};
