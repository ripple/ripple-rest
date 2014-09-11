var async     = require('async');
var bignum    = require('bignumber.js');
var ripple    = require('ripple-lib');
var remote    = require('./../lib/remote.js');
var respond   = require('../lib/response-handler.js');
var errors    = require('./../lib/errors.js');

module.exports = {
  get: getBalances
};

var InvalidRequestError   = errors.InvalidRequestError;

function getBalances(request, response, next) {

  var options = {
    account:       request.params.account,
    currency:      request.query.currency,
    counterparty:  request.query.counterparty
  };
  var currencyRE = new RegExp(options.currency ? ('^' + options.currency.toUpperCase() + '$') : /./);
  var balances = [];

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
    var request = remote.requestAccountInfo(options.account);
    request.once('error', callback);
    request.once('success', function(info) {
      balances.push({
        value: bignum(info.account_data.Balance).dividedBy('1000000').toString(),
        currency: 'XRP',
        counterparty: ''
      });
      callback();
    });
    request.request();
  };

  function getLineBalances(callback) {
    var request = remote.requestAccountLines(options.account);
    if (options.counterparty) {
      request.message.peer = options.counterparty;
    }
    request.once('error', callback);
    request.once('success', function(result) {
      result.lines.forEach(function(line) {
        if (currencyRE.test(line.currency)) {
          balances.push({
            value:         line.balance,
            currency:      line.currency,
            counterparty:  line.account
          });
        }
      });
      callback();
    });
    request.request();
  };

  var steps = [
    validateOptions
  ];

  if (options.currency) {
    if (options.currency === 'XRP') {
      steps.push(getXRPBalance);
    } else {
      steps.push(getLineBalances);
    }
  } else {
    steps.push(getXRPBalance, getLineBalances);
  }

  async.series(steps, function(error) {
    if (error) {
      next(error);
    } else {
      respond.success(response, { balances: balances });
    }
  });
};
