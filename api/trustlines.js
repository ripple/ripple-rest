/* globals Promise: true */
/* eslint-disable valid-jsdoc */
'use strict';
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var transactions = require('./transactions.js');
var utils = require('./lib/utils');
var validator = require('./lib/schema-validator');
var TxToRestConverter = require('./lib/tx-to-rest-converter.js');
var validate = require('./lib/validate');
var createTrustLineTransaction =
  require('./transaction').createTrustLineTransaction;

var DefaultPageLimit = 200;

/**
 * Retrieves all trustlines for a given account
 *
 * Notes:
 * In order to use paging, you must provide at least ledger as a query parameter
 * Additionally, any limit lower than 10 will be bumped up to 10.
 *
 * @url
 * @param {String} request.params.account - account to retrieve trustlines for
 *
 * @query
 * @param {String ISO 4217 Currency Code} [request.query.currency]
 *         - only request trustlines with given currency
 * @param {RippleAddress} [request.query.counterparty]
 *         - only request trustlines with given counterparty
 * @param {String} [request.query.marker] - start position in response paging
 * @param {Number String} [request.query.limit] - max results per response
 * @param {Number String} [request.query.ledger] - identifier
 *
 */
function getTrustLines(account, options, callback) {
  validate.address(account);
  validate.currency(options.currency, true);
  validate.counterparty(options.counterparty, true);
  validate.ledger(options.ledger, true);
  validate.limit(options.limit, true);
  validate.paging(options, true);

  var self = this;

  var currencyRE = new RegExp(options.currency ?
    ('^' + options.currency.toUpperCase() + '$') : /./);

  function getAccountLines(prevResult) {
    var isAggregate = options.limit === 'all';
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
        limit = prevResult.limit;
        ledger = prevResult.ledger_index;
      } else {
        marker = options.marker;
        limit = validator.isValid(options.limit, 'UINT32')
          ? Number(options.limit) : DefaultPageLimit;
        ledger = utils.parseLedger(options.ledger);
      }

      accountLinesRequest = self.remote.requestAccountLines({
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
          if (!currencyRE.test(line.currency)) {
            return;
          }
          lines.push({
            account: account,
            counterparty: line.account,
            currency: line.currency,
            limit: line.limit,
            reciprocated_limit: line.limit_peer,
            account_allows_rippling: line.no_ripple ? !line.no_ripple : true,
            counterparty_allows_rippling: line.no_ripple_peer
              ? !line.no_ripple_peer : true,
            account_trustline_frozen: line.freeze ? line.freeze : false,
            counterparty_trustline_frozen: line.freeze_peer
              ? line.freeze_peer : false
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
    var promise = new Promise(function(resolve) {
      var trustlines = {};

      if (result.marker) {
        trustlines.marker = result.marker;
      }

      trustlines.limit = result.limit;
      trustlines.ledger = result.ledger_index;
      trustlines.validated = result.validated;
      trustlines.trustlines = result.lines;

      resolve(callback(null, trustlines));
    });

    return promise;
  }

  getAccountLines()
  .then(respondWithTrustlines)
  .catch(callback);
}

/**
 * Grant a trustline to a counterparty
 *
 * @body
 * @param {Trustline} request.body.trustline
 * @param {String} request.body.secret
 *
 * @query
 * @param {String "true"|"false"} request.query.validated Used to force request
 *     to wait until rippled has finished validating the submitted transaction
 *
 */

function addTrustLine(account, trustline, secret, options, callback) {
  validate.address(account);
  validate.trustline(trustline);
  validate.validated(options.validated, true);

  var transaction = createTrustLineTransaction(account, trustline);
  async.waterfall([
    _.partial(transactions.submit, this, transaction, secret, options),
    TxToRestConverter.parseTrustResponseFromTx
  ], callback);
}

module.exports = {
  get: getTrustLines,
  add: utils.wrapCatch(addTrustLine)
};
