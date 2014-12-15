var Promise   = require('bluebird');
var async     = require('async');
var bignum    = require('bignumber.js');
var ripple    = require('ripple-lib');
var remote    = require('./../lib/remote.js');
var respond   = require('../lib/response-handler.js');
var utils     = require('./../lib/utils');
var errors    = require('./../lib/errors.js');
var validator = require('./../lib/schema-validator.js');

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
 *  @param {Express.js Response} response
 *  @param {Express.js Next} next
 */
function getBalances(request, response, next) {
  var options = {
    account: request.params.account,
    currency: request.query.currency,
    counterparty: request.query.counterparty,
    frozen: request.query.frozen === 'true',
    isAggregate: request.param('limit') === 'all',
    ledger: utils.parseLedger(request.param('ledger'))
  };

  var currencyRE = new RegExp(options.currency ? ('^' + options.currency.toUpperCase() + '$') : /./);

  validateOptions(options)
  .then(getAccountBalances)
  .then(respondWithBalances)
  .catch(next)

  function validateOptions(options) {
    if (!ripple.UInt160.is_valid(options.account)) {
      return Promise.reject(new InvalidRequestError('Parameter is not a valid Ripple address: account'));
    }
    if (options.counterparty && !ripple.UInt160.is_valid(options.counterparty)) {
      return Promise.reject(new InvalidRequestError('Parameter is not a valid Ripple address: counterparty'));
    }
    if (options.currency && !/^[A-Z0-9]{3}$/.test(options.currency)) {
      return Promise.reject(new InvalidRequestError('Parameter is not a valid currency: currency'));
    }

    return Promise.resolve(options);
  };

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
        account: options.account,
        ledger: options.ledger
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
    if (prevResult && (!options.isAggregate || !prevResult.marker)) {
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
        marker = request.query.marker;
        limit  = validator.isValid(request.query.limit, 'UINT32') ? Number(request.query.limit) : DefaultPageLimit;
        ledger = utils.parseLedger(request.query.ledger);
      }

      accountLinesRequest = remote.requestAccountLines({
        account: options.account,
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

      resolve(respond.success(response, balances));
    });

    return promise;
  }
};

module.exports.get = getBalances;

