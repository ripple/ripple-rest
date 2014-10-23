var _ = require('lodash');

module.exports.VALID_TRANSACTION_HASH = 'F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF';
module.exports.INVALID_TRANSACTION_HASH = 'XF4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF';

module.exports.requestPath = function(address, params) {
  return '/v1/accounts/' + address + '/notifications' + ( params || '' );
};

var LEDGER = module.exports.LEDGER = 348860;

var TRANSACTION = module.exports.TRANSACTION = {
  Account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
  Amount: {
    currency: 'USD',
    issuer: 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH',
    value: '0.001'
  },
  Destination: 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH',
  Fee: '10',
  Flags: 0,
  Paths: [
    [
      {
    currency: 'USD',
    issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
    type: 48,
    type_hex: '0000000000000030'
  },
  {
    account: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
    currency: 'USD',
    issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
    type: 49,
    type_hex: '0000000000000031'
  }
  ]
  ],
  SendMax: '1112209',
  Sequence: 4,
  SigningPubKey: '02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D',
  TransactionType: 'Payment',
  TxnSignature: '304502204EE3E9D1B01D8959B08450FCA9E22025AF503DEF310E34A93863A85CAB3C0BC5022100B61F5B567F77026E8DEED89EED0B7CAF0E6C96C228A2A65216F0DC2D04D52083',
  date: 416447810,
  hash: 'F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
  inLedger: LEDGER,
  ledger_index: LEDGER
};

var METADATA = module.exports.METADATA = {
  AffectedNodes: [
    { ModifiedNode: {
      FinalFields: {
        Account: 'r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr',
        BookDirectory: '4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5E03E788E09BB000',
        BookNode: '0000000000000000',
        Flags: 0,
        OwnerNode: '0000000000000000',
        Sequence: 58,
        TakerGets: {
          currency: 'USD',
          issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
          value: '5.648998'
        },
        TakerPays: '6208248802'
      },
      LedgerEntryType: 'Offer',
      LedgerIndex: '3CFB3C79D4F1BDB1EE5245259372576D926D9A875713422F7169A6CC60AFA68B',
      PreviousFields: {
        TakerGets: {
          currency: 'USD',
          issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
          value: '5.65'
        },
        TakerPays: '6209350000'
      },
      PreviousTxnID: '8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4',
      PreviousTxnLgrSeq: LEDGER - 1
    }
  },
  { ModifiedNode: {
      FinalFields: {
        Balance: {
          currency: 'USD',
          issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
          value: '-0.001'
        },
        Flags: 131072,
        HighLimit: {
          currency: 'USD',
          issuer: 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH',
          value: '1'
        },
        HighNode: '0000000000000000',
        LowLimit: {
          currency: 'USD',
          issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
          value: '0'
        },
        LowNode: '0000000000000002'
      },
      LedgerEntryType: 'RippleState',
      LedgerIndex: '4BD1874F8F3A60EDB0C23F5BD43E07953C2B8741B226648310D113DE2B486F01',
      PreviousFields: {
        Balance: {
          currency: 'USD',
          issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
          value: '0'
        }
      },
      PreviousTxnID: '5B2006DAD0B3130F57ACF7CC5CCAC2EEBCD4B57AAA091A6FD0A24B073D08ABB8',
      PreviousTxnLgrSeq: LEDGER - 2
    }
  },
  { ModifiedNode: {
      FinalFields: {
        Account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
        Balance: '9998898762',
        Flags: 0,
        OwnerCount: 3,
        Sequence: 5
      },
      LedgerEntryType: 'AccountRoot',
      LedgerIndex: '4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05',
      PreviousFields: {
        Balance: '9999999970',
        Sequence: 4
      },
      PreviousTxnID: '53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8',
      PreviousTxnLgrSeq: LEDGER - 3
    }
  },
  { ModifiedNode: {
      FinalFields: {
        Account: 'r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr',
        Balance: '912695302618',
        Flags: 0,
        OwnerCount: 10,
        Sequence: 59
      },
      LedgerEntryType: 'AccountRoot',
      LedgerIndex: 'F3E119AAA87AF3607CF87F5523BB8278A83BCB4142833288305D767DD30C392A',
      PreviousFields: {
        Balance: '912694201420'
      },
      PreviousTxnID: '8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4',
      PreviousTxnLgrSeq: 348433
    }
  },
  { ModifiedNode: {
      FinalFields: {
        Balance: {
          currency: 'USD',
          issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
          value: '-5.5541638883365'
        },
        Flags: 131072,
        HighLimit: {
          currency: 'USD',
          issuer: 'r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr',
          value: '1000'
        },
        HighNode: '0000000000000000',
        LowLimit: {
          currency: 'USD',
          issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
          value: '0'
        },
        LowNode: '000000000000000C'
      },
      LedgerEntryType: 'RippleState',
      LedgerIndex: 'FA1255C2E0407F1945BCF9351257C7C5C28B0F5F09BB81C08D35A03E9F0136BC',
      PreviousFields: {
        Balance: {
          currency: 'USD',
          issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
          value: '-5.5551658883365'
        }
      },
      PreviousTxnID: '8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4',
      PreviousTxnLgrSeq: LEDGER - 4
    }
  }
  ],
  TransactionIndex: 0,
  TransactionResult: 'tesSUCCESS'
};

