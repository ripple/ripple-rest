module.exports.requestPath = function(address, params) {
  return '/v1/accounts/' + address + '/settings' + ( params || '' );
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
        Flags: 655360,
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

module.exports.submitSettingsResponse = function(request, lastLedger) {
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
        Flags: 2147549184,
        clearFlag: 6,
        SetFlag: 7,
        LastLedgerSequence: lastLedger,
        Sequence: 2938,
        SigningPubKey: '02F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D8',
        TransactionType: 'AccountSet',
        TxnSignature: '3044022013ED8E41507111736B4C5EC9E4C01A7B570B273B3DE21302F72D4D1B1F20C4EF0220180C1419108CA39A9FF89E12810EC7429E28468E8D0BA61F793E14DB8D9FEA72',
        hash: 'AD922400CB1CE0876CA7203DBE0B1277D0D0EAC56A64F26CEC6C78D447EFEA5E'
      }
    }
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
    signers: ''
  }
});

module.exports.RESTAccountSettingsSubmitResponse = function(lastLedger) {
  return JSON.stringify({
    success: true,
    hash: 'AD922400CB1CE0876CA7203DBE0B1277D0D0EAC56A64F26CEC6C78D447EFEA5E',
    ledger: lastLedger.toString(),
    settings: {
      require_destination_tag: true,
      require_authorization: true,
      disallow_xrp: true,
      no_freeze: false,
      global_freeze: true,
      email_hash: '23463B99B62A72F26ED677CC556C44E8',
      wallet_locator: 'DEADBEEF',
      wallet_size: 1,
      domain: 'example.com',
      transfer_rate: 2
    }
  });
};

module.exports.RESTMissingSettingsResponse = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter missing: settings'
});

module.exports.RESTMissingSecretResponse = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter missing: secret'
});

module.exports.RESTInvalidDestTagResponse = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter must be a boolean: require_destination_tag'
});

module.exports.RESTInvalidDomainResponse = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter must be a string: domain'
});

module.exports.RESTInvalidTransferRateResponse = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter must be a number: transfer_rate'
});

module.exports.RESTInvalidFreezeResponse = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Unable to set/clear no_freeze and global_freeze'
});

