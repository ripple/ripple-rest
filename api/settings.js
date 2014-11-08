var assert  = require('assert');
var async   = require('async');
var ripple  = require('ripple-lib');
var remote  = require('./../lib/remote.js');
var respond = require('./../lib/response-handler.js');
var errors  = require('./../lib/errors.js');

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
  EmailHash:      { name:  'email_hash', encoding: 'hex', length: 32 },
  WalletLocator:  { name:  'wallet_locator', encoding: 'hex', length: 64 },
  WalletSize:     { name:  'wallet_size' },
  MessageKey:     { name:  'message_key' },
  Domain:         { name:  'domain', encoding: 'hex' },
  TransferRate:   { name:  'transfer_rate' },
  Signers:        { name:  'signers' }
};

// Emptry string passed to setting will clear it
const CLEAR_SETTING = '';

/**
 * There are different ways to clear account root fields. Find the clearing
 * value for a given field name
 *
 * @param {String} fieldName
 */

function getClearValue(fieldName) {
  assert.strictEqual(typeof fieldName, 'string');

  switch (fieldName) {
    case 'Emailhash':
    case 'WalletLocator':
      return '0';
      break;
    case 'TransferRate':
    case 'WalletSize':
      return 0;
      break;
    default:
      return '';
  }
};

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

function getSettings(request, response, next) {
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
    for (var flagName in AccountRootFlags) {
      var flag = AccountRootFlags[flagName];
      settings[flag.name] = Boolean(data.Flags & flag.value);
    }

    // Attach account fields
    for (var fieldName in AccountRootFields) {
      var field = AccountRootFields[fieldName];
      var value = data[fieldName] || '';
      if (field.encoding === 'hex' && !field.length) {
        value = new Buffer(value, 'hex').toString('ascii');
      }
      settings[field.name] = value;
    }

    settings.transaction_sequence = String(settings.transaction_sequence);

    respond.success(response, { settings: settings });
  });
};

