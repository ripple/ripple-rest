var _ = require('lodash');
var addresses = require('./../fixtures').addresses;
var paths = require('./paths');

const ORDER_HASH = '71AE74B03DE3B9A06C559AD4D173A362D96B7D2A5AA35F56B9EF21543D627F34';
const DEFAULTS = {
  account: addresses.VALID,
  taker_gets: {
    currency: 'USD',
    issuer: addresses.ISSUER,
    value: '100'
  },
  taker_pays: {
    currency: 'JPY',
    issuer: addresses.ISSUER,
    value: '10000'
  },
  flags: 2148007936,
  hash: ORDER_HASH,
  type: 'sell',
  state: 'pending',
  sequence: 99
};

module.exports.order = function(options) {
  options = options || {};
  _.defaults(options, {
    secret: addresses.SECRET,
    type: 'buy',
    taker_gets: '100/USD/' + addresses.ISSUER,
    taker_pays: '100/USD/' + addresses.ISSUER
  });

  return {
    secret: options.secret,
    order: {
       type: options.type,
       taker_gets: options.taker_gets,
       taker_pays: options.taker_pays
    }
  };
};

module.exports.accountOrdersResponse = function(request, options) {
  options = options || {};
  _.defaults(options, {
    account: addresses.VALID
  });

  return JSON.stringify({
    "id": request.id,
    "result": {
      "account": options.account,
      "marker": options.marker,
      "ledger_index": 9941609,
      "offers": [
        {
          "flags": 0,
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
      "validated": false
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

module.exports.requestSubmitResponse = function(request, options) {
  options = options || {};
  _.defaults(options, DEFAULTS);

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
  _.defaults(options, DEFAULTS);

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
  _.defaults(options, DEFAULTS);

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
        "Sequence": 24,
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
  _.defaults(options, DEFAULTS);

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
  _.defaults(options, DEFAULTS);

  return JSON.stringify({
    "engine_result": "tesSUCCESS",
    "engine_result_code": 0,
    "engine_result_message": "The transaction was applied.",
    "ledger_hash": "F1822659E6C0F1E1169F1AEFC4A07F8BCE124BF8A6CEEE30AFB4DDBDAFF2776A",
    "ledger_index": 8819952,
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
  _.defaults(options, DEFAULTS);

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
  _.defaults(options, DEFAULTS);

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

module.exports.RESTAccountOrdersResponse = function(options) {
  options = options || {};

  return JSON.stringify({
    success: true,
    marker: options.marker,
    orders: [
      {
        "flags": 0,
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
    ]
  });
};

module.exports.RESTSubmitTransactionResponse = function(options) {
  options = options || {};
  _.defaults(options, DEFAULTS);

  return JSON.stringify({
    success: true,
    order: {
      hash: options.hash,
      ledger: String(options.last_ledger),
      state: options.state,
      account: options.account,
      taker_gets: options.taker_gets,
      taker_pays: options.taker_pays,
      fee: '0.012',
      type: options.type,
      sequence: options.sequence
    }
  });
};

module.exports.RESTCancelTransactionResponse = function(options) {
  options = options || {};
  _.defaults(options, DEFAULTS);

  return JSON.stringify({
    success: true,
    order: {
      hash: options.hash,
      ledger: String(options.last_ledger),
      state: options.state,
      account: options.account,
      fee: '0.012',
      offer_sequence: options.sequence,
      sequence: options.sequence + 1
    }
  });
};