module.exports.transactionResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: _.extend({
      validated: true,
      meta: METADATA
    }, TRANSACTION)
  });
};

module.exports.transactionNotFoundResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'error',
    type: 'response',
    error: 'txnNotFound',
    error_code: 24,
    error_message: 'Transaction not found.',
    request: {
      command: 'tx',
      id: request.id,
      transaction: request.transaction
    }
  });
};

module.exports.serverInfoResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      info: {
        build_version: '0.24.0-rc1',
        complete_ledgers: '32570-6595042',
        hostid: 'ARTS',
        last_close: { converge_time_s: 2.007, proposers: 4 },
        load_factor: 1,
        peers: 53,
        pubkey_node: 'n94wWvFUmaKGYrKUGgpv1DyYgDeXRGdACkNQaSe7zJiy5Znio7UC',
        server_state: 'full',
        validated_ledger: {
          age: 5,
          base_fee_xrp: 0.00001,
          hash: '4482DEE5362332F54A4036ED57EE1767C9F33CF7CE5A6670355C16CECE381D46',
          reserve_base_xrp: 20,
          reserve_inc_xrp: 5,
          seq: 6595042
        },
        validation_quorum: 3
      }
    }
  });
};

module.exports.serverInfoMissingLedgerResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      info: {
        build_version: '0.24.0-rc1',
        complete_ledgers: '32570-' + (LEDGER - 1),
        hostid: 'ARTS',
        last_close: { converge_time_s: 2.007, proposers: 4 },
        load_factor: 1,
        peers: 53,
        pubkey_node: 'n94wWvFUmaKGYrKUGgpv1DyYgDeXRGdACkNQaSe7zJiy5Znio7UC',
        server_state: 'syncing',
        validated_ledger: {
          age: 5,
          base_fee_xrp: 0.00001,
          hash: '4482DEE5362332F54A4036ED57EE1767C9F33CF7CE5A6670355C16CECE381D46',
          reserve_base_xrp: 20,
          reserve_inc_xrp: 5,
          seq: 6595042
        },
        validation_quorum: 3
      }
    }
  });
};

module.exports.accountTxLedgerResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
      ledger_index_max: request.ledger_index_min,
      ledger_index_min: request.ledger_index_max,
      limit: request.limit,
      transactions: [
        {
          meta: METADATA,
          tx: TRANSACTION,
          validated: true
        }
      ]
    }
  });
};

module.exports.accountTxEmptyResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
      ledger_index_max: request.ledger_index_min,
      ledger_index_min: request.ledger_index_max,
      limit: request.limit,
      forward: request.forward,
      transactions: [ ]
    }
  });
};

module.exports.accountTxNextResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
      ledger_index_max: request.ledger_index_min,
      ledger_index_min: request.ledger_index_max,
      limit: request.limit,
      forward: request.forward,
      transactions: [
        {
          meta: METADATA,
          tx: _.extend({}, TRANSACTION, {
            hash: 'G4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
            inLedger: request.ledger_index_min + 2,
            ledger_index: request.ledger_index_min + 2
          }),
          validated: true
        }
      ]
    }
  });
};

module.exports.accountTxPreviousResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
      ledger_index_max: request.ledger_index_min,
      ledger_index_min: request.ledger_index_max,
      limit: request.limit,
      forward: request.forward,
      transactions: [
        {
          meta: METADATA,
          tx: _.extend({}, TRANSACTION, {
            hash: 'H4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
            inLedger: request.ledger_index_max - 2,
            ledger_index: request.ledger_index_max - 2
          }),
          validated: true
        }
      ]
    }
  });
};

module.exports.RESTNotificationResponse = JSON.stringify({
  success: true,
  notification: {
    account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
    type: 'payment',
    direction: 'outgoing',
    state: 'validated',
    result: 'tesSUCCESS',
    ledger: String(LEDGER),
    hash: 'F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
    timestamp: '2013-03-12T23:56:50.000Z',
    transaction_url: 'http://127.0.0.1:5990/v1/accounts/r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE/payments/F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
    previous_hash: 'H4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
    previous_notification_url: 'http://127.0.0.1:5990/v1/accounts/r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE/notifications/H4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
    next_hash: 'G4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
    next_notification_url: 'http://127.0.0.1:5990/v1/accounts/r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE/notifications/G4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF'
  }
});

module.exports.RESTNotificationNoNextResponse = JSON.stringify({
  success: true,
  notification: {
    account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
    type: 'payment',
    direction: 'outgoing',
    state: 'validated',
    result: 'tesSUCCESS',
    ledger: String(LEDGER),
    hash: 'F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
    timestamp: '2013-03-12T23:56:50.000Z',
    transaction_url: 'http://127.0.0.1:5990/v1/accounts/r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE/payments/F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
    previous_hash: 'H4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
    previous_notification_url: 'http://127.0.0.1:5990/v1/accounts/r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE/notifications/H4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
    next_notification_url: ''
  }
});

module.exports.RESTMissingLedgerResponse = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Cannot Get Notification',
  message: 'This transaction is not in the ripple\'s complete ledger set. Because there is a gap in the rippled\'s historical database it is not possible to determine the transactions that precede this one'
});