function changeSettings(request, response, next) {
  var options = request.params;

  Object.keys(request.body).forEach(function(param) {
    options[param] = request.body[param];
  });

  function validateOptions(callback) {
    if (typeof options.settings !== 'object') {
      return callback(new InvalidRequestError('Parameter missing: settings'));
    }
    if (!ripple.UInt160.is_valid(options.account)) {
      return callback(new InvalidRequestError(
        'Parameter is not a valid Ripple address: account'));
    }
    if (!options.secret) {
      return callback(new InvalidRequestError('Parameter missing: secret'));
    }
    if (!/(undefined|string)/.test(typeof options.settings.domain)) {
      return callback(new InvalidRequestError(
        'Parameter must be a string: domain'));
    }
    if (!/(undefined|string)/.test(typeof options.settings.wallet_locator)) {
      return callback(new InvalidRequestError(
        'Parameter must be a string: wallet_locator'));
    }
    if (!/(undefined|string)/.test(typeof options.settings.email_hash)) {
      return callback(new InvalidRequestError(
        'Parameter must be a string: email_hash'));
    }
    if (!/(undefined|string)/.test(typeof options.settings.message_key)) {
      return callback(new InvalidRequestError(
        'Parameter must be a string: message_key'));
    }
    if (!/(undefined|number)/.test(typeof options.settings.transfer_rate)) {
      if (options.settings.transfer_rate !== '') {
        return callback(new InvalidRequestError(
          'Parameter must be a number: transfer_rate'));
      }
    }
    if (!/(undefined|number)/.test(typeof options.settings.wallet_size)) {
      if (options.settings.wallet_size !== '') {
        return callback(new InvalidRequestError(
          'Parameter must be a number: wallet_size'));
      }
    }
    if (!/(undefined|boolean)/.test(typeof options.settings.no_freeze)) {
      return callback(new InvalidRequestError(
        'Parameter must be a boolean: no_freeze'));
    }
    if (!/(undefined|boolean)/.test(typeof options.settings.global_freeze)) {
      return callback(new InvalidRequestError(
        'Parameter must be a boolean: global_freeze'));
    }
    if (!/(undefined|boolean)/.test(typeof options.settings.password_spent)) {
      return callback(new InvalidRequestError(
        'Parameter must be a boolean: password_spent'));
    }
    if (!/(undefined|boolean)/.test(typeof options.settings.disable_master)) {
      return callback(new InvalidRequestError(
        'Parameter must be a boolean: disable_master'));
    }

    callback();
  };

  function changeAccountSettings(callback) {
    // Decimal flags
    const SetClearFlags = ripple.Transaction.set_clear_flags.AccountSet;

    // Bit flags
    const FlagSet = {
      require_destination_tag: {
        unset: 'OptionalDestTag',
        set: 'RequireDestTag'
      },
      require_authorization: {
        unset: 'OptionalAuth',
        set: 'RequireAuth'
      },
      disallow_xrp: {
        unset: 'AllowXRP',
        set: 'DisallowXRP'
      }
    };

    var settings = { };
    var transaction = remote.transaction();

    transaction.once('error', callback);

    transaction.once('proposed', function() {
      var summary = transaction.summary();
      var result = { success: true };

      if (summary.result) {
        result.hash = summary.result.transaction_hash;
        result.ledger = String(summary.submitIndex)
      }

      result.settings = settings;
      callback(null, result);
    });

    try {
      transaction.accountSet(options.account);
      transaction.secret(options.secret);
    } catch (exception) {
      return callback(exception);
    }

    for (var flagName in FlagSet) {
      // Set transaction flags
      if (!(flagName in options.settings)) {
        continue;
      }

      var flag = FlagSet[flagName];
      var value = options.settings[flagName];

      if (value === CLEAR_SETTING) {
        value = false;
      }

      if (typeof value !== 'boolean') {
        return callback(new InvalidRequestError(
          'Parameter must be a boolean: ' + flagName));
      }

      settings[flagName] = value;
      transaction.setFlags(value ? flag.set : flag.unset);
    }

    if (options.settings.hasOwnProperty('no_freeze')) {
      // Set/clear NoFreeze
      settings.no_freeze = options.settings.no_freeze;
      if (options.settings.no_freeze) {
        transaction.tx_json.SetFlag = SetClearFlags.asfNoFreeze;
      } else {
        transaction.tx_json.ClearFlag = SetClearFlags.asfNoFreeze;
      }
    }

    if (options.settings.hasOwnProperty('global_freeze')) {
      // Set/clear GlobalFreeze
      settings.global_freeze = options.settings.global_freeze;
      if (options.settings.global_freeze) {
        transaction.tx_json.SetFlag = SetClearFlags.asfGlobalFreeze;
      } else {
        transaction.tx_json.ClearFlag = SetClearFlags.asfGlobalFreeze;
      }
    }

    var setCollision = (typeof settings.no_freeze === 'boolean')
      && (typeof settings.global_freeze === 'boolean')
      && settings.no_freeze === settings.global_freeze;


    if (setCollision) {
      return callback(new InvalidRequestError(
        'Unable to set/clear no_freeze and global_freeze'));
    }

    for (var fieldName in AccountRootFields) {
      // Set transaction fields
      var field = AccountRootFields[fieldName];
      var value = options.settings[field.name];

      if (typeof value === 'undefined') {
        continue;
      }

      if (value === CLEAR_SETTING) {
        // The value required to clear an account root field varies
        value = getClearValue(fieldName);
      }

      if (field.encoding === 'hex') {
        if (field.length) {
          // Field is fixed length
          if (value.length > field.length) {
            return callback(new InvalidRequestError(
              'Parameter length exceeded: ' + fieldName));
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

      settings[field.name] = options.settings[field.name];
      transaction.tx_json[fieldName] = value;
    }

    transaction.submit();
  };

  var steps = [
    validateOptions,
    changeAccountSettings
  ];

  async.waterfall(steps, function(error, settings) {
    if (error) {
      next(error);
    } else {
      respond.success(response, settings);
    }
  });
};

module.exports = {
  get: getSettings,
  change: changeSettings
};
