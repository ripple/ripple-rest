var _ = require('lodash');
var addresses = require('./../fixtures').addresses;
var paths = require('./paths');

const ORDER_HASH = '71AE74B03DE3B9A06C559AD4D173A362D96B7D2A5AA35F56B9EF21543D627F34';
const DEFAULTS = {
  account: addresses.VALID,
  flags: 2148007936,
  hash: ORDER_HASH,
  type: 'sell',
  state: 'pending',
  sequence: 99
};

const LIB_DEFAULTS = _.extend(_.cloneDeep(DEFAULTS), {
  taker_gets: {
    currency: 'USD',
    value: '100',
    issuer: addresses.ISSUER
  },
  taker_pays: {
    currency: 'JPY',
    value: '10000',
    issuer: addresses.ISSUER
  },
});

const REST_DEFAULTS = _.extend(_.cloneDeep(DEFAULTS), {
  taker_gets: {
    currency: 'USD',
    counterparty: addresses.ISSUER,
    value: '100'
  },
  taker_pays: {
    currency: 'JPY',
    counterparty: addresses.ISSUER,
    value: '10000'
  }
});

module.exports.order = function(options) {
  options = options || {};
  _.defaults(options, {
    secret: addresses.SECRET,
    type: 'buy',
    taker_gets: {
      currency: 'USD',
      value: '100',
      counterparty: addresses.ISSUER
    },
    taker_pays: {
      currency: 'USD',
      value: '100',
      counterparty: addresses.ISSUER
    }
  });

  return {
    secret: options.secret,
    order: {
       type: options.type,
       passive: options.passive,
       immediate_or_cancel: options.immediate_or_cancel,
       fill_or_kill: options.fill_or_kill,
       taker_gets: options.taker_gets,
       taker_pays: options.taker_pays
    }
  };

};

module.exports.accountOrdersResponse = function(request, options) {
  options = options || {};

  _.defaults(options, {
    account: addresses.VALID,
    validated: true
  });

  return JSON.stringify({
    "id": request.id,
    "result": {
      "account": options.account,
      "marker": options.marker,
      "limit": options.limit,
      "ledger_index": options.ledger,
      "offers": [
        {
          "flags": 131072,
          "seq": 719930,
          "taker_gets": {
            "currency": "EUR",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "value": "17.70155237781915"
          },
          "taker_pays": {
            "currency": "USD",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "value": "1122.990930900328"
          }
        },
        {
          "flags": 0,
          "seq": 757002,
          "taker_gets": {
            "currency": "USD",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "value": "18.46856867857617"
          },
          "taker_pays": {
            "currency": "USD",
            "issuer": "rpDMez6pm6dBve2TJsmDpv7Yae6V5Pyvy2",
            "value": "19.50899530491766"
          }
        },
        {
          "flags": 0,
          "seq": 756999,
          "taker_gets": {
            "currency": "USD",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "value": "19.11697137482289"
          },
          "taker_pays": {
            "currency": "EUR",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "value": "750"
          }
        },
        {
          "flags": 0,
          "seq": 757003,
          "taker_gets": {
            "currency": "USD",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "value": "14.40727807030772"
          },
          "taker_pays": {
            "currency": "USD",
            "issuer": "rpDMez6pm6dBve2TJsmDpv7Yae6V5Pyvy2",
            "value": "1445.796633544794"
          }
        },
        {
          "flags": 0,
          "seq": 782148,
          "taker_gets": {
            "currency": "NZD",
            "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
            "value": "9.178557969538755"
          },
          "taker_pays": {
            "currency": "USD",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "value": "750"
          }
        },
        {
          "flags": 0,
          "seq": 787368,
          "taker_gets": {
            "currency": "USD",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "value": "9.94768291869523"
          },
          "taker_pays": {
            "currency": "USD",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "value": "500"
          }
        },
        {
          "flags": 0,
          "seq": 787408,
          "taker_gets": {
            "currency": "USD",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "value": "9.994805759894176"
          },
          "taker_pays": {
            "currency": "USD",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "value": "10000"
          }
        },
        {
          "flags": 0,
          "seq": 803438,
          "taker_gets": {
            "currency": "USD",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "value": "11.67691646304319"
          },
          "taker_pays": {
            "currency": "MXN",
            "issuer": "rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn",
            "value": "15834.53653918684"
          }
        },
        {
          "flags": 0,
          "seq": 807858,
          "taker_gets": {
            "currency": "XAU",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "value": "0.03206299605333101"
          },
          "taker_pays": {
            "currency": "USD",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "value": "3968.240250979598"
          }
        },
        {
          "flags": 0,
          "seq": 807896,
          "taker_gets": {
            "currency": "XAU",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "value": "0.03347459066593226"
          },
          "taker_pays": {
            "currency": "USD",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "value": "4139.022125516302"
          }
        },
        {
          "flags": 0,
          "seq": 814018,
          "taker_gets": {
            "currency": "NZD",
            "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
            "value": "6.840555705"
          },
          "taker_pays": "115760190000"
        },
        {
          "flags": 0,
          "seq": 827522,
          "taker_gets": {
            "currency": "EUR",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "value": "14.40843766044656"
          },
          "taker_pays": {
            "currency": "USD",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "value": "902.4050961259154"
          }
        },
        {
          "flags": 0,
          "seq": 833592,
          "taker_gets": {
            "currency": "XAG",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "value": "1.128432823485991"
          },
          "taker_pays": {
            "currency": "USD",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "value": "1814.887131319799"
          }
        },
        {
          "flags": 0,
          "seq": 833591,
          "taker_gets": {
            "currency": "XAG",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "value": "1.128432823485989"
          },
          "taker_pays": {
            "currency": "USD",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "value": "181.4887131319798"
          }
        },
        {
          "flags": 0,
          "seq": 838954,
          "taker_gets": {
            "currency": "XAG",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "value": "0.7283371225235964"
          },
          "taker_pays": {
            "currency": "USD",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "value": "118.6872603846736"
          }
        },
        {
          "flags": 0,
          "seq": 843730,
          "taker_gets": "2229229447",
          "taker_pays": {
            "currency": "XAU",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "value": "1"
          }
        },
        {
          "flags": 0,
          "seq": 844068,
          "taker_gets": {
            "currency": "USD",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "value": "17.77537376072202"
          },
          "taker_pays": {
            "currency": "EUR",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "value": "750"
          }
        }
      ],
      "validated": options.validated
    },
    "status": "success",
    "type": "response"
  });
};

