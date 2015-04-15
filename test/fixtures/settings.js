/* eslint-disable max-len */
'use strict';
var _ = require('lodash');
var addresses = require('./addresses');

var DEFAULTS = {
  require_destination_tag: true,
  require_authorization: true,
  disallow_xrp: true,
  domain: 'example.com',
  email_hash: '23463B99B62A72F26ED677CC556C44E8',
  wallet_locator: 'DEADBEEF',
  wallet_size: 1,
  transfer_rate: 2,
  no_freeze: false,
  global_freeze: true,
  last_ledger: 9903915,
  flags: -2146107392,
  hash: 'AD922400CB1CE0876CA7203DBE0B1277D0D0EAC56A64F26CEC6C78D447EFEA5E'
};

module.exports.requestPath = function(address, params) {
  return '/v1/accounts/' + address + '/settings' + (params || '');
};

module.exports.settings = function(options) {
  options = options || {};
  _.defaults(options, DEFAULTS);

  return options;
};

module.exports.accountInfoResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      account_data: {
        Account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
        Balance: '922913243',
        Domain: '6578616D706C652E636F6D',
        EmailHash: '23463B99B62A72F26ED677CC556C44E8',
        Flags: 9043968,
        LedgerEntryType: 'AccountRoot',
        OwnerCount: 1,
        PreviousTxnID: '19899273706A9E040FDB5885EE991A1DC2BAD878A0D6E7DBCFB714E63BF737F7',
        PreviousTxnLgrSeq: 6614625,
        Sequence: 2938,
        TransferRate: 1002000000,
        WalletLocator: '00000000000000000000000000000000000000000000000000000000DEADBEEF',
        index: '396400950EA27EB5710C0D5BE1D2B4689139F168AC5D07C13B8140EC3F82AE71',
        urlgravatar: 'http://www.gravatar.com/avatar/23463b99b62a72f26ed677cc556c44e8'
      },
      ledger_current_index: 6614628
    }
  });
};

module.exports.accountNotFoundResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'error',
    type: 'response',
    account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
    error: 'actNotFound',
    error_code: 15,
    error_message: 'Account not found.',
    ledger_current_index: 8941468,
    request: {
      account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
      command: 'account_info',
      id: request.id
    },
    validated: false
  });
};

module.exports.submitSettingsResponse = function(request, options) {
  options = options || {};
  _.defaults(options, DEFAULTS);

  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      engine_result: 'tesSUCCESS',
      engine_result_code: 0,
      engine_result_message: 'The transaction was applied.',
      tx_blob: request.tx_blob,
      tx_json: {
        Account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
        Fee: '12',
        Flags: options.flags,
        clearFlag: 6,
        SetFlag: 7,
        LastLedgerSequence: options.last_ledger,
        Sequence: 2938,
        SigningPubKey: '02F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D8',
        TransactionType: 'AccountSet',
        TxnSignature: '3044022013ED8E41507111736B4C5EC9E4C01A7B570B273B3DE21302F72D4D1B1F20C4EF0220180C1419108CA39A9FF89E12810EC7429E28468E8D0BA61F793E14DB8D9FEA72',
        hash: options.hash
      }
    }
  });
};

