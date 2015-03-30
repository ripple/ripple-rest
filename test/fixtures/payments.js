var _ = require('lodash');
var addresses = require('./../fixtures').addresses;
var paths = require('./paths');
var SerializedObject = require('ripple-lib').SerializedObject;

var fromAccount   = addresses.VALID;
var fromSecret    = addresses.SECRET;
var toAccount     = addresses.COUNTERPARTY;
var issuerAccount = addresses.ISSUER;

module.exports.VALID_TRANSACTION_HASH = '22F45FBD4DFDE03CF5AED05F3F858C06E9206D07098E469363F9D48D9D019589';
module.exports.VALID_TRANSACTION_HASH_MEMO = 'F9DE78E635A418529A5104A56439F305CE7C42B9F29180F05D77326B9ACD1D33';
module.exports.INVALID_TRANSACTION_HASH = 'XF4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF';
module.exports.VALID_SUBMITTED_TRANSACTION_HASH = '797A79F825CC5E5149D16D05960457A2E1C21484B41D8C80312601B39227ACE9';

var METADATA = module.exports.METADATA = {
  AffectedNodes: [
    {
      ModifiedNode: {
        FinalFields: {
          Account: fromAccount,
          BookDirectory: '4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5E03E788E09BB000',
          BookNode: '0000000000000000',
          Flags: 0,
          OwnerNode: '0000000000000000',
          Sequence: 58,
          TakerGets: {
            currency: 'USD',
            issuer: addresses.COUNTERPARTY,
            value: '5.648998'
          },
          TakerPays: '6208248802'
        },
        LedgerEntryType: 'Offer',
        LedgerIndex: '3CFB3C79D4F1BDB1EE5245259372576D926D9A875713422F7169A6CC60AFA68B',
        PreviousFields: {
          TakerGets: {
            currency: 'USD',
            issuer: addresses.COUNTERPARTY,
            value: '5.65'
          },
          TakerPays: '6209350000'
        },
        PreviousTxnID: '8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4',
        PreviousTxnLgrSeq: 348433
      }
    },
    {
      ModifiedNode: {
        FinalFields: {
          Balance: {
            currency: 'USD',
            issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
            value: '-0.001'
          },
          Flags: 131072,
          HighLimit: {
            currency: 'USD',
            issuer: addresses.ISSUER,
            value: '1'
          },
          HighNode: '0000000000000000',
          LowLimit: {
            currency: 'USD',
            issuer: addresses.COUNTERPARTY,
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
        PreviousTxnLgrSeq: 343703
      }
    },
    {
      ModifiedNode: {
        FinalFields: {
          Account: addresses.VALID,
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
        PreviousTxnLgrSeq: 343570
      }
    },
    {
      ModifiedNode: {
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
    {
      ModifiedNode: {
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
            issuer: addresses.COUNTERPARTY,
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
        PreviousTxnLgrSeq: 348433
      }
    }
  ],
  TransactionIndex: 0,
  TransactionResult: 'tesSUCCESS'
};

module.exports.binaryTransactionSynth = function (options) {
  return {
    date: 416447810,
    hash: options.hash,
    inLedger: 348860,
    ledger_index: 348860,
    validated: true
  };
};

module.exports.binaryTransaction = function (options) {
  options = options || {};
  _.defaults(options, {
    memos: []
  });

  return {
    Account: fromAccount,
    Amount: {
      currency: 'USD',
      issuer: addresses.ISSUER,
      value: '0.001'
    },
    Destination: addresses.ISSUER,
    Fee: '10',
    Flags: 0,
    Memos: options.memos,
    Paths: [
      [
        {
          currency: 'USD',
          issuer: addresses.COUNTERPARTY,
          type: 48,
          type_hex: '0000000000000030'
        },
        {
          account: addresses.COUNTERPARTY,
          currency: 'USD',
          issuer: addresses.COUNTERPARTY,
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
  };
};

module.exports.requestPath = function(address, params) {
  return '/v1/accounts/' + address + '/payments' + ( params || '' );
};

module.exports.accountTransactionsResponse = function(request, options) {
  options = options || {};
  _.defaults(options, {
    memos: [],
    hash: module.exports.VALID_TRANSACTION_HASH
  });

  var tx = {
    Account: fromAccount,
    Amount: {
      currency: 'USD',
      issuer: addresses.ISSUER,
      value: '0.001'
    },
    Destination: addresses.ISSUER,
    Fee: '10',
    Flags: 0,
    Memos: options.memos,
    Paths: [
      [
        {
          currency: 'USD',
          issuer: addresses.COUNTERPARTY,
          type: 48,
          type_hex: '0000000000000030'
        },
        {
          account: addresses.COUNTERPARTY,
          currency: 'USD',
          issuer: addresses.COUNTERPARTY,
          type: 49,
          type_hex: '0000000000000031'
        }
      ] 
    ],
    SendMax: '1112209',
    Sequence: 4,
    SigningPubKey: '02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D',
    TransactionType: 'Payment',
    TxnSignature: '304502204EE3E9D1B01D8959B08450FCA9E22025AF503DEF310E34A93863A85CAB3C0BC5022100B61F5B567F77026E8DEED89EED0B7CAF0E6C96C228A2A65216F0DC2D04D52083'
  };

  var meta = {
    AffectedNodes: [
      {
        ModifiedNode: {
          FinalFields: {
            Account: fromAccount,
            BookDirectory: '4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5E03E788E09BB000',
            BookNode: '0000000000000000',
            Flags: 0,
            OwnerNode: '0000000000000000',
            Sequence: 58,
            TakerGets: {
              currency: 'USD',
              issuer: addresses.COUNTERPARTY,
              value: '5.648998'
            },
            TakerPays: '6208248802'
          },
          LedgerEntryType: 'Offer',
          LedgerIndex: '3CFB3C79D4F1BDB1EE5245259372576D926D9A875713422F7169A6CC60AFA68B',
          PreviousFields: {
            TakerGets: {
              currency: 'USD',
              issuer: addresses.COUNTERPARTY,
              value: '5.65'
            },
            TakerPays: '6209350000'
          },
          PreviousTxnID: '8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4',
          PreviousTxnLgrSeq: 348433
        }
      },
      {
        ModifiedNode: {
          FinalFields: {
            Balance: {
              currency: 'USD',
              issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
              value: '-0.001'
            },
            Flags: 131072,
            HighLimit: {
              currency: 'USD',
              issuer: addresses.ISSUER,
              value: '1'
            },
            HighNode: '0000000000000000',
            LowLimit: {
              currency: 'USD',
              issuer: addresses.COUNTERPARTY,
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
          PreviousTxnLgrSeq: 343703
        }
      },
      {
        ModifiedNode: {
          FinalFields: {
            Account: addresses.VALID,
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
          PreviousTxnLgrSeq: 343570
        }
      },
      {
        ModifiedNode: {
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
      {
        ModifiedNode: {
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
              issuer: addresses.COUNTERPARTY,
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
          PreviousTxnLgrSeq: 348433
        }
      }
    ],
    TransactionIndex: 0,
    TransactionResult: 'tesSUCCESS'
  };

  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      transactions: [
        {
          ledger_index: 348860,
          tx_blob: SerializedObject.from_json(tx).to_hex(),
          meta: SerializedObject.from_json(meta).to_hex(),
          validated: true
        }
      ]
    }
  });
};

module.exports.transactionResponse = function(request, options) {
  options = options || {};
  _.defaults(options, {
    memos: [],
    hash: module.exports.VALID_TRANSACTION_HASH
  });

  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: _.extend({
      meta: SerializedObject.from_json(METADATA).to_hex(),
      tx: SerializedObject.from_json(module.exports.binaryTransaction(options)).to_hex()
    }, module.exports.binaryTransactionSynth(options))
  });
};

module.exports.ledgerResponse = function(request) {
  return JSON.stringify(
    {
      id: request.id,
      status: 'success',
      type: 'response',
      result: {
        ledger: {
          accepted: true,
          account_hash: 'EC028EC32896D537ECCA18D18BEBE6AE99709FEFF9EF72DBD3A7819E918D8B96',
          close_time: 464908910,
          close_time_human: '2014-Sep-24 21:21:50',
          close_time_resolution: 10,
          closed: true,
          hash: '0F7ED9F40742D8A513AE86029462B7A6768325583DF8EE21B7EC663019DD6A0F',
          ledger_hash: '0F7ED9F40742D8A513AE86029462B7A6768325583DF8EE21B7EC663019DD6A0F',
          ledger_index: '9038214',
          parent_hash: '4BB9CBE44C39DC67A1BE849C7467FE1A6D1F73949EA163C38A0121A15E04FFDE',
          seqNum: '9038214',
          totalCoins: '99999973964317514',
          total_coins: '99999973964317514',
          transaction_hash: 'ECB730839EB55B1B114D5D1AD2CD9A932C35BA9AB6D3A8C2F08935EAC2BAC239'
        }
      }
    }
  );
};

module.exports.RESTTransactionResponse = function(options) {
  options = options || {};

  _.defaults(options, {
    memos: undefined,
    hash: module.exports.VALID_TRANSACTION_HASH,
    fromAccount: fromAccount,
    toAccount: issuerAccount,
    fee: '0.00001',
    ledger: '348860',
    client_resource_id: ''
  });

  return JSON.stringify({
    success: true,
    payment: {
      source_account: options.fromAccount,
      source_tag: '',
      source_amount: {
        value: '1.112209',
        currency: 'XRP',
        issuer: ''
      },
      source_slippage: '0',
      destination_account: options.toAccount,
      destination_tag: '',
      destination_amount: {
        currency: 'USD',
        issuer: options.toAccount,
        value: '0.001'
      },
      invoice_id: '',
      paths: '[[{"currency":"USD","issuer":"' + addresses.COUNTERPARTY + '","type":48,"type_hex":"0000000000000030"},{"account":"' + addresses.COUNTERPARTY + '","currency":"USD","issuer":"' + addresses.COUNTERPARTY + '","type":49,"type_hex":"0000000000000031"}]]',
      no_direct_ripple: false,
      partial_payment: false,
      direction: 'outgoing',
      result: 'tesSUCCESS',
      timestamp: '2013-03-12T23:56:50.000Z',
      fee: options.fee,
      balance_changes: [
        {
          currency: 'XRP',
          value: '-1.101208',
          issuer: ''
        }
      ],
      source_balance_changes: [
        {
          value: '-1.101208',
          currency: 'XRP',
          issuer: ''
        }
      ],
      destination_balance_changes: [
        {
          value: '0.001',
          currency: 'USD',
          issuer: addresses.COUNTERPARTY
        }
      ],
      order_changes: [
        {
          taker_pays: { currency: 'XRP', issuer: '', value: '-1.101198' },
          taker_gets:
          { currency: 'USD',
            issuer: addresses.COUNTERPARTY,
            value: '-0.001002' },
          sequence: 58,
            status: 'open' }
        ],
      memos: options.memos
    },
    client_resource_id: options.client_resource_id,
    hash: options.hash,
    ledger: options.ledger,
    state: 'validated'
  });
};

module.exports.RESTAccountTransactionsResponse = function(options) {
  options = options || {};
  _.defaults(options, {
    memos: undefined,
    hash: module.exports.VALID_TRANSACTION_HASH,
    fromAccount: fromAccount,
    toAccount: issuerAccount,
    fee: '0.00001',
    ledger: '348860',
    client_resource_id: ''
  });

  return JSON.stringify({
    success: true,
    payments: [
      {
        payment: {
          source_account: options.fromAccount,
          source_tag: '',
          source_amount: {
            value: '1.112209',
            currency: 'XRP',
            issuer: ''
          },
          source_slippage: '0',
          destination_account: options.toAccount,
          destination_tag: '',
          destination_amount: {
            currency: 'USD',
            issuer: options.toAccount,
            value: '0.001'
          },
          invoice_id: '',
          paths: '[[{"currency":"USD","issuer":"' + addresses.COUNTERPARTY + '","type":48,"type_hex":"0000000000000030"},{"account":"' + addresses.COUNTERPARTY + '","currency":"USD","issuer":"' + addresses.COUNTERPARTY + '","type":49,"type_hex":"0000000000000031"}]]',
          no_direct_ripple: false,
          partial_payment: false,
          direction: 'outgoing',
          result: 'tesSUCCESS',
          timestamp: '2014-09-24T21:21:50.000Z',
          fee: options.fee,
          balance_changes: [
            {
              currency: 'XRP',
              value: '-1.101208',
              issuer: ''
            }
          ],
          source_balance_changes: [
            {
              value: '-1.101208',
              currency: 'XRP',
              issuer: ''
            }
          ],
          destination_balance_changes: [
            {
              value: '0.001',
              currency: 'USD',
              issuer: addresses.COUNTERPARTY
            }
          ],
          order_changes: [
            { taker_pays: { currency: 'XRP', issuer: '', value: '-1.101198' },
              taker_gets:
              { currency: 'USD',
                issuer: addresses.COUNTERPARTY,
                value: '-0.001002' },
              sequence: 58,
              status: 'open'
            }
          ],
          memos: options.memos
        },
        client_resource_id: options.client_resource_id,
        hash: options.hash,
        ledger: options.ledger,
        state: 'validated'
      }
    ]
  });
};

module.exports.RESTTransactionResponseComplexCurrencies = function(options) {
  options = options || {};
  _.defaults(options, {
    memos: undefined,
    hash: module.exports.VALID_TRANSACTION_HASH,
    ledger: '10151421',
    client_resource_id: ''
  });

  return JSON.stringify({
    success: true,
    payment: {
      source_account: addresses.VALID,
      source_tag: '',
      source_amount: {
        currency: '0158415500000000C1F76FF6ECB0BAC600000000',
        issuer: addresses.COUNTERPARTY,
        value: '0.00000001'
      },
      source_slippage: '0',
      destination_account: addresses.COUNTERPARTY,
      destination_tag: '',
      destination_amount: {
        currency: '0158415500000000C1F76FF6ECB0BAC600000000',
        issuer: addresses.COUNTERPARTY,
        value: '0.00000001'
      },
      invoice_id: '',
      paths: '[]',
      no_direct_ripple: false,
      partial_payment: false,
      direction: 'outgoing',
      result: 'tesSUCCESS',
      timestamp: '2014-11-25T21:03:00.000Z',
      fee: '0.012',
      balance_changes: [
        {
          currency: 'XRP',
          value: '-0.012',
          issuer: ''
        },
        {
          currency: '0158415500000000C1F76FF6ECB0BAC600000000',
          value: '-1e-8',
          issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        }
      ],
      source_balance_changes: [
        {
          value: '-0.012',
          currency: 'XRP',
          issuer: ''
        },
        {
          value: '-1e-8',
          currency: '0158415500000000C1F76FF6ECB0BAC600000000',
          issuer: addresses.COUNTERPARTY
        }
      ],
      destination_balance_changes: [
        {
          value: '1e-8',
          currency: '0158415500000000C1F76FF6ECB0BAC600000000',
          issuer: addresses.VALID
        }
      ],
      order_changes: []
    },
    client_resource_id: options.client_resource_id,
    hash: options.hash,
    ledger: options.ledger,
    state: 'validated',
  });
};

module.exports.payment = function(options) {
  options = options || {};
  _.defaults(options, {
    secret: addresses.SECRET,
    clientResourceId: '1',
    value: '1',
    currency: 'XRP',
    issuer: '',
    sourceAccount: addresses.VALID,
    destinationAccount: addresses.COUNTERPARTY
  });

  return {
    secret: options.secret,
    client_resource_id: options.clientResourceId,
    fixed_fee: options.fixed_fee ? String(options.fixed_fee) : undefined,
    max_fee: options.max_fee ? String(options.max_fee) : undefined,
    last_ledger_sequence: options.lastLedgerSequence,
    payment: {
      source_account: options.sourceAccount,
      destination_account: options.destinationAccount,
      destination_amount: {
        value: options.value,
        currency: options.currency,
        issuer: options.issuer
      },
      memos: options.memos
    }
  };
};

module.exports.accountInfoResponse = function(request) {
  return JSON.stringify(
    {
      id: request.id,
      status: 'success',
      type: 'response',
      result: {
        account_data: {
          Account: fromAccount,
          Balance: '30999545',
          Flags: 0,
          LedgerEntryType: 'AccountRoot',
          OwnerCount: 2,
          PreviousTxnID: '272B581E78B8FA3F532A89C506901F7F6625683BEA280FFB8E3B90E29A837E94',
          PreviousTxnLgrSeq: 9036179,
          Sequence: 23,
          index: '819EBB8946A3FF55FBFFE32F3AD429F866B5E5AADC253796E3E068E51D22F569'
        },
        ledger_current_index: 9036069,
        validated: false
      }
    }
  );
};

module.exports.requestSubmitResponse = function(request, options) {
  options = options || {};
  _.defaults(options, {
    LastLedgerSequence: 9036180,
    fee: '12',
    hash: module.exports.VALID_SUBMITTED_TRANSACTION_HASH
  });

  return JSON.stringify(
    {
      id: request.id,
      status: 'success',
      type: 'response',
      result: {
        engine_result: 'tesSUCCESS',
        engine_result_code: 0,
        engine_result_message: 'The transaction was applied.',
        tx_blob: '12000022000000002400000017201B0089E19461400000000000006468400000000000000C7321029A98439AF7459E256D64635598E8B21047807E6B5E6BEE3A3CCF35DEAD2C2C55744630440220688EDB9DC23AEB60A46DDFCC496B4EFCFB1D2432DC9636E2B88F8462FAAE3C4D022005A8EEC4A60AA34B778089EE7BA4622A3D2F18F9B8A05F9EE6709CB2C1FC89968114A69FF8D7778091B9F273549766DD6C063D984B5F83143DD06317D19C6110CAFF150AE528F58843BE2CA1',
        tx_json: {
          Account: fromAccount,
          Amount: '100',
          Destination: toAccount,
          Fee: options.fee,
          Flags: 0,
          LastLedgerSequence: options.LastLedgerSequence,
          Sequence: 23,
          SigningPubKey: '029A98439AF7459E256D64635598E8B21047807E6B5E6BEE3A3CCF35DEAD2C2C55',
          TransactionType: 'Payment',
          TxnSignature: '30440220688EDB9DC23AEB60A46DDFCC496B4EFCFB1D2432DC9636E2B88F8462FAAE3C4D022005A8EEC4A60AA34B778089EE7BA4622A3D2F18F9B8A05F9EE6709CB2C1FC8996',
          hash: options.hash
        }
      }
    }
  );
};

module.exports.rippledSuccessResponse = function(request, options) {
  options = options || {};
  _.defaults(options, {
    LastLedgerSequence: 9036180,
    Fee: '12',
    hash: module.exports.VALID_SUBMITTED_TRANSACTION_HASH
  });

  return JSON.stringify(
    {
      engine_result: 'tesSUCCESS',
      engine_result_code: 0,
      engine_result_message: 'The transaction was applied.',
      ledger_hash: 'A7DB52A124E7D20C293EC37FD897DBB965480D7BA039A1F7500C761F8FA613E8',
      ledger_index: 9907427,
      meta: {
      AffectedNodes: [
        {
          ModifiedNode: {
            FinalFields: {
              Account: toAccount,
              Balance: '38917451',
              Flags: 0,
              OwnerCount: 3,
              Sequence: 15
            },
            LedgerEntryType: 'AccountRoot',
            LedgerIndex: '232B144A8867993B74B65354DFBF94A7E91CDD2AB645E0CDD1C85C953E883D91',
            PreviousFields: {
              Balance: '38917450'
            },
            PreviousTxnID: '64E8F8D87E96F01850C5F0092A95FED8B199D70E8E61562BF9C52DE768387466',
            PreviousTxnLgrSeq: 9907416
          }
        },
        {
          ModifiedNode: {
            FinalFields: {
              Account: fromAccount,
              Balance: '34862528',
              Flags: 0,
              OwnerCount: 1,
              Sequence: 242
            },
            LedgerEntryType: 'AccountRoot',
            LedgerIndex: '2BC3AC309793910D16A3CEA95D5514448C6884765E82C2BA29FA6D6692B4F90A',
            PreviousFields: {
              Balance: '34862541',
              Sequence: 241
            },
            PreviousTxnID: '64E8F8D87E96F01850C5F0092A95FED8B199D70E8E61562BF9C52DE768387466',
            PreviousTxnLgrSeq: 9907416
          }
        }
      ],
        TransactionIndex: 3,
        TransactionResult: 'tesSUCCESS'
    },
      status: 'closed',
      transaction: {
      Account: fromAccount,
        Amount: '1',
        Destination: toAccount,
        Fee: options.Fee,
        Flags: 2147483648,
        LastLedgerSequence: options.LastLedgerSequence,
        Sequence: 241,
        SigningPubKey: '03D642E6457B8AB4D140E2C66EB4C484FAFB1BF267CB578EC4815FE6CD06379C51',
        TransactionType: 'Payment',
        TxnSignature: '30450221008D77CF76ECF30DEF6C882C1E84E668E87EB03FC3B066A696A6B179579CABE36202205E0B3CF18A5101C52BDAEC6B480FAE4324886249FE019EC80597E668D2805546',
        date: 469160470,
        hash: options.hash
    },
      type: 'transaction',
      validated: true
    }
  );
};

module.exports.rippledSubmitErrorResponse = function(request, options) {
  options = options || {};
  _.defaults(options, {
    LastLedgerSequence: 9036180,
    Fee: '12',
    amount: '1',
    hash: module.exports.VALID_SUBMITTED_TRANSACTION_HASH
  });

  return JSON.stringify(
    {
      id: request.id,
      result: {
        engine_result: options.engineResult,
        engine_result_code: options.engineResultCode,
        engine_result_message: options.engineResultMessage,
        tx_blob: '120000228000000024000000EC201B00971A5861400000000000000168400000000000000C732103D642E6457B8AB4D140E2C66EB4C484FAFB1BF267CB578EC4815FE6CD06379C5174463044022037A4D233ADA7604BCB329C9A254FA29269627B1C327FB39438724F2262F80DAA02202A8DA1B670BE0AB5D8606170E62C4364F1F0A2FC43392DAEE6A64043DC7716FE811426C4CFB3BD05A9AA23936F2E81634C66A9820C948314B92881442877D9FEEFB3190D6B33F731677B5710',
        tx_json: {
          Account: fromAccount,
          Amount: options.amount,
          Destination: toAccount,
          Fee: options.Fee,
          Flags: 2147483648,
          LastLedgerSequence: options.LastLedgerSequence,
          Sequence: 236,
          SigningPubKey: '03D642E6457B8AB4D140E2C66EB4C484FAFB1BF267CB578EC4815FE6CD06379C51',
          TransactionType: 'Payment',
          TxnSignature: '3044022037A4D233ADA7604BCB329C9A254FA29269627B1C327FB39438724F2262F80DAA02202A8DA1B670BE0AB5D8606170E62C4364F1F0A2FC43392DAEE6A64043DC7716FE',
          hash: options.hash
        }
      },
      status: 'success',
      type: 'response'
    }
  );
};

module.exports.rippledSubscribeRequest = function(request, lastLedger) {
  return JSON.stringify({
    id: request.id,
    command: 'subscribe',
    accounts: [
      fromAccount
    ]
  });
};

module.exports.rippledSubcribeResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    result: {},
    status: 'success',
    type: 'response'
  });
};

module.exports.rippledValidatedErrorResponse = function(request, options) {
  options = options || {};
  _.defaults(options, {
    LastLedgerSequence: 9036180,
    Fee: '12',
    amount: '1'
  });

  return JSON.stringify(
    {
      engine_result: options.engineResult,
      engine_result_code: options.engineResultCode,
      engine_result_message: options.engineResultMessage,
      ledger_hash: 'D797D779B29900F1ABA65BBCFB18A5675ED8B0B877DDB42983D3250F8280E8BE',
      ledger_index: 9902672,
      meta: {
        AffectedNodes: [
          {
            ModifiedNode: {
              FinalFields: {
                Account: fromAccount,
                Balance: '34862592',
                Flags: 0,
                OwnerCount: 1,
                Sequence: 237
              },
              LedgerEntryType: 'AccountRoot',
              LedgerIndex: '2BC3AC309793910D16A3CEA95D5514448C6884765E82C2BA29FA6D6692B4F90A',
              PreviousFields: {
                Balance: '34862604',
                Sequence: 236
              },
              PreviousTxnID: 'D588A6353D01EF0A8E5E5B1153838D05061D0B332AA8BB85F5C2127215725F91',
              PreviousTxnLgrSeq: 9902649
            }
          }
        ],
        TransactionIndex: 1,
        TransactionResult: options.engineResult
      },
      status: 'closed',
      transaction: {
        Account: fromAccount,
        Amount: options.amount,
        Destination: toAccount,
        Fee: options.Fee,
        Flags: 2147483648,
        LastLedgerSequence: options.LastLedgerSequence,
        Sequence: 236,
        SigningPubKey: '03D642E6457B8AB4D140E2C66EB4C484FAFB1BF267CB578EC4815FE6CD06379C51',
        TransactionType: 'Payment',
        TxnSignature: '3044022037A4D233ADA7604BCB329C9A254FA29269627B1C327FB39438724F2262F80DAA02202A8DA1B670BE0AB5D8606170E62C4364F1F0A2FC43392DAEE6A64043DC7716FE',
        date: 469138400,
        hash: options.hash
      },
      type: 'transaction',
      validated: true
    }
  );
};

module.exports.ledgerSequenceTooHighResponse = function(request, lastLedgerSequence) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      engine_result: 'tefMAX_LEDGER',
      engine_result_code: -186,
      engine_result_message: 'Ledger sequence too high.',
      tx_blob: '12000322000000002400000043201B0000000168400000000000000F732102AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D374463044022030177B57C6848DBABD9993F1480AC4CAEA04911FF0C6C0ED40484D10A7FA5FC0022073AD09CAFF94CB23821DF9B5915A47A7370178743279D3D676592F35F3A65F5B8114E81DCB25DAA1DDEFF45145D334C56F12EA63C337',
      tx_json: {
        Account: fromAccount,
        Fee: '15',
        Flags: 0,
        LastLedgerSequence: lastLedgerSequence,
        Sequence: 67,
        SigningPubKey: '02AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3',
        TransactionType: 'AccountSet',
        TxnSignature: '3044022030177B57C6848DBABD9993F1480AC4CAEA04911FF0C6C0ED40484D10A7FA5FC0022073AD09CAFF94CB23821DF9B5915A47A7370178743279D3D676592F35F3A65F5B',
        hash: '6A171B18021FC45116B72FC80D82B234B1513EDD58DFFCE0E60CC8722A980E08'
      }
    }
  });
};

module.exports.destinationTagNeededResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    result: {
      engine_result: 'tefDST_TAG_NEEDED',
      engine_result_code: -193,
      engine_result_message: 'Destination tag required.',
      tx_blob: '1200002280000000240000004A201B00968D5B61D4838D7EA4C6800000000000000000000000000055534400000000000A20B3C85F482532A9578DBB3950B85CA06594D168400000000000000C69D3C9A10B165530C70000000000000000000000004254430000000000E81DCB25DAA1DDEFF45145D334C56F12EA63C337732102AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3744730450221009723AA02F9385CFD89C1B08CC8A03FE362F1A33431C8800EEE81D45A131E64AD02203B61F5B88F6B0B1CDF0EF991161535B7A3C3CBA0F9E716A07FF4BA0E4613152A8114E81DCB25DAA1DDEFF45145D334C56F12EA63C33783140A20B3C85F482532A9578DBB3950B85CA06594D10112010A20B3C85F482532A9578DBB3950B85CA06594D13000000000000000000000000055534400000000000A20B3C85F482532A9578DBB3950B85CA06594D1FF010A20B3C85F482532A9578DBB3950B85CA06594D11000000000000000000000000000000000000000003000000000000000000000000055534400000000000A20B3C85F482532A9578DBB3950B85CA06594D1FF01DD39C650A96EDA48334E70CC4A85B8B2E8502CD31000000000000000000000000000000000000000003000000000000000000000000055534400000000000A20B3C85F482532A9578DBB3950B85CA06594D1FF01DD39C650A96EDA48334E70CC4A85B8B2E8502CD33000000000000000000000000055534400000000000A20B3C85F482532A9578DBB3950B85CA06594D100',
      tx_json: {
        Account: fromAccount,
        Amount: {
          currency: 'USD',
          issuer: toAccount,
          value: '1'
        },
        Destination: toAccount,
        Fee: '12',
        Flags: 2147483648,
        LastLedgerSequence: 9866587,
        Paths: [
          [
            {
              account: toAccount,
              type: 1,
              type_hex: '0000000000000001'
            },
            {
              currency: 'USD',
              issuer: toAccount,
              type: 48,
              type_hex: '0000000000000030'
            }
          ],
          [
            {
              account: toAccount,
              type: 1,
              type_hex: '0000000000000001'
            },
            {
              currency: 'XRP',
              type: 16,
              type_hex: '0000000000000010'
            },
            {
              currency: 'USD',
              issuer: toAccount,
              type: 48,
              type_hex: '0000000000000030'
            }
          ],
          [
            {
              account: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
              type: 1,
              type_hex: '0000000000000001'
            },
            {
              currency: 'XRP',
              type: 16,
              type_hex: '0000000000000010'
            },
            {
              currency: 'USD',
              issuer: toAccount,
              type: 48,
              type_hex: '0000000000000030'
            }
          ],
          [
            {
              account: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
              type: 1,
              type_hex: '0000000000000001'
            },
            {
              currency: 'USD',
              issuer: toAccount,
              type: 48,
              type_hex: '0000000000000030'
            }
          ]
        ],
        SendMax: {
          currency: 'BTC',
          issuer: fromAccount,
          value: '0.002710343781789895'
        },
        Sequence: 74,
        SigningPubKey: '02AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3',
        TransactionType: 'Payment',
        TxnSignature: '30450221009723AA02F9385CFD89C1B08CC8A03FE362F1A33431C8800EEE81D45A131E64AD02203B61F5B88F6B0B1CDF0EF991161535B7A3C3CBA0F9E716A07FF4BA0E4613152A',
        hash: module.exports.VALID_SUBMITTED_TRANSACTION_HASH
      }
    },
    status: 'success',
    type: 'response'
  });
};

