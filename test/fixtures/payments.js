var addresses = require('./../fixtures').addresses;
var paths = require('./paths');

var fromAccount = addresses.VALID;
var fromSecret = addresses.SECRET;
var toAccount = addresses.COUNTERPARTY;

module.exports.VALID_TRANSACTION_HASH = 'F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF';
module.exports.VALID_TRANSACTION_HASH_MEMO = 'F9DE78E635A418529A5104A56439F305CE7C42B9F29180F05D77326B9ACD1D33';
module.exports.INVALID_TRANSACTION_HASH = 'XF4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF';
module.exports.VALID_SUBMITTED_TRANSACTION_HASH = '797A79F825CC5E5149D16D05960457A2E1C21484B41D8C80312601B39227ACE9'

module.exports.requestPath = function(address, params) {
  return '/v1/accounts/' + address + '/payments' + ( params || '' );
};

module.exports.transactionResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
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
      inLedger: 348860,
      ledger_index: 348860,
      meta: {
        AffectedNodes: [
          {
          ModifiedNode: {
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
            PreviousTxnLgrSeq: 343703
          }
        },
        {
          ModifiedNode: {
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
            PreviousTxnLgrSeq: 348433
          }
        }
        ],
        TransactionIndex: 0,
        TransactionResult: 'tesSUCCESS'
      },
      validated: true
    }
  });
};

module.exports.transactionResponseWithMemo = function(request) {
  return JSON.stringify(
    {
      "id": request.id,
      "status": "success",
      "type": "response",
      "result": {
        "Account": "rGUpotx8YYDiocqS577N4T1p1kHBNdEJ9s",
        "Amount": "100",
        "Destination": "radqi6ppXFxVhJdjzaATRBxdrPcVTf1Ung",
        "Fee": "12",
        "Flags": 0,
        "LastLedgerSequence": 9038219,
        "Memos": [
          {
            "Memo": {
              "MemoData": "736F6D655F76616C7565",
              "MemoType": "736F6D655F6B6579"
            }
          },
          {
            "Memo": {
              "MemoData": "736F6D655F76616C7565"
            }
          }
        ],
        "Sequence": 26,
        "SigningPubKey": "029A98439AF7459E256D64635598E8B21047807E6B5E6BEE3A3CCF35DEAD2C2C55",
        "TransactionType": "Payment",
        "TxnSignature": "3044022022C0ADFB098AF03183329F525184C539D5221104A7C5032C138BF10C19D37A000220443A58890F063AEB8FE1EFA5CC39A0744946B318C9AE9161F82351EB55C43AC1",
        "hash": "F9DE78E635A418529A5104A56439F305CE7C42B9F29180F05D77326B9ACD1D33",
        "inLedger": 9038214,
        "ledger_index": 9038214,
        "meta": {
          "AffectedNodes": [
            {
              "ModifiedNode": {
                "FinalFields": {
                  "Account": "radqi6ppXFxVhJdjzaATRBxdrPcVTf1Ung",
                  "Balance": "39000731",
                  "Flags": 0,
                  "OwnerCount": 2,
                  "Sequence": 8
                },
                "LedgerEntryType": "AccountRoot",
                "LedgerIndex": "232B144A8867993B74B65354DFBF94A7E91CDD2AB645E0CDD1C85C953E883D91",
                "PreviousFields": {
                  "Balance": "39000631"
                },
                "PreviousTxnID": "A4F84CBDA68051EAB64D34EBA71B7224FA82FD5A4E23220EA173975D52588DCE",
                "PreviousTxnLgrSeq": 9038197
              }
            },
            {
              "ModifiedNode": {
                "FinalFields": {
                  "Account": "rGUpotx8YYDiocqS577N4T1p1kHBNdEJ9s",
                  "Balance": "30998873",
                  "Flags": 0,
                  "OwnerCount": 2,
                  "Sequence": 27
                },
                "LedgerEntryType": "AccountRoot",
                "LedgerIndex": "819EBB8946A3FF55FBFFE32F3AD429F866B5E5AADC253796E3E068E51D22F569",
                "PreviousFields": {
                  "Balance": "30998985",
                  "Sequence": 26
                },
                "PreviousTxnID": "A4F84CBDA68051EAB64D34EBA71B7224FA82FD5A4E23220EA173975D52588DCE",
                "PreviousTxnLgrSeq": 9038197
              }
            }
          ],
          "TransactionIndex": 9,
          "TransactionResult": "tesSUCCESS"
        },
        "validated": true
      }
    }
  );
};