module.exports.settingsValidatedResponse = function(options) {
  options = options || {};
  _.defaults(options, DEFAULTS);

  return JSON.stringify({
    engine_result: 'tesSUCCESS',
    engine_result_code: 0,
    engine_result_message: 'The transaction was applied.',
    ledger_hash: 'F344F3ADB34FF3636B3A5D1005CFF613D24D5969BC646AF490C07B627BF3765D',
    ledger_index: 9903908,
    meta: {
      AffectedNodes: [
        {
          ModifiedNode: {
            FinalFields: {
              Account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
              Balance: '790495028',
              Flags: 0,
              OwnerCount: 5,
              Sequence: 19
            },
            LedgerEntryType: 'AccountRoot',
            LedgerIndex: '25FF5CC1037AE7E2C491A2E4C6206CBE31D0F1609B6426E6E8C3626BAC8C3439',
            PreviousFields: {
              Balance: '790495040',
              Sequence: 18
            },
            PreviousTxnID: 'A6023206583A66E5FFDE81B0E6BAEEF3E3FFFF906F370AD675B5BE4B7BB68C42',
            PreviousTxnLgrSeq: 9886121
          }
        }
      ],
      TransactionIndex: 10,
      TransactionResult: 'tesSUCCESS'
    },
    status: 'closed',
    transaction: {
      Account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
      Fee: '12',
      Flags: options.flags,
      LastLedgerSequence: options.last_ledger,
      Sequence: 18,
      SigningPubKey: '02F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D8',
      TransactionType: 'AccountSet',
      TxnSignature: '3044022013ED8E41507111736B4C5EC9E4C01A7B570B273B3DE21302F72D4D1B1F20C4EF0220180C1419108CA39A9FF89E12810EC7429E28468E8D0BA61F793E14DB8D9FEA72',
      hash: options.hash,
      date: 469144180
    },
    type: 'transaction',
    validated: true
  });
};

module.exports.ledgerSequenceTooHighResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    result: {
      engine_result: 'tefMAX_LEDGER',
      engine_result_code: -186,
      engine_result_message: 'Ledger sequence too high.',
      tx_blob: request.tx_blob,
      tx_json: {
        Account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
        Fee: '12',
        Flags: -2146107392,
        clearFlag: 6,
        SetFlag: 7,
        LastLedgerSequence: 8819963,
        Sequence: 2938,
        SigningPubKey: '02F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D8',
        TransactionType: 'AccountSet',
        TxnSignature: '3044022013ED8E41507111736B4C5EC9E4C01A7B570B273B3DE21302F72D4D1B1F20C4EF0220180C1419108CA39A9FF89E12810EC7429E28468E8D0BA61F793E14DB8D9FEA72',
        hash: 'AD922400CB1CE0876CA7203DBE0B1277D0D0EAC56A64F26CEC6C78D447EFEA5E'
      }
    },
    status: 'success',
    type: 'response'
  });
};

module.exports.RESTAccountSettingsResponse = JSON.stringify({
  success: true,
  settings: {
    account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
    transfer_rate: 1002000000,
    password_spent: false,
    require_destination_tag: true,
    require_authorization: false,
    disallow_xrp: true,
    disable_master: false,
    no_freeze: false,
    global_freeze: false,
    transaction_sequence: '2938',
    email_hash: '23463B99B62A72F26ED677CC556C44E8',
    wallet_locator: '00000000000000000000000000000000000000000000000000000000DEADBEEF',
    wallet_size: '',
    message_key: '',
    domain: 'example.com',
    signers: '',
    default_ripple: true
  }
});

module.exports.RESTAccountSettingsSubmitResponse = function(options) {
  options = options || {};
  _.defaults(options, DEFAULTS);

  return JSON.stringify({
    success: true,
    settings: {
      no_freeze: false,
      global_freeze: true,
      email_hash: '23463B99B62A72F26ED677CC556C44E8',
      wallet_locator: 'DEADBEEF',
      wallet_size: 1,
      domain: 'example.com',
      transfer_rate: 2,
      require_destination_tag: true,
      require_authorization: true,
      disallow_xrp: true
    },
    hash: 'AD922400CB1CE0876CA7203DBE0B1277D0D0EAC56A64F26CEC6C78D447EFEA5E',
    ledger: options.current_ledger.toString(),
    state: options.state
  });
};

module.exports.prepareSettingsRequest = {
  address: addresses.VALID,
  settings: {
    domain: 'ripple.com'
  },
  instructions: {
    lastLedgerOffset: 100
  }
};

module.exports.prepareSettingsResponse = JSON.stringify({
  success: true,
  tx_json: {
    Flags: 0,
    TransactionType: 'AccountSet',
    Account: addresses.VALID,
    Domain: '726970706C652E636F6D',
    LastLedgerSequence: 8820244,
    Fee: '12',
    Sequence: 2938
  }
});
