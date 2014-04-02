var async     = require('async');
var ripple    = require('ripple-lib');
var serverLib = require('./server-lib');

function getTrustLines(remote, opts, callback) {
  var currencyRE = new RegExp(opts.currency ? ('^' + opts.currency.toUpperCase() + '$') : /./);

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(opts.account)) {
      return callback(new Error('Parameter "account" is not a valid Ripple address'));
    }

    if (opts.counterparty && !ripple.UInt160.is_valid(opts.counterparty)) {
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

  function getAccountLines(connected, callback) {
    if (!connected) {
      return callback(new Error('Remote is not connected'));
    }

    var request = remote.requestAccountLines(opts.account);

    if (opts.counterparty) {
      request.message.peer = opts.counterparty;
    }

    request.once('error', callback);

    request.once('success', function(res) {
      var lines = [ ];

      res.lines.forEach(function(line) {
        if (!currencyRE.test(line.currency)) return;
        lines.push({
          account: opts.account,
          counterparty: line.account,
          currency: line.currency,
          trust_limit: line.limit,
          reciprocated_trust_limit: line.limit_peer,
          account_allows_rippling: line.no_ripple ? !line.no_ripple : true,
          account_allows_rippling: line.no_ripple_peer ? !line.no_ripple_peer : true,
        });
      });

      callback(null, lines);
    });

    request.request();
  };

  var steps = [
    validateOptions,
    ensureConnected,
    getAccountLines
  ]

  async.waterfall(steps, callback);
};

function addTrustLine(remote, opts, callback) {

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(opts.account)) {
      return callback(new Error('Parameter "account" is not a Ripple address'));
    }

    if (typeof opts.secret !== 'string') {
      return callback(new Error('Parameter "secret" is not a Ripple secret'));
    }

    if (typeof opts.limit === 'string') {
      var spl = opts.limit.split('/');
      opts.limit = {
        amount:        spl[0],
        currency:      spl[1],
        counterparty:  spl[2]
      }
    }

    if (typeof opts.limit !== 'object') {
      return callback(new Error('Parameter "limit" is not an object'));
    }

    if (isNaN(opts.limit.amount)) {
      return callback(new Error('Parameter "limit.amount" is not a number'));
    }

    if (!/^[A-Z0-9]{3}$/.test(opts.limit.currency)) {
      return callback(new Error('Parameter "limit.currency" is not a valid currency'));
    }

    if (!ripple.UInt160.is_valid(opts.limit.counterparty)) {
      return callback(new Error('Parameter "limit.counterparty" is not a Ripple address'));
    }

    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, callback);
  };

  function addLine(connected, callback) {
    if (!connected) {
      return callback(new Error('Remote is not connected'));
    }

    var limit = [ opts.limit.amount, opts.limit.currency, opts.limit.counterparty ].join('/');

    var transaction = remote.transaction().trustSet(opts.account, limit);
    transaction.secret(opts.secret);

    transaction.once('error', callback);

    transaction.once('proposed', function(m) {
      var summary = transaction.summary();
      callback(null, {
          account: opts.account,
          counterparty: opts.limit.counterparty,
          currency: opts.limit.currency,
          trust_limit: opts.limit.amount,
          ledger: String(summary.submitIndex)
      });
    });

    transaction.submit();
  };

  var steps = [
    validateOptions,
    ensureConnected,
    addLine
  ]

  async.waterfall(steps, callback);
};

exports.getTrustLines = getTrustLines;
exports.addTrustLine = addTrustLine;