module.exports.accountInfoResponse = function(request) {
  return JSON.stringify(
    {
      "id": request.id,
      "status": "success",
      "type": "response",
      "result": {
        "account_data": {
          "Account": addresses.VALID,
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

module.exports.requestLedgerResponse = function(request, options) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      ledger: {
        accepted: true,
        account_hash: '6AB712C3CA840436E4544A6E9D804BA4DFBE2CFF52EF9FD148F5CF1DC13FA84F',
        close_time: 473217650,
        close_time_human: '2014-Dec-30 01:20:50',
        close_time_resolution: 10,
        closed: true,
        hash: 'B513CA3DE23463401F44F4F1AC168C97998D321E060AAEE25B21D1BFB78735C8',
        ledger_hash: 'B513CA3DE23463401F44F4F1AC168C97998D321E060AAEE25B21D1BFB78735C8',
        ledger_index: options.ledger,
        parent_hash: 'E3A9B7E86136542239162756FD174FE014300D1881DC193E67F2445C2C28A4D2',
        seqNum: '10814408',
        totalCoins: '99999638715444995',
        total_coins: '99999638715444995',
        transaction_hash: 'A6DF9EC1F661300538FCB855E8A0C0438696531663C52F8EDA1F9FA728D504D3',
        transactions: [
          '1FC4D12C30CE206A6E23F46FAC62BD393BE9A79A1C452C6F3A04A13BC7A5E5A3',
          'E25C38FDB8DD4A2429649588638EE05D055EE6D839CABAF8ABFB4BD17CFE1F3E'
        ]
      }
    }
  });
};

module.exports.requestSubmitResponse = function(request, options) {
  options = options || {};
  _.defaults(options, LIB_DEFAULTS);

  return JSON.stringify({
    "id": request.id,
    "status": "success",
    "type": "response",
    "result": {
      "engine_result": "tesSUCCESS",
      "engine_result_code": 0,
      "engine_result_message": "The transaction was applied.",
      "tx_blob": "12000722800800002400000063201B0099699B64D54E35FA931A00000000000000000000000000004A50590000000000E5C92828261DBAAC933B6309C6F5C72AF020AFD465D448E1BC9BF0400000000000000000000000000055534400000000000A20B3C85F482532A9578DBB3950B85CA06594D1684000000000002EE0732102AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3744730450221009D829F972F220620D790E7C4028F311A338763F081758EBF7E2D320899D2831502204F0512873A2C96F087C3E8D98A33CB7316B9AA8C40DDB1A3D15F0206366B8AD48114E81DCB25DAA1DDEFF45145D334C56F12EA63C337",
      "tx_json": {
        "Account": options.account,
        "Fee": "12000",
        "Flags": options.flags,
        "LastLedgerSequence": 10054043,
        "Sequence": options.sequence,
        "SigningPubKey": "02AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3",
        "TakerGets": options.taker_gets,
        "TakerPays": options.taker_pays,
        "TransactionType": "OfferCreate",
        "TxnSignature": "30450221009D829F972F220620D790E7C4028F311A338763F081758EBF7E2D320899D2831502204F0512873A2C96F087C3E8D98A33CB7316B9AA8C40DDB1A3D15F0206366B8AD4",
        "hash": options.hash
      }
    }
  });
};

module.exports.requestCancelResponse = function(request, options) {
  options = options || {};
  _.defaults(options, LIB_DEFAULTS);

  return JSON.stringify({
    "id": request.id,
    "status": "success",
    "type": "response",
    "result": {
      "engine_result": "tesSUCCESS",
      "engine_result_code": 0,
      "engine_result_message": "The transaction was applied.",
      "tx_blob": "12000822800000002400000083201900000082201B0099B518684000000000002EE0732102AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D374463044022063C7C53712737A8715EF940F954C80D72C54D0D82DD01426059AEE147A831815022042CE97F22661B80897D07BAB6B66E80C184D424778062343881063E695AC0E7E8114E81DCB25DAA1DDEFF45145D334C56F12EA63C337",
      "tx_json": {
        "Account": options.account,
        "Fee": "12000",
        "Flags": 2147483648,
        "LastLedgerSequence": 10073368,
        "OfferSequence": options.sequence,
        "Sequence": options.sequence + 1,
        "SigningPubKey": "02AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3",
        "TransactionType": "OfferCancel",
        "TxnSignature": "3044022063C7C53712737A8715EF940F954C80D72C54D0D82DD01426059AEE147A831815022042CE97F22661B80897D07BAB6B66E80C184D424778062343881063E695AC0E7E",
        "hash": options.hash
      }
    }
  });
};

module.exports.rippledSubmitErrorResponse = function(request, options) {
  options = options || {};
  _.defaults(options, LIB_DEFAULTS);

  return JSON.stringify({
    id: request.id,
    result: {
      engine_result: options.engine_result,
      engine_result_code: options.engine_result_code,
      engine_result_message: options.engine_result_message,
      tx_blob: '1200072280080000240000001B201B0099737164D54E35FA931A00000000000000000000000000004A50590000000000E5C92828261DBAAC933B6309C6F5C72AF020AFD465D448E1BC9BF0400000000000000000000000000055534400000000000A20B3C85F482532A9578DBB3950B85CA06594D1684000000000002EE0732102AFA3692CC78A804ACC11DBA23DBB99943C6F8D61D3CB07BBE6D28356EB5B9C5774463044022034FF61A42D649DA06BB13A2844BBF4C77AD8EE830666639E0850F58259ADFF7C022007048D1DD3896939A4BDB7D8221A9611302E0377EC7572740378DB2A7DE8485C8114625E2F1F09A0D769E05C04FAA64F0D2013306C6A',
      tx_json: {
        "Account": options.account,
        "Fee": "12000",
        "Flags": options.flags,
        "LastLedgerSequence": 10055679,
        "Sequence": options.sequence,
        "SigningPubKey": "02AFA3692CC78A804ACC11DBA23DBB99943C6F8D61D3CB07BBE6D28356EB5B9C57",
        "TakerGets": options.taker_gets,
        "TakerPays": options.taker_pays,
        "TransactionType": "OfferCreate",
        "TxnSignature": "3045022100F6CAC4B1A57D7298112B970D4D2F93CCDADD897BBE20612D6D8210697360563202201B91F3B1FA184BDC1A4EDFBC47B43D22EE858F1A902D469031D641BFCEFA652F",
        "hash": options.hash
      }
    },
    status: 'success',
    type: 'response'
  });
};

module.exports.rippledCancelErrorResponse = function(request, options) {
  options = options || {};
  _.defaults(options, LIB_DEFAULTS);

  return JSON.stringify({
    id: request.id,
    result: {
      engine_result: options.engine_result,
      engine_result_code: options.engine_result_code,
      engine_result_message: options.engine_result_message,
      tx_blob: '1200072280080000240000001B201B0099737164D54E35FA931A00000000000000000000000000004A50590000000000E5C92828261DBAAC933B6309C6F5C72AF020AFD465D448E1BC9BF0400000000000000000000000000055534400000000000A20B3C85F482532A9578DBB3950B85CA06594D1684000000000002EE0732102AFA3692CC78A804ACC11DBA23DBB99943C6F8D61D3CB07BBE6D28356EB5B9C5774463044022034FF61A42D649DA06BB13A2844BBF4C77AD8EE830666639E0850F58259ADFF7C022007048D1DD3896939A4BDB7D8221A9611302E0377EC7572740378DB2A7DE8485C8114625E2F1F09A0D769E05C04FAA64F0D2013306C6A',
      tx_json: {
        "Account": options.account,
        "Fee": "12000",
        "Flags": 2147483648,
        "LastLedgerSequence": 10055679,
        "OffserSequence": options.sequence,
        "Sequence": options.sequence + 1,
        "SigningPubKey": "02AFA3692CC78A804ACC11DBA23DBB99943C6F8D61D3CB07BBE6D28356EB5B9C57",
        "TransactionType": "OfferCancel",
        "TxnSignature": "3045022100F6CAC4B1A57D7298112B970D4D2F93CCDADD897BBE20612D6D8210697360563202201B91F3B1FA184BDC1A4EDFBC47B43D22EE858F1A902D469031D641BFCEFA652F",
        "hash": options.hash
      }
    },
    status: 'success',
    type: 'response'
  });
};

module.exports.submitTransactionVerifiedResponse = function(options) {
  options = options || {};
  _.defaults(options, LIB_DEFAULTS);

  return JSON.stringify({
    "engine_result": "tesSUCCESS",
    "engine_result_code": 0,
    "engine_result_message": "The transaction was applied.",
    "ledger_hash": "F1822659E6C0F1E1169F1AEFC4A07F8BCE124BF8A6CEEE30AFB4DDBDAFF2776A",
    "ledger_index": options.last_ledger,
    "meta": {
      "AffectedNodes": [
        {
          "CreatedNode": {
            "LedgerEntryType": "Offer",
            "LedgerIndex": "29D7BD92138842A1049A8D523B037B7589A0B78C147CF048F5D869B8242CE4DF",
            "NewFields": {
              "Account": options.account,
              "BookDirectory": "3B95C29205977C2136BBC70F21895F8C8F471C8522BF446E5905AF3107A40000",
              "Flags": 131072,
              "Sequence": options.sequence,
              "TakerGets": options.taker_gets,
              "TakerPays": options.taker_pays
            }
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "ExchangeRate": "5905AF3107A40000",
              "Flags": 0,
              "RootIndex": "3B95C29205977C2136BBC70F21895F8C8F471C8522BF446E5905AF3107A40000",
              "TakerGetsCurrency": "0000000000000000000000005553440000000000",
              "TakerGetsIssuer": "0A20B3C85F482532A9578DBB3950B85CA06594D1",
              "TakerPaysCurrency": "0000000000000000000000004A50590000000000",
              "TakerPaysIssuer": "E5C92828261DBAAC933B6309C6F5C72AF020AFD4"
            },
            "LedgerEntryType": "DirectoryNode",
            "LedgerIndex": "3B95C29205977C2136BBC70F21895F8C8F471C8522BF446E5905AF3107A40000"
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Flags": 0,
              "Owner": options.account,
              "RootIndex": "4CC6A36EE801B2A3A3B2E2C44857631BAF1A7FD1CAF73BAD55EB6F584815858A"
            },
            "LedgerEntryType": "DirectoryNode",
            "LedgerIndex": "4CC6A36EE801B2A3A3B2E2C44857631BAF1A7FD1CAF73BAD55EB6F584815858A"
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Account": options.account,
              "Balance": "531738396423",
              "Flags": 0,
              "OwnerCount": 7,
              "Sequence": options.sequence + 1
            },
            "LedgerEntryType": "AccountRoot",
            "LedgerIndex": "53539B9154C83B7D657103C27ABCA0EF1AD3674F6D0B341F20710FC50EC4DC03",
            "PreviousFields": {
              "Balance": "531738408423",
              "OwnerCount": 6,
              "Sequence": options.sequence
            },
            "PreviousTxnID": "EAA4EDD969DCD5D101AB002B0544E35E522C83925F5D72B8D02116C13B45016F",
            "PreviousTxnLgrSeq": 8819952
          }
        }
      ],
      "TransactionIndex": 1,
      "TransactionResult": "tesSUCCESS"
    },
    "status": "closed",
    "transaction": {
      "Account": options.account,
      "Fee": "12000",
      "Flags": options.flags,
      "LastLedgerSequence": 8819952,
      "Sequence": options.sequence,
      "SigningPubKey": "02AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3",
      "TakerGets": options.taker_gets,
      "TakerPays": options.taker_pays,
      "TransactionType": "OfferCreate",
      "TxnSignature": "3045022100E346C5C2C20EFDC5B58D56E1E1C381CA881846D40BDAE89973C4E065A91FB01D02207DB8A6CF32D5F988737F262B23809C68D7A6A723209A90F57A016122263EE9E9",
      "date": 469839200,
      "hash": options.hash,
      "owner_funds": "0.187148394287841"
    },
    "type": "transaction",
    "validated": true
  });
};

module.exports.cancelTransactionVerifiedResponse = function(options) {
  options = options || {};
  _.defaults(options, LIB_DEFAULTS);

  return JSON.stringify({
    "engine_result": "tesSUCCESS",
    "engine_result_code": 0,
    "engine_result_message": "The transaction was applied.",
    "ledger_hash": "22148DA306D45FA966F0AA2A667078AF80E782D02A21E346A7F49E07A274F186",
    "ledger_index": 10073361,
    "meta": {
      "AffectedNodes": [
        {
          "DeletedNode": {
            "FinalFields": {
              "Account": options.account,
              "BookDirectory": "3B95C29205977C2136BBC70F21895F8C8F471C8522BF446E5905AF3107A40000",
              "BookNode": "0000000000000000",
              "Flags": options.flags,
              "OwnerNode": "0000000000000000",
              "PreviousTxnID": "052D575D49936BAF2DC674C2A80D6E19995FC8197577B8EB6163D31DA49D0D9E",
              "PreviousTxnLgrSeq": 10073252,
              "Sequence": options.sequence,
              "TakerGets": options.taker_gets,
              "TakerPays": options.taker_pays
            },
            "LedgerEntryType": "Offer",
            "LedgerIndex": "093E00CAE2C35822017F99E27C2BD1FED6730858D109E3F5FA4C9FD8C9640453"
          }
        },
        {
          "DeletedNode": {
            "FinalFields": {
              "ExchangeRate": "5905AF3107A40000",
              "Flags": 0,
              "RootIndex": "3B95C29205977C2136BBC70F21895F8C8F471C8522BF446E5905AF3107A40000",
              "TakerGetsCurrency": "0000000000000000000000005553440000000000",
              "TakerGetsIssuer": "0A20B3C85F482532A9578DBB3950B85CA06594D1",
              "TakerPaysCurrency": "0000000000000000000000004A50590000000000",
              "TakerPaysIssuer": "E5C92828261DBAAC933B6309C6F5C72AF020AFD4"
            },
            "LedgerEntryType": "DirectoryNode",
            "LedgerIndex": "3B95C29205977C2136BBC70F21895F8C8F471C8522BF446E5905AF3107A40000"
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Flags": 0,
              "Owner": options.account,
              "RootIndex": "4CC6A36EE801B2A3A3B2E2C44857631BAF1A7FD1CAF73BAD55EB6F584815858A"
            },
            "LedgerEntryType": "DirectoryNode",
            "LedgerIndex": "4CC6A36EE801B2A3A3B2E2C44857631BAF1A7FD1CAF73BAD55EB6F584815858A"
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Account": options.account,
              "Balance": "511738048423",
              "Flags": 0,
              "OwnerCount": 5,
              "Sequence": options.sequence + 2
            },
            "LedgerEntryType": "AccountRoot",
            "LedgerIndex": "53539B9154C83B7D657103C27ABCA0EF1AD3674F6D0B341F20710FC50EC4DC03",
            "PreviousFields": {
              "Balance": "511738060423",
              "OwnerCount": 6,
              "Sequence": options.sequence + 1
            },
            "PreviousTxnID": "052D575D49936BAF2DC674C2A80D6E19995FC8197577B8EB6163D31DA49D0D9E",
            "PreviousTxnLgrSeq": 10073252
          }
        }
      ],
      "TransactionIndex": 8,
      "TransactionResult": "tesSUCCESS"
    },
    "status": "closed",
    "transaction": {
      "Account": options.account,
      "Fee": "12000",
      "Flags": 2147483648,
      "LastLedgerSequence": 10073368,
      "OfferSequence": options.sequence,
      "Sequence": options.sequence + 1,
      "SigningPubKey": "02AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3",
      "TransactionType": "OfferCancel",
      "TxnSignature": "3044022063C7C53712737A8715EF940F954C80D72C54D0D82DD01426059AEE147A831815022042CE97F22661B80897D07BAB6B66E80C184D424778062343881063E695AC0E7E",
      "date": 469910420,
      "hash": options.hash
    },
    "type": "transaction",
    "validated": true
  });
};

