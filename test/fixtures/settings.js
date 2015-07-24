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
    transaction_sequence: '23',
    email_hash: '23463B99B62A72F26ED677CC556C44E8',
    wallet_locator: '00000000000000000000000000000000000000000000000000000000DEADBEEF',
    wallet_size: '',
    message_key: '',
    domain: 'example.com',
    signers: '',
    default_ripple: false
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
  secret: addresses.SECRET,
  settings: {
    domain: 'ripple.com'
  },
  last_ledger_offset: '100'
};

module.exports.prepareSettingsResponse = JSON.stringify({
  success: true,
  settings: {
    domain: 'ripple.com',
    require_destination_tag: false,
    require_authorization: false,
    disallow_xrp: false
  },
  tx_json: {
    Flags: 0,
    TransactionType: 'AccountSet',
    Account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
    Domain: '726970706C652E636F6D',
    LastLedgerSequence: 8820052,
    Fee: '12',
    Sequence: 23,
    SigningPubKey: '02F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D8',
    TxnSignature: '304402207660BDEF67105CE1EBA9AD35DC7156BAB43FF1D47633199EE257D70B6B9AAFBF02207F5517BC8AEF2ADC1325897ECDBA8C673838048BCA62F4E98B252F19BE88796D'
  },
  tx_blob: '12000322000000002400000017201B0086955468400000000000000C732102F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D87446304402207660BDEF67105CE1EBA9AD35DC7156BAB43FF1D47633199EE257D70B6B9AAFBF02207F5517BC8AEF2ADC1325897ECDBA8C673838048BCA62F4E98B252F19BE88796D770A726970706C652E636F6D81144FBFF73DA4ECF9B701940F27341FA8020C313443',
  hash: 'DB44C111583A95AF973A0B0A40348D90512FCBCDDCA3315A286D2BF4FAC100F1'
});
