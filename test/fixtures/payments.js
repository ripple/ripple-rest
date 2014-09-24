module.exports.VALID_TRANSACTION_HASH = 'F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF';
module.exports.VALID_TRANSACTION_HASH_MEMO = 'F9DE78E635A418529A5104A56439F305CE7C42B9F29180F05D77326B9ACD1D33';
module.exports.INVALID_TRANSACTION_HASH = 'XF4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF';

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


module.exports.RESTTransactionResponse = JSON.stringify({
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
    hash: 'F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF',
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