module.exports.unfundedOrderFinalizedResponse = function(options) {
  options = options || {};
  _.defaults(options, LIB_DEFAULTS);

  return JSON.stringify({
    "engine_result": "tecUNFUNDED_OFFER",
    "engine_result_code": 103,
    "engine_result_message": "Insufficient balance to fund created offer.",
    "ledger_hash": "CC075DCF5826FEC9D81CC1D5056405385679D8BA70F9F57DC2265FFFDF164F36",
    "ledger_index": 8819952,
    "meta": {
      "AffectedNodes": [
        {
          "ModifiedNode": {
            "FinalFields": {
              "Account": options.account,
              "Balance": "790423004",
              "Flags": 0,
              "OwnerCount": 5,
              "Sequence": 27
            },
            "LedgerEntryType": "AccountRoot",
            "LedgerIndex": "25FF5CC1037AE7E2C491A2E4C6206CBE31D0F1609B6426E6E8C3626BAC8C3439",
            "PreviousFields": {
              "Balance": "790435004",
              "Sequence": 26
            },
            "PreviousTxnID": "324601F5ED4F57B920BAC517C2F4361BB0A1ED9155DFAD3C8707326A66AF752B",
            "PreviousTxnLgrSeq": 8819952
          }
        }
      ],
      "TransactionIndex": 16,
      "TransactionResult": "tecUNFUNDED_OFFER"
    },
    "status": "closed",
    "transaction": {
      "Account": options.account,
      "Fee": "12000",
      "Flags": options.flags,
      "LastLedgerSequence": 8819952,
      "Sequence": 26,
      "SigningPubKey": "02AFA3692CC78A804ACC11DBA23DBB99943C6F8D61D3CB07BBE6D28356EB5B9C57",
      "TakerGets": options.taker_gets,
      "TakerPays": options.taker_pays,
      "TransactionType": "OfferCreate",
      "TxnSignature": "3045022100ECA423F103650DBBEABE63A97B1CA7C4E63FB5E33CB62A23ED52B0210AAF85D3022073388E6F81B175649FBBAE80971F6261230CF38A06FD5D476EB4BFF08C3A9B12",
      "date": 469834430,
      "hash": options.hash,
      "owner_funds": "0"
    },
    "type": "transaction",
    "validated": true
  });
};

module.exports.ledgerSequenceTooHighResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    result: {
      engine_result: 'tefMAX_LEDGER',
      engine_result_code: -186,
      engine_result_message: "Ledger sequence too high.",
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

module.exports.requestBookOffersBidsResponse = function(request, options) {
  options = options || {};

  _.defaults(options, {
    gets: {
      currency: 'BTC',
      issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
    },
    pays: {
      currency: 'USD',
      issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
    }
  });

  return JSON.stringify({
    id: request.id,
    result: {
      ledger_index: 10716345,
      offers: [
        {
          Account: "r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ",
          BookDirectory: "20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520B15A60037FFCF",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "544932DC56D72E845AF2B738821FE07865E32EC196270678AB0D947F54E9F49F",
          PreviousTxnLgrSeq: 10679000,
          Sequence: 434,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "3205.1"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.gets.issuer,
            value: "10"
          },
          index: "CE457115A4ADCC8CB351B3E35A0851E48DE16605C23E305017A9B697B156DE5A",
          owner_funds: "41952.95917199965",
          quality: "0.003120027456241615"
        },
        {
          Account: "rDYCRhpahKEhCFV25xScg67Bwf4W9sTYAm",
          BookDirectory: "20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520B1A2BC2EC5000",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "F68F9658AB3D462FEB027E6C380F054BC6D2514B43EC3C6AD46EE19C59BF1CC3",
          PreviousTxnLgrSeq: 10704238,
          Sequence: 233,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "1599.063669386278"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "4.99707396683212"
          },
          index: "BF14FBB305159DBCAEA91B7E848408F5B559A91B160EBCB6D244958A6A16EA6B",
          owner_funds: "3169.910902910102",
          quality: "0.003125"
        },
        {
          Account: "raudnGKfTK23YKfnS7ixejHrqGERTYNFXk",
          BookDirectory: "20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520B2BF1C2F4D4C9",
          BookNode: "0000000000000000",
          Expiration: 472785284,
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "00000000000008F0",
          PreviousTxnID: "446410E1CD718AC01929DD16B558FCF6B3A7B8BF208C420E67A280C089C5C59B",
          PreviousTxnLgrSeq: 10713576,
          Sequence: 110104,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "143.1050962074379"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "0.4499999999999999"
          },
          index: "67924B0EAA15784CC00CCD5FDD655EE2D6D2AE40341776B5F14E52341E7FC73E",
          owner_funds: "0",
          quality: "0.003144542101755081",
          taker_gets_funded: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0"
          },
          taker_pays_funded: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "0"
          }
        },
        {
          Account: "rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE",
          BookDirectory: "20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520B2CD7A2BFBB75",
          BookNode: "0000000000000000",
          Expiration: 472772651,
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "00000000000003CD",
          PreviousTxnID: "D49164AB68DDA3AEC9DFCC69A35685C4F532B5C231D3C1D25FEA7D5D0224FB84",
          PreviousTxnLgrSeq: 10711128,
          Sequence: 35625,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "254.329207354604"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "0.8"
          },
          index: "567BF2825173E3FB28FC94E436B6EB30D9A415FC2335E6D25CDE1BE47B25D120",
          owner_funds: "0",
          quality: "0.003145529403882357",
          taker_gets_funded: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0"
          },
          taker_pays_funded: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "0"
          }
        },
        {
          Account: "rwBYyfufTzk77zUSKEu4MvixfarC35av1J",
          BookDirectory: "20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520B3621DF140FDA",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000008",
          PreviousTxnID: "2E371E2B287C8A9FBB3424E4204B17AD9FA1BAA9F3B33C7D2261E3B038AFF083",
          PreviousTxnLgrSeq: 10716291,
          Sequence: 387756,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "390.4979"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "1.23231134568807"
          },
          index: "8CA23E55BF9F46AC7E803D3DB40FD03225EFCA66650D4CF0CBDD28A7CCDC8400",
          owner_funds: "5704.824764087842",
          quality: "0.003155743848271834"
        },
        {
          Account: "rwjsRktX1eguUr1pHTffyHnC4uyrvX58V1",
          BookDirectory: "20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520B3A4D41FF4211",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "91763FA7089C63CC4D5D14CBA6A5A5BF7ECE949B0D34F00FD35E733AF9F05AF1",
          PreviousTxnLgrSeq: 10716292,
          Sequence: 208927,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "1"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "0.003160328237957649"
          },
          index: "7206866E39D9843623EE79E570242753DEE3C597F3856AEFB4631DD5AD8B0557",
          owner_funds: "45.55665106096075",
          quality: "0.003160328237957649"
        },
        {
          Account: "r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ",
          BookDirectory: "20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520B4748E68669A7",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "3B3CF6FF1A336335E78513CF77AFD3A784ACDD7B1B4D3F1F16E22957A060BFAE",
          PreviousTxnLgrSeq: 10639969,
          Sequence: 429,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "4725"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "15"
          },
          index: "42894809370C7E6B23498EF8E22AD4B05F02B94F08E6983357A51EA96A95FF7F",
          quality: "0.003174603174603175"
        },
        {
          Account: "rDbsCJr5m8gHDCNEHCZtFxcXHsD4S9jH83",
          BookDirectory: "20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520B58077ED03C1B",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000001",
          PreviousTxnID: "98F3F2D02D3BB0AEAC09EECCF2F24BBE5E1AB2C71C40D7BD0A5199E12541B6E2",
          PreviousTxnLgrSeq: 10715839,
          Sequence: 110099,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "1.24252537879871"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.gets.issuer,
            value: "0.003967400879423823"
          },
          index: "F4404D6547149419D3607F81D7080979FBB3AFE2661F9A933E2F6C07AC1D1F6D",
          owner_funds: "73.52163803897041",
          quality: "0.003193013959408667"
        },
        {
          Account: "rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE",
          BookDirectory: "20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520B72A555B981A3",
          BookNode: "0000000000000000",
          Expiration: 472772652,
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "00000000000003CD",
          PreviousTxnID: "146C8DBB047BAAFAE5B8C8DECCCDACD9DFCD7A464E5AB273230FF975E9B83CF7",
          PreviousTxnLgrSeq: 10711128,
          Sequence: 35627,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "496.5429474010489"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "1.6"
          },
          index: "50CAA04E81D0009115B61C132FC9887FA9E5336E0CB8A2E7D3280ADBF6ABC043",
          quality: "0.003222279177208227",
          taker_gets_funded: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0"
          },
          taker_pays_funded: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "0"
          }
        },
        {
          Account: "r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ",
          BookDirectory: "20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520B730474DD96E5",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "624F9ADA85EC3BE845EAC075B47E01E4F89288EAF27823C715777B3DFFB21F24",
          PreviousTxnLgrSeq: 10639989,
          Sequence: 431,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "3103"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "10"
          },
          index: "8A319A496288228AD9CAD74375E32FA81805C56A9AD84798A26756A8B3F9EE23",
          quality: "0.003222687721559781"
        }
      ],
      validated: false
    },
    status: "success",
    type: "response"
  });
};

module.exports.requestBookOffersBidsPartialFundedResponse = function(request, options) {
  options = options || {};

  _.defaults(options, {
    gets: {
      currency: 'BTC',
      issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
    },
    pays: {
      currency: 'USD',
      issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
    }
  });

  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      ledger_current_index: 10714274,
      offers: [
        {
          Account: 'rpUirQxhaFqMp7YHPLMZCWxgZQbaZkp4bM',
          BookDirectory: '20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520B75DA97A99CE7',
          BookNode: '0000000000000000',
          Flags: 0,
          LedgerEntryType: 'Offer',
          OwnerNode: '0000000000000000',
          PreviousTxnID: '52801D1249261E410632BF6C00F503B1F51B31798C1E7DBD67B976FE65BE4DA4',
          PreviousTxnLgrSeq: 10630313,
          Sequence: 132,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: '310'
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: '1'
          },
          index: '861D15BECDA5DCA1327CF4D8080C181425F043AC969A992C5FAE5D12813785D0',
          owner_funds: '259.7268806690133',
          quality: '0.003225806451612903',
          taker_gets_funded: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: '259.2084637415302'
          },
          taker_pays_funded: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: '0.8361563346500974'
          }
        }
      ]
    }
  });
};

module.exports.requestBookOffersAsksPartialFundedResponse = function(request, options) {
  options = options || {};

  _.defaults(options, {
    gets: {
      currency: 'BTC',
      issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
    },
    pays: {
      currency: 'USD',
      issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
    }
  });

  return JSON.stringify({
    id: request.id,
    status: "success",
    type: "response",
    result: {
      ledger_current_index: 10714274,
      offers: [
        {
          Account: "rPyYxUGK8L4dgEvjPs3aRc1B1jEiLr3Hx5",
          BookDirectory: "6EAB7C172DEFA430DBFAD120FDC373B5F5AF8B191649EC98570BCB85BCA78000",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "D22993C68C94ACE3F2FCE4A334EBEA98CC46DCA92886C12B5E5B4780B5E17D4E",
          PreviousTxnLgrSeq: 10711938,
          Sequence: 392,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.8095"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "268.754"
          },
          index: "18B136E08EF50F0DEE8521EA22D16A950CD8B6DDF5F6E07C35F7FDDBBB09718D",
          owner_funds: "0.8095132334507441",
          quality: "332",
          taker_gets_funded: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.8078974385735969"
          },
          taker_pays_funded: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "268.2219496064341"
          }
        }
      ]
    }
  });
};

