var async     = require('async');
var bignum    = require('bignumber.js')
var ripple    = require('ripple-lib');
var serverLib = require('../lib/server-lib');

exports.get = getBalances;

function getBalances($, req, res, next) {
  var self = this;

  var remote = $.remote;

  var opts = {
    account:       req.params.account,
    currency:      req.query.currency,
    counterparty:  req.query.counterparty
  }

  var currencyRE = new RegExp(opts.currency ? ('^' + opts.currency.toUpperCase() + '$') : /./);
  var balances = [ ];

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(opts.account)) {
      return res.json(400, { success: false, message: 'Parameter is not a valid Ripple address: account' });
    }

    if (opts.counterparty && !ripple.UInt160.is_valid(opts.counterparty)) {
      return res.json(400, { success: false, message: 'Parameter is not a valid Ripple address: counterparty'});
    }

    if (opts.currency && !/^[A-Z0-9]{3}$/.test(opts.currency)) {
      return res.json(400, { success: false, message: 'Parameter is not a valid currency: currency'});
    }

    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, function(err, connected) {
      if (connected) {
        callback();
      } else {
        res.json(500, { success: false, message: 'No connection to rippled' });
      }
    });
  };

  function getXRPBalance(callback) {
    var request = remote.requestAccountInfo(opts.account);

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
    var request = remote.requestAccountLines(opts.account);

    if (opts.counterparty) {
      request.message.peer = opts.counterparty;
    }

    request.once('error', callback);

    request.once('success', function(res) {
      res.lines.forEach(function(line) {
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

  var steps = [ validateOptions, ensureConnected ];

  if (currencyRE.test('XRP') && !opts.issuer) {
    steps.push(getXRPBalance);
  }

  steps.push(getLineBalances);

  async.series(steps, function(err) {
    if (err) {
      next(err);
    } else {
      res.json(200, { success: true, balances: balances });
    }
  });
};
