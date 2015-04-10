'use strict';
var ripple = require('ripple-lib');

var AccountRootFlags = {
  PasswordSpent: {
    name: 'password_spent',
    value: ripple.Remote.flags.account_root.PasswordSpent
  },
  RequireDestTag: {
    name: 'require_destination_tag',
    value: ripple.Remote.flags.account_root.RequireDestTag
  },
  RequireAuth: {
    name: 'require_authorization',
    value: ripple.Remote.flags.account_root.RequireAuth
  },
  DisallowXRP: {
    name: 'disallow_xrp',
    value: ripple.Remote.flags.account_root.DisallowXRP
  },
  DisableMaster: {
    name: 'disable_master',
    value: ripple.Remote.flags.account_root.DisableMaster
  },
  NoFreeze: {
    name: 'no_freeze',
    value: ripple.Remote.flags.account_root.NoFreeze
  },
  GlobalFreeze: {
    name: 'global_freeze',
    value: ripple.Remote.flags.account_root.GlobalFreeze
  },
  DefaultRipple: {
    name: 'default_ripple',
    value: ripple.Remote.flags.account_root.DefaultRipple
  }
};

var AccountRootFields = {
  Sequence: {name: 'transaction_sequence'},
  EmailHash: {name: 'email_hash', encoding: 'hex', length: 32, defaults: '0'},
  WalletLocator: {name: 'wallet_locator', encoding: 'hex',
                  length: 64, defaults: '0'},
  WalletSize: {name: 'wallet_size', defaults: 0},
  MessageKey: {name: 'message_key'},
  Domain: {name: 'domain', encoding: 'hex'},
  TransferRate: {name: 'transfer_rate', defaults: 0},
  Signers: {name: 'signers'}
};

var AccountSetIntFlags = {
  NoFreeze: {name: 'no_freeze',
    value: ripple.Transaction.set_clear_flags.AccountSet.asfNoFreeze},
  GlobalFreeze: {name: 'global_freeze',
    value: ripple.Transaction.set_clear_flags.AccountSet.asfGlobalFreeze},
  DefaultRipple: {name: 'default_ripple',
    value: ripple.Transaction.set_clear_flags.AccountSet.asfDefaultRipple}
};

var AccountSetFlags = {
  RequireDestTag: {name: 'require_destination_tag', set: 'RequireDestTag',
                   unset: 'OptionalDestTag'},
  RequireAuth: {name: 'require_authorization', set: 'RequireAuth',
                unset: 'OptionalAuth'},
  DisallowXRP: {name: 'disallow_xrp', set: 'DisallowXRP', unset: 'AllowXRP'}
};

var AccountSetResponseFlags = {
  RequireDestTag: {name: 'require_destination_tag',
    value: ripple.Transaction.flags.AccountSet.RequireDestTag},
  RequireAuth: {name: 'require_authorization',
    value: ripple.Transaction.flags.AccountSet.RequireAuth},
  DisallowXRP: {name: 'disallow_xrp',
    value: ripple.Transaction.flags.AccountSet.DisallowXRP}
};

module.exports = {
  AccountRootFlags: AccountRootFlags,
  AccountRootFields: AccountRootFields,
  AccountSetIntFlags: AccountSetIntFlags,
  AccountSetFlags: AccountSetFlags,
  AccountSetResponseFlags: AccountSetResponseFlags
};