module.exports.requestBookOffersAsksResponse = function(request, options) {
  options = options || {};

  _.defaults(options, {
    gets: {
      currency: 'BTC',
      issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
    },
    pays: {
      currency: 'USD',
      issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
    }
  });


  return JSON.stringify({
    id: request.id,
    status: "success",
    type: "response",
    result: {
      ledger_current_index: 10714274,
      offers: [
        {
          Account: "rwBYyfufTzk77zUSKEu4MvixfarC35av1J",
          BookDirectory: "6EAB7C172DEFA430DBFAD120FDC373B5F5AF8B191649EC98570B9980E49C7DE8",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000008",
          PreviousTxnID: "92DBA0BE18B331AC61FB277211477A255D3B5EA9C5FE689171DE689FB45FE18A",
          PreviousTxnLgrSeq: 10714030,
          Sequence: 386940,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.2849323720855092"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "93.030522464522"
          },
          index: "8092033091034D94219BC1131AF7A6B469D790D81831CB479AB6F67A32BE4E13",
          owner_funds: "31.77682120227525",
          quality: "326.5003614141928"
        },
        {
          Account: "rwjsRktX1eguUr1pHTffyHnC4uyrvX58V1",
          BookDirectory: "6EAB7C172DEFA430DBFAD120FDC373B5F5AF8B191649EC98570BBF1EEFA2FB0A",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "C6BDA152363E3CFE18688A6830B49F3DB2B05976110B5908EA4EB66D93DEEB1F",
          PreviousTxnLgrSeq: 10714031,
          Sequence: 207855,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.00302447007930511"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "1"
          },
          index: "8DB3520FF9CB16A0EA955056C49115F8CFB03A587D0A4AFC844F1D220EFCE0B9",
          owner_funds: "0.0670537912615556",
          quality: "330.6364334177034"
        },
        {
          Account: "raudnGKfTK23YKfnS7ixejHrqGERTYNFXk",
          BookDirectory: "6EAB7C172DEFA430DBFAD120FDC373B5F5AF8B191649EC98570BC3A506FC016F",
          BookNode: "0000000000000000",
          Expiration: 472785283,
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "00000000000008F0",
          PreviousTxnID: "77E763F1D02F58965CD1AD94F557B37A582FAC7760B71F391B856959836C2F7B",
          PreviousTxnLgrSeq: 10713576,
          Sequence: 110103,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.3"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "99.34014894048333"
          },
          index: "9ECDFD31B28643FD3A54658398C5715D6DAD574F83F04529CB24765770F9084D",
          owner_funds: "4.021116654525635",
          quality: "331.1338298016111"
        },
        {
          Account: "rPyYxUGK8L4dgEvjPs3aRc1B1jEiLr3Hx5",
          BookDirectory: "6EAB7C172DEFA430DBFAD120FDC373B5F5AF8B191649EC98570BCB85BCA78000",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "D22993C68C94ACE3F2FCE4A334EBEA98CC46DCA92886C12B5E5B4780B5E17D4E",
          PreviousTxnLgrSeq: 10711938,
          Sequence: 392,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.8095"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "268.754"
          },
          index: "18B136E08EF50F0DEE8521EA22D16A950CD8B6DDF5F6E07C35F7FDDBBB09718D",
          owner_funds: "0.8095132334507441",
          quality: "332",
          taker_gets_funded: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.8078974385735969"
          },
          taker_pays_funded: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "268.2219496064341"
          }
        },
        {
          Account: "raudnGKfTK23YKfnS7ixejHrqGERTYNFXk",
          BookDirectory: "6EAB7C172DEFA430DBFAD120FDC373B5F5AF8B191649EC98570C00450D461510",
          BookNode: "0000000000000000",
          Expiration: 472785284,
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "00000000000008F0",
          PreviousTxnID: "1F4D9D859D9AABA888C0708A572B38919A3AEF2C8C1F5A13F58F44C92E5FF3FB",
          PreviousTxnLgrSeq: 10713576,
          Sequence: 110105,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.4499999999999999"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "152.0098333185607"
          },
          index: "9F380E0B39E2AF8AA9608C3E39A5A8628E6D0F44385C6D12BE06F4FEC8D83351",
          quality: "337.7996295968016"
        },
        {
          Account: "rDbsCJr5m8gHDCNEHCZtFxcXHsD4S9jH83",
          BookDirectory: "6EAB7C172DEFA430DBFAD120FDC373B5F5AF8B191649EC98570C560B764D760C",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000001",
          PreviousTxnID: "9A0B6B76F0D86614F965A2FFCC8859D8607F4E424351D4CFE2FBE24510F93F25",
          PreviousTxnLgrSeq: 10708382,
          Sequence: 110061,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.003768001830745216"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "1.308365894430151"
          },
          index: "B971769686CE1B9139502770158A4E7C011CFF8E865E5AAE5428E23AAA0E146D",
          owner_funds: "0.2229210189326514",
          quality: "347.2306949944844"
        },
        {
          Account: "rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE",
          BookDirectory: "6EAB7C172DEFA430DBFAD120FDC373B5F5AF8B191649EC98570C87DF25DC4FC6",
          BookNode: "0000000000000000",
          Expiration: 472783298,
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "00000000000003D2",
          PreviousTxnID: "E5F9A10F29A4BB3634D5A84FC96931E17267B58E0D2D5ADE24FFB751E52ADB9E",
          PreviousTxnLgrSeq: 10713533,
          Sequence: 35788,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.5"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "176.3546101589987"
          },
          index: "D2CB71038AD0ECAF4B5FF0A953AD1257225D0071E6F3AF9ADE67F05590B45C6E",
          owner_funds: "6.617688680663627",
          quality: "352.7092203179974"
        },
        {
          Account: "rN6jbxx4H6NxcnmkzBxQnbCWLECNKrgSSf",
          BookDirectory: "6EAB7C172DEFA430DBFAD120FDC373B5F5AF8B191649EC98570CC0B8E0E2C000",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "2E16ACFEAC2306E3B3483D445787F3496FACF9504F7A5E909620C1A73E2EDE54",
          PreviousTxnLgrSeq: 10558020,
          Sequence: 491,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.5"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "179.48"
          },
          index: "DA853913C8013C9471957349EDAEE4DF4846833B8CCB92008E2A8994E37BEF0D",
          owner_funds: "0.5",
          quality: "358.96",
          taker_gets_funded: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.499001996007984"
          },
          taker_pays_funded: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "179.1217564870259"
          }
        },
        {
          Account: "rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE",
          BookDirectory: "6EAB7C172DEFA430DBFAD120FDC373B5F5AF8B191649EC98570CD2F24C9C145D",
          BookNode: "0000000000000000",
          Expiration: 472783299,
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "00000000000003D2",
          PreviousTxnID: "B1B12E47043B4260223A2C4240D19E93526B55B1DB38DEED335DACE7C04FEB23",
          PreviousTxnLgrSeq: 10713534,
          Sequence: 35789,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.8"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "288.7710263794967"
          },
          index: "B89AD580E908F7337CCBB47A0BAAC6417EF13AC3465E34E8B7DD3BED016EA833",
          quality: "360.9637829743709"
        },
        {
          Account: "rUeCeioKJkbYhv4mRGuAbZpPcqkMCoYq6N",
          BookDirectory: "6EAB7C172DEFA430DBFAD120FDC373B5F5AF8B191649EC98570D0069F50EA028",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000012",
          PreviousTxnID: "F0E8ABF07F83DF0B5EF5B417E8E29A45A5503BA8F26FBC86447CC6B1FAD6A1C4",
          PreviousTxnLgrSeq: 10447672,
          Sequence: 5255,
          TakerGets: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.5"
          },
          TakerPays: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "182.9814890090516"
          },
          index: "D652DCE4B19C6CB43912651D3A975371D3B2A16A034EDF07BC11BF721AEF94A4",
          owner_funds: "0.225891986027944",
          quality: "365.9629780181032",
          taker_gets_funded: {
            currency: options.gets.currency,
            issuer: options.gets.issuer,
            value: "0.2254411038203033"
          },
          taker_pays_funded: {
            currency: options.pays.currency,
            issuer: options.pays.issuer,
            value: "82.50309772176658"
          }
        }
      ],
      validated: false
    }
  });
};

module.exports.requestBookOffersXRPBaseResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: "success",
    type: "response",
    result: {
      ledger_index: request.ledger_index,
      offers: [
        {
          Account: "rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9",
          BookDirectory: "4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5C10FB4C37E64D39",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000007",
          PreviousTxnID: "C4CF947D0C4CCFC667B60ACA552C9381BD4901800297C1DCBA9E162B56FE3097",
          PreviousTxnLgrSeq: 11004060,
          Sequence: 32667,
          TakerGets: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "577.9185501389138"
          },
          TakerPays: "27623954214",
          index: "B1330CDE9D818DBAF27DF16B9474880710FBC57F309F2A9B7D6AC9C4EBB0C722",
          owner_funds: "577.9127710112036",
          quality: "47799044.01296697",
          taker_gets_funded: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "576.7592525061912"
          },
          taker_pays_funded: "27568540895"
        },
        {
          Account: "rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9",
          BookDirectory: "4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5C10FB5758F3ACDC",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000007",
          PreviousTxnID: "BAA6974BC4E267FA53A91A7C820DE5E064FE2329763E42B712F0E0A5F6ABA0C9",
          PreviousTxnLgrSeq: 11004026,
          Sequence: 32661,
          TakerGets: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "578.129773249599"
          },
          TakerPays: "27634326809",
          index: "D5B3EB16FD23C03716C1ACDE274702D61EFD6807F15284A95C4CDF34375CAF71",
          quality: "47799522.00461532",
          taker_gets_funded: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "0"
          },
          taker_pays_funded: "0"
        },
        {
          Account: "rsvZ4ucGpMvfSYFQXB4nFaQhxiW5CUy2zx",
          BookDirectory: "4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5C10FB627A06C000",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000002",
          PreviousTxnID: "6221CBEC5E06E604B5AD32979D4C04CD3EA24404B6E07EC3508E708CC6FC1A9D",
          PreviousTxnLgrSeq: 11003996,
          Sequence: 549,
          TakerGets: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "265.0254187774191"
          },
          TakerPays: "12668215016",
          index: "A9AC351832B9A17FDA35650B6EE32C0A48F6AC661730E9855CC47498C171860C",
          owner_funds: "2676.502797501436",
          quality: "47800000"
        },
        {
          Account: "rfCFLzNJYvvnoGHWQYACmJpTgkLUaugLEw",
          BookDirectory: "4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5C110D996CF89F0E",
          BookNode: "0000000000000000",
          Expiration: 474062867,
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "00000000000000E1",
          PreviousTxnID: "80CFB17188F02FF19759CC19E6E543ACF3F7299C11746FCDD8D7D3BBD18FBC5E",
          PreviousTxnLgrSeq: 11004047,
          Sequence: 2665862,
          TakerGets: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "193"
          },
          TakerPays: "9264052522",
          index: "67C79EAA9F4EB638E2FC8F569C29E9E02F79F38BB136B66FD13857EB60432913",
          owner_funds: "3962.913768867934",
          quality: "48000272.13471502"
        },
        {
          Account: "rM3X3QSr8icjTGpaF52dozhbT2BZSXJQYM",
          BookDirectory: "4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5C110F696023CF97",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000005302",
          PreviousTxnID: "4DAC7F491E106C4BF2292C387144AB08D758B3DE04A1698BBD97468C893A375B",
          PreviousTxnLgrSeq: 11003934,
          Sequence: 1425976,
          TakerGets: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "161.8304886"
          },
          TakerPays: "7771132207",
          index: "A9696EDF0D7AC89ACBAF62E3CEDCD14DE82B441046CC748FE92A1DEB90D40A4A",
          owner_funds: "2673.609970934654",
          quality: "48020198.63023511"
        },
        {
          Account: "r4rCiFc9jpMeCpKioVJUMbT1hU4kj3XiSt",
          BookDirectory: "4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5C11107D2C579CB9",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "9559B82392D110D543FA47670A0619A423078FABD8DBD69B6620B83CBC851BE2",
          PreviousTxnLgrSeq: 11003872,
          Sequence: 44405,
          TakerGets: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "605.341293717861"
          },
          TakerPays: "29075779685",
          index: "F38F7F427823927F3870AB66E9C01529DDA7567CE62F9687992729B8F14E7937",
          owner_funds: "637.5308256246498",
          quality: "48032044.04976825"
        },
        {
          Account: "rNEib8Z73zSTYTi1WqzU4b1BQMXxnpYg1s",
          BookDirectory: "4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5C11108A8F4D49EA",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000001",
          PreviousTxnID: "1C41470EFDF9D83252C6EA702B7B8D8824A560D63B75880D652B1898D8519B98",
          PreviousTxnLgrSeq: 11004058,
          Sequence: 781823,
          TakerGets: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "166.647580164238"
          },
          TakerPays: "8004519725",
          index: "042EDAF04F4C0709831439DEC15384CA9C5C9926B63FB87D1352BD5FEDD2FC68",
          owner_funds: "166.6476801642377",
          quality: "48032618.99819498",
          taker_gets_funded: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "166.3150500641094"
          },
          taker_pays_funded: "7988547433"
        },
        {
          Account: "rPCFVxAqP2XdaPmih1ZSjmCPNxoyMiy2ne",
          BookDirectory: "4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5C11108A97DE552A",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000001",
          PreviousTxnID: "053C4A7116D258C2D83128B0552ADA2FCD3C50058953495B382114DED5D03CD1",
          PreviousTxnLgrSeq: 11003869,
          Sequence: 50020,
          TakerGets: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "792.5367174829754"
          },
          TakerPays: "38067615332",
          index: "EFF326D799C5D722F4367250DC3C9E3DADB300D4E96D634A58E1F4B534F754C7",
          owner_funds: "816.6776190772376",
          quality: "48032620.43542826"
        },
        {
          Account: "rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9",
          BookDirectory: "4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5C111177AF892263",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000007",
          PreviousTxnID: "D7E587874A4ACB0F2F5557416E8834EA3A9A9DCCF493A139DFC1DF1AA21FA24C",
          PreviousTxnLgrSeq: 11003728,
          Sequence: 32647,
          TakerGets: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "732.679143498934"
          },
          TakerPays: "35199960104",
          index: "3B2748D2270588F2A180CA2C6B7262B3D95F37BF5EE052600059F23BFFD4ED82",
          quality: "48042803.47861603",
          taker_gets_funded: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "0"
          },
          taker_pays_funded: "0"
        },
        {
          Account: "rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9",
          BookDirectory: "4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5C111182DF1CF82E",
          BookNode: "0000000000000000",
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000007",
          PreviousTxnID: "CD503C7524F4C16369C671D1E3419B8C7AA45D4D9049137B700C1F83F4B2A6ED",
          PreviousTxnLgrSeq: 11003716,
          Sequence: 32645,
          TakerGets: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "732.679143498934"
          },
          TakerPays: "35200312104",
          index: "C307AAACE73B101EA03D33C4A9FADECA19439F49F0AAF080FE37FA676B69F6D5",
          quality: "48043283.90719534",
          taker_gets_funded: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "0"
          },
          taker_pays_funded: "0"
        }
      ],
      validated: true
    }
  });
};

module.exports.requestBookOffersXRPCounterResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: "success",
    type: "response",
    result: {
      ledger_index: request.ledger_index,
      offers: [
        {
          Account: "rDhvfvsyBBTe8VFRp9q9hTmuUH91szQDyo",
          BookDirectory: "DFA3B6DDAB58C7E8E5D944E736DA4B7046C30E4F460FD9DE4D0773EDCBC36C00",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "CE8CF4B56D56B8625E97A0A885750228DA04FB3957F55DB812F571E82DBF409D",
          PreviousTxnLgrSeq: 11003859,
          Sequence: 554,
          TakerGets: "1000000000",
          TakerPays: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "20.9779"
          },
          index: "CE14A7A75F12FDD166FDFBE446CF737CE0D467F6F11299E69DA10EDFD9C984EB",
          owner_funds: "1037828768",
          quality: "0.0000000209779"
        },
        {
          Account: "rLVCrkavabdvHiNtcMedN3BAmz3AUc2L5j",
          BookDirectory: "DFA3B6DDAB58C7E8E5D944E736DA4B7046C30E4F460FD9DE4D07741EB0BD2000",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "000000000000000A",
          PreviousTxnID: "3F98A2AC970BCB077BFB6E6A99D1395C878DBD869F8327FE3BA226DE50229898",
          PreviousTxnLgrSeq: 10997095,
          Sequence: 7344,
          TakerGets: "70000000000",
          TakerPays: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "1468.6"
          },
          index: "9D7D345AC880071453B18F78BB2CDD8DB98B38025F4C6DC8A9CDA7ECDD7229C1",
          owner_funds: "189998700393",
          quality: "0.00000002098"
        },
        {
          Account: "rL5916QJwSMnUqcCv9savsXA7Xtq83fhzS",
          BookDirectory: "DFA3B6DDAB58C7E8E5D944E736DA4B7046C30E4F460FD9DE4D0775F05A074000",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "C8BA89CE93BCC203225337086752AB98AD87D201CFE8B8F768D8B33A95A442C9",
          PreviousTxnLgrSeq: 10996282,
          Sequence: 243,
          TakerGets: "100000000000",
          TakerPays: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "2100"
          },
          index: "307CE6343140915231E11E0FE993D2A256DEC18092A2B546EFA0B4214139FAFC",
          owner_funds: "663185088622",
          quality: "0.000000021"
        },
        {
          Account: "rGPmoJKzmocGgJoWUmU4KYxig2RUC7cESo",
          BookDirectory: "DFA3B6DDAB58C7E8E5D944E736DA4B7046C30E4F460FD9DE4D0777C203516000",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "3DE17110F54AD94B4F853ADA985AB02EE9E4B6382E9912E0128ED0D0DCAF71D2",
          PreviousTxnLgrSeq: 10997799,
          Sequence: 91,
          TakerGets: "58200000000",
          TakerPays: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "1223.364"
          },
          index: "8BFFF54B164E52C4B66EE193829D589EA03F0FAD86A585EB3208C3D2FDEE2CAF",
          owner_funds: "58199748000",
          quality: "0.00000002102",
          taker_gets_funded: "58199748000",
          taker_pays_funded: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "1223.35870296"
          }
        },
        {
          Account: "rfCFLzNJYvvnoGHWQYACmJpTgkLUaugLEw",
          BookDirectory: "DFA3B6DDAB58C7E8E5D944E736DA4B7046C30E4F460FD9DE4D077C885DE9E684",
          BookNode: "0000000000000000",
          Expiration: 474062867,
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "00000000000000E1",
          PreviousTxnID: "3E6B6CB8518CC6DF19E8EA0D38D0268ECE35DCCB59DE25DC5A340D4DB68312F8",
          PreviousTxnLgrSeq: 11004047,
          Sequence: 2665861,
          TakerGets: "8589393882",
          TakerPays: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "181"
          },
          index: "B2247E0118DAF88318EBB495A03F54C115FC9420AF85499D95D208912B059A86",
          owner_funds: "412756265349",
          quality: "0.0000000210724996998106"
        },
        {
          Account: "rn7Dk7YcNRmUb9q9WUVX1oh9Kp1Dkuy9xE",
          BookDirectory: "DFA3B6DDAB58C7E8E5D944E736DA4B7046C30E4F460FD9DE4D077CB4EB7E6D1E",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000009",
          PreviousTxnID: "2AF95FB960B7E4E0E9E88BCBF4465BD37DCC7D0B2D8C640F6B4384DDAB77E75E",
          PreviousTxnLgrSeq: 10999181,
          Sequence: 881318,
          TakerGets: "1983226007",
          TakerPays: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "41.79532441712259"
          },
          index: "AC3E2571C15C4A405D19DD0665B798AAACE843D87849544237DA7B29541990AB",
          owner_funds: "0",
          quality: "0.00000002107441323863326",
          taker_gets_funded: "0",
          taker_pays_funded: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "0"
          }
        },
        {
          Account: "rLVCrkavabdvHiNtcMedN3BAmz3AUc2L5j",
          BookDirectory: "DFA3B6DDAB58C7E8E5D944E736DA4B7046C30E4F460FD9DE4D077F08A879E000",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "000000000000000A",
          PreviousTxnID: "68D5EEA742C3EFD3E8CB3B998542042885C2D7E4BFAF47C15DF1681AD9D1E42A",
          PreviousTxnLgrSeq: 10995569,
          Sequence: 7335,
          TakerGets: "60000000000",
          TakerPays: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "1266"
          },
          index: "4ED8112E78F86DB75E5A14A6C2EE45F3EA9CBC5644EAFA81F970F688F0CC04D7",
          quality: "0.0000000211"
        },
        {
          Account: "rN24WWiyC6q1yWmm6b3Z6yMycohvnutLUQ",
          BookDirectory: "DFA3B6DDAB58C7E8E5D944E736DA4B7046C30E4F460FD9DE4D077F08A879E000",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "22BDB32176381066833FC64BC1D6D56F033F99695CBC996DAC848C36F2FC800C",
          PreviousTxnLgrSeq: 10996022,
          Sequence: 367,
          TakerGets: "8000000000",
          TakerPays: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "168.8"
          },
          index: "7B1F18E506BA7B06C18B10A4D0F45FA6213F94B5ACA1912B0C4A3C9F899862D5",
          owner_funds: "16601355477",
          quality: "0.0000000211"
        },
        {
          Account: "rfCFLzNJYvvnoGHWQYACmJpTgkLUaugLEw",
          BookDirectory: "DFA3B6DDAB58C7E8E5D944E736DA4B7046C30E4F460FD9DE4D0782A08429CE0B",
          BookNode: "0000000000000000",
          Expiration: 474062643,
          Flags: 0,
          LedgerEntryType: "Offer",
          OwnerNode: "00000000000000E1",
          PreviousTxnID: "A737529DC88EE6EFF684729BFBEB1CD89FF186A20041D6237EB1B36A192C4DF3",
          PreviousTxnLgrSeq: 11004000,
          Sequence: 2665799,
          TakerGets: "85621672636",
          TakerPays: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "1810"
          },
          index: "C63B614E60EB46FAA4F9F5E3B6D5535E18F909F936788514280F59EDB6C899BD",
          quality: "0.00000002113950760685067"
        },
        {
          Account: "rHRC9cBUYwEnrDZce6SkAkDTo8P9G1un3U",
          BookDirectory: "DFA3B6DDAB58C7E8E5D944E736DA4B7046C30E4F460FD9DE4D078394CFB33000",
          BookNode: "0000000000000000",
          Flags: 131072,
          LedgerEntryType: "Offer",
          OwnerNode: "0000000000000000",
          PreviousTxnID: "B08E26494F49ACCDFA22151369E2171558E5D62BA22DCFFD001DF2C45E0727DB",
          PreviousTxnLgrSeq: 10984137,
          Sequence: 17,
          TakerGets: "100752658247",
          TakerPays: {
            currency: "USD",
            issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            value: "2130.918721932529"
          },
          index: "72F31EC2BDE26A721CC78EB8D42B2BC4A3E36DCF6E7D4B73C53D4A40F4728A88",
          owner_funds: "4517636158733",
          quality: "0.00000002115"
        }
      ],
      validated: true
    }
  });
};

