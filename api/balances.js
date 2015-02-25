var Promise   = require('bluebird');
var async     = require('async');
var ripple    = require('ripple-lib');
var remote    = require('./lib/remote.js');
var utils     = require('./lib/utils');
var errors    = require('./lib/errors.js');
var validator = require('./lib/schema-validator.js');
var validate  = require('./lib/validate');

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
function getBalances(account, options, callback) {
  if(validate.fail([
    validate.account(account),
    validate.currency(options.currency, true),
    validate.counterparty(options.counterparty, true)
  ], callback)) {
    return;
  }

  const currencyRE = new RegExp(options.currency ?
    ('^' + options.currency.toUpperCase() + '$') : /./);

  getAccountBalances(options)
  .then(respondWithBalances)
  .catch(callback)

  function getAccountBalances(options) {
    if (options.counterparty || options.frozen) {
      return getLineBalances(options);
    }

    if (options.currency) {
      if (options.currency === 'XRP') {
        return getXRPBalance(options);
      } else {
        return getLineBalances(options);
      }
    }

    return getXRPBalance(options)
    .then(function(XRPResult) {
      options.XRPLines = XRPResult.lines;
      return Promise.resolve(options);
    })
    .then(getLineBalances)
    .then(function(lineBalances) {
      lineBalances.lines.unshift(options.XRPLines[0]);
      return Promise.resolve(lineBalances);
    });
  }

  function getXRPBalance(options) {
    var promise = new Promise(function(resolve, reject) {
      var accountInfoRequest = remote.requestAccountInfo({
        account: account,
        ledger: utils.parseLedger(options.ledger)
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

  function getLineBalances(options, prevResult) {
    const isAggregate = options.limit === 'all';
    if (prevResult && (!isAggregate || !prevResult.marker)) {
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
        marker = options.marker;
        limit  = validator.isValid(options.limit, 'UINT32')
          ? Number(options.limit) : DefaultPageLimit;
        ledger = utils.parseLedger(options.ledger);
      }

      accountLinesRequest = remote.requestAccountLines({
        account: account,
        marker: marker,
        limit: limit,
        ledger: ledger
      });

      if (options.counterparty) {
        accountLinesRequest.message.peer = options.counterparty;
      }

      accountLinesRequest.once('error', reject);
      accountLinesRequest.once('success', function(nextResult) {

        var lines = [];
        nextResult.lines.forEach(function(line) {
          if (options.frozen && !line.freeze) {
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
        resolve([options, nextResult]);
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