module.exports.ledgerResponse = function(request) {
  return JSON.stringify(
    {
      "id": request.id,
      "status": "success",
      "type": "response",
      "result": {
        "ledger": {
          "accepted": true,
          "account_hash": "EC028EC32896D537ECCA18D18BEBE6AE99709FEFF9EF72DBD3A7819E918D8B96",
          "close_time": 464908910,
          "close_time_human": "2014-Sep-24 21:21:50",
          "close_time_resolution": 10,
          "closed": true,
          "hash": "0F7ED9F40742D8A513AE86029462B7A6768325583DF8EE21B7EC663019DD6A0F",
          "ledger_hash": "0F7ED9F40742D8A513AE86029462B7A6768325583DF8EE21B7EC663019DD6A0F",
          "ledger_index": "9038214",
          "parent_hash": "4BB9CBE44C39DC67A1BE849C7467FE1A6D1F73949EA163C38A0121A15E04FFDE",
          "seqNum": "9038214",
          "totalCoins": "99999973964317514",
          "total_coins": "99999973964317514",
          "transaction_hash": "ECB730839EB55B1B114D5D1AD2CD9A932C35BA9AB6D3A8C2F08935EAC2BAC239"
        }
      }
    }
  );
}

module.exports.RESTTransactionResponse = function(hash) {
  return JSON.stringify({
    success: true,
    payment: {
      source_account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
      source_tag: '',
      source_amount: {
        value: '1.112209',
        currency: 'XRP',
        issuer: ''
      },
      source_slippage: '0',
      destination_account: 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH',
      destination_tag: '',
      destination_amount: {
        currency: 'USD',
        issuer: 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH',
        value: '0.001'
      },
      invoice_id: '',
      paths: '[[{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","type":48,"type_hex":"0000000000000030"},{"account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","type":49,"type_hex":"0000000000000031"}]]',
      no_direct_ripple: false,
      partial_payment: false,
      direction: 'outgoing',
      state: 'validated',
      result: 'tesSUCCESS',
      ledger: '348860',
      hash: hash,
      timestamp: '2013-03-12T23:56:50.000Z',
      fee: '0.00001',
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
        issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
      }
      ]
    }
  });
};

module.exports.RESTTransactionResponseWithMemo = JSON.stringify({
  success: true,
  payment: {
    source_account: "rGUpotx8YYDiocqS577N4T1p1kHBNdEJ9s",
    source_tag: "",
    source_amount: {
      value: "0.0001",
      currency: "XRP",
      issuer: ""
    },
    source_slippage: "0",
    destination_account: "radqi6ppXFxVhJdjzaATRBxdrPcVTf1Ung",
    destination_tag: "",
    destination_amount: {
      value: "0.0001",
      currency: "XRP",
      issuer: ""
    },
    invoice_id: "",
    paths: "[]",
    no_direct_ripple: false,
    partial_payment: false,
    direction: "outgoing",
    state: "validated",
    result: "tesSUCCESS",
    ledger: "9038214",
    hash: "F9DE78E635A418529A5104A56439F305CE7C42B9F29180F05D77326B9ACD1D33",
    timestamp: "2014-09-24T21:21:50.000Z",
    fee: "0.000012",
    source_balance_changes: [
      {
        value: "-0.000112",
        currency: "XRP",
        issuer: ""
      }
    ],
    destination_balance_changes: [
      {
        value: "0.0001",
        currency: "XRP",
        issuer: ""
      }
    ],
    memos: [
      {
        MemoData: "736F6D655F76616C7565",
        MemoType: "736F6D655F6B6579"
      },
      {
        MemoData: "736F6D655F76616C7565"
      }
    ]
  }
});

