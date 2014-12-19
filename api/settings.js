var _                       = require('lodash');
var assert                  = require('assert');
var async                   = require('async');
var ripple                  = require('ripple-lib');
var transactions            = require('./transactions.js');
var SubmitTransactionHooks  = require('./../lib/submit_transaction_hooks.js');
var remote                  = require('./../lib/remote.js');
var respond                 = require('./../lib/response-handler.js');
var errors                  = require('./../lib/errors.js');
var TxToRestConverter       = require('./../lib/tx-to-rest-converter.js');

const InvalidRequestError = errors.InvalidRequestError;

const AccountRootFlags = {
  PasswordSpent:   { name:  'password_spent', value: 0x00010000 },
  RequireDestTag:  { name:  'require_destination_tag', value: 0x00020000 },
  RequireAuth:     { name:  'require_authorization', value: 0x00040000 },
  DisallowXRP:     { name:  'disallow_xrp', value: 0x00080000 },
  DisableMaster:   { name:  'disable_master', value: 0x00100000 },
  NoFreeze:        { name:  'no_freeze', value: 0x00200000 },
  GlobalFreeze:    { name:  'global_freeze', value: 0x00400000 }
};

const AccountRootFields = {
  Sequence:       { name:  'transaction_sequence' },
  EmailHash:      { name:  'email_hash', encoding: 'hex', length: 32, defaults: '0' },
  WalletLocator:  { name:  'wallet_locator', encoding: 'hex', length: 64, defaults: '0' },
  WalletSize:     { name:  'wallet_size', defaults: 0 },
  MessageKey:     { name:  'message_key' },
  Domain:         { name:  'domain', encoding: 'hex' },
  TransferRate:   { name:  'transfer_rate', defaults: 0 },
  Signers:        { name:  'signers' }
};

const AccountSetIntFlags = {
  NoFreeze:       { name:   'no_freeze', value: ripple.Transaction.set_clear_flags.AccountSet.asfNoFreeze },
  GlobalFreeze:   { name:   'global_freeze', value: ripple.Transaction.set_clear_flags.AccountSet.asfGlobalFreeze }
};

const AccountSetFlags = {
  RequireDestTag: { name:   'require_destination_tag', set: 'RequireDestTag', unset: 'OptionalDestTag' },
  RequireAuth:    { name:   'require_authorization', set: 'RequireAuth', unset: 'OptionalAuth' },
  DisallowXRP:    { name:   'disallow_xrp', set: 'DisallowXRP', unset: 'AllowXRP' }
};

// Emptry string passed to setting will clear it
const CLEAR_SETTING = '';

/**
 * Pad the value of a  fixed-length field
 *
 * @param {String} value
 * @param {Number} length
 * @return {String}
 */
function padValue(value, length) {
  assert.strictEqual(typeof value, 'string');
  assert.strictEqual(typeof length, 'number');

  var result = value;

  while (result.length < length) {
    result = '0' + result;
  }

  return result;
};

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

  return parsedBody
};

/**
 * Set integer flags on a transaction based on input and a flag map
 * 
 * @param {Transaction} transaction
 * @param {Object} input - Object whose properties determine whether to update the transaction's SetFlag or ClearFlag property
 * @param {Object} flags - Object that maps property names to transaction integer flag values
 *
 * @returns undefined
 */
function setTransactionIntFlags(transaction, input, flags) {
  for (var flagName in flags) {
    var flag = flags[flagName];

    if (!input.hasOwnProperty(flag.name)) {
      continue;
    }

    var value = input[flag.name];

    if (value) {
      transaction.tx_json.SetFlag = flag.value;
    } else {
      transaction.tx_json.ClearFlag = flag.value;
    }
  }
};

/**
 * Set fields on a transaction based on input and fields schema object
 * 
 * @param {Transaction} transaction
 * @param {Object} input       - Object whose properties are used to set fields on the transaction
 * @param {Object} fieldSchema - Object that holds the schema of each field
 *
 * @returns undefined
 */
function setTransactionFields(transaction, input, fieldSchema) {
  for (var fieldName in fieldSchema) {
    var field = fieldSchema[fieldName];
    var value = input[field.name];

    if (typeof value === 'undefined') {
      continue;
    }

    // The value required to clear an account root field varies
    if (value === CLEAR_SETTING && field.hasOwnProperty('defaults')) {
      value = field.defaults;
    }

    if (field.encoding === 'hex') {
      // If the field is supposed to be hex, why don't we do a toString('hex') on it?
      if (field.length) {
        // Field is fixed length, why are we checking here though? We could move this to validateInputs
        if (value.length > field.length) {
          throw new InvalidRequestError(
            'Parameter length exceeded: ' + fieldName);
        } else if (value.length < field.length) {
          value = padValue(value, field.length);
        }
      } else {
        // Field is variable length. Expecting an ascii string as input.
        // This is currently only used for Domain field
        value = new Buffer(value, 'ascii').toString('hex');
      }

      value = value.toUpperCase();
    }

    transaction.tx_json[fieldName] = value;
  }
};

/**
 *  Retrieves account settings for a given account
 *
 *  @url
 *  @param {String} request.params.account
 *  
 *  @param {Express.js Response} response
 *  @param {Express.js Next} next
 */
