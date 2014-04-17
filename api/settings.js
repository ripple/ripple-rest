var Domain    = require('domain');
var async     = require('async');
var ripple    = require('ripple-lib');
var serverLib = require('../lib/server-lib');

const AccountRootFlags = {
  PasswordSpent:   { name: 'password_spent', value: 0x00010000 },
  RequireDestTag:  { name: 'require_destination_tag', value: 0x00020000 },
  RequireAuth:     { name: 'require_authorization', value: 0x00040000 },
  DisallowXRP:     { name: 'disallow_xrp', value: 0x00080000 },
  DisableMaster:   { name: 'disable_master', value: 0x00100000 }
}

const AccountRootFields = {
  Sequence:       { name:  'transaction_sequence' },
  EmailHash:      { name:  'email_hash' },
  WalletLocator:  { name:  'wallet_locator' },
  WalletSize:     { name:  'wallet_size' },
  MessageKey:     { name:  'message_key' },
  Domain:         { name:  'url', encoding: 'hex' },
  TransferRate:   { name:  'transfer_rate' },
  Signers:        { name:  'signers' }
}

function _requestAccountSettings(remote, account, callback) {
  remote.requestAccountInfo(account, function(err, info) {
    if (err) return callback(err);

    var data = info.account_data;

    var settings = {
      account: data.account,
      transfer_rate: 100
    }

    // Attach account flags
    for (var flagName in AccountRootFlags) {
      var flag = AccountRootFlags[flagName];
      settings[flag.name] = Boolean(data.Flags & flag.value);
    }

    // Attach account fields
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

exports.get = getSettings;

function getSettings($, req, res, next) {
  var remote = $.remote;

  var opts = {
    account: req.params.account
  }

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(opts.account)) {
      return res.json(400, { success: false, message: 'Parameter is not a valid Ripple address: account' });
    }

    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, callback);
  };

  function getAccountSettings(connected, callback) {
    if (!connected) {
      res.json(500, { success: false, message: 'No connection to rippled' });
    } else {
      _requestAccountSettings(remote, opts.account, callback);
    }
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
      return res.json(400, { success: false, message: 'Parameter is not a valid Ripple address: account' });
    }

    if (!opts.secret) {
      return res.json(400, { success: false, message: 'Parameter is not a valid Ripple secret: secret' });
    }

    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, callback);
  };

  function changeAccountSettings(connected, callback) {
    if (!connected) {
      return res.json(500, { success: false, message: 'Remote is not connected' });
    }

    var domain = Domain.create();

    domain.once('error', callback);

    domain.run(function() {
      var transaction = remote.transaction().accountSet(opts.account);

      transaction.secret(opts.secret);

      var FlagSet = {
        require_destination_tag: {
          unset: 'OptionalDestTag',
          set: 'RequireDestTag',
        },
        require_authorization: {
          unset: 'OptionalAuth',
          set: 'RequireAuth'
        },
        disallow_xrp: {
          unset: 'AllowXRP',
          set: 'DisallowXRP'
        }
      }

      // Set transaction flags
      for (var flagName in FlagSet) {
        if (!(flagName in opts)) continue;

        var flag = FlagSet[flagName];
        var value = opts[flagName];

        if (typeof value !== 'boolean') {
          return callback(new TypeError('Parameter is not boolean: ' + flagName));
        }

        transaction.setFlags(value ? flag.set : flag.unset);
      }

      // Set transaction fields
      for (var fieldName in AccountRootFields) {
        var field = AccountRootFields[fieldName];
        var value = opts[field.name];

        if (typeof value === 'undefined') continue;

        if (field.encoding === 'hex') {
          value = new Buffer(value).toString('hex');
        }

        transaction.tx_json[fieldName] = value;
      }

      transaction.submit(callback);
    });
  };

  function getAccountSettings(tx_res, callback) {
    _requestAccountSettings(remote, opts.account, function(err, settings) {
      if (err) return callback(err);

      var result = {
        settings: settings,
        hash: tx_res.transaction.hash,
        ledger: String(tx_res.ledger_index)
      }

      callback(null, result);
    });
  };

  var steps = [
    validateOptions,
    ensureConnected,
    changeAccountSettings,
    getAccountSettings
  ]

  async.waterfall(steps, function(err, settings) {
    if (err) {
      next(err);
    } else {
      res.json(200, settings);
    }
  });
};