module.exports.paymentWithMemo = {
  "secret": fromSecret,
  "client_resource_id": "1",
  "payment": {
    "source_account": fromAccount,
    "source_tag": "",
    "source_amount": {
      "value": "0.0001",
      "currency": "XRP",
      "issuer": ""
    },
    "source_slippage": "0.01",
    "destination_account": toAccount,
    "destination_tag": "",
    "destination_amount": {
      "value": "0.0001",
      "currency": "XRP",
      "issuer": ""
    },
    "invoice_id": "",
    "paths": "[]",
    "partial_payment": false,
    "no_direct_ripple": false,
    "memos": [
      {
        "MemoType": "some_key",
        "MemoData": "some_value"
      },
      {
        "MemoData": "some_value"
      }
    ]
  }
};

module.exports.nonXrpPaymentWithoutIssuer = {
  secret: addresses.SECRET,
  client_resource_id: "1",
  payment: {
    source_account: addresses.VALID,
    destination_account: addresses.COUNTERPARTY,
    destination_amount: {
      value: "0.001",
      currency: "USD",
      issuer: ""
    }
  }
};

module.exports.nonXrpPaymentWithIssuer = {
  secret: addresses.SECRET,
  client_resource_id: "1",
  payment: {
    source_account: addresses.VALID,
    destination_account: addresses.COUNTERPARTY,
    destination_amount: {
      value: "0.001",
      currency: "USD",
      issuer: addresses.ISSUER
    }
  }
};

module.exports.nonXrpWithLastLedgerSequence = function(lastLedgerSequence) {
  return {
    secret: addresses.SECRET,
    client_resource_id: "1",
    last_ledger_sequence: lastLedgerSequence,
    payment: {
      source_account: addresses.VALID,
      destination_account: addresses.COUNTERPARTY,
      destination_amount: {
        value: "0.001",
        currency: "USD",
        issuer: addresses.ISSUER
      }
    }
  };
};

module.exports.nonXrpPaymentWithInvalidSecret = {
  "secret": "sssssssssssssssssssssssssssss",
  "client_resource_id": "614013f0-034f-4e22-ada9-4d131d71781f",
  "payment": {
    "source_account": fromAccount,
    "source_tag": "",
    "source_amount": {
      "value": "1",
      "currency": "USD",
      "issuer": ""
    },
    "source_slippage": "0",
    "destination_account": toAccount,
    "destination_tag": "",
    "destination_amount": {
      "value": "1",
      "currency": "USD",
      "issuer": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"
    },
    "invoice_id": "",
    "paths": "[]",
    "partial_payment": false,
    "no_direct_ripple": false
  }
};

module.exports.accountInfoResponse = function(request) {
  return JSON.stringify(
    {
      "id": request.id,
      "status": "success",
      "type": "response",
      "result": {
        "account_data": {
          "Account": fromAccount,
          "Balance": "30999545",
          "Flags": 0,
          "LedgerEntryType": "AccountRoot",
          "OwnerCount": 2,
          "PreviousTxnID": "272B581E78B8FA3F532A89C506901F7F6625683BEA280FFB8E3B90E29A837E94",
          "PreviousTxnLgrSeq": 9036179,
          "Sequence": 23,
          "index": "819EBB8946A3FF55FBFFE32F3AD429F866B5E5AADC253796E3E068E51D22F569"
        },
        "ledger_current_index": 9036069,
        "validated": false
      }
    }
  );
};

