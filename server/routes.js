'use strict';
var _ = require('lodash');
var api = require('./api');
var respond = require('./response-handler');
var config = require('./config');

function invalid(message) {
  return new api.errors.InvalidRequestError(message);
}

function validateRequest(request) {
  if (request.query.submit === 'false') {
    if (request.query.validated === 'true') {
      throw invalid('validated=true cannot be set with submit=false');
    }
    if (request.body.client_resource_id) {
      throw invalid('client_resource_id cannot be set with submit=false');
    }
  }
}

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

function removeUndefinedValues(object) {
  return _.omit(object, _.isUndefined);
}

function loadInstructions(body) {
  return removeUndefinedValues({
    max_fee: body.max_fee,
    fixed_fee: body.fixed_fee,
    last_ledger_sequence: body.last_ledger_sequence,
    last_ledger_offset: body.last_ledger_offset,
    sequence: body.sequence
  });
}

function loadOptions(request) {
  return _.assign(loadInstructions(request.body), {
    validated: request.query.validated === 'true',
    submit: request.query.submit !== 'false'
  });
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
    results_per_page: Number(request.query.results_per_page),
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

function getNotifications(request, callback) {
  var account = request.params.account;
  var urlBase = getUrlBase(request);
  // var direction = request.query.direction;
  var options = {
    ledger_index_min: request.query.start_ledger,
    ledger_index_max: request.query.end_ledger,
    earliest_first: request.query.earliest_first === 'true',
    exclude_failed: request.query.exclude_failed === 'true',
    results_per_page: request.query.results_per_page,
    page: request.query.page
  };
  api.getNotifications(account, urlBase, options, callback);
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

  var options = {
    min_ledger: request.query.min_ledger,
    max_ledger: request.query.max_ledger
  };

  api.getTransaction(account, identifier, options, callback);
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
  validateRequest(request);
  var account = request.params.account;
  var payment = request.body.payment;
  var clientResourceID = request.body.client_resource_id;
  var secret = request.body.secret;
  var urlBase = getUrlBase(request);
  var options = loadOptions(request);
  api.submitPayment(account, payment, clientResourceID, secret,
    urlBase, options, callback);
}

function submitOrder(request, callback) {
  validateRequest(request);
  var account = request.params.account;
  var order = request.body.order;
  var secret = request.body.secret;
  var options = loadOptions(request);
  api.submitOrder(account, order, secret, options, callback);
}

function changeSettings(request, callback) {
  validateRequest(request);
  var account = request.params.account;
  var settings = request.body.settings;
  var secret = request.body.secret;
  var options = loadOptions(request);
  api.changeSettings(account, settings, secret, options, callback);
}

function addTrustLine(request, callback) {
  validateRequest(request);
  var account = request.params.account;
  var trustline = request.body.trustline;
  var secret = request.body.secret;
  var options = loadOptions(request);
  api.addTrustLine(account, trustline, secret, options, callback);
}

function cancelOrder(request, callback) {
  validateRequest(request);
  var account = request.params.account;
  var sequence = request.params.sequence;
  var secret = request.body.secret;
  var options = loadOptions(request);
  api.cancelOrder(account, sequence, secret, options, callback);
}

function sign(request, callback) {
  var tx_json = request.body.tx_json;
  var secret = request.body.secret;
  var response = api.sign(tx_json, secret);
  callback(null, response);
}

function submit(request, callback) {
  var tx_blob = request.body.tx_blob;
  api.submit(tx_blob, callback);
}

function preparePayment(request, callback) {
  var address = request.body.address;
  var payment = request.body.payment;
  var instructions = request.body.instructions;
  api.preparePayment(address, payment, instructions, callback);
}

function prepareSettings(request, callback) {
  var address = request.body.address;
  var settings = request.body.settings;
  var instructions = request.body.instructions;
  api.prepareSettings(address, settings, instructions, callback);
}

function prepareOrder(request, callback) {
  var address = request.body.address;
  var order = request.body.order;
  var instructions = request.body.instructions;
  api.prepareOrder(address, order, instructions, callback);
}

function prepareOrderCancellation(request, callback) {
  var address = request.body.address;
  var sequence = request.body.sequence;
  var instructions = request.body.instructions;
  api.prepareOrderCancellation(address, sequence, instructions, callback);
}

function prepareTrustLine(request, callback) {
  var address = request.body.address;
  var trustline = request.body.trustline;
  var instructions = request.body.instructions;
  api.prepareTrustLine(address, trustline, instructions, callback);
}

/* eslint-disable max-len */
module.exports = {
  GET: {
    '/uuid': makeMiddleware(getUUID),
    '/server/connected': makeMiddleware(isTrue),
    '/transaction-fee': makeMiddleware(getFee),
    '/server': makeMiddleware(getServerStatus),
    '/wallet/new': makeMiddleware(generateWallet),
    '/accounts/:account/payments': makeMiddleware(getAccountPayments),
    '/accounts/:account/payments/:identifier': makeMiddleware(getPayment),
    '/accounts/:account/payments/paths/:destination_account/:destination_amount_string': makeMiddleware(getPathFind),
    '/accounts/:account/orders': makeMiddleware(getOrders),
    '/accounts/:account/order_book/:base/:counter': makeMiddleware(getOrderBook),
    '/accounts/:account/orders/:identifier': makeMiddleware(getOrder),
    '/accounts/:account/notifications': makeMiddleware(getNotifications),
    '/accounts/:account/notifications/:identifier': makeMiddleware(getNotification),
    '/accounts/:account/balances': makeMiddleware(getBalances),
    '/accounts/:account/settings': makeMiddleware(getSettings),
    '/transactions/:identifier': makeMiddleware(getTransaction),
    '/accounts/:account/trustlines': makeMiddleware(getTrustLines)
  },
  POST: {
    '/accounts/:account/payments': makeMiddleware(submitPayment),
    '/accounts/:account/orders': makeMiddleware(submitOrder),
    '/accounts/:account/settings': makeMiddleware(changeSettings),
    '/accounts/:account/trustlines': makeMiddleware(addTrustLine, respond.created),
    '/transaction/sign': makeMiddleware(sign),
    '/transaction/submit': makeMiddleware(submit),
    '/transaction/prepare/payment': makeMiddleware(preparePayment),
    '/transaction/prepare/settings': makeMiddleware(prepareSettings),
    '/transaction/prepare/order': makeMiddleware(prepareOrder),
    '/transaction/prepare/ordercancellation': makeMiddleware(prepareOrderCancellation),
    '/transaction/prepare/trustline': makeMiddleware(prepareTrustLine)
  },
  DELETE: {
    '/accounts/:account/orders/:sequence': makeMiddleware(cancelOrder)
  }
};
/* eslint-enable max-len */
