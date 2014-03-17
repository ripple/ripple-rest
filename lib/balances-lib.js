var async     = require('async');
var bignum    = require('bignumber.js')
var ripple    = require('ripple-lib');
var serverLib = require('./server-lib');

function getBalances(remote, opts, callback) {
  var currencyRE = new RegExp(opts.currency ? ('^' + opts.currency.toUpperCase() + '$') : /./);
  var balances = { };

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(opts.account)) {
      return callback(new Error('Parameter "account" is not a valid Ripple address'));
    }

    if (opts.issuer && !ripple.UInt160.is_valid(opts.issuer)) {
      return callback(new Error('Parameter "issuer" is not a valid Ripple address'));
    }

    if (opts.currency && !/^[A-Z0-9]{3}$/.test(opts.currency)) {
      return callback(new Error('Parameter "currency" is not a valid currency'));
    }

    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, callback);
  };

  function getXRPBalance(callback) {
    var request = remote.requestAccountInfo(opts.account);

    request.once('error', callback);

    request.once('success', function(info) {
      balances['XRP'] = bignum(info.account_data.Balance).dividedBy('1000000');
      callback(null);
    });

    request.request();
  };

  function getLineBalances(callback) {
    var request = remote.requestAccountLines(opts.account);

    if (opts.issuer) {
      request.message.peer = opts.issuer;
    }

    request.once('error', callback);

    request.once('success', function(res) {
      res.lines.forEach(function(line) {
        var currency = line.currency;
        if (currencyRE.test(currency)) {
          balances[currency] = (balances[currency] || bignum(0)).plus(line.balance);
        }
      });
      callback(null);
    });

    request.request();
  };

  function formatBalances(callback) {
    for (var currency in balances) {
      balances[currency] = balances[currency].toString();
    }
    callback(null);
  };

  var steps = [ validateOptions, ensureConnected ];

  if (currencyRE.test('XRP') && !opts.issuer) {
    steps.push(getXRPBalance);
  }

  steps.push(getLineBalances, formatBalances);

  async.series(steps, function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, balances);
    }
  });
};

exports.getBalances = getBalances;