module.exports.requestSubmitResponse = function(request) {
  return JSON.stringify(
    {
      "id": request.id,
      "status": "success",
      "type": "response",
      "result": {
        "engine_result": "tesSUCCESS",
        "engine_result_code": 0,
        "engine_result_message": "The transaction was applied.",
        "tx_blob": "12000022000000002400000017201B0089E19461400000000000006468400000000000000C7321029A98439AF7459E256D64635598E8B21047807E6B5E6BEE3A3CCF35DEAD2C2C55744630440220688EDB9DC23AEB60A46DDFCC496B4EFCFB1D2432DC9636E2B88F8462FAAE3C4D022005A8EEC4A60AA34B778089EE7BA4622A3D2F18F9B8A05F9EE6709CB2C1FC89968114A69FF8D7778091B9F273549766DD6C063D984B5F83143DD06317D19C6110CAFF150AE528F58843BE2CA1",
        "tx_json": {
          "Account": fromAccount,
          "Amount": "100",
          "Destination": toAccount,
          "Fee": "12",
          "Flags": 0,
          "LastLedgerSequence": 9036180,
          "Sequence": 23,
          "SigningPubKey": "029A98439AF7459E256D64635598E8B21047807E6B5E6BEE3A3CCF35DEAD2C2C55",
          "TransactionType": "Payment",
          "TxnSignature": "30440220688EDB9DC23AEB60A46DDFCC496B4EFCFB1D2432DC9636E2B88F8462FAAE3C4D022005A8EEC4A60AA34B778089EE7BA4622A3D2F18F9B8A05F9EE6709CB2C1FC8996",
          "hash": module.exports.VALID_SUBMITTED_TRANSACTION_HASH
        }
      }
    }
  );
};

module.exports.ledgerSequenceTooHighResponse = function(request, lastLedgerSequence) {
  return JSON.stringify({
    "id": request.id,
    "status": "success",
    "type": "response",
    "result": {
      "engine_result": "tefMAX_LEDGER",
      "engine_result_code": -186,
      "engine_result_message": "Ledger sequence too high.",
      "tx_blob": "12000322000000002400000043201B0000000168400000000000000F732102AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D374463044022030177B57C6848DBABD9993F1480AC4CAEA04911FF0C6C0ED40484D10A7FA5FC0022073AD09CAFF94CB23821DF9B5915A47A7370178743279D3D676592F35F3A65F5B8114E81DCB25DAA1DDEFF45145D334C56F12EA63C337",
      "tx_json": {
        "Account": fromAccount,
        "Fee": "15",
        "Flags": 0,
        "LastLedgerSequence": lastLedgerSequence,
        "Sequence": 67,
        "SigningPubKey": "02AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3",
        "TransactionType": "AccountSet",
        "TxnSignature": "3044022030177B57C6848DBABD9993F1480AC4CAEA04911FF0C6C0ED40484D10A7FA5FC0022073AD09CAFF94CB23821DF9B5915A47A7370178743279D3D676592F35F3A65F5B",
        "hash": "6A171B18021FC45116B72FC80D82B234B1513EDD58DFFCE0E60CC8722A980E08"
      }
    }
  });
};

