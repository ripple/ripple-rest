var async     = require('async');
var ripple    = require('ripple-lib');
var serverLib = require('../lib/server-lib');

const TrustSetFlags = {
  SetAuth:        { name: 'authorized', value: 0x00010000 },
  NoRipple:       { name: 'prevent_rippling', value: 0x00020000 },
  ClearNoRipple:  { name: 'allow_rippling', value: 0x00040000 }
}

exports.get = getTrustLines;

function getTrustLines($, req, res, next) {
  var remote = $.remote;

  var opts = req.params;

  Object.keys(req.query).forEach(function(param) {
    opts[param] = req.query[param];
  });

  opts.limit = opts.limit || req.body.limit;

  var currencyRE = new RegExp(opts.currency ? ('^' + opts.currency.toUpperCase() + '$') : /./);

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(opts.account)) {
      return res.json(400, { success: false, message: 'Parameter is not a valid Ripple address: account' });
    }

    if (opts.counterparty && !ripple.UInt160.is_valid(opts.counterparty)) {
      return res.json(400, { success: false, message: 'Parameter is not a valid Ripple address: counterparty' });
    }

    if (opts.currency && !/^[A-Z0-9]{3}$/.test(opts.currency)) {
      return res.json(400, { success: false, message: 'Parameter is not a valid currency: currency' });
    }

    callback();
  };

 function ensureConnected(callback) {
    serverLib.ensureConnected(remote, callback);
  };

  function getAccountLines(connected, callback) {
    if (!connected) {
      return res.json(500, { success: false, message: 'Remote is not connected' });
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
          limit: line.limit,
          reciprocated__limit: line.limit_peer,
          account_allows_rippling: line.no_ripple ? !line.no_ripple : true,
          counterparty_allows_rippling: line.no_ripple_peer ? !line.no_ripple_peer : true,
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

  async.waterfall(steps, function(err, lines) {
    if (err) {
      next(err);
    } else {
      res.json(200, { success: true, trustlines: lines });
    }
  });
};

exports.add = addTrustLine;

function addTrustLine($, req, res, next) {
  var self = this;
  var remote = $.remote;
  var opts = req.params;

  Object.keys(req.body).forEach(function(param) {
    opts[param] = req.body[param];
  });


  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(opts.account)) {
      return res.json(400, { success: false, message: 'Parameter is not a Ripple address: account' });
    }

    if (!opts.secret) {
      return res.json(400, { success: false, message: 'Parameter missing: secret' });
    }

    if (typeof opts.trustline !== 'object') {
      return res.json(400, { success: false, message: 'Parameter missing: trustline' });
    }

    if (isNaN(opts.trustline.limit = String(opts.trustline.limit))) {
      return res.json(400, { success: false, message: 'Parameter is not a number: trustline.limit.amount' });
    }

    if (!/^[A-Z0-9]{3}$/.test(opts.trustline.currency)) {
      return res.json(400, { success: false, message: 'Parameter is not a valid currency: trustline.limit.currency' });
    }

    if (!ripple.UInt160.is_valid(opts.trustline.counterparty)) {
      return res.json(400, { success: false, message: 'Parameter is not a Ripple address: trustline.limit.counterparty' });
    }

    if (!/^(undefined|number)$/.test(typeof opts.trustline.quality_in)) {
      return res.json(400, { success: false, message: 'Parameter must be a number: trustline.quality_in' });
    }

    if (!/^(undefined|number)$/.test(typeof opts.trustline.quality_out)) {
      return res.json(400, { success: false, message: 'Parameter must be a number: trustline.quality_out' });
    }

    if (!/^(undefined|boolean)$/.test(typeof opts.trustline.account_allows_rippling)) {
      return res.json(400, { success: false, message: 'Parameter must be a boolean: trustline.allow_rippling' });
    }

    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, function(err, connected) {
      if (err || !connected) {
        res.json(500, { success: false, message: 'Remote is not connected' });
      } else {
        callback();
      }
    });
  };

  function addLine(callback) {
    var limit = [
      opts.trustline.limit,
      opts.trustline.currency,
      opts.trustline.counterparty
    ].join('/');

    var transaction = remote.transaction();
    var complete = false;

    function transactionSent(m) {
      complete = true;

      var summary = transaction.summary();
      var line = summary.tx_json.LimitAmount;

      var result = {
        success: true,
        trustline: {
          account: opts.account,
          limit: line.value,
          currency: line.currency,
          counterparty: line.issuer,
          account_allows_rippling: true
        }
      }

      if (m.tx_json.Flags & TrustSetFlags.NoRipple.value) {
        result.trustline.account_allows_rippling = false;
      }

      if (m.tx_json.Flags & TrustSetFlags.SetAuth) {
        result.trustline.authorized = true;
      }

      result.ledger = String(summary.submitIndex);
      result.hash = m.tx_json.hash;

      callback(null, result);
    };

    transaction.once('error', callback);

    transaction.once('proposed', transactionSent);

    transaction.once('success', function(m) {
      if (!complete) {
        transaction.removeAllListeners('proposed');
        transactionSent(m);
      }
    });

    try {
      transaction.trustSet(opts.account, limit);
      transaction.secret(opts.secret);

      if (typeof opts.trustline.quality_in === 'number') {
        transaction.tx_json.QualityIn = opts.trustline.quality_in;
      }

      if (typeof opts.trustline.quality_out === 'number') {
        transaction.tx_json.QualityOut = opts.trustline.quality_out;
      }

      if (typeof opts.trustline.account_allows_rippling === 'boolean') {
        if (opts.trustline.account_allows_rippling) {
          transaction.setFlags('ClearNoRipple');
        } else {
          transaction.setFlags('NoRipple');
        }
      }
    } catch (e) {
      return res.json(500, { success: false, message: e.message });
    }

    transaction.submit();
  };

  var steps = [
    validateOptions,
    ensureConnected,
    addLine
  ]

  async.waterfall(steps, function(err, line) {
    if (err) {
      next(err);
    } else {
      res.json(201, line);
    }
  });
};
