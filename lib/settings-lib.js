var async     = require('async');
var ripple    = require('ripple-lib');
var serverLib = require('./server-lib');

var AccountRootFlags = {
  PasswordSpent:   0x00010000,
  RequireDestTag:  0x00020000,
  RequireAuth:     0x00040000,
  DisallowXRP:     0x00080000,
  DisableMaster:   0x00100000
}

var AccountRootFields = {
  EmailHash:      void(0),
  WalletLocator:  void(0),
  WalletSize:     void(0),
  MessageKey:     void(0),
  Domain:         'hex',
  TransferRate:   void(0),
  Signers:        void(0)
}

function getSettings(remote, opts, callback) {

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(opts.account)) {
      return callback(new Error('Parameter "account" is not a valid Ripple address'));
    }

    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, callback);
  };

  function getAccountSettings(connected, callback) {
    remote.requestAccountInfo(opts.account, function(err, info) {
      if (err) return callback(err);

      var settings = { };
      var data = info.account_data;

      for (var flag in AccountRootFlags) {
        settings[flag] = Boolean(data.Flags & AccountRootFlags[flag]);
      }

      for (var field in AccountRootFields) {
        if (!data.hasOwnProperty(field)) continue;

        var val = data[field];
        var type = AccountRootFields[field];

        switch (type) {
          case 'hex':
            val = new Buffer(val, 'hex').toString();
            break;
        }

        settings[field] = val;
      }

      callback(null, settings);
    });
  };

  var steps = [
    validateOptions,
    ensureConnected,
    getAccountSettings
  ]

  async.waterfall(steps, callback);
};

exports.getSettings = getSettings;

function changeSettings(remote, opts, callback) {

  function validateOptions(callback) {
    if (!ripple.UInt160.is_valid(opts.account)) {
      return callback(new Error('Parameter "account" is not a valid Ripple address'));
    }

    if (!opts.secret) {
      return callback(new Error('Parameter "secret" is not a valid Ripple secret'));
    }

    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, callback);
  };

  function changeAccountSettings(connected, callback) {
    var tx = remote.transaction().accountSet(opts.account);
    tx.secret(opts.secret);

    var FlagSet = {
      RequireDestTag:  { unset:  'OptionalDestTag' },
      RequireAuth:     { unset:  'OptionalAuth' },
      DisallowXRP:     { unset:  'AllowXRP' }
    }

    for (var flag in FlagSet) {
      if (!opts.hasOwnProperty(flag)) continue;
      if (typeof opts[flag] !== 'boolean') {
        return callback(new TypeError('Parameter "' + flag + '" is not boolean'));
      }
      if (opts[flag]) {
        //set
        tx.setFlags(flag);
      } else {
        //unset
        tx.setFlags(FlagSet[flag].unset);
      }
    }

    for (var field in AccountRootFields) {
      if (!opts.hasOwnProperty(field)) continue;
      if (AccountRootFields[field] === 'hex') {
        tx.tx_json[field] = new Buffer(opts[field]).toString('hex');
      } else {
        tx.tx_json[field] = opts[field];
      }
    }

    tx.submit(callback);
  };

  function getAccountSettings(setResult, callback) {
    exports.getSettings(remote, opts, callback);
  };

  var steps = [
    validateOptions,
    ensureConnected,
    changeAccountSettings,
    getAccountSettings
  ]

  async.waterfall(steps, callback);
};

exports.changeSettings = changeSettings;
