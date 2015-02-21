const api = require('../api');
const respond = require('./response-handler');

const DEFAULT_RESULTS_PER_PAGE = 10;

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
    }
  };
}

function getUUID(request, response, next) {
  api.info.uuid(makeCallback(response, next));
}

function isConnected(request, response, next) {
  api.info.isConnected(makeCallback(response, next));
}

function getFee(request, response, next) {
  api.info.fee(makeCallback(response, next));
}

function generateWallet(request, response, next) {
  api.wallet.generate(makeCallback(response, next));
}

function getAccountPayments(request, response, next) {
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
  payments.getAccountPayments(account, source_account, destination_account,
    direction, options, makeCallback(response, next));
}

function getPayment(request, response, next) {
  const account = request.params.account;
  const identifier = request.params.identifier;
  api.payments.get(account, identifier, makeCallback(response, next));
}

function getPathFind(request, response, next) {
  const source_account = request.params.account;
  const destination_account = request.params.destination_account;
  const destination_amount = request.params.destination_amount_string;
  const source_currencies = request.query.source_currencies;
  api.payments.getPathFind(source_account, destination_account,
    destination_amount, source_currencies, makeCallback(response, next));
}

function getOrders(request, response, next) {
  const account = request.params.account;
  const options = {
    isAggregate: request.params.limit === 'all'
  };
  api.orders.getOrders(account, options, makeCallback(response, next));
}

function getOrderBook(request, response, next) {
  const account = request.params.account;
  const base = request.params.base;
  const counter = request.params.counter;
  const options = {
    limit: request.params.limit
  };
  api.orders.getOrderBook(account, base, counter, options,
    makeCallback(response, next));
}

function getOrder(request, response, next) {
  const account = request.params.account;
  const identifier = request.params.identifier;
  api.orders.getOrder(account, identifier, makeCallback(response, next));
}

function getNotification(request, response, next) {
  const account = request.params.account;
  const identifier = request.params.identifier;
  const urlBase = utils.getUrlBase(request);
  api.notifications.getNotification(account, identifier, urlBase,
    makeCallback(response, next));
}

function getBalances(request, response, next) {
  const account = request.params.account;
  const currency = request.query.currency;
  const counterparty = request.query.counterparty;
  const options = {
    frozen: request.query.frozen === 'true',
    isAggregate: request.param('limit') === 'all',
    ledger: utils.parseLedger(request.param('ledger'))
  };
  api.balances.get(account, currency, counterparty, options,
    makeCallback(response, next));
}

function getSettings(request, response, next) {
  const account = request.params.account;
  api.settings.get(account, makeCallback(response, next));
}

function getTransaction(request, response, next) {
  const account = request.params.account;
  const identifier = request.params.identifier;
  api.transactions.get(account, identifier, makeCallback(response, next));
}

function getTrustlines(request, response, next) {
  const account = request.params.account;
  const currency = request.params.currency;
  const counterparty = request.params.counterparty;
  const options = {
    isAggregate: request.params.limit === 'all'
  };
  api.trustlines.get(account, currency, counterparty, options,
    makeCallback(response, next));
}

function submitPayment(request, response, next) {
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
    lastLedgerSequence, options, makeCallback(response, next));
}

function placeOrder(request, response, next) {
  const account = request.params.account;
  const secret = request.params.secret;
  const order = request.params.order;
  const options = {
    validated: request.query.validated === 'true'
  };
  api.orders.placeOrder(account, order, secret, options,
    makeCallback(response, next));
}

function changeSettings(request, response, next) {
  const account = request.params.account;
  const settings = request.params.settings;
  const secret = request.params.secret;
  const options = {
    validated: request.query.validated === 'true'
  };
  api.settings.changeSettings(account, settings, secret, options,
    makeCallback(response, next));
}

function addTrustLine(request, response, next) {
  const account = request.params.account;
  const trustline = request.params.trustline;
  
}