function getSettings(request, response, next) {
  if (!ripple.UInt160.is_valid(request.param('account'))) {
    return next(new errors.InvalidRequestError('Parameter is not a valid Ripple address: account'));
  }

  remote.requestAccountInfo({account: request.params.account}, function(error, info) {
    if (error) {
      return next(error);
    }

    var data = info.account_data;
    var settings = {
      account: data.Account,
      transfer_rate: '0'
    };

    // Attach account flags
    _.extend(settings, TxToRestConverter.parseFlagsFromResponse(data.Flags, AccountRootFlags));

    // Attach account fields
    _.extend(settings, parseFieldsFromResponse(data, AccountRootFields));

    settings.transaction_sequence = String(settings.transaction_sequence);

    respond.success(response, { settings: settings });
  });
};

/**
 *  Change account settings
 *
 *  @body
 *  @param {Settings} request.body.settings
 *  @param {String} request.body.secret
 *  
 *  @query
 *  @param {String "true"|"false"} request.query.validated Used to force request to wait until rippled has finished validating the submitted transaction
 *
 *  @param {Express.js Response} response
 *  @param {Express.js Next} next
 */
function changeSettings(request, response, next) {
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
    formatTransactionResponse: TxToRestConverter.parseSettingResponseFromTx.bind(void(0), params),
    setTransactionParameters: setTransactionParameters
  };

  transactions.submit(options, new SubmitTransactionHooks(hooks), function(err, settings) {
    if (err) {
      return next(err);
    }

    respond.success(response, settings);
  });
  
  function validateParams(callback) {
    if (typeof params.settings !== 'object') {
      return callback(new InvalidRequestError('Parameter missing: settings'));
    }
    if (!ripple.UInt160.is_valid(params.account)) {
      return callback(new InvalidRequestError(
        'Parameter is not a valid Ripple address: account'));
    }
    if (!/(undefined|string)/.test(typeof params.settings.domain)) {
      return callback(new InvalidRequestError(
        'Parameter must be a string: domain'));
    }
    if (!/(undefined|string)/.test(typeof params.settings.wallet_locator)) {
      return callback(new InvalidRequestError(
        'Parameter must be a string: wallet_locator'));
    }
    if (!/(undefined|string)/.test(typeof params.settings.email_hash)) {
      return callback(new InvalidRequestError(
        'Parameter must be a string: email_hash'));
    }
    if (!/(undefined|string)/.test(typeof params.settings.message_key)) {
      return callback(new InvalidRequestError(
        'Parameter must be a string: message_key'));
    }
    if (!/(undefined|number)/.test(typeof params.settings.transfer_rate)) {
      if (params.settings.transfer_rate !== '') {
        return callback(new InvalidRequestError(
          'Parameter must be a number: transfer_rate'));
      }
    }
    if (!/(undefined|number)/.test(typeof params.settings.wallet_size)) {
      if (params.settings.wallet_size !== '') {
        return callback(new InvalidRequestError(
          'Parameter must be a number: wallet_size'));
      }
    }
    if (!/(undefined|boolean)/.test(typeof params.settings.no_freeze)) {
      return callback(new InvalidRequestError(
        'Parameter must be a boolean: no_freeze'));
    }
    if (!/(undefined|boolean)/.test(typeof params.settings.global_freeze)) {
      return callback(new InvalidRequestError(
        'Parameter must be a boolean: global_freeze'));
    }
    if (!/(undefined|boolean)/.test(typeof params.settings.password_spent)) {
      return callback(new InvalidRequestError(
        'Parameter must be a boolean: password_spent'));
    }
    if (!/(undefined|boolean)/.test(typeof params.settings.disable_master)) {
      return callback(new InvalidRequestError(
        'Parameter must be a boolean: disable_master'));
    }
    if (!/(undefined|boolean)/.test(typeof params.settings.require_destination_tag)) {
      return callback(new InvalidRequestError(
        'Parameter must be a boolean: require_destination_tag'));
    }
    if (!/(undefined|boolean)/.test(typeof params.settings.require_authorization)) {
      return callback(new InvalidRequestError(
        'Parameter must be a boolean: require_authorization'));
    }
    if (!/(undefined|boolean)/.test(typeof params.settings.disallow_xrp)) {
      return callback(new InvalidRequestError(
        'Parameter must be a boolean: disallow_xrp'));
    }

    var setCollision = (typeof params.settings.no_freeze === 'boolean')
      && (typeof params.settings.global_freeze === 'boolean')
      && params.settings.no_freeze === params.settings.global_freeze;

    if (setCollision) {
      return callback(new InvalidRequestError(
        'Unable to set/clear no_freeze and global_freeze'));
    }

    callback();
  };

  function setTransactionParameters(transaction) {
    transaction.accountSet(params.account);

    transactions.setTransactionBitFlags(transaction, {
      input: params.settings, 
      flags: AccountSetFlags,
      clear_setting: CLEAR_SETTING
    });
    setTransactionIntFlags(transaction, params.settings, AccountSetIntFlags);
    setTransactionFields(transaction, params.settings, AccountRootFields);
  };
};

module.exports = {
  get: getSettings,
  change: changeSettings,
  AccountSetIntFlags: AccountSetIntFlags,
  AccountRootFields: AccountRootFields
};