module.exports.RESTAccountOrdersResponse = function(options) {
  options = options || {};

  _.defaults(options, {
    validated: true
  });

  return JSON.stringify({
    success: true,
    marker: options.marker,
    limit: options.limit,
    ledger: options.ledger,
    validated: options.validated,
    orders: [
      { type: 'sell',
        taker_gets:
          { currency: 'EUR',
            counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            value: '17.70155237781915' },
        taker_pays:
          { currency: 'USD',
            counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            value: '1122.990930900328' },
        sequence: 719930,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'USD',
            counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            value: '18.46856867857617' },
        taker_pays:
          { currency: 'USD',
            counterparty: 'rpDMez6pm6dBve2TJsmDpv7Yae6V5Pyvy2',
            value: '19.50899530491766' },
        sequence: 757002,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'USD',
            counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            value: '19.11697137482289' },
        taker_pays:
          { currency: 'EUR',
            counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            value: '750' },
        sequence: 756999,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'USD',
            counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            value: '14.40727807030772' },
        taker_pays:
          { currency: 'USD',
            counterparty: 'rpDMez6pm6dBve2TJsmDpv7Yae6V5Pyvy2',
            value: '1445.796633544794' },
        sequence: 757003,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'NZD',
            counterparty: 'rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc',
            value: '9.178557969538755' },
        taker_pays:
          { currency: 'USD',
            counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            value: '750' },
        sequence: 782148,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'USD',
            counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            value: '9.94768291869523' },
        taker_pays:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '500' },
        sequence: 787368,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'USD',
            counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            value: '9.994805759894176' },
        taker_pays:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '10000' },
        sequence: 787408,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'USD',
            counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            value: '11.67691646304319' },
        taker_pays:
          { currency: 'MXN',
            counterparty: 'rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn',
            value: '15834.53653918684' },
        sequence: 803438,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'XAU',
            counterparty: 'r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH',
            value: '0.03206299605333101' },
        taker_pays:
          { currency: 'USD',
            counterparty: 'r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH',
            value: '3968.240250979598' },
        sequence: 807858,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'XAU',
            counterparty: 'r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH',
            value: '0.03347459066593226' },
        taker_pays:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '4139.022125516302' },
        sequence: 807896,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'NZD',
            counterparty: 'rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc',
            value: '6.840555705' },
        taker_pays: { currency: 'XRP', counterparty: '', value: '115760.19' },
        sequence: 814018,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'EUR',
            counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            value: '14.40843766044656' },
        taker_pays:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '902.4050961259154' },
        sequence: 827522,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'XAG',
            counterparty: 'r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH',
            value: '1.128432823485991' },
        taker_pays:
          { currency: 'USD',
            counterparty: 'r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH',
            value: '1814.887131319799' },
        sequence: 833592,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'XAG',
            counterparty: 'r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH',
            value: '1.128432823485989' },
        taker_pays:
          { currency: 'USD',
            counterparty: 'r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH',
            value: '181.4887131319798' },
        sequence: 833591,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'XAG',
            counterparty: 'r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH',
            value: '0.7283371225235964' },
        taker_pays:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '118.6872603846736' },
        sequence: 838954,
        passive: false },
      { type: 'buy',
        taker_gets: { currency: 'XRP', counterparty: '', value: '2229.229447' },
        taker_pays:
          { currency: 'XAU',
            counterparty: 'r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH',
            value: '1' },
        sequence: 843730,
        passive: false },
      { type: 'buy',
        taker_gets:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '17.77537376072202' },
        taker_pays:
          { currency: 'EUR',
            counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            value: '750' },
        sequence: 844068,
        passive: false }
    ]
  });
};

module.exports.RESTSubmitTransactionResponse = function(options) {
  options = options || {};
  _.defaults(options, REST_DEFAULTS);

  return JSON.stringify({
    success: true,
    order: {
      account: options.account,
      taker_gets: options.taker_gets,
      taker_pays: options.taker_pays,
      fee: '0.012',
      type: options.type,
      sequence: options.sequence
    },
    hash: options.hash,
    ledger: String(options.last_ledger),
    state: options.state
  });
};

module.exports.RESTCancelTransactionResponse = function(options) {
  options = options || {};
  _.defaults(options, DEFAULTS);

  return JSON.stringify({
    success: true,
    order: {
      account: options.account,
      fee: '0.012',
      offer_sequence: options.sequence,
      sequence: options.sequence + 1
    },
    hash: options.hash,
    ledger: String(options.last_ledger),
    state: options.state
  });
};

module.exports.RESTOrderBookResponse = function(options) {
  options = options || {};

  _.defaults(options,{
    ledger: 9592219
  });

  return JSON.stringify({
    success: true,
    order_book: 'BTC+r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH/USD+r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH',
    ledger: 9592219,
    validated: true,
    bids:
    [ { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '320.51' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '3205.1' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '3205.1' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '10' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '10' },
        order_maker: 'r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ',
        sequence: 434,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '319.99999999999991995316' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1599.063669386278' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1599.063669386278' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '4.99707396683212' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '4.99707396683212' },
        order_maker: 'rDYCRhpahKEhCFV25xScg67Bwf4W9sTYAm',
        sequence: 233,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '318.01132490541762622474' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '143.1050962074379' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.4499999999999999' },
        order_maker: 'raudnGKfTK23YKfnS7ixejHrqGERTYNFXk',
        sequence: 110104,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '317.911509193255' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '254.329207354604' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8' },
        order_maker: 'rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE',
        sequence: 35625,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '316.88250000000012839694' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '390.4979' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '390.4979' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.23231134568807' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.23231134568807' },
        order_maker: 'rwBYyfufTzk77zUSKEu4MvixfarC35av1J',
        sequence: 387756,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '316.42282848640003298582' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.003160328237957649' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.003160328237957649' },
        order_maker: 'rwjsRktX1eguUr1pHTffyHnC4uyrvX58V1',
        sequence: 208927,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '315' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '4725' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '4725' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '15' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '15' },
        order_maker: 'r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ',
        sequence: 429,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '313.18372318835581295619' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.24252537879871' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.24252537879871' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.003967400879423823' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.003967400879423823' },
        order_maker: 'rDbsCJr5m8gHDCNEHCZtFxcXHsD4S9jH83',
        sequence: 110099,
        passive: false,
        sell: true },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '310.3393421256555625' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '496.5429474010489' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.6' },
        order_maker: 'rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE',
        sequence: 35627,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '310.3' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '3103' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '3103' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '10' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '10' },
        order_maker: 'r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ',
        sequence: 431,
        passive: false,
        sell: false } ],
    asks:
    [ { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '326.50036141419275201121' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.2849323720855092' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.2849323720855092' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '93.030522464522' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '93.030522464522' },
        order_maker: 'rwBYyfufTzk77zUSKEu4MvixfarC35av1J',
        sequence: 386940,
        passive: false,
        sell: false },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '330.63643341770335886994' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.00302447007930511' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.00302447007930511' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1' },
        order_maker: 'rwjsRktX1eguUr1pHTffyHnC4uyrvX58V1',
        sequence: 207855,
        passive: false,
        sell: false },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '331.1338298016111' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.3' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.3' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '99.34014894048333' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '99.34014894048333' },
        order_maker: 'raudnGKfTK23YKfnS7ixejHrqGERTYNFXk',
        sequence: 110103,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '332' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8078974385735969' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8095' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '268.2219496064341' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '268.754' },
        order_maker: 'rPyYxUGK8L4dgEvjPs3aRc1B1jEiLr3Hx5',
        sequence: 392,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '337.79962959680163062214' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.4499999999999999' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.4499999999999999' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '152.0098333185607' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '152.0098333185607' },
        order_maker: 'raudnGKfTK23YKfnS7ixejHrqGERTYNFXk',
        sequence: 110105,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '347.23069499448441892052' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.003768001830745216' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.003768001830745216' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.308365894430151' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.308365894430151' },
        order_maker: 'rDbsCJr5m8gHDCNEHCZtFxcXHsD4S9jH83',
        sequence: 110061,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '352.7092203179974' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.5' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.5' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '176.3546101589987' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '176.3546101589987' },
        order_maker: 'rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE',
        sequence: 35788,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '358.96' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.499001996007984' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.5' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '179.1217564870259' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '179.48' },
        order_maker: 'rN6jbxx4H6NxcnmkzBxQnbCWLECNKrgSSf',
        sequence: 491,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '360.963782974370875' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '288.7710263794967' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '288.7710263794967' },
        order_maker: 'rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE',
        sequence: 35789,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '365.9629780181032' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.2254411038203033' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.5' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '82.50309772176658' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '182.9814890090516' },
        order_maker: 'rUeCeioKJkbYhv4mRGuAbZpPcqkMCoYq6N',
        sequence: 5255,
        passive: false,
        sell: false } ]
  });
};

module.exports.RESTOrderBookPartialAskResponse = function(options) {
  options = options || {};

  _.defaults(options,{
    ledger: 9592219
  });

  return JSON.stringify({
    success: true,
    order_book: 'BTC+r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH/USD+r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH',
    ledger: 9592219,
    validated: true,
    bids:
    [ { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '320.51' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '3205.1' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '3205.1' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '10' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '10' },
        order_maker: 'r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ',
        sequence: 434,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '319.99999999999991995316' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1599.063669386278' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1599.063669386278' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '4.99707396683212' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '4.99707396683212' },
        order_maker: 'rDYCRhpahKEhCFV25xScg67Bwf4W9sTYAm',
        sequence: 233,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '318.01132490541762622474' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '143.1050962074379' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.4499999999999999' },
        order_maker: 'raudnGKfTK23YKfnS7ixejHrqGERTYNFXk',
        sequence: 110104,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '317.911509193255' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '254.329207354604' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8' },
        order_maker: 'rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE',
        sequence: 35625,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '316.88250000000012839694' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '390.4979' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '390.4979' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.23231134568807' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.23231134568807' },
        order_maker: 'rwBYyfufTzk77zUSKEu4MvixfarC35av1J',
        sequence: 387756,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '316.42282848640003298582' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.003160328237957649' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.003160328237957649' },
        order_maker: 'rwjsRktX1eguUr1pHTffyHnC4uyrvX58V1',
        sequence: 208927,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '315' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '4725' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '4725' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '15' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '15' },
        order_maker: 'r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ',
        sequence: 429,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '313.18372318835581295619' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.24252537879871' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.24252537879871' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.003967400879423823' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.003967400879423823' },
        order_maker: 'rDbsCJr5m8gHDCNEHCZtFxcXHsD4S9jH83',
        sequence: 110099,
        passive: false,
        sell: true },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '310.3393421256555625' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '496.5429474010489' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.6' },
        order_maker: 'rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE',
        sequence: 35627,
        passive: false,
        sell: false },
      { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '310.3' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '3103' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '3103' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '10' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '10' },
        order_maker: 'r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ',
        sequence: 431,
        passive: false,
        sell: false } ],
    asks:
    [ { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '332' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8078974385735969' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8095' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '268.2219496064341' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '268.754' },
        order_maker: 'rPyYxUGK8L4dgEvjPs3aRc1B1jEiLr3Hx5',
        sequence: 392,
        passive: false,
        sell: true } ]
  });
};

