'use strict';
var api = require('./api');
var respond = require('./response-handler');
var config = require('../api/lib/config');

function getUrlBase(request) {
  if (config.get('url_base')) {
    return config.get('url_base');
  }
  return request.protocol + '://' + request.hostname +
    (config && config.get('port') ? ':' + config.get('port') : '');
}

function makeCallback(response, next, type) {
  return function(error, data) {
    if (error !== null) {
      next(error);
    } else {
      if (type === undefined) {
        respond.success(response, data);
      } else {
        type(response, data);
      }
      next();
    }
  };
}

function makeMiddleware(handler, type) {
  return function(request, response, next) {
    handler(request, makeCallback(response, next, type));
  };
}

function getUUID(request, callback) {
  api.getUUID(callback);
}

function isTrue(request, callback) {
  api.isTrue(callback);
}

function getFee(request, callback) {
  api.getFee(callback);
}

function getServerStatus(request, callback) {
  api.getServerStatus(callback);
}

function generateWallet(request, callback) {
  api.wallet.generate(callback);
}

function getAccountPayments(request, callback) {
  var account = request.params.account;
  var source_account = request.query.source_account;
  var destination_account = request.query.destination_account;
  var direction = request.query.direction;
  var options = {
    ledger_index_min: request.query.start_ledger,
    ledger_index_max: request.query.end_ledger,
    earliest_first: request.query.earliest_first === 'true',
    exclude_failed: request.query.exclude_failed === 'true',
    results_per_page: request.query.results_per_page,
    page: request.query.page
  };
  api.getAccountPayments(account, source_account, destination_account,
    direction, options, callback);
}

function getPayment(request, callback) {
  var account = request.params.account;
  var identifier = request.params.identifier;
  api.getPayment(account, identifier, callback);
}

function getPathFind(request, callback) {
  var source_account = request.params.account;
  var destination_account = request.params.destination_account;
  var destination_amount_string = request.params.destination_amount_string;
  var source_currency_strings = request.query.source_currencies;
  api.getPathFind(source_account, destination_account,
    destination_amount_string, source_currency_strings, callback);
}

function getOrders(request, callback) {
  var account = request.params.account;
  var options = {
    ledger: request.query.ledger,
    limit: request.query.limit,
    marker: request.query.marker
  };
  api.getOrders(account, options, callback);
}

function getOrderBook(request, callback) {
  var account = request.params.account;
  var base = request.params.base;
  var counter = request.params.counter;
  var options = {
    ledger: request.query.ledger,
    limit: request.query.limit,
    marker: request.query.marker
  };
  api.getOrderBook(account, base, counter, options, callback);
}

function getOrder(request, callback) {
  var account = request.params.account;
  var identifier = request.params.identifier;
  api.getOrder(account, identifier, callback);
}

function getNotification(request, callback) {
  var account = request.params.account;
  var identifier = request.params.identifier;
  var urlBase = getUrlBase(request);
  api.getNotification(account, identifier, urlBase, callback);
}

function getBalances(request, callback) {
  var account = request.params.account;
  var options = {
    currency: request.query.currency,
    counterparty: request.query.counterparty,
    frozen: request.query.frozen === 'true',
    limit: request.query.limit,
    ledger: request.query.ledger,
    marker: request.query.marker
  };
  api.getBalances(account, options, callback);
}

function getSettings(request, callback) {
  var account = request.params.account;
  api.getSettings(account, callback);
}

function getTransaction(request, callback) {
  var account = request.params.account;
  var identifier = request.params.identifier;
  api.getTransaction(account, identifier, callback);
}

function getTrustLines(request, callback) {
  var account = request.params.account;
  var options = {
    currency: request.query.currency,
    counterparty: request.query.counterparty,
    limit: request.query.limit,
    ledger: request.query.ledger,
    marker: request.query.marker
  };
  api.getTrustLines(account, options, callback);
}

function submitPayment(request, callback) {
  var account = request.params.account;
  var payment = request.body.payment;
  var clientResourceID = request.body.client_resource_id;
  var lastLedgerSequence = request.body.last_ledger_sequence;
  var secret = request.body.secret;
  var urlBase = getUrlBase(request);
  var options = {
    max_fee: request.body.max_fee,
    fixed_fee: request.body.fixed_fee,
    validated: request.query.validated === 'true'
  };
  api.submitPayment(account, payment, clientResourceID, secret,
    lastLedgerSequence, urlBase, options, callback);
}

function submitOrder(request, callback) {
  var account = request.params.account;
  var order = request.body.order;
  var secret = request.body.secret;
  var options = {validated: request.query.validated === 'true'};
  api.submitOrder(account, order, secret, options, callback);
}

function changeSettings(request, callback) {
  var account = request.params.account;
  var settings = request.body.settings;
  var secret = request.body.secret;
  var options = {validated: request.query.validated === 'true'};
  api.changeSettings(account, settings, secret, options, callback);
}

function addTrustLine(request, callback) {
  var account = request.params.account;
  var trustline = request.body.trustline;
  var secret = request.body.secret;
  var options = {validated: request.query.validated === 'true'};
  api.addTrustLine(account, trustline, secret, options, callback);
}

function cancelOrder(request, callback) {
  var account = request.params.account;
  var sequence = request.params.sequence;
  var secret = request.body.secret;
  var options = {validated: request.query.validated === 'true'};
  api.cancelOrder(account, sequence, secret, options, callback);
}

module.exports = {
  GET: {
    '/uuid': makeMiddleware(getUUID),
    '/server/connected': makeMiddleware(isTrue),
    '/transaction-fee': makeMiddleware(getFee),
    '/server': makeMiddleware(getServerStatus),
    '/wallet/new': makeMiddleware(generateWallet),
    '/accounts/:account/payments': makeMiddleware(getAccountPayments),
    '/accounts/:account/payments/:identifier': makeMiddleware(getPayment),
    /* eslint-disable max-len */
    '/accounts/:account/payments/paths/:destination_account/:destination_amount_string':
    /* eslint-enable max-len */
      makeMiddleware(getPathFind),
    '/accounts/:account/orders': makeMiddleware(getOrders),
    '/accounts/:account/order_book/:base/:counter':
      makeMiddleware(getOrderBook),
    '/accounts/:account/orders/:identifier': makeMiddleware(getOrder),
    '/accounts/:account/notifications': makeMiddleware(getNotification),
    '/accounts/:account/notifications/:identifier':
      makeMiddleware(getNotification),
    '/accounts/:account/balances': makeMiddleware(getBalances),
    '/accounts/:account/settings': makeMiddleware(getSettings),
    '/transactions/:identifier': makeMiddleware(getTransaction),
    '/accounts/:account/trustlines': makeMiddleware(getTrustLines)
  },
  POST: {
    '/accounts/:account/payments': makeMiddleware(submitPayment),
    '/accounts/:account/orders': makeMiddleware(submitOrder),
    '/accounts/:account/settings': makeMiddleware(changeSettings),
    '/accounts/:account/trustlines':
      makeMiddleware(addTrustLine, respond.created)
  },
  DELETE: {
    '/accounts/:account/orders/:sequence': makeMiddleware(cancelOrder)
  }
};
