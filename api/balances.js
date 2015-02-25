var Promise   = require('bluebird');
var async     = require('async');
var ripple    = require('ripple-lib');
var remote    = require('./lib/remote.js');
var utils     = require('./lib/utils');
var errors    = require('./lib/errors.js');
var validator = require('./lib/schema-validator.js');

var InvalidRequestError = errors.InvalidRequestError;
const DefaultPageLimit = 200;


/**
 *  Request the balances for a given account
 *
 *  Notes:
 *  In order to use paging, you must provide at least ledger as a query parameter.
 *  Additionally, any limit lower than 10 will be bumped up to 10.
 *
 *  @url
 *  @param {RippleAddress} request.params.account - account to retrieve balances for
 *
 *  @query
 *  @param {String ISO 4217 Currency Code} [request.query.currency] - only request balances with given currency
 *  @param {RippleAddress} [request.query.counterparty] - only request balances with given counterparty
 *  @param {String} [request.query.marker] - start position in response paging
 *  @param {Number String} [request.query.limit] - max results per response
 *  @param {Number String} [request.query.ledger] - identifier
 *
 */
function getBalances(account, currency, counterparty, options, callback) {
  var parameters = {
    account: account,
    currency: currency,
    counterparty: counterparty,
    frozen: options.frozen,
    limit: options.limit,
    isAggregate: options.isAggregate,
    ledger: utils.parseLedger(options.ledger),
    marker: options.marker
  };

  var currencyRE = new RegExp(currency ?
    ('^' + currency.toUpperCase() + '$') : /./);

  validateOptions(parameters)
  .then(getAccountBalances)
  .then(respondWithBalances)
  .catch(callback)

  function validateOptions(parameters) {
    if (!ripple.UInt160.is_valid(parameters.account)) {
      return Promise.reject(new InvalidRequestError('Parameter is not a valid Ripple address: account'));
    }
    if (parameters.counterparty && !ripple.UInt160.is_valid(parameters.counterparty)) {
      return Promise.reject(new InvalidRequestError('Parameter is not a valid Ripple address: counterparty'));
    }
    if (parameters.currency && !validator.isValid(parameters.currency, 'Currency')) {
      return Promise.reject(new InvalidRequestError('Parameter is not a valid currency: currency'));
    }

    return Promise.resolve(parameters);
  };

  function getAccountBalances(parameters) {
    if (parameters.counterparty || parameters.frozen) {
      return getLineBalances(parameters);
    }

    if (parameters.currency) {
      if (parameters.currency === 'XRP') {
        return getXRPBalance(parameters);
      } else {
        return getLineBalances(parameters);
      }
    }

    return getXRPBalance(parameters)
    .then(function(XRPResult) {
      parameters.XRPLines = XRPResult.lines;
      return Promise.resolve(parameters);
    })
    .then(getLineBalances)
    .then(function(lineBalances) {
      lineBalances.lines.unshift(parameters.XRPLines[0]);
      return Promise.resolve(lineBalances);
    });
  }

  function getXRPBalance(parameters) {
    var promise = new Promise(function(resolve, reject) {
      var accountInfoRequest = remote.requestAccountInfo({
        account: parameters.account,
        ledger: parameters.ledger
      });

      var lines = [];
      accountInfoRequest.once('error', reject);
      accountInfoRequest.once('success', function(result) {
        lines.push({
          value: utils.dropsToXrp(result.account_data.Balance),
          currency: 'XRP',
          counterparty: ''
        });

        result.lines = lines;
        resolve(result);
      });

      accountInfoRequest.request();
    });

    return promise;
  };

  function getLineBalances(parameters, prevResult) {
    if (prevResult && (!parameters.isAggregate || !prevResult.marker)) {
      return Promise.resolve(prevResult)
    }

    var promise = new Promise(function(resolve, reject) {
      var accountLinesRequest;
      var marker;
      var ledger;
      var limit;

      if (prevResult) {
        marker = prevResult.marker;
        limit  = prevResult.limit;
        ledger = prevResult.ledger_index;
      } else {
        marker = parameters.marker;
        limit  = validator.isValid(parameters.limit, 'UINT32')
          ? Number(parameters.limit) : DefaultPageLimit;
        ledger = utils.parseLedger(parameters.ledger);
      }

      accountLinesRequest = remote.requestAccountLines({
        account: parameters.account,
        marker: marker,
        limit: limit,
        ledger: ledger
      });

      if (parameters.counterparty) {
        accountLinesRequest.message.peer = parameters.counterparty;
      }

      accountLinesRequest.once('error', reject);
      accountLinesRequest.once('success', function(nextResult) {

        var lines = [];
        nextResult.lines.forEach(function(line) {
          if (parameters.frozen && !line.freeze) {
            return;
          }

          if (currencyRE.test(line.currency)) {
            lines.push({
              value:         line.balance,
              currency:      line.currency,
              counterparty:  line.account
            });
          }
        });

        nextResult.lines = prevResult ? prevResult.lines.concat(lines) : lines;
        resolve([parameters, nextResult]);
      });
      accountLinesRequest.request();
    });

    return promise.spread(getLineBalances);
  };

  function respondWithBalances(result) {
    var promise = new Promise(function (resolve, reject) {
      var balances = {};

      if (result.marker) {
        balances.marker = result.marker;
      }

      balances.limit     = result.limit;
      balances.ledger    = result.ledger_index;
      balances.validated = result.validated;
      balances.balances  = result.lines;

      resolve(callback(null, balances));
    });

    return promise;
  }
};

module.exports.get = getBalances;

