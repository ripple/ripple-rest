var _            = require('lodash');
var async        = require('async');
var ripple       = require('ripple-lib');
var transactions = require('./transactions.js');
var remote       = require('./../lib/remote.js');
var respond      = require('./../lib/response-handler.js');
var errors       = require('./../lib/errors.js');

const TrustSetFlags = {
  ClearNoRipple: { name: 'account_allows_rippling', set: 'ClearNoRipple', unset: 'NoRipple' },
  SetFreeze:     { name: 'account_trustline_frozen', set: 'SetFreeze', unset: 'ClearFreeze' }
};

const TrustSetResponseFlags = {
  NoRipple:      { name: 'prevent_rippling', value: ripple.Transaction.flags.TrustSet.NoRipple },
  SetFreeze:     { name: 'account_trustline_frozen', value: ripple.Transaction.flags.TrustSet.SetFreeze },
  SetAuth:       { name: 'authorized', value: ripple.Transaction.flags.TrustSet.SetAuth }
}

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

  async.waterfall(steps, function(err, trustlines) {
    if (err) {
      next(err);
    } else {
      respond.success(response, trustlines);
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
      var trustlines = {};

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
          account_trustline_frozen: line.freeze ? line.freeze : false,
          counterparty_trustline_frozen: line.freeze_peer ? line.freeze_peer : false
        });
      });

      if (result.marker) {
        trustlines.marker = result.marker;
      }

      if (result.limit) {
        trustlines.limit = result.limit;
      }

      trustlines.trustlines = lines;

      callback(null, trustlines);
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
  var params = request.params;

  Object.keys(request.body).forEach(function(param) {
    params[param] = request.body[param];
  });

  var options = {
    secret: params.secret,
    validated: request.query.validated === 'true'
  };

  var hooks = {
    validateParams: validateParams,
    formatTransactionResponse: formatTransactionResponse,
    setTransactionParameters: setTransactionParameters
  };

  transactions.submit(options, hooks, function(err, trustline) {
    if (err) {
      return next(err);
    }

    respond.created(response, trustline);
  });

  function validateParams(callback) {
    if (!ripple.UInt160.is_valid(params.account)) {
      return callback(new errors.InvalidRequestError('Parameter is not a Ripple address: account'));
    }
    if (typeof params.trustline !== 'object') {
      return callback(new errors.InvalidRequestError('Parameter missing: trustline'));
    }
    if (!params.trustline.limit) {
      return callback(new errors.InvalidRequestError('Parameter missing: trustline.limit'));
    }
    if (isNaN(params.trustline.limit = String(params.trustline.limit))) {
      return callback(new errors.InvalidRequestError('Parameter is not a number: trustline.limit'));
    }
    if (!params.trustline.currency) {
      return callback(new errors.InvalidRequestError('Parameter missing: trustline.currency'));
    }
    if (!/^[A-Z0-9]{3}$/.test(params.trustline.currency)) {
      return callback(new errors.InvalidRequestError('Parameter is not a valid currency: trustline.currency'));
    }
    if (!params.trustline.counterparty) {
      return callback(new errors.InvalidRequestError('Parameter missing: trustline.counterparty'));
    }
    if (!ripple.UInt160.is_valid(params.trustline.counterparty)) {
      return callback(new errors.InvalidRequestError('Parameter is not a Ripple address: trustline.counterparty'));
    }
    if (!/^(undefined|number)$/.test(typeof params.trustline.quality_in)) {
      return callback(new errors.InvalidRequestError('Parameter must be a number: trustline.quality_in'));
    }
    if (!/^(undefined|number)$/.test(typeof params.trustline.quality_out)) {
      return callback(new errors.InvalidRequestError('Parameter must be a number: trustline.quality_out'));
    }
    if (!/^(undefined|boolean)$/.test(typeof params.trustline.account_allows_rippling)) {
      return callback(new errors.InvalidRequestError('Parameter must be a boolean: trustline.allow_rippling'));
    }

    callback();
  };

  function formatTransactionResponse(message, meta, callback) {
    var result = {};
    var line = message.tx_json.LimitAmount;
    var parsedFlags = transactions.parseFlagsFromResponse(message.tx_json.Flags, TrustSetResponseFlags);

    _.extend(meta, {
      account: message.tx_json.Account,
      limit: line.value,
      currency: line.currency,
      counterparty: line.issuer,
      account_allows_rippling: !parsedFlags.prevent_rippling,
      account_trustline_frozen: parsedFlags.account_trustline_frozen,
      authorized: parsedFlags.authorized ? parsedFlags.authorized : void(0)
    });

    result.trustline = meta;

    callback(null, result);
  };

  function setTransactionParameters(transaction) {
    var limit = [
      params.trustline.limit,
      params.trustline.currency,
      params.trustline.counterparty
    ].join('/');

    transaction.trustSet(params.account, limit);
    transaction.secret(params.secret);

    if (typeof params.trustline.quality_in === 'number') {
      transaction.tx_json.QualityIn = params.trustline.quality_in;
    }
    if (typeof params.trustline.quality_out === 'number') {
      transaction.tx_json.QualityOut = params.trustline.quality_out;
    }

    transactions.setTransactionBitFlags(transaction, {
      input: params.trustline,
      flags: TrustSetFlags,
      clear_setting: ''
    });
  };
};

module.exports.get = getTrustLines;
module.exports.add = addTrustLine;
