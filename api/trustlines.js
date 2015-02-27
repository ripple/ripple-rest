var _                       = require('lodash');
var Promise                 = require('bluebird');
var async                   = require('async');
var ripple                  = require('ripple-lib');
var transactions            = require('./transactions.js');
var SubmitTransactionHooks  = require('./lib/submit_transaction_hooks.js');
var remote                  = require('./lib/remote.js');
var utils                   = require('./lib/utils');
var errors                  = require('./lib/errors.js');
var validator               = require('./lib/schema-validator');
var TxToRestConverter       = require('./lib/tx-to-rest-converter.js');
var validate                = require('./lib/validate');

const TrustSetFlags = {
  SetAuth:       { name: 'authorized', set: 'SetAuth' },
  ClearNoRipple: { name: 'account_allows_rippling', set: 'ClearNoRipple', unset: 'NoRipple' },
  SetFreeze:     { name: 'account_trustline_frozen', set: 'SetFreeze', unset: 'ClearFreeze' }
};

const DefaultPageLimit = 200;

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
 */
function getTrustLines(account, options, callback) {
  if(validate.fail([
    validate.account(account),
    validate.currency(options.currency, true),
    validate.counterparty(options.counterparty, true)
  ], callback)) {
    return;
  }

  const currencyRE = new RegExp(options.currency ?
    ('^' + options.currency.toUpperCase() + '$') : /./);

  getAccountLines()
  .then(respondWithTrustlines)
  .catch(callback);

  function getAccountLines(prevResult) {
    const isAggregate = options.limit === 'all';
    if (prevResult && (!isAggregate || !prevResult.marker)) {
      return Promise.resolve(prevResult);
    }

    var promise = new Promise(function(resolve, reject) {
      var accountLinesRequest;
      var marker;
      var ledger;
      var limit;

      if (prevResult) {
        marker = prevResult.marker;
        limit  = prevResult.limit;
        ledger = prevResult.ledger_index;
      } else {
        marker = options.marker;
        limit  = validator.isValid(options.limit, 'UINT32')
          ? Number(options.limit) : DefaultPageLimit;
        ledger = utils.parseLedger(options.ledger);
      }

      accountLinesRequest = remote.requestAccountLines({
        account: account,
        marker: marker,
        limit: limit,
        ledger: ledger
      });

      if (options.counterparty) {
        accountLinesRequest.message.peer = options.counterparty;
      }

      accountLinesRequest.once('error', reject);
      accountLinesRequest.once('success', function(nextResult) {

        var lines = [ ];
        nextResult.lines.forEach(function(line) {
          if (!currencyRE.test(line.currency)) return;
          lines.push({
            account: account,
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

        nextResult.lines = prevResult ? prevResult.lines.concat(lines) : lines;
        resolve([nextResult]);
      });
      accountLinesRequest.request();
    });

    return promise.spread(getAccountLines);
  }

  function respondWithTrustlines(result) {
    var promise = new Promise(function (resolve, reject) {
      var trustlines = {};

      if (result.marker) {
        trustlines.marker = result.marker;
      }

      trustlines.limit      = result.limit;
      trustlines.ledger     = result.ledger_index;
      trustlines.validated  = result.validated;
      trustlines.trustlines = result.lines;

      resolve(callback(null, trustlines));
    });

    return promise;
  }

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
 */

function addTrustLine(request, callback) {
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
    formatTransactionResponse: TxToRestConverter.parseTrustResponseFromTx,
    setTransactionParameters: setTransactionParameters
  };

  transactions.submit(options, new SubmitTransactionHooks(hooks), function(err, trustline) {
    if (err) {
      return callback(err);
    }
    callback(null, trustline);
  });

  function validateParams(callback) {
    if (!ripple.UInt160.is_valid(params.account)) {
      return callback(new errors.InvalidRequestError('Parameter is not a valid Ripple address: account'));
    }
    if (typeof params.trustline !== 'object') {
      return callback(new errors.InvalidRequestError('Parameter missing: trustline'));
    }
    if (_.isUndefined(params.trustline.limit)) {
      return callback(new errors.InvalidRequestError('Parameter missing: trustline.limit'));
    }
    if (isNaN(params.trustline.limit = String(params.trustline.limit))) {
      return callback(new errors.InvalidRequestError('Parameter is not a number: trustline.limit'));
    }
    if (!params.trustline.currency) {
      return callback(new errors.InvalidRequestError('Parameter missing: trustline.currency'));
    }
    if (!validator.isValid(params.trustline.currency, 'Currency')) {
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
