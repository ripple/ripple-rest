var async     = require('async');
var ripple    = require('ripple-lib');
var serverLib = require('../lib/server-lib');
var remote = require(__dirname+'/../lib/remote.js');

const TrustSetFlags = {
  SetAuth:        { name: 'authorized', value: 0x00010000 },
  NoRipple:       { name: 'prevent_rippling', value: 0x00020000 },
  ClearNoRipple:  { name: 'allow_rippling', value: 0x00040000 }
};

exports.get = getTrustLines;
exports.add = addTrustLine;

function getTrustLines(request, response, next) {
  var steps = [
    validateOptions,
    ensureConnected,
    getAccountLines
  ];
  async.waterfall(steps, function(err, lines) {
    if (err) {
      next(err);
    } else {
      response.json(200, {
        success: true,
        trustlines: lines
      });
    }
  });
  var options = request.params;
  Object.keys(request.query).forEach(function(param) {
    options[param] = request.query[param];
  });
  options.limit = options.limit || request.body.limit;
  var currencyRE = new RegExp(options.currency ? ('^' + options.currency.toUpperCase() + '$') : /./);

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(options.account)) {
      return response.json(400, {
        success: false,
        message: 'Parameter is not a valid Ripple address: account'
      });
    }
    if (options.counterparty && !ripple.UInt160.is_valid(options.counterparty)) {
      return response.json(400, {
        success: false,
        message: 'Parameter is not a valid Ripple address: counterparty'
      });
    }
    if (options.currency && !/^[A-Z0-9]{3}$/.test(options.currency)) {
      return response.json(400, {
        success: false,
        message: 'Parameter is not a valid currency: currency'
      });
    }
    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, function(error, connected) {
      if (error || !connected) {
        response.json(500, {
          success: false,
          message: 'Remote is not connected'
        });
      } else {
        callback();
      }
    });
  };

  function getAccountLines(callback) {
    var request = remote.requestAccountLines(options.account);
    if (options.counterparty) {
      request.message.peer = options.counterparty;
    }
    request.once('error', callback);
    request.once('success', function(result) {
      var lines = [ ];
      result.lines.forEach(function(line) {
        if (!currencyRE.test(line.currency)) return;
        lines.push({
          account: options.account,
          counterparty: line.account,
          currency: line.currency,
          limit: line.limit,
          reciprocated_limit: line.limit_peer,
          account_allows_rippling: line.no_ripple ? !line.no_ripple : true,
          counterparty_allows_rippling: line.no_ripple_peer ? !line.no_ripple_peer : true,
        });
      });
      callback(null, lines);
    });
    request.request();
  };
};


function addTrustLine(request, response, next) {
  var self = this;
  var options = request.params;

  Object.keys(request.body).forEach(function(param) {
    options[param] = request.body[param];
  });
  var steps = [
    validateOptions,
    ensureConnected,
    addLine
  ];
  async.waterfall(steps, function(err, line) {
    if (err) {
      next(err);
    } else {
      response.json(201, line);
    }
  });
  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(options.account)) {
      return response.json(400, {
        success: false,
        message: 'Parameter is not a Ripple address: account'
      });
    }
    if (!options.secret) {
      return response.json(400, {
        success: false,
        message: 'Parameter missing: secret'
      });
    }
    if (typeof options.trustline !== 'object') {
      return response.json(400, {
        success: false,
        message: 'Parameter missing: trustline'
      });
    }
    if (!options.trustline.limit) {
      return response.json(400, {
        success: false,
        message: 'Parameter missing: trustline.limit'
      });
    }
    if (isNaN(options.trustline.limit = String(options.trustline.limit))) {
      return response.json(400, {
        success: false,
        message: 'Parameter is not a number: trustline.limit'
      });
    }
    if (!options.trustline.currency) {
      return response.json(400, {
        success: false,
        message: 'Parameter missing: trustline.currency'
      });
    }
    if (!/^[A-Z0-9]{3}$/.test(options.trustline.currency)) {
      return response.json(400, {
        success: false,
        message: 'Parameter is not a valid currency: trustline.currency'
      });
    }
    if (!options.trustline.counterparty) {
      return response.json(400, {
        success: false,
        message: 'Parameter missing: trustline.counterparty'
      });
    }
    if (!ripple.UInt160.is_valid(options.trustline.counterparty)) {
      return response.json(400, {
        success: false,
        message: 'Parameter is not a Ripple address: trustline.counterparty'
      });
    }
    if (!/^(undefined|number)$/.test(typeof options.trustline.quality_in)) {
      return response.json(400, {
        success: false,
        message: 'Parameter must be a number: trustline.quality_in'
      });
    }
    if (!/^(undefined|number)$/.test(typeof options.trustline.quality_out)) {
      return response.json(400, {
        success: false,
        message: 'Parameter must be a number: trustline.quality_out'
      });
    }
    if (!/^(undefined|boolean)$/.test(typeof options.trustline.account_allows_rippling)) {
      return response.json(400, {
        success: false,
        message: 'Parameter must be a boolean: trustline.allow_rippling'
      });
    }
    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, function(error, connected) {
      if (error || !connected) {
        response.json(500, {
          success: false,
          message: 'Remote is not connected'
        });
      } else {
        callback();
      }
    });
  };
  function addLine(callback) {
    var limit = [
      options.trustline.limit,
      options.trustline.currency,
      options.trustline.counterparty
    ].join('/');
    var transaction = remote.transaction();
    var complete = false;
    var allows_rippling = false;

    function transactionSent(m) {
      complete = true;
      var summary = transaction.summary();
      var line = summary.tx_json.LimitAmount;
      var result = {
        success: true,
        trustline: {
          account: options.account,
          limit: line.value,
          currency: line.currency,
          counterparty: line.issuer,
          account_allows_rippling: allows_rippling
        }
      };
      if (m.tx_json.Flags & TrustSetFlags.SetAuth) {
        result.trustline.authorized = true;
      }
      result.ledger = String(summary.submitIndex);
      result.hash = m.tx_json.hash;
      callback(null, result);
    };
    transaction.once('error', callback);
    transaction.once('proposed', transactionSent);
    transaction.once('success', function(result) {
      if (!complete) {
        transaction.removeAllListeners('proposed');
        transactionSent(result);
      }
    });
    try {
      transaction.trustSet(options.account, limit);
      transaction.secret(options.secret);
      if (typeof options.trustline.quality_in === 'number') {
        transaction.tx_json.QualityIn = options.trustline.quality_in;
      }
      if (typeof options.trustline.quality_out === 'number') {
        transaction.tx_json.QualityOut = options.trustline.quality_out;
      }
      if (typeof options.trustline.account_allows_rippling === 'boolean') {
        if (options.trustline.account_allows_rippling) {
          transaction.setFlags('ClearNoRipple');
        } else {
          transaction.setFlags('NoRipple');
        }
      }
      allows_rippling = !Boolean(transaction.tx_json.Flags & 0x00020000);
    } catch (exception) {
      return response.json(500, {
        success: false,
        message: exception.message
      });
    }
    transaction.submit();
  };
};