module.exports.RESTOrderBookXRPBaseResponse = function(options) {
  options = options || {};

  _.defaults(options,{
    ledger: 9592219
  });

  return JSON.stringify({
    success: true,
    order_book: "XRP/USD+rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
    ledger: options.ledger,
    validated: true,
    bids: [
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02092092050478497075"
        },
        taker_gets_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "576.7592525061912"
        },
        taker_gets_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "577.9185501389138"
        },
        taker_pays_funded: {
          currency: "XRP",
          counterparty: "",
          value: "27568.540895"
        },
        taker_pays_total: {
          currency: "XRP",
          counterparty: "",
          value: "27623.954214"
        },
        order_maker: "rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9",
        sequence: 32667,
        passive: false,
        sell: false
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02092071130393205737"
        },
        taker_gets_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0"
        },
        taker_gets_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "578.129773249599"
        },
        taker_pays_funded: {
          currency: "XRP",
          counterparty: "",
          value: "0"
        },
        taker_pays_total: {
          currency: "XRP",
          counterparty: "",
          value: "27634.326809"
        },
        order_maker: "rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9",
        sequence: 32661,
        passive: false,
        sell: false
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.0209205020946274646"
        },
        taker_gets_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "265.0254187774191"
        },
        taker_gets_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "265.0254187774191"
        },
        taker_pays_funded: {
          currency: "XRP",
          counterparty: "",
          value: "12668.215016"
        },
        taker_pays_total: {
          currency: "XRP",
          counterparty: "",
          value: "12668.215016"
        },
        order_maker: "rsvZ4ucGpMvfSYFQXB4nFaQhxiW5CUy2zx",
        sequence: 549,
        passive: false,
        sell: true
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02083321521997735496"
        },
        taker_gets_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "193"
        },
        taker_gets_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "193"
        },
        taker_pays_funded: {
          currency: "XRP",
          counterparty: "",
          value: "9264.052522"
        },
        taker_pays_total: {
          currency: "XRP",
          counterparty: "",
          value: "9264.052522"
        },
        order_maker: "rfCFLzNJYvvnoGHWQYACmJpTgkLUaugLEw",
        sequence: 2665862,
        passive: false,
        sell: false
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02082457025428392638"
        },
        taker_gets_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "161.8304886"
        },
        taker_gets_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "161.8304886"
        },
        taker_pays_funded: {
          currency: "XRP",
          counterparty: "",
          value: "7771.132207"
        },
        taker_pays_total: {
          currency: "XRP",
          counterparty: "",
          value: "7771.132207"
        },
        order_maker: "rM3X3QSr8icjTGpaF52dozhbT2BZSXJQYM",
        sequence: 1425976,
        passive: false,
        sell: false
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02081943460419575675"
        },
        taker_gets_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "605.341293717861"
        },
        taker_gets_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "605.341293717861"
        },
        taker_pays_funded: {
          currency: "XRP",
          counterparty: "",
          value: "29075.779685"
        },
        taker_pays_total: {
          currency: "XRP",
          counterparty: "",
          value: "29075.779685"
        },
        order_maker: "r4rCiFc9jpMeCpKioVJUMbT1hU4kj3XiSt",
        sequence: 44405,
        passive: false,
        sell: false
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02081918539644025926"
        },
        taker_gets_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "166.3150500641094"
        },
        taker_gets_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "166.647580164238"
        },
        taker_pays_funded: {
          currency: "XRP",
          counterparty: "",
          value: "7988.547433"
        },
        taker_pays_total: {
          currency: "XRP",
          counterparty: "",
          value: "8004.519725"
        },
        order_maker: "rNEib8Z73zSTYTi1WqzU4b1BQMXxnpYg1s",
        sequence: 781823,
        passive: false,
        sell: false
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02081918477348806998"
        },
        taker_gets_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "792.5367174829754"
        },
        taker_gets_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "792.5367174829754"
        },
        taker_pays_funded: {
          currency: "XRP",
          counterparty: "",
          value: "38067.615332"
        },
        taker_pays_total: {
          currency: "XRP",
          counterparty: "",
          value: "38067.615332"
        },
        order_maker: "rPCFVxAqP2XdaPmih1ZSjmCPNxoyMiy2ne",
        sequence: 50020,
        passive: false,
        sell: false
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02081477198650787425"
        },
        taker_gets_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0"
        },
        taker_gets_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "732.679143498934"
        },
        taker_pays_funded: {
          currency: "XRP",
          counterparty: "",
          value: "0"
        },
        taker_pays_total: {
          currency: "XRP",
          counterparty: "",
          value: "35199.960104"
        },
        order_maker: "rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9",
        sequence: 32647,
        passive: false,
        sell: false
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02081456384063355349"
        },
        taker_gets_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0"
        },
        taker_gets_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "732.679143498934"
        },
        taker_pays_funded: {
          currency: "XRP",
          counterparty: "",
          value: "0"
        },
        taker_pays_total: {
          currency: "XRP",
          counterparty: "",
          value: "35200.312104"
        },
        order_maker: "rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9",
        sequence: 32645,
        passive: false,
        sell: false
      }
    ],
    asks: [
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.0209779"
        },
        taker_gets_funded: {
          currency: "XRP",
          counterparty: "",
          value: "1000"
        },
        taker_gets_total: {
          currency: "XRP",
          counterparty: "",
          value: "1000"
        },
        taker_pays_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "20.9779"
        },
        taker_pays_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "20.9779"
        },
        order_maker: "rDhvfvsyBBTe8VFRp9q9hTmuUH91szQDyo",
        sequence: 554,
        passive: false,
        sell: true
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02098"
        },
        taker_gets_funded: {
          currency: "XRP",
          counterparty: "",
          value: "70000"
        },
        taker_gets_total: {
          currency: "XRP",
          counterparty: "",
          value: "70000"
        },
        taker_pays_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "1468.6"
        },
        taker_pays_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "1468.6"
        },
        order_maker: "rLVCrkavabdvHiNtcMedN3BAmz3AUc2L5j",
        sequence: 7344,
        passive: false,
        sell: true
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.021"
        },
        taker_gets_funded: {
          currency: "XRP",
          counterparty: "",
          value: "100000"
        },
        taker_gets_total: {
          currency: "XRP",
          counterparty: "",
          value: "100000"
        },
        taker_pays_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "2100"
        },
        taker_pays_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "2100"
        },
        order_maker: "rL5916QJwSMnUqcCv9savsXA7Xtq83fhzS",
        sequence: 243,
        passive: false,
        sell: true
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02102"
        },
        taker_gets_funded: {
          currency: "XRP",
          counterparty: "",
          value: "58199.748"
        },
        taker_gets_total: {
          currency: "XRP",
          counterparty: "",
          value: "58200"
        },
        taker_pays_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "1223.35870296"
        },
        taker_pays_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "1223.364"
        },
        order_maker: "rGPmoJKzmocGgJoWUmU4KYxig2RUC7cESo",
        sequence: 91,
        passive: false,
        sell: true
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02107249969981059951"
        },
        taker_gets_funded: {
          currency: "XRP",
          counterparty: "",
          value: "8589.393882"
        },
        taker_gets_total: {
          currency: "XRP",
          counterparty: "",
          value: "8589.393882"
        },
        taker_pays_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "181"
        },
        taker_pays_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "181"
        },
        order_maker: "rfCFLzNJYvvnoGHWQYACmJpTgkLUaugLEw",
        sequence: 2665861,
        passive: false,
        sell: false
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02107441323863326587"
        },
        taker_gets_funded: {
          currency: "XRP",
          counterparty: "",
          value: "0"
        },
        taker_gets_total: {
          currency: "XRP",
          counterparty: "",
          value: "1983.226007"
        },
        taker_pays_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0"
        },
        taker_pays_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "41.79532441712259"
        },
        order_maker: "rn7Dk7YcNRmUb9q9WUVX1oh9Kp1Dkuy9xE",
        sequence: 881318,
        passive: false,
        sell: true
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.0211"
        },
        taker_gets_funded: {
          currency: "XRP",
          counterparty: "",
          value: "60000"
        },
        taker_gets_total: {
          currency: "XRP",
          counterparty: "",
          value: "60000"
        },
        taker_pays_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "1266"
        },
        taker_pays_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "1266"
        },
        order_maker: "rLVCrkavabdvHiNtcMedN3BAmz3AUc2L5j",
        sequence: 7335,
        passive: false,
        sell: true
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.0211"
        },
        taker_gets_funded: {
          currency: "XRP",
          counterparty: "",
          value: "8000"
        },
        taker_gets_total: {
          currency: "XRP",
          counterparty: "",
          value: "8000"
        },
        taker_pays_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "168.8"
        },
        taker_pays_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "168.8"
        },
        order_maker: "rN24WWiyC6q1yWmm6b3Z6yMycohvnutLUQ",
        sequence: 367,
        passive: false,
        sell: true
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02113950760685067166"
        },
        taker_gets_funded: {
          currency: "XRP",
          counterparty: "",
          value: "85621.672636"
        },
        taker_gets_total: {
          currency: "XRP",
          counterparty: "",
          value: "85621.672636"
        },
        taker_pays_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "1810"
        },
        taker_pays_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "1810"
        },
        order_maker: "rfCFLzNJYvvnoGHWQYACmJpTgkLUaugLEw",
        sequence: 2665799,
        passive: false,
        sell: false
      },
      {
        price: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "0.02115000000008415659"
        },
        taker_gets_funded: {
          currency: "XRP",
          counterparty: "",
          value: "100752.658247"
        },
        taker_gets_total: {
          currency: "XRP",
          counterparty: "",
          value: "100752.658247"
        },
        taker_pays_funded: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "2130.918721932529"
        },
        taker_pays_total: {
          currency: "USD",
          counterparty: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "2130.918721932529"
        },
        order_maker: "rHRC9cBUYwEnrDZce6SkAkDTo8P9G1un3U",
        sequence: 17,
        passive: false,
        sell: true
      }
    ]
  });
};

