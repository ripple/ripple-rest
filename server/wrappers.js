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

function wallet_new(request, response, next) {
  api.wallet.generate(makeCallback(response, next));
}

function payment_paths(request, response, next) {
  const source_account = request.params.account;
  const destination_account = request.params.destination_account;
  const destination_amount = request.params.destination_amount_string;
  const source_currencies = request.query.source_currencies;
  api.payments.getPathFind(source_account, destination_account,
    destination_amount, source_currencies, makeCallback(response, next));
}

function payment_submit(request, response, next) {
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

function account_payments(request, response, next) {
  const account = request.params.account;
  const identifier = request.params.identifier;
  api.payments.get(account, identifier, makeCallback(response, next));
}

function account_notifications(request, response, next) {
  const account = request.params.account;
  const identifier = request.params.identifier;
  api.notifications.getNotification(account, identifier,
    makeCallback(response, next));
}

function account_balances(request, response, next) {

}
