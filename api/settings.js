/* eslint-disable valid-jsdoc */
'use strict';
var _ = require('lodash');
var asyncify = require('simple-asyncify');
var utils = require('./lib/utils');
var TxToRestConverter = require('./lib/tx-to-rest-converter.js');
var validate = require('./lib/validate');
var createSettingsTransaction =
  require('./transaction').createSettingsTransaction;
var constants = require('./lib/constants');
var transact = require('./transact');

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
  var transaction = createSettingsTransaction(account, settings);
  var converter = asyncify(_.partial(
    TxToRestConverter.parseSettingsResponseFromTx, settings));
  transact(transaction, this, secret, options, converter, callback);
}

module.exports = {
  get: getSettings,
  change: utils.wrapCatch(changeSettings)
};
