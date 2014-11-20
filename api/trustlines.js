var async   = require('async');
var ripple  = require('ripple-lib');
var remote  = require('./../lib/remote.js');
var respond = require('./../lib/response-handler.js');
var errors  = require('./../lib/errors.js');

const TrustSetFlags = {
  SetAuth: { name: 'authorized', value: 0x00010000 },
  NoRipple: { name: 'prevent_rippling', value: 0x00020000 },
  ClearNoRipple: { name: 'allow_rippling', value: 0x00040000 },
  SetFreeze: { name: 'freeze', value: 0x00100000 },
  ClearFreeze: { name: 'unfreeze', value: 0x00200000 }
};

/**
 *  Retrieves all trustlines for a given account
 *
 *  Notes:
 *  In order to use paging, you must provide at least ledger as a query parameter.
 *  Additionally, any limit lower than 10 will be bumped up to 10.
 *
 *  @url
 *  @param {String} request.params.account - account to retrieve trustlines for
 *
 *  @query
 *  @param {String ISO 4217 Currency Code} [request.query.currency] - only request trustlines with given currency
 *  @param {RippleAddress} [request.query.counterparty] - only request trustlines with given counterparty
 *  @param {String} [request.query.marker] - start position in response paging
 *  @param {Number String} [request.query.limit] - max results per response
 *  @param {Number String} [request.query.ledger] - identifier
 *
 *  @param {Express.js Response} response
 *  @param {Express.js Next} next
 */

function getTrustLines(request, response, next) {
  var steps = [
    validateOptions,
    getAccountLines
  ];

  async.waterfall(steps, function(err, lines) {
    if (err) {
      next(err);
    } else {
      respond.success(response, { trustlines: lines });
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
      return callback(new errors.InvalidRequestError('Parameter is not a valid Ripple address: account'));
    }
    if (options.counterparty && !ripple.UInt160.is_valid(options.counterparty)) {
      return callback(new errors.InvalidRequestError('Parameter is not a valid Ripple address: counterparty'));
    }
    if (options.currency && !/^[A-Z0-9]{3}$/.test(options.currency)) {
      return callback(new errors.InvalidRequestError('Parameter is not a valid currency: currency'));
    }

    callback();
  };

  function getAccountLines(callback) {
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
          account_froze_trustline: line.freeze ? line.freeze : false,
          counterparty_froze_trustline: line.freeze_peer ? line.freeze_peer : false
        });
      });

      callback(null, lines);
    });

    accountLinesRequest.request();
  };
};

/**
 *  Grant a trustline to a counterparty
 *
 *  @body
 *  @param {Trustline} request.body.trustline
 *  @param {String} request.body.secret
 *
 *  @query
 *  @param {String "true"|"false"} request.query.validated Used to force request to wait until rippled has finished validating the submitted transaction
 *
 *  @param {Express.js Response} response
 *  @param {Express.js Next} next
 */

function addTrustLine(request, response, next) {
  var options = request.params;

  Object.keys(request.body).forEach(function(param) {
    options[param] = request.body[param];
  });

  options.validated = request.query.validated === 'true';

  var steps = [
    validateOptions,
    addLine
  ];

  async.waterfall(steps, function(err, line) {
    if (err) {
      next(err);
    } else {
      respond.created(response, line);
    }
  });

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(options.account)) {
      return callback(new errors.InvalidRequestError('Parameter is not a Ripple address: account'));
    }
    if (!options.secret) {
      return callback(new errors.InvalidRequestError('Parameter missing: secret'));
    }
    if (typeof options.trustline !== 'object') {
      return callback(new errors.InvalidRequestError('Parameter missing: trustline'));
    }
    if (!options.trustline.limit) {
      return callback(new errors.InvalidRequestError('Parameter missing: trustline.limit'));
    }
    if (isNaN(options.trustline.limit = String(options.trustline.limit))) {
      return callback(new errors.InvalidRequestError('Parameter is not a number: trustline.limit'));
    }
    if (!options.trustline.currency) {
      return callback(new errors.InvalidRequestError('Parameter missing: trustline.currency'));
    }
    if (!/^[A-Z0-9]{3}$/.test(options.trustline.currency)) {
      return callback(new errors.InvalidRequestError('Parameter is not a valid currency: trustline.currency'));
    }
    if (!options.trustline.counterparty) {
      return callback(new errors.InvalidRequestError('Parameter missing: trustline.counterparty'));
    }
    if (!ripple.UInt160.is_valid(options.trustline.counterparty)) {
      return callback(new errors.InvalidRequestError('Parameter is not a Ripple address: trustline.counterparty'));
    }
    if (!/^(undefined|number)$/.test(typeof options.trustline.quality_in)) {
      return callback(new errors.InvalidRequestError('Parameter must be a number: trustline.quality_in'));
    }
    if (!/^(undefined|number)$/.test(typeof options.trustline.quality_out)) {
      return callback(new errors.InvalidRequestError('Parameter must be a number: trustline.quality_out'));
    }
    if (!/^(undefined|boolean)$/.test(typeof options.trustline.account_allows_rippling)) {
      return callback(new errors.InvalidRequestError('Parameter must be a boolean: trustline.allow_rippling'));
    }

    callback();
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
    var froze_trustline = false;

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
          account_allows_rippling: allows_rippling,
          account_froze_trustline: froze_trustline,
          ledger: String(summary.submitIndex),
          hash: m.tx_json.hash,
          state: m.validated === true ? 'validated' : 'pending'
        }
      };

      if (m.tx_json.Flags & TrustSetFlags.SetAuth) {
        result.trustline.authorized = true;
      }

      callback(null, result);
    };

    transaction.once('error', callback);
    transaction.once('proposed', function (result) {
      if (options.validated === false) {
        transactionSent(result);
      }
    });

    transaction.once('success', function(result) {
      if (!complete && options.validated === false) {
        transaction.removeAllListeners('proposed');
        transactionSent(result);
      }
    });

    transaction.once('final', function(result) {
      if (!complete && options.validated === true) {
        if (/^tes/.test(result.engine_result)) {
          transaction.removeAllListeners('proposed');
          transactionSent(result);
        } else {
          callback(result);
        }
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

      if (typeof options.trustline.account_froze_trustline === 'boolean') {
        if (options.trustline.account_froze_trustline) {
          transaction.setFlags('SetFreeze');
        } else {
          transaction.setFlags('ClearFreeze');
        }
      }

      allows_rippling = !Boolean(transaction.tx_json.Flags & 0x00020000);
      froze_trustline = Boolean(transaction.tx_json.Flags & 0x00100000);
    } catch (exception) {
      return callback(new errors.ApiError(exception));
    }

    transaction.submit();
  };
};

module.exports.get = getTrustLines;
module.exports.add = addTrustLine;
