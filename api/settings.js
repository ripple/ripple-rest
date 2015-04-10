/* eslint-disable valid-jsdoc */
'use strict';
var _ = require('lodash');
var async = require('async');
var utils = require('./lib/utils');
var transactions = require('./transactions.js');
var TxToRestConverter = require('./lib/tx-to-rest-converter.js');
var validate = require('./lib/validate');
var createSettingsTransaction =
  require('./transaction').createSettingsTransaction;
var constants = require('./lib/constants');

function parseFieldsFromResponse(responseBody, fields) {
  var parsedBody = {};

  for (var fieldName in fields) {
    var field = fields[fieldName];
    var value = responseBody[fieldName] || '';
    if (field.encoding === 'hex' && !field.length) {
      value = new Buffer(value, 'hex').toString('ascii');
    }
    parsedBody[field.name] = value;
  }

  return parsedBody;
}

/**
 * Retrieves account settings for a given account
 *
 * @url
 * @param {String} request.params.account
 *
 */
function getSettings(account, callback) {
  validate.address(account);

  this.remote.requestAccountInfo({account: account}, function(error, info) {
    if (error) {
      return callback(error);
    }

    var data = info.account_data;
    var settings = {
      account: data.Account,
      transfer_rate: '0'
    };

    // Attach account flags
    _.extend(settings, TxToRestConverter.parseFlagsFromResponse(data.Flags,
      constants.AccountRootFlags));

    // Attach account fields
    _.extend(settings, parseFieldsFromResponse(data,
      constants.AccountRootFields));

    settings.transaction_sequence = String(settings.transaction_sequence);

    callback(null, {settings: settings});
  });
}

/**
 * Change account settings
 *
 * @body
 * @param {Settings} request.body.settings
 * @param {String} request.body.secret
 *
 * @query
 * @param {String "true"|"false"} request.query.validated Used to force request
 *     to wait until rippled has finished validating the submitted transaction
 *
 */
function changeSettings(account, settings, secret, options, callback) {
  validate.address(account);
  validate.settings(settings);

  var transaction = createSettingsTransaction(account, settings);
  async.waterfall([
    _.partial(transactions.submit, this, transaction, secret, options),
    _.partial(TxToRestConverter.parseSettingsResponseFromTx, settings)
  ], callback);
}

module.exports = {
  get: getSettings,
  change: utils.wrapCatch(changeSettings)
};
