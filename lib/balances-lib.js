var async     = require('async');
var bignum    = require('bignumber.js')
var ripple    = require('ripple-lib');
var serverLib = require('./server-lib');

function getBalances(remote, opts, callback) {
  var currencyRE = new RegExp(opts.currency ? ('^' + opts.currency.toUpperCase() + '$') : /./);
  var balances = [ ];

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
      balances.push({
        currency: 'XRP',
        amount: bignum(info.account_data.Balance).dividedBy('1000000').toString(),
        issuer: ''
      });
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
        if (currencyRE.test(line.currency)) {
          balances.push({
            currency:  line.currency,
            amount:    line.balance,
            issuer:    line.account,
          });
        }
      });

      callback(null);
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
      callback(err);
    } else {
      callback(null, balances);
    }
  });
};

exports.getBalances = getBalances;