module.exports.transactionVerifiedResponse = function() {
  return JSON.stringify(
    {
      "engine_result": "tesSUCCESS",
      "engine_result_code": 0,
      "engine_result_message": "The transaction was applied.",
      "ledger_hash": "F7D1AFD4B7F9F895A4720ADC612A7D6D87FAE94BAD86EB55C2951C7D311D6F94",
      "ledger_index": 348860,
      "status": "closed",
      "meta": {
        "AffectedNodes": [
          {
          "ModifiedNode": {
            "FinalFields": {
              "Account": 'r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr',
              "BookDirectory": '4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5E03E788E09BB000',
              "BookNode": '0000000000000000',
              "Flags": 0,
              "OwnerNode": '0000000000000000',
              "Sequence": 58,
              "TakerGets": {
                "currency": 'USD',
                "issuer": 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                "value": '5.648998'
              },
              "TakerPays": '6208248802'
            },
            "LedgerEntryType": 'Offer',
            "LedgerIndex": '3CFB3C79D4F1BDB1EE5245259372576D926D9A875713422F7169A6CC60AFA68B',
            "PreviousFields": {
              "TakerGets": {
                "currency": 'USD',
                "issuer": 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                "value": '5.65'
              },
              "TakerPays": '6209350000'
            },
            "PreviousTxnID": '8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4',
            "PreviousTxnLgrSeq": 348433
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Balance": {
                "currency": 'USD',
                "issuer": 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                "value": '-0.001'
              },
              "Flags": 131072,
              "HighLimit": {
                "currency": 'USD',
                "issuer": 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH',
                "value": '1'
              },
              "HighNode": '0000000000000000',
              "LowLimit": {
                "currency": 'USD',
                "issuer": 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                "value": '0'
              },
              "LowNode": '0000000000000002'
            },
            "LedgerEntryType": 'RippleState',
            "LedgerIndex": '4BD1874F8F3A60EDB0C23F5BD43E07953C2B8741B226648310D113DE2B486F01',
            "PreviousFields": {
              "Balance": {
                "currency": 'USD',
                "issuer": 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                "value": '0'
              }
            },
            "PreviousTxnID": '5B2006DAD0B3130F57ACF7CC5CCAC2EEBCD4B57AAA091A6FD0A24B073D08ABB8',
            "PreviousTxnLgrSeq": 343703
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Account": 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
              "Balance": '9998898762',
              "Flags": 0,
              "OwnerCount": 3,
              "Sequence": 5
            },
            "LedgerEntryType": 'AccountRoot',
            "LedgerIndex": '4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05',
            "PreviousFields": {
              "Balance": '9999999970',
              "Sequence": 4
            },
            "PreviousTxnID": '53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8',
            "PreviousTxnLgrSeq": 343570
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Account": 'r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr',
              "Balance": '912695302618',
              "Flags": 0,
              "OwnerCount": 10,
              "Sequence": 59
            },
            "LedgerEntryType": 'AccountRoot',
            "LedgerIndex": 'F3E119AAA87AF3607CF87F5523BB8278A83BCB4142833288305D767DD30C392A',
            "PreviousFields": {
              "Balance": '912694201420'
            },
            "PreviousTxnID": '8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4',
            "PreviousTxnLgrSeq": 348433
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Balance": {
                "currency": 'USD',
                "issuer": 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                "value": '-5.5541638883365'
              },
              "Flags": 131072,
              "HighLimit": {
                "currency": 'USD',
                "issuer": 'r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr',
                "value": '1000'
              },
              "HighNode": '0000000000000000',
              "LowLimit": {
                "currency": 'USD',
                "issuer": 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                "value": '0'
              },
              "LowNode": '000000000000000C'
            },
            "LedgerEntryType": 'RippleState',
            "LedgerIndex": 'FA1255C2E0407F1945BCF9351257C7C5C28B0F5F09BB81C08D35A03E9F0136BC',
            "PreviousFields": {
              "Balance": {
                "currency": 'USD',
                "issuer": 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                "value": '-5.5551658883365'
              }
            },
            "PreviousTxnID": '8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4',
            "PreviousTxnLgrSeq": 348433
          }
        }
        ],
        "TransactionIndex": 0,
        "TransactionResult": 'tesSUCCESS'
      },
      "transaction": {
        "Account": addresses.VALID,
        "Amount": { 
          "currency": 'USD',
          "issuer": 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH',
          "value": '0.001' 
        },
        "Destination": addresses.ISSUER,
        "Fee": "10",
        "Flags": 0,
        "LastLedgerSequence": 9036180,
        "Paths": [
          [
            {
              "currency": 'USD',
              "issuer": 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
              "type": 48,
              "type_hex": '0000000000000030'
            },
            {
              "account": 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
              "currency": 'USD',
              "issuer": 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
              "type": 49,
              "type_hex": '0000000000000031'
            }
          ]
        ],
        "SendMax": '1112209',
        "Sequence": 4,
        "SigningPubKey": "02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D",
        "TransactionType": "Payment",
        "TxnSignature": "304502204EE3E9D1B01D8959B08450FCA9E22025AF503DEF310E34A93863A85CAB3C0BC5022100B61F5B567F77026E8DEED89EED0B7CAF0E6C96C228A2A65216F0DC2D04D52083",
        "date": 416447810,
        "hash": module.exports.VALID_SUBMITTED_TRANSACTION_HASH
      },
      "type": "transaction",
      "validated": true
    }
  );
};

module.exports.RESTPaymentWithMemoResponse = JSON.stringify(
  {
    "success":true,
    "client_resource_id":"1",
    "status_url":"http://127.0.0.1:5990/v1/accounts/"+fromAccount+"/payments/1"
  }
);

