const api = require('../api');
const respond = require('./response-handler');
const utils = require('../api/lib/utils');

const DEFAULT_RESULTS_PER_PAGE = 10;

function validatedOptions(request) {
  return  {validated: request.query.validated === 'true'};
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
    earliest_first: (request.query.earliest_first === 'true'),
    exclude_failed: (request.query.exclude_failed === 'true'),
    min: request.query.results_per_page,
    max: request.query.results_per_page,
    offset: (request.query.results_per_page || DEFAULT_RESULTS_PER_PAGE)
            * ((request.query.page || 1) - 1),
    types: ['payment']
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
    isAggregate: request.query.limit === 'all',
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
    limit: request.query.limit
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
  const urlBase = utils.getUrlBase(request);
  api.notifications.getNotification(account, identifier, urlBase, callback);
}

function getBalances(request, callback) {
  const account = request.params.account;
  const currency = request.query.currency;
  const counterparty = request.query.counterparty;
  const options = {
    frozen: request.query.frozen === 'true',
    isAggregate: request.param('limit') === 'all',
    ledger: utils.parseLedger(request.param('ledger'))
  };
  api.balances.get(account, currency, counterparty, options, callback);
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
  const currency = request.params.currency;
  const counterparty = request.params.counterparty;
  const options = {
    isAggregate: request.params.limit === 'all'
  };
  api.trustlines.get(account, currency, counterparty, options, callback);
}

function submitPayment(request, callback) {
  const payment = request.params.payment;
  const clientResourceID = request.params.client_resource_id;
  const lastLedgerSequence = request.params.last_ledger_sequence;
  const secret = request.params.secret;
  const options = {
    max_fee: request.body.max_fee,
    fixed_fee: request.body.fixed_fee,
    validated: request.query.validated === 'true',
    blockDuplicates: true,
    saveTransaction: true
  };
  api.payments.submitPayment(payment, clientResourceID, secret,
    lastLedgerSequence, options, callback);
}

function placeOrder(request, callback) {
  const account = request.params.account;
  const secret = request.params.secret;
  const order = request.params.order;
  const options = validatedOptions(request);
  api.orders.placeOrder(account, order, secret, options, callback);
}

function changeSettings(request, callback) {
  const account = request.params.account;
  const settings = request.params.settings;
  const secret = request.params.secret;
  const options = validatedOptions(request);
  api.settings.changeSettings(account, settings, secret, options, callback);
}

function addTrustLine(request, callback) {
  const account = request.params.account;
  const trustline = request.params.trustline;
  const secret = request.params.secret;
  const options = validatedOptions(request);
  api.trustlines.add(account, trustline, secret, options, callback);
}

function cancelOrder(request, callback) {
  const account = request.params.account;
  const sequence = request.params.sequence;
  const secret = request.params.secret;
  const options = validatedOptions(request);
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
    '/accounts/:account/orders/:identifier': api.orders.getOrder,
    '/accounts/:account/notifications': api.notifications.getNotification,
    '/accounts/:account/notifications/:identifier':
      api.notifications.getNotification,
    '/accounts/:account/balances': api.balances.get,
    '/accounts/:account/settings': api.settings.get,
    '/transactions/:identifier': api.transactions.get,
    '/accounts/:account/trustlines': api.trustlines.get
  },
  POST: {
    '/accounts/:account/payments': api.payments.submit,
    '/accounts/:account/orders': api.orders.placeOrder,
    '/accounts/:account/settings': api.settings.change,
    '/accounts/:account/trustlines': api.trustlines.add
  },
  DELETE: {
    '/accounts/:account/orders/:sequence': api.orders.cancelOrder
  }
};