module.exports.RESTOrderBookXRPCounterResponse = function(options) {
  options = options || {};

  _.defaults(options,{
    ledger: 9592219
  });

  return JSON.stringify({
    success: true,
    order_book: 'USD+rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B/XRP',
    ledger: options.ledger,
    validated: true,
    bids:
    [ { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.66921379165693420218' },
        taker_gets_funded: { currency: 'XRP', counterparty: '', value: '1000' },
        taker_gets_total: { currency: 'XRP', counterparty: '', value: '1000' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '20.9779' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '20.9779' },
        order_maker: 'rDhvfvsyBBTe8VFRp9q9hTmuUH91szQDyo',
        sequence: 554,
        passive: false,
        sell: true },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.66444232602478551001' },
        taker_gets_funded: { currency: 'XRP', counterparty: '', value: '70000' },
        taker_gets_total: { currency: 'XRP', counterparty: '', value: '70000' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1468.6' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1468.6' },
        order_maker: 'rLVCrkavabdvHiNtcMedN3BAmz3AUc2L5j',
        sequence: 7344,
        passive: false,
        sell: true },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.61904761904761904762' },
        taker_gets_funded: { currency: 'XRP', counterparty: '', value: '100000' },
        taker_gets_total: { currency: 'XRP', counterparty: '', value: '100000' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '2100' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '2100' },
        order_maker: 'rL5916QJwSMnUqcCv9savsXA7Xtq83fhzS',
        sequence: 243,
        passive: false,
        sell: true },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.57373929590865842055' },
        taker_gets_funded: { currency: 'XRP', counterparty: '', value: '58199.748' },
        taker_gets_total: { currency: 'XRP', counterparty: '', value: '58200' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1223.35870296' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1223.364' },
        order_maker: 'rGPmoJKzmocGgJoWUmU4KYxig2RUC7cESo',
        sequence: 91,
        passive: false,
        sell: true },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.45521481767955801105' },
        taker_gets_funded: { currency: 'XRP', counterparty: '', value: '8589.393882' },
        taker_gets_total: { currency: 'XRP', counterparty: '', value: '8589.393882' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '181' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '181' },
        order_maker: 'rfCFLzNJYvvnoGHWQYACmJpTgkLUaugLEw',
        sequence: 2665861,
        passive: false,
        sell: false },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.45090592447985863047' },
        taker_gets_funded: { currency: 'XRP', counterparty: '', value: '0' },
        taker_gets_total: { currency: 'XRP', counterparty: '', value: '1983.226007' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '41.79532441712259' },
        order_maker: 'rn7Dk7YcNRmUb9q9WUVX1oh9Kp1Dkuy9xE',
        sequence: 881318,
        passive: false,
        sell: true },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.39336492890995260664' },
        taker_gets_funded: { currency: 'XRP', counterparty: '', value: '60000' },
        taker_gets_total: { currency: 'XRP', counterparty: '', value: '60000' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1266' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1266' },
        order_maker: 'rLVCrkavabdvHiNtcMedN3BAmz3AUc2L5j',
        sequence: 7335,
        passive: false,
        sell: true },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.39336492890995260664' },
        taker_gets_funded: { currency: 'XRP', counterparty: '', value: '8000' },
        taker_gets_total: { currency: 'XRP', counterparty: '', value: '8000' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '168.8' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '168.8' },
        order_maker: 'rN24WWiyC6q1yWmm6b3Z6yMycohvnutLUQ',
        sequence: 367,
        passive: false,
        sell: true },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.30479151160220994475' },
        taker_gets_funded: { currency: 'XRP', counterparty: '', value: '85621.672636' },
        taker_gets_total: { currency: 'XRP', counterparty: '', value: '85621.672636' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1810' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1810' },
        order_maker: 'rfCFLzNJYvvnoGHWQYACmJpTgkLUaugLEw',
        sequence: 2665799,
        passive: false,
        sell: false },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.28132387688042388099' },
        taker_gets_funded: { currency: 'XRP', counterparty: '', value: '100752.658247' },
        taker_gets_total: { currency: 'XRP', counterparty: '', value: '100752.658247' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '2130.918721932529' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '2130.918721932529' },
        order_maker: 'rHRC9cBUYwEnrDZce6SkAkDTo8P9G1un3U',
        sequence: 17,
        passive: false,
        sell: true } ],
    asks:
    [ { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.79904401296697114116' },
        taker_gets_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '576.7592525061912' },
        taker_gets_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '577.9185501389138' },
        taker_pays_funded: { currency: 'XRP', counterparty: '', value: '27568.540895' },
        taker_pays_total: { currency: 'XRP', counterparty: '', value: '27623.954214' },
        order_maker: 'rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9',
        sequence: 32667,
        passive: false,
        sell: false },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.79952198910414376988' },
        taker_gets_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_gets_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '578.129773249599' },
        taker_pays_funded: { currency: 'XRP', counterparty: '', value: '0' },
        taker_pays_total: { currency: 'XRP', counterparty: '', value: '27634.326809' },
        order_maker: 'rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9',
        sequence: 32661,
        passive: false,
        sell: false },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '47.79999999411138377896' },
        taker_gets_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '265.0254187774191' },
        taker_gets_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '265.0254187774191' },
        taker_pays_funded: { currency: 'XRP', counterparty: '', value: '12668.215016' },
        taker_pays_total: { currency: 'XRP', counterparty: '', value: '12668.215016' },
        order_maker: 'rsvZ4ucGpMvfSYFQXB4nFaQhxiW5CUy2zx',
        sequence: 549,
        passive: false,
        sell: true },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '48.00027213471502590674' },
        taker_gets_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '193' },
        taker_gets_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '193' },
        taker_pays_funded: { currency: 'XRP', counterparty: '', value: '9264.052522' },
        taker_pays_total: { currency: 'XRP', counterparty: '', value: '9264.052522' },
        order_maker: 'rfCFLzNJYvvnoGHWQYACmJpTgkLUaugLEw',
        sequence: 2665862,
        passive: false,
        sell: false },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '48.02019863023511874882' },
        taker_gets_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '161.8304886' },
        taker_gets_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '161.8304886' },
        taker_pays_funded: { currency: 'XRP', counterparty: '', value: '7771.132207' },
        taker_pays_total: { currency: 'XRP', counterparty: '', value: '7771.132207' },
        order_maker: 'rM3X3QSr8icjTGpaF52dozhbT2BZSXJQYM',
        sequence: 1425976,
        passive: false,
        sell: false },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '48.03204404976825003476' },
        taker_gets_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '605.341293717861' },
        taker_gets_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '605.341293717861' },
        taker_pays_funded: { currency: 'XRP', counterparty: '', value: '29075.779685' },
        taker_pays_total: { currency: 'XRP', counterparty: '', value: '29075.779685' },
        order_maker: 'r4rCiFc9jpMeCpKioVJUMbT1hU4kj3XiSt',
        sequence: 44405,
        passive: false,
        sell: false },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '48.0326189981949856156' },
        taker_gets_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '166.3150500641094' },
        taker_gets_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '166.647580164238' },
        taker_pays_funded: { currency: 'XRP', counterparty: '', value: '7988.547433' },
        taker_pays_total: { currency: 'XRP', counterparty: '', value: '8004.519725' },
        order_maker: 'rNEib8Z73zSTYTi1WqzU4b1BQMXxnpYg1s',
        sequence: 781823,
        passive: false,
        sell: false },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '48.03262043542826285505' },
        taker_gets_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '792.5367174829754' },
        taker_gets_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '792.5367174829754' },
        taker_pays_funded: { currency: 'XRP', counterparty: '', value: '38067.615332' },
        taker_pays_total: { currency: 'XRP', counterparty: '', value: '38067.615332' },
        order_maker: 'rPCFVxAqP2XdaPmih1ZSjmCPNxoyMiy2ne',
        sequence: 50020,
        passive: false,
        sell: false },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '48.04280347861603027671' },
        taker_gets_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_gets_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '732.679143498934' },
        taker_pays_funded: { currency: 'XRP', counterparty: '', value: '0' },
        taker_pays_total: { currency: 'XRP', counterparty: '', value: '35199.960104' },
        order_maker: 'rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9',
        sequence: 32647,
        passive: false,
        sell: false },
      { price:
          { currency: 'XRP',
            counterparty: '',
            value: '48.04328390719533855633' },
        taker_gets_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0' },
        taker_gets_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '732.679143498934' },
        taker_pays_funded: { currency: 'XRP', counterparty: '', value: '0' },
        taker_pays_total: { currency: 'XRP', counterparty: '', value: '35200.312104' },
        order_maker: 'rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9',
        sequence: 32645,
        passive: false,
        sell: false } ]
  });
};

module.exports.RESTOrderBookPartialBidResponse = function(options) {
  options = options || {};

  _.defaults(options,{
    ledger: 9592219
  });

  return JSON.stringify({
    success: true,
    order_book: 'BTC+r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH/USD+r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH',
    ledger: 9592219,
    validated: true,
    bids:
    [ { price:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '310' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '259.2084637415302' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '310' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8361563346500974' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1' },
        order_maker: 'rpUirQxhaFqMp7YHPLMZCWxgZQbaZkp4bM',
        sequence: 132,
        passive: false,
        sell: false } ],
    asks:
    [ { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '326.50036141419275201121' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.2849323720855092' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.2849323720855092' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '93.030522464522' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '93.030522464522' },
        order_maker: 'rwBYyfufTzk77zUSKEu4MvixfarC35av1J',
        sequence: 386940,
        passive: false,
        sell: false },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '330.63643341770335886994' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.00302447007930511' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.00302447007930511' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1' },
        order_maker: 'rwjsRktX1eguUr1pHTffyHnC4uyrvX58V1',
        sequence: 207855,
        passive: false,
        sell: false },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '331.1338298016111' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.3' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.3' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '99.34014894048333' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '99.34014894048333' },
        order_maker: 'raudnGKfTK23YKfnS7ixejHrqGERTYNFXk',
        sequence: 110103,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '332' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8078974385735969' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8095' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '268.2219496064341' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '268.754' },
        order_maker: 'rPyYxUGK8L4dgEvjPs3aRc1B1jEiLr3Hx5',
        sequence: 392,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '337.79962959680163062214' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.4499999999999999' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.4499999999999999' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '152.0098333185607' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '152.0098333185607' },
        order_maker: 'raudnGKfTK23YKfnS7ixejHrqGERTYNFXk',
        sequence: 110105,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '347.23069499448441892052' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.003768001830745216' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.003768001830745216' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.308365894430151' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '1.308365894430151' },
        order_maker: 'rDbsCJr5m8gHDCNEHCZtFxcXHsD4S9jH83',
        sequence: 110061,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '352.7092203179974' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.5' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.5' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '176.3546101589987' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '176.3546101589987' },
        order_maker: 'rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE',
        sequence: 35788,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '358.96' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.499001996007984' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.5' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '179.1217564870259' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '179.48' },
        order_maker: 'rN6jbxx4H6NxcnmkzBxQnbCWLECNKrgSSf',
        sequence: 491,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '360.963782974370875' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.8' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '288.7710263794967' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '288.7710263794967' },
        order_maker: 'rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE',
        sequence: 35789,
        passive: false,
        sell: true },
      { price:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '365.9629780181032' },
        taker_gets_funded:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.2254411038203033' },
        taker_gets_total:
          { currency: 'BTC',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '0.5' },
        taker_pays_funded:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '82.50309772176658' },
        taker_pays_total:
          { currency: 'USD',
            counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
            value: '182.9814890090516' },
        order_maker: 'rUeCeioKJkbYhv4mRGuAbZpPcqkMCoYq6N',
        sequence: 5255,
        passive: false,
        sell: false } ]
  });
};
