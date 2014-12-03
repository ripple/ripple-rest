var async     = require('async');
var bignum    = require('bignumber.js');
var ripple    = require('ripple-lib');
var remote    = require('./../lib/remote.js');
var respond   = require('../lib/response-handler.js');
var errors    = require('./../lib/errors.js');

module.exports = {
  get: getBalances
};

var InvalidRequestError = errors.InvalidRequestError;

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
    counterparty: request.query.counterparty
  };

  var currencyRE = new RegExp(options.currency ? ('^' + options.currency.toUpperCase() + '$') : /./);
  var balances = [];
  var nextMarker;
  var responseLimit;

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(options.account)) {
      return callback(new InvalidRequestError('Parameter is not a valid Ripple address: account'));
    }
    if (options.counterparty && !ripple.UInt160.is_valid(options.counterparty)) {
      return callback(new InvalidRequestError('Parameter is not a valid Ripple address: counterparty'));
    }
    if (options.currency && !/^[A-Z0-9]{3}$/.test(options.currency)) {
      return callback(new InvalidRequestError('Parameter is not a valid currency: currency'));
    }
    callback();
  };

  function getXRPBalance(callback) {
    var accountInfoRequest = remote.requestAccountInfo({account: options.account});

    accountInfoRequest.once('error', callback);
    accountInfoRequest.once('success', function(info) {
      balances.push({
        value: bignum(info.account_data.Balance).dividedBy('1000000').toString(),
        currency: 'XRP',
        counterparty: ''
      });

      callback();
    });

    accountInfoRequest.request();
  };

  function getLineBalances(callback) {
    var accountLinesRequest;
    var marker = request.query.marker;
    var limit = /^[0-9]*$/.test(request.query.limit) ? Number(request.query.limit) : void(0);
    var ledger = /^[0-9]*$/.test(request.query.ledger) ? Number(request.query.ledger) : void(0);

    try {
      accountLinesRequest = remote.requestAccountLines({
        account: options.account,
        marker: marker,
        limit: limit,
        ledger: ledger
      });
    } catch (error) {
      return callback(error);
    }

    if (options.counterparty) {
      accountLinesRequest.message.peer = options.counterparty;
    }

    accountLinesRequest.once('error', callback);
    accountLinesRequest.once('success', function(result) {
      result.lines.forEach(function(line) {
        if (currencyRE.test(line.currency)) {
          balances.push({
            value:         line.balance,
            currency:      line.currency,
            counterparty:  line.account
          });
        }
      });

      if (result.marker) {
        nextMarker = result.marker;
      }

      if (result.limit) {
        responseLimit = result.limit;
      }

      callback();
    });

    accountLinesRequest.request();
  };

  var steps = [
    validateOptions
  ];

  if (options.currency) {
    steps.push(options.currency === 'XRP' ? getXRPBalance : getLineBalances);
  } else if (options.counterparty) {
    steps.push(getLineBalances);
  } else {
    steps.push(getXRPBalance, getLineBalances);
  }

  async.series(steps, function(error) {
    if (error) {
      next(error);
    } else {
      respond.success(response, { marker: nextMarker, limit: responseLimit, balances: balances });
    }
  });
};