module.exports.transactionVerifiedResponse = function(options) {
  options = options || {};
  _.defaults(options, {
    fee: '10',
    hash: module.exports.VALID_SUBMITTED_TRANSACTION_HASH,
    ledger: '34886'
  });

  return JSON.stringify(
    {
      engine_result: 'tesSUCCESS',
      engine_result_code: 0,
      engine_result_message: 'The transaction was applied.',
      ledger_hash: 'F7D1AFD4B7F9F895A4720ADC612A7D6D87FAE94BAD86EB55C2951C7D311D6F94',
      ledger_index: options.ledger,
      status: 'closed',
      meta: {
        AffectedNodes: [
          {
          ModifiedNode: {
            FinalFields: {
              Account: fromAccount,
              BookDirectory: '4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5E03E788E09BB000',
              BookNode: '0000000000000000',
              Flags: 0,
              OwnerNode: '0000000000000000',
              Sequence: 58,
              TakerGets: {
                currency: 'USD',
                issuer: addresses.COUNTERPARTY,
                value: '5.648998'
              },
              TakerPays: '6208248802'
            },
            LedgerEntryType: 'Offer',
            LedgerIndex: '3CFB3C79D4F1BDB1EE5245259372576D926D9A875713422F7169A6CC60AFA68B',
            PreviousFields: {
              TakerGets: {
                currency: 'USD',
                issuer: addresses.COUNTERPARTY,
                value: '5.65'
              },
              TakerPays: '6209350000'
            },
            PreviousTxnID: '8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4',
            PreviousTxnLgrSeq: 348433
          }
        },
        {
          ModifiedNode: {
            FinalFields: {
              Balance: {
                currency: 'USD',
                issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                value: '-0.001'
              },
              Flags: 131072,
              HighLimit: {
                currency: 'USD',
                issuer: addresses.ISSUER,
                value: '1'
              },
              HighNode: '0000000000000000',
              LowLimit: {
                currency: 'USD',
                issuer: addresses.COUNTERPARTY,
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
            PreviousTxnLgrSeq: 343703
          }
        },
        {
          ModifiedNode: {
            FinalFields: {
              Account: addresses.VALID,
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
            PreviousTxnLgrSeq: 343570
          }
        },
        {
          ModifiedNode: {
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
        {
          ModifiedNode: {
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
                issuer: addresses.COUNTERPARTY,
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
            PreviousTxnLgrSeq: 348433
          }
        }
        ],
        TransactionIndex: 0,
        TransactionResult: 'tesSUCCESS'
      },
      transaction: {
        Account: addresses.VALID,
        Amount: {
          currency: 'USD',
          issuer: addresses.ISSUER,
          value: '0.001'
        },
        Destination: addresses.ISSUER,
        Fee: options.fee,
        Flags: 0,
        LastLedgerSequence: 9036180,
        Paths: [
          [
            {
              currency: 'USD',
              issuer: addresses.COUNTERPARTY,
              type: 48,
              type_hex: '0000000000000030'
            },
            {
              account: addresses.COUNTERPARTY,
              currency: 'USD',
              issuer: addresses.COUNTERPARTY,
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
        hash: options.hash
      },
      type: 'transaction',
      validated: true
    }
  );
};


module.exports.verifiedResponseComplexCurrency = function(options) {
  options = options || {};
  _.defaults(options, {
    hash: module.exports.VALID_SUBMITTED_TRANSACTION_HASH,
    fromAccount: fromAccount,
    toAccount: toAccount,
    ledger: '10151421'
  });

  return JSON.stringify({
    engine_result: 'tesSUCCESS',
    engine_result_code: 0,
    engine_result_message: 'The transaction was applied.',
    ledger_hash: '4D63F66E96FA9FDD477A3CECE7BCCC474CF69820530F0993853BD74810939B2B',
    ledger_index: options.ledger,
    meta: {
      AffectedNodes: [
        {
          ModifiedNode: {
            FinalFields: {
              Account: options.fromAccount,
              Balance: '38821580',
              Flags: 0,
              OwnerCount: 3,
              Sequence: 23
            },
            LedgerEntryType: 'AccountRoot',
            LedgerIndex: '232B144A8867993B74B65354DFBF94A7E91CDD2AB645E0CDD1C85C953E883D91',
            PreviousFields: {
              Balance: '38833580',
              Sequence: 22
            },
            PreviousTxnID: '3C7368462683AF6731F0CF7D68C9126534599FB8A5842084C6515B8BD3FA8C91',
            PreviousTxnLgrSeq: 10151364
          }
        },
        {
          ModifiedNode: {
            FinalFields: {
              Balance: {
                currency: '0158415500000000C1F76FF6ECB0BAC600000000',
                issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                value: '-0.00000022'
              },
              Flags: 2228224,
              HighLimit: {
                currency: '0158415500000000C1F76FF6ECB0BAC600000000',
                issuer: options.toAccount,
                value: '107.5942812604172'
              },
              HighNode: '0000000000000000',
              LowLimit: {
                currency: '0158415500000000C1F76FF6ECB0BAC600000000',
                issuer: options.fromAccount,
                value: '0'
              },
              LowNode: '0000000000000000'
            },
            LedgerEntryType: 'RippleState',
            LedgerIndex: '8AB5CFA846695B5BA335D113125D0D5165E979EDC3014333CC594E16A8D4042E',
            PreviousFields: {
              Balance: {
                currency: '0158415500000000C1F76FF6ECB0BAC600000000',
                issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                value: '-0.00000021'
              }
            },
            PreviousTxnID: '3C7368462683AF6731F0CF7D68C9126534599FB8A5842084C6515B8BD3FA8C91',
            PreviousTxnLgrSeq: 10151364
          }
        }
      ],
      TransactionIndex: 19,
      TransactionResult: 'tesSUCCESS'
    },
    status: 'closed',
    transaction: {
      Account: options.fromAccount,
      Amount: {
        currency: '0158415500000000C1F76FF6ECB0BAC600000000',
        issuer: options.toAccount,
        value: '0.00000001'
      },
      Destination: options.toAccount,
      Fee: '12000',
      Flags: 2147483648,
      LastLedgerSequence: 10151428,
      Sequence: 22,
      SigningPubKey: '0347FFA8A09A9C473D0A8D9026B02C12C8065E5E66A787A278B379132950EDA0DD',
      TransactionType: 'Payment',
      TxnSignature: '304402203657E0A56CA849B9D0DA1066590FF5E2E4936328027219E23690E8072F9DC1FD02202DED19813D54881183C0385DE362BD15ECD1ADBF54FCD09DACF456C170064D6D',
      date: 470264580,
      hash: options.hash
    },
    type: 'transaction',
    validated: true
  });
}

module.exports.ledgerSequenceTooHighResponse = function(request) {
  return JSON.stringify(
    {
      id: request.id,
      result: {
        engine_result: 'tefMAX_LEDGER',
        engine_result_code: -186,
        engine_result_message: 'Ledger sequence too high.',
        tx_blob: '12000022800000002400000049201B0000000061D4038D7EA4C680000000000000000000000000005553440000000000625E2F1F09A0D769E05C04FAA64F0D2013306C6A68400000000000000C69D34A074F961630D40000000000000000000000004254430000000000E81DCB25DAA1DDEFF45145D334C56F12EA63C337732102AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D37446304402201B2E35F186C177C9DCF52EB8EB7BAA837EE56FA5A4D6D3A5DF28F115346059980220348EE36BBA46F618DCA38EA00008BA0436BA8C3336289E5B718D2FDA63793FBF8114E81DCB25DAA1DDEFF45145D334C56F12EA63C3378314625E2F1F09A0D769E05C04FAA64F0D2013306C6A011201DD39C650A96EDA48334E70CC4A85B8B2E8502CD3300000000000000000000000005553440000000000DD39C650A96EDA48334E70CC4A85B8B2E8502CD301DD39C650A96EDA48334E70CC4A85B8B2E8502CD3FF010A20B3C85F482532A9578DBB3950B85CA06594D1300000000000000000000000005553440000000000DD39C650A96EDA48334E70CC4A85B8B2E8502CD301DD39C650A96EDA48334E70CC4A85B8B2E8502CD3FF010A20B3C85F482532A9578DBB3950B85CA06594D13000000000000000000000000055534400000000000A20B3C85F482532A9578DBB3950B85CA06594D1010A20B3C85F482532A9578DBB3950B85CA06594D1FF01DD39C650A96EDA48334E70CC4A85B8B2E8502CD31000000000000000000000000000000000000000003000000000000000000000000055534400000000000A20B3C85F482532A9578DBB3950B85CA06594D1010A20B3C85F482532A9578DBB3950B85CA06594D100',
        tx_json: {
          Account: fromAccount,
          Amount: [Object],
          Destination: toAccount,
          Fee: '12',
          Flags: 2147483648,
          LastLedgerSequence: 0,
          Paths: [Object],
          SendMax: [Object],
          Sequence: 73,
          SigningPubKey: '02AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3',
          TransactionType: 'Payment',
          TxnSignature: '304402201B2E35F186C177C9DCF52EB8EB7BAA837EE56FA5A4D6D3A5DF28F115346059980220348EE36BBA46F618DCA38EA00008BA0436BA8C3336289E5B718D2FDA63793FBF',
          hash: module.exports.VALID_SUBMITTED_TRANSACTION_HASH
        }
      },
      status: 'success',
      type: 'response'
    }
  );
};

/**
 * Construct REST success response
 *
 * @param options
 *   @param {String} clientResourceId
 *   @param {String} account
 * @return {String} REST error response message
 */
module.exports.RESTSuccessResponse = function(options) {
  options = options || {};
  _.defaults(options, {
    clientResourceId: '1',
    account: fromAccount
  });

  return JSON.stringify(
    {
      success: true,
      client_resource_id: options.clientResourceId,
      status_url: 'http://127.0.0.1:5990/v1/accounts/'+fromAccount+'/payments/'+options.clientResourceId
    }
  );
};