module.exports.RESTResponseMissingMemoData = JSON.stringify(
  {
    "success":true,
    "client_resource_id":"1",
    "status_url":"http://127.0.0.1:5990/v1/accounts/"+fromAccount+"/payments/1"
  }
);

module.exports.RESTResponseMemoTypeInt = JSON.stringify(
  {
    "success":false,
    "error_type":"invalid_request",
    "error":"Invalid parameter: MemoType",
    "message":"MemoType must be a string"
  }
);

module.exports.RESTResponseMemoDataInt = JSON.stringify(
  {
    "success":false,
    "error_type":"invalid_request",
    "error":"Invalid parameter: MemoData",
    "message":"MemoData must be a string"
  }
);

module.exports.RESTResponseEmptyMemosArray = JSON.stringify(
  {
    "success":false,
    "error_type":"invalid_request",
    "error":"Invalid parameter: memos",
    "message":"Must contain at least one Memo object, otherwise omit the memos property"
  }
);

module.exports.RESTResponseNonArrayMemo = JSON.stringify(
  {
    "success":false,
    "error_type":"invalid_request",
    "error":"Invalid parameter: memos",
    "message":"Must be an array with memo objects"
  }
);

module.exports.RESTNonXrpPaymentWithoutIssuer = JSON.stringify(
  {
    "success": false,
    "error_type": "invalid_request",
    "error": "Invalid parameter: destination_amount",
    "message": "Non-XRP payment must have an issuer"
  }
);

module.exports.RESTNonXrpPaymentWithIssuer = JSON.stringify(
  {
    "success": true,
    "client_resource_id": "1",
    "status_url": "http://127.0.0.1:5990/v1/accounts/r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE/payments/1"
  }
);

module.exports.RESTNonXrpPaymentWithInvalidsecret = JSON.stringify(
  {
    "success":false,
    "error_type":"transaction",
    "error":"Invalid secret"
  }
);

module.exports.RESTNonXrpPaymentWithHighLedgerSequence = JSON.stringify(
  {
    "success": false,
    "error_type": "transaction",
    "error": "tefMAX_LEDGER",
    "message": "Ledger sequence too high."
  }
);

module.exports.txPayment = {
  "Account": "radqi6ppXFxVhJdjzaATRBxdrPcVTf1Ung",
  "Amount": "100",
  "Destination": "rGUpotx8YYDiocqS577N4T1p1kHBNdEJ9s",
  "Fee": "12000",
  "Flags": 0,
  "LastLedgerSequence": 9270801,
  "Sequence": 8,
  "SigningPubKey": "0347FFA8A09A9C473D0A8D9026B02C12C8065E5E66A787A278B379132950EDA0DD",
  "TransactionType": "Payment",
  "TxnSignature": "3045022100848BCA20267B9D56E2B8BB6A621886F1F7CA41D9689682AC361A37B655E2035002205CFACC939471F8DEA72B1BCA7922C4697CE02350039A2E6462B010B9C1BDFBCA",
  "hash": "37972E2B3529ADFD07EF51B1FF28BAF1C5AE6C6EA31EDC37367A882ACF5D6F03",
  "inLedger": 9270796,
  "ledger_index": 9270796,
  "meta": {
    "AffectedNodes": [
      {
        "ModifiedNode": {
          "FinalFields": {
            "Account": "radqi6ppXFxVhJdjzaATRBxdrPcVTf1Ung",
            "Balance": "38989433",
            "Flags": 0,
            "OwnerCount": 2,
            "Sequence": 9
          },
          "LedgerEntryType": "AccountRoot",
          "LedgerIndex": "232B144A8867993B74B65354DFBF94A7E91CDD2AB645E0CDD1C85C953E883D91",
          "PreviousFields": {
            "Balance": "39001533",
            "Sequence": 8
          },
          "PreviousTxnID": "C3DAB10C25845E226CC5F7550581A5521EF8E7BE7E4F9EB8C8A0C2DE75D3B305",
          "PreviousTxnLgrSeq": 9163183
        }
      },
      {
        "ModifiedNode": {
          "FinalFields": {
            "Account": "rGUpotx8YYDiocqS577N4T1p1kHBNdEJ9s",
            "Balance": "30997987",
            "Flags": 0,
            "OwnerCount": 2,
            "Sequence": 37
          },
          "LedgerEntryType": "AccountRoot",
          "LedgerIndex": "819EBB8946A3FF55FBFFE32F3AD429F866B5E5AADC253796E3E068E51D22F569",
          "PreviousFields": {
            "Balance": "30997887"
          },
          "PreviousTxnID": "C3DAB10C25845E226CC5F7550581A5521EF8E7BE7E4F9EB8C8A0C2DE75D3B305",
          "PreviousTxnLgrSeq": 9163183
        }
      }
    ],
    "TransactionIndex": 1,
    "TransactionResult": "tesSUCCESS"
  },
  "validated": true,
  "client_resource_id": "1",
  "date": 466135630
};


