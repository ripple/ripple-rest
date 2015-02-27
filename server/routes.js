const api = require('../api');
const respond = require('./response-handler');
const config = require('../api/lib/config');

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
  api.info.uuid(callback);
}

function isConnected(request, callback) {
  api.info.isConnected(callback);
}

function getFee(request, callback) {
  api.info.fee(callback);
}

function getServerStatus(request, callback) {
  api.info.serverStatus(callback);
}

function generateWallet(request, callback) {
  api.wallet.generate(callback);
}

function getAccountPayments(request, callback) {
  const account = request.params.account;
  const source_account = request.query.source_account;
  const destination_account = request.query.destination_account;
  const direction = request.query.direction;
  const options = {
    ledger_index_min: request.query.start_ledger,
    ledger_index_max: request.query.end_ledger,
    earliest_first: request.query.earliest_first === 'true',
    exclude_failed: request.query.exclude_failed === 'true',
    results_per_page: request.query.results_per_page,
    page: request.query.page
  };
  api.payments.getAccountPayments(account, source_account, destination_account,
    direction, options, callback);
}

function getPayment(request, callback) {
  const account = request.params.account;
  const identifier = request.params.identifier;
  api.payments.get(account, identifier, callback);
}

function getPathFind(request, callback) {
  const source_account = request.params.account;
  const destination_account = request.params.destination_account;
  const destination_amount_string = request.params.destination_amount_string;
  const source_currency_strings = request.query.source_currencies;
  api.payments.getPathFind(source_account, destination_account,
    destination_amount_string, source_currency_strings, callback);
}

function getOrders(request, callback) {
  const account = request.params.account;
  const options = {
    ledger: request.query.ledger,
    limit: request.query.limit,
    marker: request.query.marker
  };
  api.orders.getOrders(account, options, callback);
}

function getOrderBook(request, callback) {
  const account = request.params.account;
  const base = request.params.base;
  const counter = request.params.counter;
  const options = {
    ledger: request.query.ledger,
    limit: request.query.limit,
    marker: request.query.marker
  };
  api.orders.getOrderBook(account, base, counter, options, callback);
}

function getOrder(request, callback) {
  const account = request.params.account;
  const identifier = request.params.identifier;
  api.orders.getOrder(account, identifier, callback);
}

function getNotification(request, callback) {
  const account = request.params.account;
  const identifier = request.params.identifier;
  const urlBase = getUrlBase(request);
  api.notifications.getNotification(account, identifier, urlBase, callback);
}

function getBalances(request, callback) {
  const account = request.params.account;
  const options = {
    currency: request.query.currency,
    counterparty: request.query.counterparty,
    frozen: request.query.frozen === 'true',
    limit: request.query.limit,
    ledger: request.query.ledger,
    marker: request.query.marker
  };
  api.balances.get(account, options, callback);
}

function getSettings(request, callback) {
  const account = request.params.account;
  api.settings.get(account, callback);
}

function getTransaction(request, callback) {
  const account = request.params.account;
  const identifier = request.params.identifier;
  api.transactions.get(account, identifier, callback);
}

function getTrustlines(request, callback) {
  const account = request.params.account;
  const options = {
    currency: request.query.currency,
    counterparty: request.query.counterparty,
    limit: request.query.limit,
    ledger: request.query.ledger,
    marker: request.query.marker
  };
  api.trustlines.get(account, options, callback);
}

function submitPayment(request, callback) {
  const account = request.params.account;
  const payment = request.body.payment;
  const clientResourceID = request.body.client_resource_id;
  const lastLedgerSequence = request.body.last_ledger_sequence;
  const secret = request.body.secret;
  const urlBase = getUrlBase(request);
  const options = {
    max_fee: request.body.max_fee,
    fixed_fee: request.body.fixed_fee,
    validated: request.query.validated === 'true'
  };
  api.payments.submit(account, payment, clientResourceID, secret,
    lastLedgerSequence, urlBase, options, callback);
}

function placeOrder(request, callback) {
  const account = request.params.account;
  const order = request.body.order;
  const secret = request.body.secret;
  const options = {validated: request.query.validated === 'true'};
  api.orders.placeOrder(account, order, secret, options, callback);
}

function changeSettings(request, callback) {
  const account = request.params.account;
  const settings = request.body.settings;
  const secret = request.body.secret;
  const options = {validated: request.query.validated === 'true'};
  api.settings.change(account, settings, secret, options, callback);
}

function addTrustLine(request, callback) {
  const account = request.params.account;
  const trustline = request.body.trustline;
  const secret = request.body.secret;
  const options = {validated: request.query.validated === 'true'};
  api.trustlines.add(account, trustline, secret, options, callback);
}

function cancelOrder(request, callback) {
  const account = request.params.account;
  const sequence = request.params.sequence;
  const secret = request.body.secret;
  const options = {validated: request.query.validated === 'true'};
  api.orders.cancelOrder(account, sequence, secret, options, callback);
}

module.exports = {
  GET: {
    '/uuid': makeMiddleware(getUUID),
    '/server/connected': makeMiddleware(isConnected),
    '/transaction-fee': makeMiddleware(getFee),
    '/server': makeMiddleware(getServerStatus),
    '/wallet/new': makeMiddleware(generateWallet),
    '/accounts/:account/payments': makeMiddleware(getAccountPayments),
    '/accounts/:account/payments/:identifier': makeMiddleware(getPayment),
    '/accounts/:account/payments/paths/:destination_account/:destination_amount_string': makeMiddleware(getPathFind),
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
    '/accounts/:account/trustlines': makeMiddleware(getTrustlines),
  },
  POST: {
    '/accounts/:account/payments': makeMiddleware(submitPayment),
    '/accounts/:account/orders': makeMiddleware(placeOrder),
    '/accounts/:account/settings': makeMiddleware(changeSettings),
    '/accounts/:account/trustlines':
      makeMiddleware(addTrustLine, respond.created),
  },
  DELETE: {
    '/accounts/:account/orders/:sequence': makeMiddleware(cancelOrder)
  }
};
