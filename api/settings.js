var async     = require('async');
var ripple    = require('ripple-lib');
var serverLib = require('../lib/server-lib');

const AccountRootFlags = {
  PasswordSpent:   { name: 'password_spent', value: 0x00010000 },
  RequireDestTag:  { name: 'require_dest_tag', value: 0x00020000 },
  RequireAuth:     { name: 'require_auth', value: 0x00040000 },
  DisallowXRP:     { name: 'disallow_xrp', value: 0x00080000 },
  DisableMaster:   { name: 'disable_master', value: 0x00100000 }
}

const AccountRootFields = {
  EmailHash:      { name: 'email_hash' },
  WalletLocator:  { name: 'wallet_locator' },
  WalletSize:     { name: 'wallet_size' },
  MessageKey:     { name: 'message_key' },
  Domain:         { name: 'domain', encoding: 'hex' },
  TransferRate:   { name: 'transfer_rate' },
  Signers:        { name: 'signers' }
}

exports.get = getSettings;

function getSettings($, req, res, next) {
  var remote = $.remote;

  var opts = {
    account: req.params.account
  }

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(opts.account)) {
      return res.json(400, { success: false, message: 'Parameter "account" is not a valid Ripple address' });
    }

    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, callback);
  };

  function getAccountSettings(connected, callback) {
    if (!connected) {
      return res.json(500, { success: false, message: 'No connection to rippled' });
    }

    remote.requestAccountInfo(opts.account, function(err, info) {
      if (err) return callback(err);

      var settings = { };
      var data = info.account_data;

      for (var flagName in AccountRootFlags) {
        var flag = AccountRootFlags[flagName];
        settings[flag.name] = Boolean(data.Flags & flag.value);
      }

      for (var fieldName in AccountRootFields) {
        if (!(fieldName in data)) continue;

        var field = AccountRootFields[fieldName];
        var value = data[fieldName];

        if (field.encoding === 'hex') {
          value = new Buffer(value, 'hex').toString();
        }

        settings[field.name] = value;
      }

      callback(null, settings);
    });
  };

  var steps = [
    validateOptions,
    ensureConnected,
    getAccountSettings
  ]

  async.waterfall(steps, function(err, settings) {
    if (err) {
      next(err);
    } else {
      res.json(200, { success: true, settings: settings });
    }
  });
};

exports.change = changeSettings;

function changeSettings($, req, res, next) {
  var self = this;
  var remote = $.remote;
  var opts = req.params;

  Object.keys(req.body).forEach(function(param) {
    opts[param] = req.body[param];
  });

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(opts.account)) {
      return res.json(400, { success: false, message: 'Parameter "account" is not a valid Ripple address' });
    }

    if (!opts.secret) {
      return res.json(400, { success: false, 'Parameter "secret" is not a valid Ripple secret' });
    }

    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, callback);
  };

  function changeAccountSettings(connected, callback) {
    var transaction = remote.transaction().accountSet(opts.account);
    transaction.secret(opts.secret);

    var FlagSet = {
      require_dest_tag: {
        unset: 'OptionalDestTag',
        set: 'RequireDestTag',
      },
      require_auth: {
        unset: 'OptionalAuth',
        set: 'RequireAuth'
      },
      disallow_xrp: {
        unset: 'AllowXRP',
        set: 'DisallowXRP'
      }
    }

    Object.keys(FlagSet).forEach(function(flagName) {
      if (!(flagName in opts)) return

      var flag = FlagSet[flagName];
      var value = opts[flagName];

      if (typeof value !== 'boolean') {
        return callback(new TypeError('Parameter is not boolean: ' + flagName));
      }

      transaction.setFlags(value ? flag.set : flag.unset);
    });

    Object.keys(AccountRootFields).forEach(function(fieldName) {
      var field = AccountRootFields[fieldName];
      var value = opts[field.name];

      if (typeof value === 'undefined') return;

      if (field.encoding === 'hex') {
        value = new Buffer(value).toString('hex');
      }

      transaction.tx_json[fieldName] = value;
    });

    transaction.submit(callback);
  };

  var steps = [
    validateOptions,
    ensureConnected,
    changeAccountSettings
  ]

  async.waterfall(steps, function(err, settings) {
    if (err) {
      next(err);
    } else {
      getSettings($, req, res, next);
    }
  });
};