module.exports.txPartialPayment =  {
  "Account": "rDuV4ndTFUn5NjLJSTNfEFMTxqQVeafvxC",
  "Amount": {
    "currency": "STR",
    "issuer": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
    "value": "100000000"
  },
  "Destination": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
  "DestinationTag": 1768250171,
  "Fee": "10000",
  "Flags": 131072,
  "Sequence": 5,
  "SigningPubKey": "02873F86283680593062E3CD373D26C42915CE6AED1197E3053B1865432029299B",
  "TransactionType": "Payment",
  "TxnSignature": "3044022074444B7D2603EB45748E3354F57FB68B6BF4924C163D81DDABFB177EE58C694502205CED905B228DAE5C8EE9E90C53082D3840D200EA9CF825AB5E7F5C6F581CF168",
  "hash": "69F2BC4C8C6815F416E60141271EA41BB91A0D86A0AB9F7AC75A7B8EA712AC44",
  "inLedger": 9261492,
  "ledger_index": 9261492,
  "meta": {
    "AffectedNodes": [
      {
        "ModifiedNode": {
          "FinalFields": {
            "Flags": 0,
            "IndexPrevious": "0000000000000034",
            "Owner": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
            "RootIndex": "32402441C76661B2F575952656A64E872C98713DCA0FCA3CF2525B4281D46D0B"
          },
          "LedgerEntryType": "DirectoryNode",
          "LedgerIndex": "013311ECAC3680B4F027CC2AE56BE85C61AAA5B581EA5CE99FBC32BB34F0E0DE"
        }
      },
      {
        "DeletedNode": {
          "FinalFields": {
            "Flags": 0,
            "Owner": "rDuV4ndTFUn5NjLJSTNfEFMTxqQVeafvxC",
            "RootIndex": "2DC8801741073E66DDD53E55B1591DB76EBEEF253FA5D1484289CE0841545851"
          },
          "LedgerEntryType": "DirectoryNode",
          "LedgerIndex": "2DC8801741073E66DDD53E55B1591DB76EBEEF253FA5D1484289CE0841545851"
        }
      },
      {
        "ModifiedNode": {
          "FinalFields": {
            "Account": "rDuV4ndTFUn5NjLJSTNfEFMTxqQVeafvxC",
            "Balance": "596665727",
            "Flags": 0,
            "OwnerCount": 0,
            "Sequence": 6
          },
          "LedgerEntryType": "AccountRoot",
          "LedgerIndex": "5AE15BCCC263A52590135CD2D49EE4BCC8D74A5FD79D151AA3BE203CEA680FF4",
          "PreviousFields": {
            "Balance": "596675727",
            "OwnerCount": 1,
            "Sequence": 5
          },
          "PreviousTxnID": "F07362E42872A5BCA710180F28AF453D683128C602B612ABFF9E5D483862DEAC",
          "PreviousTxnLgrSeq": 9261490
        }
      },
      {
        "DeletedNode": {
          "FinalFields": {
            "Balance": {
              "currency": "STR",
              "issuer": "rrrrrrrrrrrrrrrrrrrrBZbvji",
              "value": "0"
            },
            "Flags": 0,
            "HighLimit": {
              "currency": "STR",
              "issuer": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
              "value": "0"
            },
            "HighNode": "0000000000000035",
            "LowLimit": {
              "currency": "STR",
              "issuer": "rDuV4ndTFUn5NjLJSTNfEFMTxqQVeafvxC",
              "value": "0"
            },
            "LowNode": "0000000000000000",
            "PreviousTxnID": "146B3F4F722F6A7AB99758EDDCDE39CF0001F41CC1E5BF86A461153F62DF783B",
            "PreviousTxnLgrSeq": 9261192
          },
          "LedgerEntryType": "RippleState",
          "LedgerIndex": "C9CED5888C23503CDA7DD50DE03B77479DAA7BB7703E0EEEDDC9418168573E0F",
          "PreviousFields": {
            "Balance": {
              "currency": "STR",
              "issuer": "rrrrrrrrrrrrrrrrrrrrBZbvji",
              "value": "1"
            },
            "Flags": 65536
          }
        }
      }
    ],
    "DeliveredAmount": {
      "currency": "STR",
      "issuer": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
      "value": "1"
    },
    "TransactionIndex": 5,
    "TransactionResult": "tesSUCCESS"
  },
  "validated": true,
  "date": 466091690
};

