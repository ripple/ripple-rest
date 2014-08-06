var async     = require('async');
var ripple    = require('ripple-lib');
var serverLib = require('../lib/server-lib');
var remote    = require(__dirname+'/../lib/remote.js');
const AccountRootFlags = {
  PasswordSpent:   { name: 'password_spent', value: 0x00010000 },
  RequireDestTag:  { name: 'require_destination_tag', value: 0x00020000 },
  RequireAuth:     { name: 'require_authorization', value: 0x00040000 },
  DisallowXRP:     { name: 'disallow_xrp', value: 0x00080000 },
  DisableMaster:   { name: 'disable_master', value: 0x00100000 }
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
exports.get = getSettings;
exports.change = changeSettings;

function _requestAccountSettings(account, callback) {
  remote.requestAccountInfo(account, function(error, info) {
    if (error) return callback(error);
    var data = info.account_data;
    var settings = {
      account: data.Account,
      transfer_rate: '0'
    }
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
    callback(null, settings);
  });
};


function getSettings(server, request, response, next) {
  var account = request.params.account;
  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(account)) {
      return response.json(400, {
        success: false,
        message: 'Parameter is not a valid Ripple address: account'
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
  function getAccountSettings(callback) {
    _requestAccountSettings(account, callback);
  };
  var steps = [
    validateOptions,
    ensureConnected,
    getAccountSettings
  ];
  async.waterfall(steps, function(error, settings) {
    if (error) {
      next(error);
    } else {
      response.json(200, {
        success: true,
        settings: settings
      });
    }
  });
};


function changeSettings(server, request, response, next) {
  var self = this;
  var options = request.params;
  Object.keys(request.body).forEach(function(param) {
    options[param] = request.body[param];
  });
  var steps = [
    validateOptions,
    ensureConnected,
    changeAccountSettings
  ];
  async.waterfall(steps, function(error, settings) {
    if (error) {
      next(error);
    } else {
      response.json(200, settings);
    }
  });

  function validateOptions(callback) {
    if (typeof options.settings !== 'object') {
      return response.json(400, {
        success: false,
        message: 'Parameter missing: settings'
      });
    }
    if (!ripple.UInt160.is_valid(options.account)) {
      return response.json(400, {
        success: false,
        message: 'Parameter is not a valid Ripple address: account'
      });
    }
    if (!options.secret) {
      return response.json(400, {
        success: false,
        message: 'Parameter missing: secret'
      });
    }
    if (!/(undefined|string)/.test(typeof options.settings.domain)) {
      return response.json(400, {
        success: false,
        message: 'Parameter must be a string: domain'
      });
    }
    if (!/(undefined|string)/.test(typeof options.settings.wallet_locator)) {
      return response.json(400, {
        success: false,
        message: 'Parameter must be a string: wallet_locator'
      });
    }
    if (!/(undefined|string)/.test(typeof options.settings.email_hash)) {
      return response.json(400, {
        success: false,
        message: 'Parameter must be a string: email_hash'
      });
    }
    if (!/(undefined|string)/.test(typeof options.settings.message_key)) {
      return response.json(400, {
        success: false,
        message: 'Parameter must be a string: message_key'
      });
    }
    if (!/(undefined|number)/.test(typeof options.settings.transfer_rate)) {
      if (options.settings.transfer_rate !== '') {
        return response.json(400, {
          success: false,
          message: 'Parameter must be a number: transfer_rate'
        });
      }
    }
    if (!/(undefined|number)/.test(typeof options.settings.wallet_size)) {
      if (options.settings.wallet_size !== '') {
        return response.json(400, {
          success: false,
          message: 'Parameter must be a number: wallet_size'
        });
      }
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

  function changeAccountSettings(callback) {
    var FlagSet = {
      require_destination_tag: { unset: 'OptionalDestTag', set: 'RequireDestTag', },
      require_authorization: { unset: 'OptionalAuth', set: 'RequireAuth' },
      disallow_xrp: { unset: 'AllowXRP', set: 'DisallowXRP' }
    }
    var settings = { };
    var transaction = remote.transaction();
    transaction.once('error', callback);
    transaction.once('proposed', function() {
      var summary = transaction.summary();
      var result = { success: true }
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
      // Set transaction flags
      for (var flagName in FlagSet) {
        if (!(flagName in options.settings)) continue;
        var flag = FlagSet[flagName];
        var value = options.settings[flagName];
        if (value === '') {
          value = Boolean(value);
        }
        if (typeof value !== 'boolean') {
          return response.json(400, {
            success: false,
            message: 'Parameter is not boolean: ' + flagName
          });
        }
        settings[flagName] = value;
        transaction.setFlags(value ? flag.set : flag.unset);
      }
      // Set transaction fields
      for (var fieldName in AccountRootFields) {
        var field = AccountRootFields[fieldName];
        var value = options.settings[field.name];
        if (typeof value === 'undefined') continue;
        if (value === '') {
          switch (fieldName) {
            case 'Emailhash':
            case 'WalletLocator':
              value = '0';
              break;
            case 'TransferRate':
            case 'WalletSize':
              value = 0;
              break;
          }
        }
        if (field.encoding === 'hex') {
          if (field.length) {
            // Fixed length
            if (value.length > field.length) {
              return response.json(400, {
                success: false,
                message: 'Parameter length exceeded: ' + fieldName
              });
            }
            while (value.length < field.length) {
              value = '0' + value;
            }
          } else {
            // Variable length
            value = new Buffer(value, 'ascii').toString('hex');
          }
          value = value.toUpperCase();
        }
        settings[field.name] = options.settings[field.name];
        transaction.tx_json[fieldName] = value;
      }
    } catch (exception) {
      return response.json(500, {
        success: false, message: exception.message
      });
    }
    transaction.submit();
  };
};
