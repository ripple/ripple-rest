var Domain    = require('domain');
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
      return res.json(400, { success: false, message: 'Parameter is not a valid Ripple address: issuer' });
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
          trust_limit: line.limit,
          reciprocated_trust_limit: line.limit_peer,
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
      res.json(200, { success: true, lines: lines });
    }
  });
};

exports.add = addTrustLine;

function addTrustLine($, req, res, next) {
  var self = this;
  var remote = $.remote;
  var opts = req.params;

  console.log('Adding trustline', opts);

  Object.keys(req.body).forEach(function(param) {
    opts[param] = req.body[param];
  });

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(opts.account)) {
      return res.json(400, { success: false, message: 'Parameter is not a Ripple address: account' });
    }

    if (typeof opts.secret !== 'string') {
      return res.json(400, { success: false, message: 'Parameter is not a Ripple secret: secret' });
    }

    if (typeof opts.limit === 'string') {
      var spl = opts.limit.split('/');
      opts.limit = {
        value:         spl[0],
        currency:      spl[1],
        counterparty:  spl[2]
      }
    }

    if (typeof opts.limit !== 'object') {
      return res.json(400, { success: false, message: 'Parameter is not a valid limit: limit' });
    }

    if (isNaN(opts.limit.value)) {
      return res.json(400, { success: false, message: 'Parameter is not a number: limit.amount' });
    }

    if (!/^[A-Z0-9]{3}$/.test(opts.limit.currency)) {
      return res.json(400, { success: false, message: 'Parameter is not a valid currency: limit.currency' });
    }

    if (!ripple.UInt160.is_valid(opts.limit.counterparty)) {
      return res.json(400, { success: false, message: 'Parameter is not a Ripple address: limit.counterparty' });
    }

    if (!/^(undefined|number)$/.test(typeof opts.quality_in)) {
      return res.json(400, { success: false, message: 'Parameter must be a number: quality_in' });
    }

    if (!/^(undefined|number)$/.test(typeof opts.quality_out)) {
      return res.json(400, { success: false, message: 'Parameter must be a number: quality_out' });
    }

    if (!/^(undefined|boolean)$/.test(typeof opts.allow_rippling)) {
      return res.json(400, { success: false, message: 'Parameter must be a boolean: allow_rippling' });
    }

    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, callback);
  };

  function addLine(connected, callback) {
    if (!connected) {
      return res.json(500, { success: false, message: 'Remote is not connected' });
    }

    console.log('SUBMIT');

    var domain = Domain.create();

    domain.once('error', callback);

    domain.run(function() {
      var limit = [ opts.limit.value, opts.limit.currency, opts.limit.counterparty ].join('/');
      var transaction = remote.transaction().trustSet(opts.account, limit);

      domain.add(transaction);

      transaction.secret(opts.secret);

      if (typeof opts.quality_in === 'number') {
        transaction.tx_json.QualityIn = opts.quality_in;
      }

      if (typeof opts.quality_out === 'number') {
        transaction.tx_json.QualityOut = opts.quality_out;
      }

      if (typeof opts.allow_rippling === 'boolean') {
        if (opts.allow_rippling) {
          transaction.setFlags('ClearNoRipple');
        } else {
          transaction.setFlags('NoRipple');
        }
      }

      transaction.once('proposed', function(m) {
        domain.exit();

        var summary = transaction.summary();

        var result = {
          success: true,
          line: {
            account: opts.account,
            counterparty: opts.limit.counterparty,
            currency: opts.limit.currency,
            trust_limit: opts.limit.amount,
            allows_rippling: true
          }
        }

        if (m.tx_json.Flags & TrustSetFlags.NoRipple.value) {
          result.line.allows_rippling = false;
        }

        if (m.tx_json.Flags & TrustSetFlags.SetAuth) {
          result.line.authorized = true;
        }

        result.ledger = String(summary.submitIndex);
        result.hash = m.tx_json.hash;

        callback(null, result);
      });

      transaction.submit();
    });
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