module.exports.RESTResponsePayment = {
  "source_account": "radqi6ppXFxVhJdjzaATRBxdrPcVTf1Ung",
  "source_tag": "",
  "source_amount": {
    "value": "0.0001",
    "currency": "XRP",
    "issuer": ""
  },
  "source_slippage": "0",
  "destination_account": "rGUpotx8YYDiocqS577N4T1p1kHBNdEJ9s",
  "destination_tag": "",
  "destination_amount": {
    "value": "0.0001",
    "currency": "XRP",
    "issuer": ""
  },
  "invoice_id": "",
  "paths": "[]",
  "no_direct_ripple": false,
  "partial_payment": false,
  "direction": "incoming",
  "state": "validated",
  "result": "tesSUCCESS",
  "ledger": "9270796",
  "hash": "37972E2B3529ADFD07EF51B1FF28BAF1C5AE6C6EA31EDC37367A882ACF5D6F03",
  "timestamp": "2014-10-09T02:07:10.000Z",
  "fee": "0.012",
  "source_balance_changes": [
    {
      "value": "-0.0121",
      "currency": "XRP",
      "issuer": ""
    }
  ],
  "destination_balance_changes": [
    {
      "value": "0.0001",
      "currency": "XRP",
      "issuer": ""
    }
  ]
};

module.exports.RESTResponsePartialPayment = {
  "source_account": "rDuV4ndTFUn5NjLJSTNfEFMTxqQVeafvxC",
  "source_tag": "",
  "source_amount": {
    "currency": "STR",
    "issuer": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
    "value": "1"
  },
  "source_amount_submitted": {
    "currency": "STR",
    "issuer": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
    "value": "100000000"
  },
  "source_slippage": "0",
  "destination_account": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
  "destination_tag": "1768250171",
  "destination_amount": {
    "currency": "STR",
    "issuer": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
    "value": "1"
  },
  "destination_amount_submitted": {
    "currency": "STR",
    "issuer": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
    "value": "100000000"
  },
  "invoice_id": "",
  "paths": "[]",
  "no_direct_ripple": false,
  "partial_payment": true,
  "direction": "outgoing",
  "state": "validated",
  "result": "tesSUCCESS",
  "ledger": "9261492",
  "hash": "69F2BC4C8C6815F416E60141271EA41BB91A0D86A0AB9F7AC75A7B8EA712AC44",
  "timestamp": "2014-10-08T13:54:50.000Z",
  "fee": "0.01",
  "source_balance_changes": [
    {
      "value": "-0.01",
      "currency": "XRP",
      "issuer": ""
    },
    {
      "value": "-1",
      "currency": "STR",
      "issuer": "rDuV4ndTFUn5NjLJSTNfEFMTxqQVeafvxC"
    }
  ],
  "destination_balance_changes": [
    {
      "value": "1",
      "currency": "STR",
      "issuer": "rDuV4ndTFUn5NjLJSTNfEFMTxqQVeafvxC"
    }
  ]
};
