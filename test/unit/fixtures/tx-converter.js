/* eslint-disable new-cap */
/* eslint-disable max-len */
'use strict';

var _ = require('lodash');
var addresses = require('./../../fixtures').addresses;

var VALID_TRANSACTION_HASH = 'F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF';

// VALID's EUR balance with ISSUER goes down from 6.948 to 6.113
// VALID's XRP balance goes down 15000 drops for the fee
// rGAW's USD balance with ISSUER goes down from 615 to 614
// rGAW's EUR balance with ISSUER goes up from 9988 to 9989
module.exports.COMPLICATED_META = {
  AffectedNodes: [
    {
      ModifiedNode: {
        FinalFields: {
          Balance: {
            currency: 'EUR',
            issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
            value: '-6.113114000000012'
         },
          Flags: 2228224,
          HighLimit: {
            currency: 'EUR',
            issuer: addresses.VALID,
            value: '100'
         },
          HighNode: '0000000000000000',
          LowLimit: {
            currency: 'EUR',
            issuer: addresses.ISSUER,
            value: '0'
         },
          LowNode: '0000000000000000'
       },
        LedgerEntryType: 'RippleState',
        LedgerIndex: '24D1C0A5010D55A17DF68086F66945393CC8DBFED112D31A51CDAB36550845AA',
        PreviousFields: {
          Balance: {
            currency: 'EUR',
            issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
            value: '-6.948114000000011'
         }
       },
        PreviousTxnID: '02B2AA7EBC3F484740FEA25268B208CDE84D69AC70C97FB7CF5CBF540FEDEE6C',
        PreviousTxnLgrSeq: 10251451
     }
   },
    {
      ModifiedNode: {
        FinalFields: {
          Account: addresses.VALID,
          Balance: '88622336',
          Flags: 0,
          OwnerCount: 1,
          Sequence: 100
       },
        LedgerEntryType: 'AccountRoot',
        LedgerIndex: '3FF5B517FE080E470078AABEAF8FEE7FF07DB778B979E4DB580E2B74879D8E22',
        PreviousFields: {
          Balance: '88637336',
          Sequence: 99
       },
        PreviousTxnID: '157DC6CB2E0F2118212B475FB3DEB0984FB74B5DF58829730BCCB44C79D9270D',
        PreviousTxnLgrSeq: 10246850
     }
   },
    {
      ModifiedNode: {
        FinalFields: {
          Balance: {
            currency: 'USD',
            issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
            value: '-614.2984464173688'
         },
          Flags: 131072,
          HighLimit: {
            currency: 'USD',
            issuer: 'rGAWXLxpsy77vWxgYriPZE5ktUfqa6prbG',
            value: '1000'
         },
          HighNode: '0000000000000000',
          LowLimit: {
            currency: 'USD',
            issuer: addresses.ISSUER,
            value: '0'
         },
          LowNode: '0000000000000000'
       },
        LedgerEntryType: 'RippleState',
        LedgerIndex: '5DE72094CF0D34410C620A2003735FD4391FBA6F100D19A31CEFE4A4B1E9A116',
        PreviousFields: {
          Balance: {
            currency: 'USD',
            issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
            value: '-615.2984464173688'
         }
       },
        PreviousTxnID: '02B2AA7EBC3F484740FEA25268B208CDE84D69AC70C97FB7CF5CBF540FEDEE6C',
        PreviousTxnLgrSeq: 10251451
     }
   },
    {
      ModifiedNode: {
        FinalFields: {
          Balance: {
            currency: 'EUR',
            issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
            value: '-9989.667799999999'
         },
          Flags: 131072,
          HighLimit: {
            currency: 'EUR',
            issuer: 'rGAWXLxpsy77vWxgYriPZE5ktUfqa6prbG',
            value: '10000000'
         },
          HighNode: '0000000000000000',
          LowLimit: {
            currency: 'EUR',
            issuer: addresses.ISSUER,
            value: '0'
         },
          LowNode: '0000000000000000'
       },
        LedgerEntryType: 'RippleState',
        LedgerIndex: '6086D04C4C47B3F92B3EC0BA70BF762A13C7366299CEAA2E5F75666991AE28DF',
        PreviousFields: {
          Balance: {
            currency: 'EUR',
            issuer: 'rrrrrrrrrrrrrrrrrrrrBZbvji',
            value: '-9988.834466666666'
         }
       },
        PreviousTxnID: '02B2AA7EBC3F484740FEA25268B208CDE84D69AC70C97FB7CF5CBF540FEDEE6C',
        PreviousTxnLgrSeq: 10251451
     }
   },
    {
      ModifiedNode: {
        FinalFields: {
          Account: 'rGAWXLxpsy77vWxgYriPZE5ktUfqa6prbG',
          BookDirectory: 'B939D46F734C31872A8B6C423F61FA2D2743F0622661668D541D9B1F5D20D554',
          BookNode: '0000000000000000',
          Flags: 0,
          OwnerNode: '0000000000000000',
          Sequence: 56,
          TakerGets: {
            currency: 'USD',
            issuer: addresses.ISSUER,
            value: '488'
         },
          TakerPays: {
            currency: 'EUR',
            issuer: addresses.ISSUER,
            value: '406.6666666666667'
         }
       },
        LedgerEntryType: 'Offer',
        LedgerIndex: 'A19F21722E4361EA4495DE7EF2CCE362367C43196620B68D563B661CFEA4AFAE',
        PreviousFields: {
          TakerGets: {
            currency: 'USD',
            issuer: addresses.ISSUER,
            value: '489'
         },
          TakerPays: {
            currency: 'EUR',
            issuer: addresses.ISSUER,
            value: '407.5'
         }
       },
        PreviousTxnID: '157DC6CB2E0F2118212B475FB3DEB0984FB74B5DF58829730BCCB44C79D9270D',
        PreviousTxnLgrSeq: 10246850
     }
   }
 ]
};

module.exports.paymentTx = function(options) {
  options = options || {};
  _.defaults(options, {
    meta: {
      'AffectedNodes': [
        {
          'ModifiedNode': {
            'FinalFields': {
              'Account': addresses.VALID,
              'BookDirectory': '4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5E03E788E09BB000',
              'BookNode': '0000000000000000',
              'Flags': 0,
              'OwnerNode': '0000000000000000',
              'Sequence': 58,
              'TakerGets': {
                'currency': 'USD',
                'issuer': addresses.COUNTERPARTY,
                'value': '5.648998'
             },
              'TakerPays': '6208248802'
           },
            'LedgerEntryType': 'Offer',
            'LedgerIndex': '3CFB3C79D4F1BDB1EE5245259372576D926D9A875713422F7169A6CC60AFA68B',
            'PreviousFields': {
              'TakerGets': {
                'currency': 'USD',
                'issuer': addresses.COUNTERPARTY,
                'value': '5.65'
             },
              'TakerPays': '6209350000'
           },
            'PreviousTxnID': '8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4',
            'PreviousTxnLgrSeq': 348433
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Balance': {
                'currency': 'USD',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-0.001'
             },
              'Flags': 131072,
              'HighLimit': {
                'currency': 'USD',
                'issuer': addresses.ISSUER,
                'value': '1'
             },
              'HighNode': '0000000000000000',
              'LowLimit': {
                'currency': 'USD',
                'issuer': addresses.COUNTERPARTY,
                'value': '0'
             },
              'LowNode': '0000000000000002'
           },
            'LedgerEntryType': 'RippleState',
            'LedgerIndex': '4BD1874F8F3A60EDB0C23F5BD43E07953C2B8741B226648310D113DE2B486F01',
            'PreviousFields': {
              'Balance': {
                'currency': 'USD',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '0'
             }
           },
            'PreviousTxnID': '5B2006DAD0B3130F57ACF7CC5CCAC2EEBCD4B57AAA091A6FD0A24B073D08ABB8',
            'PreviousTxnLgrSeq': 343703
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Account': addresses.VALID,
              'Balance': '9998898762',
              'Flags': 0,
              'OwnerCount': 3,
              'Sequence': 5
           },
            'LedgerEntryType': 'AccountRoot',
            'LedgerIndex': '4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05',
            'PreviousFields': {
              'Balance': '9999999970',
              'Sequence': 4
           },
            'PreviousTxnID': '53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8',
            'PreviousTxnLgrSeq': 343570
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Account': 'r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr',
              'Balance': '912695302618',
              'Flags': 0,
              'OwnerCount': 10,
              'Sequence': 59
           },
            'LedgerEntryType': 'AccountRoot',
            'LedgerIndex': 'F3E119AAA87AF3607CF87F5523BB8278A83BCB4142833288305D767DD30C392A',
            'PreviousFields': {
              'Balance': '912694201420'
           },
            'PreviousTxnID': '8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4',
            'PreviousTxnLgrSeq': 348433
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Balance': {
                'currency': 'USD',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-5.5541638883365'
             },
              'Flags': 131072,
              'HighLimit': {
                'currency': 'USD',
                'issuer': 'r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr',
                'value': '1000'
             },
              'HighNode': '0000000000000000',
              'LowLimit': {
                'currency': 'USD',
                'issuer': addresses.COUNTERPARTY,
                'value': '0'
             },
              'LowNode': '000000000000000C'
           },
            'LedgerEntryType': 'RippleState',
            'LedgerIndex': 'FA1255C2E0407F1945BCF9351257C7C5C28B0F5F09BB81C08D35A03E9F0136BC',
            'PreviousFields': {
              'Balance': {
                'currency': 'USD',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-5.5551658883365'
             }
           },
            'PreviousTxnID': '8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4',
            'PreviousTxnLgrSeq': 348433
         }
       }
     ],
      'TransactionIndex': 0,
      'TransactionResult': 'tesSUCCESS'
   },
    hash: VALID_TRANSACTION_HASH
 });

  return {
    'Account': addresses.VALID,
    'Amount': {
      'currency': 'USD',
      'issuer': addresses.ISSUER,
      'value': '0.001'
   },
    'Destination': addresses.ISSUER,
    'Fee': '10',
    'Flags': 0,
    'Memos': [
      {
        'Memo': {
          'MemoData': '736F6D655F76616C7565',
          'MemoType': '736F6D655F6B6579'
       }
     },
      {
        'Memo': {
          'MemoData': '736F6D655F76616C7565'
       }
     }
   ],
    'Paths': [
      [
        {
          'currency': 'USD',
          'issuer': addresses.COUNTERPARTY,
          'type': 48,
          'type_hex': '0000000000000030'
       },
        {
          'account': addresses.COUNTERPARTY,
          'currency': 'USD',
          'issuer': addresses.COUNTERPARTY,
          'type': 49,
          'type_hex': '0000000000000031'
       }
     ]
   ],
    'SendMax': '1112209',
    'Sequence': 4,
    'SigningPubKey': '02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D',
    'TransactionType': 'Payment',
    'TxnSignature': '304502204EE3E9D1B01D8959B08450FCA9E22025AF503DEF310E34A93863A85CAB3C0BC5022100B61F5B567F77026E8DEED89EED0B7CAF0E6C96C228A2A65216F0DC2D04D52083',
    'date': 416447810,
    'hash': options.hash,
    'inLedger': 348860,
    'ledger_index': 348860,
    'meta': options.meta,
    'validated': true
 };
};

module.exports.paymentRest = {
  source_account: addresses.VALID,
  source_tag: '',
  source_amount: {value: '1.112209', currency: 'XRP', issuer: ''},
  source_slippage: '0',
  destination_account: addresses.ISSUER,
  destination_tag: '',
  destination_amount:
  {currency: 'USD',
    issuer: addresses.ISSUER,
    value: '0.001'},
  invoice_id: '',
  paths: '[[{\"currency\":\"USD\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"currency\":\"USD\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":49,\"type_hex\":\"0000000000000031\"}]]',
  no_direct_ripple: false,
  partial_payment: false,
  direction: 'outgoing',
  result: 'tesSUCCESS',
  timestamp: '2013-03-12T23:56:50.000Z',
  fee: '0.00001',
  balance_changes: [
    {
      currency: 'XRP',
      value: '-1.101208',
      issuer: ''
   }
 ],
  source_balance_changes: [{value: '-1.101208', currency: 'XRP', issuer: ''}],
  destination_balance_changes:
    [{value: '0.001',
      currency: 'USD',
      issuer: addresses.COUNTERPARTY}],
  order_changes: [
    {
      taker_pays: {
        currency: 'XRP',
        issuer: '',
        value: '-1.101198'
     },
      taker_gets: {
        currency: 'USD',
        issuer: addresses.COUNTERPARTY,
        value: '-0.001002'
     },
      sequence: 58,
      status: 'open'
   }
 ],
  memos:
    [{MemoData: '736F6D655F76616C7565',
      MemoType: '736F6D655F6B6579'},
      {MemoData: '736F6D655F76616C7565'}]};


module.exports.pathFindResultsTx = {
  'alternatives': [
    {
      'paths_canonical': [],
      'paths_computed': [
        [
          {
            'account': 'rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'currency': 'USD',
            'issuer': addresses.ISSUER,
            'type': 48,
            'type_hex': '0000000000000030'
         },
          {
            'account': addresses.ISSUER,
            'type': 1,
            'type_hex': '0000000000000001'
         }
       ],
        [
          {
            'account': 'rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'currency': 'XRP',
            'type': 16,
            'type_hex': '0000000000000010'
         },
          {
            'currency': 'USD',
            'issuer': addresses.ISSUER,
            'type': 48,
            'type_hex': '0000000000000030'
         },
          {
            'account': addresses.ISSUER,
            'type': 1,
            'type_hex': '0000000000000001'
         }
       ],
        [
          {
            'account': 'rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'currency': 'XRP',
            'type': 16,
            'type_hex': '0000000000000010'
         },
          {
            'currency': 'USD',
            'issuer': 'rpHgehzdpfWRXKvSv6duKvVuo1aZVimdaT',
            'type': 48,
            'type_hex': '0000000000000030'
         },
          {
            'account': 'rpHgehzdpfWRXKvSv6duKvVuo1aZVimdaT',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'account': addresses.ISSUER,
            'type': 1,
            'type_hex': '0000000000000001'
         }
       ],
        [
          {
            'account': 'rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'currency': 'XRP',
            'type': 16,
            'type_hex': '0000000000000010'
         },
          {
            'currency': 'USD',
            'issuer': 'rHHa9t2kLQyXRbdLkSzEgkzwf9unmFgZs9',
            'type': 48,
            'type_hex': '0000000000000030'
         },
          {
            'account': 'rHHa9t2kLQyXRbdLkSzEgkzwf9unmFgZs9',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'account': addresses.ISSUER,
            'type': 1,
            'type_hex': '0000000000000001'
         }
       ]
     ],
      'source_amount': {
        'currency': 'JPY',
        'value': '0.1117218827811721'
     }
   },
    {
      'paths_canonical': [],
      'paths_computed': [
        [
          {
            'account': addresses.ISSUER,
            'type': 1,
            'type_hex': '0000000000000001'
         }
       ],
        [
          {
            'account': 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'currency': 'USD',
            'issuer': addresses.ISSUER,
            'type': 48,
            'type_hex': '0000000000000030'
         },
          {
            'account': addresses.ISSUER,
            'type': 1,
            'type_hex': '0000000000000001'
         }
       ],
        [
          {
            'account': 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'currency': 'XRP',
            'type': 16,
            'type_hex': '0000000000000010'
         },
          {
            'currency': 'USD',
            'issuer': addresses.ISSUER,
            'type': 48,
            'type_hex': '0000000000000030'
         },
          {
            'account': addresses.ISSUER,
            'type': 1,
            'type_hex': '0000000000000001'
         }
       ],
        [
          {
            'account': 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'currency': 'XRP',
            'type': 16,
            'type_hex': '0000000000000010'
         },
          {
            'currency': 'USD',
            'issuer': 'rpHgehzdpfWRXKvSv6duKvVuo1aZVimdaT',
            'type': 48,
            'type_hex': '0000000000000030'
         },
          {
            'account': 'rpHgehzdpfWRXKvSv6duKvVuo1aZVimdaT',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'account': addresses.ISSUER,
            'type': 1,
            'type_hex': '0000000000000001'
         }
       ]
     ],
      'source_amount': {
        'currency': 'USD',
        'issuer': addresses.VALID,
        'value': '0.001002'
     }
   },
    {
      'paths_canonical': [],
      'paths_computed': [
        [
          {
            'currency': 'USD',
            'issuer': addresses.ISSUER,
            'type': 48,
            'type_hex': '0000000000000030'
         },
          {
            'account': addresses.ISSUER,
            'type': 1,
            'type_hex': '0000000000000001'
         }
       ],
        [
          {
            'currency': 'USD',
            'issuer': 'rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc',
            'type': 48,
            'type_hex': '0000000000000030'
         },
          {
            'account': 'rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'account': 'rf9X8QoYnWLHMHuDfjkmRcD2UE5qX5aYV',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'account': addresses.ISSUER,
            'type': 1,
            'type_hex': '0000000000000001'
         }
       ],
        [
          {
            'currency': 'USD',
            'issuer': 'rDVdJ62foD1sn7ZpxtXyptdkBSyhsQGviT',
            'type': 48,
            'type_hex': '0000000000000030'
         },
          {
            'account': 'rDVdJ62foD1sn7ZpxtXyptdkBSyhsQGviT',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'account': 'rfQPFZ3eLcaSUKjUy7A3LAmDNM4F9Hz9j1',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'account': addresses.ISSUER,
            'type': 1,
            'type_hex': '0000000000000001'
         }
       ],
        [
          {
            'currency': 'USD',
            'issuer': 'rpHgehzdpfWRXKvSv6duKvVuo1aZVimdaT',
            'type': 48,
            'type_hex': '0000000000000030'
         },
          {
            'account': 'rpHgehzdpfWRXKvSv6duKvVuo1aZVimdaT',
            'type': 1,
            'type_hex': '0000000000000001'
         },
          {
            'account': addresses.ISSUER,
            'type': 1,
            'type_hex': '0000000000000001'
         }
       ]
     ],
      'source_amount': '207669'
   }
 ],
  'destination_account': addresses.VALID,
  'destination_currencies': [
    'USD',
    'JOE',
    'BTC',
    'DYM',
    'CNY',
    'EUR',
    '015841551A748AD2C1F76FF6ECB0CCCD00000000',
    'MXN',
    'XRP'
 ],
  'source_account': addresses.VALID,
  'destination_amount': {
    'value': '100',
    'currency': 'USD',
    'issuer': addresses.ISSUER
 }
};


module.exports.pathPaymentsRest = [
  {
    'source_account': addresses.VALID,
    'source_tag': '',
    'source_amount': {
      'value': '0.1117218827811721',
      'currency': 'JPY',
      'issuer': ''
   },
    'source_slippage': '0',
    'destination_account': addresses.VALID,
    'destination_tag': '',
    'destination_amount': {
      'value': '100',
      'currency': 'USD',
      'issuer': addresses.ISSUER
   },
    'invoice_id': '',
    'paths': '[[{\"account\":\"rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"USD\",\"issuer\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"account\":\"rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"},{\"currency\":\"USD\",\"issuer\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"account\":\"rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"},{\"currency\":\"USD\",\"issuer\":\"rpHgehzdpfWRXKvSv6duKvVuo1aZVimdaT\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rpHgehzdpfWRXKvSv6duKvVuo1aZVimdaT\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"account\":\"rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"},{\"currency\":\"USD\",\"issuer\":\"rHHa9t2kLQyXRbdLkSzEgkzwf9unmFgZs9\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rHHa9t2kLQyXRbdLkSzEgkzwf9unmFgZs9\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]',
    'partial_payment': false,
    'no_direct_ripple': false
 },
  {
    'source_account': addresses.VALID,
    'source_tag': '',
    'source_amount': {
      'value': '0.001002',
      'currency': 'USD',
      'issuer': ''
   },
    'source_slippage': '0',
    'destination_account': addresses.VALID,
    'destination_tag': '',
    'destination_amount': {
      'value': '100',
      'currency': 'USD',
      'issuer': addresses.ISSUER
   },
    'invoice_id': '',
    'paths': '[[{\"account\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"USD\",\"issuer\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"},{\"currency\":\"USD\",\"issuer\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"currency\":\"XRP\",\"type\":16,\"type_hex\":\"0000000000000010\"},{\"currency\":\"USD\",\"issuer\":\"rpHgehzdpfWRXKvSv6duKvVuo1aZVimdaT\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rpHgehzdpfWRXKvSv6duKvVuo1aZVimdaT\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]',
    'partial_payment': false,
    'no_direct_ripple': false
 },
  {
    'source_account': addresses.VALID,
    'source_tag': '',
    'source_amount': {
      'value': '0.207669',
      'currency': 'XRP',
      'issuer': ''
   },
    'source_slippage': '0',
    'destination_account': addresses.VALID,
    'destination_tag': '',
    'destination_amount': {
      'value': '100',
      'currency': 'USD',
      'issuer': addresses.ISSUER
   },
    'invoice_id': '',
    'paths': '[[{\"currency\":\"USD\",\"issuer\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rf9X8QoYnWLHMHuDfjkmRcD2UE5qX5aYV\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"rDVdJ62foD1sn7ZpxtXyptdkBSyhsQGviT\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rDVdJ62foD1sn7ZpxtXyptdkBSyhsQGviT\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rfQPFZ3eLcaSUKjUy7A3LAmDNM4F9Hz9j1\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"rpHgehzdpfWRXKvSv6duKvVuo1aZVimdaT\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rpHgehzdpfWRXKvSv6duKvVuo1aZVimdaT\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]',
    'partial_payment': false,
    'no_direct_ripple': false
 }
];

module.exports.cancelOrderTx = {
  'engine_result': 'tesSUCCESS',
  'engine_result_code': 0,
  'engine_result_message': 'The transaction was applied.',
  'ledger_hash': '22148DA306D45FA966F0AA2A667078AF80E782D02A21E346A7F49E07A274F186',
  'ledger_index': 10073361,
  'status': 'closed',
  'type': 'transaction',
  'validated': true,
  'metadata': {
    'AffectedNodes': [
      {
        'DeletedNode': {
          'FinalFields': {
            'Account': addresses.VALID,
            'BookDirectory': '3B95C29205977C2136BBC70F21895F8C8F471C8522BF446E5905AF3107A40000',
            'BookNode': '0000000000000000',
            'Flags': 2148007936,
            'OwnerNode': '0000000000000000',
            'PreviousTxnID': '052D575D49936BAF2DC674C2A80D6E19995FC8197577B8EB6163D31DA49D0D9E',
            'PreviousTxnLgrSeq': 10073252,
            'Sequence': 99,
            'TakerGets': {
              'currency': 'USD',
              'issuer': addresses.ISSUER,
              'value': '100'
           },
            'TakerPays': {
              'currency': 'JPY',
              'issuer': addresses.ISSUER,
              'value': '10000'
           }
         },
          'LedgerEntryType': 'Offer',
          'LedgerIndex': '093E00CAE2C35822017F99E27C2BD1FED6730858D109E3F5FA4C9FD8C9640453'
       }
     },
      {
        'DeletedNode': {
          'FinalFields': {
            'ExchangeRate': '5905AF3107A40000',
            'Flags': 0,
            'RootIndex': '3B95C29205977C2136BBC70F21895F8C8F471C8522BF446E5905AF3107A40000',
            'TakerGetsCurrency': '0000000000000000000000005553440000000000',
            'TakerGetsIssuer': '0A20B3C85F482532A9578DBB3950B85CA06594D1',
            'TakerPaysCurrency': '0000000000000000000000004A50590000000000',
            'TakerPaysIssuer': 'E5C92828261DBAAC933B6309C6F5C72AF020AFD4'
         },
          'LedgerEntryType': 'DirectoryNode',
          'LedgerIndex': '3B95C29205977C2136BBC70F21895F8C8F471C8522BF446E5905AF3107A40000'
       }
     },
      {
        'ModifiedNode': {
          'FinalFields': {
            'Flags': 0,
            'Owner': addresses.VALID,
            'RootIndex': '4CC6A36EE801B2A3A3B2E2C44857631BAF1A7FD1CAF73BAD55EB6F584815858A'
         },
          'LedgerEntryType': 'DirectoryNode',
          'LedgerIndex': '4CC6A36EE801B2A3A3B2E2C44857631BAF1A7FD1CAF73BAD55EB6F584815858A'
       }
     },
      {
        'ModifiedNode': {
          'FinalFields': {
            'Account': addresses.VALID,
            'Balance': '511738048423',
            'Flags': 0,
            'OwnerCount': 5,
            'Sequence': 101
         },
          'LedgerEntryType': 'AccountRoot',
          'LedgerIndex': '53539B9154C83B7D657103C27ABCA0EF1AD3674F6D0B341F20710FC50EC4DC03',
          'PreviousFields': {
            'Balance': '511738060423',
            'OwnerCount': 6,
            'Sequence': 100
         },
          'PreviousTxnID': '052D575D49936BAF2DC674C2A80D6E19995FC8197577B8EB6163D31DA49D0D9E',
          'PreviousTxnLgrSeq': 10073252
       }
     }
   ],
    'TransactionIndex': 8,
    'TransactionResult': 'tesSUCCESS'
 },
  'tx_json': {
    'Account': addresses.VALID,
    'Fee': '12000',
    'Flags': 2147483648,
    'LastLedgerSequence': 10073368,
    'OfferSequence': 99,
    'Sequence': 100,
    'SigningPubKey': '02AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3',
    'TransactionType': 'OfferCancel',
    'TxnSignature': '3044022063C7C53712737A8715EF940F954C80D72C54D0D82DD01426059AEE147A831815022042CE97F22661B80897D07BAB6B66E80C184D424778062343881063E695AC0E7E',
    'date': 469910420,
    'hash': '3fc6fe4050075aa3115f212b64d97565ccd8003412f6404478a256b2f48351f3'
 }
};

module.exports.cancelOrderResponseRest = {
  order: {
    account: addresses.VALID,
    fee: '0.012',
    offer_sequence: 99,
    sequence: 100
 },
  hash: '3fc6fe4050075aa3115f212b64d97565ccd8003412f6404478a256b2f48351f3',
  ledger: '8819996',
  state: 'validated'
};

module.exports.submitOrderResponseTx = {
  'engine_result': 'tesSUCCESS',
  'engine_result_code': 0,
  'engine_result_message': 'The transaction was applied.',
  'tx_blob': '12000722800800002400000063201B0099699B64D54E35FA931A00000000000000000000000000004A50590000000000E5C92828261DBAAC933B6309C6F5C72AF020AFD465D448E1BC9BF0400000000000000000000000000055534400000000000A20B3C85F482532A9578DBB3950B85CA06594D1684000000000002EE0732102AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3744730450221009D829F972F220620D790E7C4028F311A338763F081758EBF7E2D320899D2831502204F0512873A2C96F087C3E8D98A33CB7316B9AA8C40DDB1A3D15F0206366B8AD48114E81DCB25DAA1DDEFF45145D334C56F12EA63C337',
  'tx_json': {
    'Account': addresses.VALID,
    'Fee': '12000',
    'Flags': 2148007936,
    'LastLedgerSequence': 10054043,
    'Sequence': 99,
    'SigningPubKey': '02AC2A11C997C04EC6A4139E6189111F90E89D05F9A9DDC3E2CA459CEA89C539D3',
    'TakerGets': {
      'currency': 'USD',
      'issuer': addresses.ISSUER,
      'value': '100'
   },
    'TakerPays': {
      'currency': 'JPY',
      'issuer': addresses.ISSUER,
      'value': '10000'
   },
    'TransactionType': 'OfferCreate',
    'TxnSignature': '30450221009D829F972F220620D790E7C4028F311A338763F081758EBF7E2D320899D2831502204F0512873A2C96F087C3E8D98A33CB7316B9AA8C40DDB1A3D15F0206366B8AD4',
    'hash': '684fd723577624f4581fd35d3ada8ff9e536f0ce5ab2065a22adf81633be1f2c'
 },
  'result': 'tesSUCCESS'
};

module.exports.submitOrderResponseRest = {
  order: {
    account: addresses.VALID,
    taker_gets: {
      currency: 'USD',
      counterparty: addresses.ISSUER,
      value: '100'
   },
    taker_pays: {
      currency: 'JPY',
      counterparty: addresses.ISSUER,
      value: '10000'
   },
    fee: '0.012',
    type: 'sell',
    sequence: 99
 },
  hash: '684fd723577624f4581fd35d3ada8ff9e536f0ce5ab2065a22adf81633be1f2c',
  ledger: '8819982',
  state: 'pending'
};

module.exports.trustResponseTx = {
  'engine_result': 'tesSUCCESS',
  'engine_result_code': 0,
  'engine_result_message': 'The transaction was applied.',
  'ledger_hash': 'E0B48625C74115865D83F777081163D1C33144AD11A3104292720092D2183770',
  'ledger_index': 9810402,
  'status': 'closed',
  'type': 'transaction',
  'validated': true,
  'metadata': {
    'AffectedNodes': [
      {
        'ModifiedNode': {
          'FinalFields': {
            'Account': addresses.VALID,
            'Balance': '792505355',
            'Flags': 0,
            'OwnerCount': 3,
            'Sequence': 12
         },
          'LedgerEntryType': 'AccountRoot',
          'LedgerIndex': '25FF5CC1037AE7E2C491A2E4C6206CBE31D0F1609B6426E6E8C3626BAC8C3439',
          'PreviousFields': {
            'Balance': '792505367',
            'Sequence': 11
         },
          'PreviousTxnID': 'B7B913FC00AE7838238F5021CE88ED8A5D408110726BED719BDC2A024FAE793D',
          'PreviousTxnLgrSeq': 9791833
       }
     },
      {
        'ModifiedNode': {
          'FinalFields': {
            'Balance': {
              'currency': 'USD',
              'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
              'value': '0.2899999999999999'
           },
            'Flags': 1114112,
            'HighLimit': {
              'currency': 'USD',
              'issuer': 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
              'value': '0'
           },
            'HighNode': '0000000000000163',
            'LowLimit': {
              'currency': 'USD',
              'issuer': addresses.VALID,
              'value': '110'
           },
            'LowNode': '0000000000000000'
         },
          'LedgerEntryType': 'RippleState',
          'LedgerIndex': '620379E07473AAE2E6CCCB196AE9DD13C5D036C4B47211BB3DAA55D019CB2226',
          'PreviousFields': {
            'Flags': 65536
         },
          'PreviousTxnID': 'A1344FACEAE2FA0EC795A1A64B972F144DDBBB1441B9C253BF63AC6294258287',
          'PreviousTxnLgrSeq': 9791722
       }
     }
   ],
    'TransactionIndex': 0,
    'TransactionResult': 'tesSUCCESS'
 },
  'tx_json': {
    'Account': addresses.VALID,
    'Fee': '12',
    'Flags': 2147614720,
    'LastLedgerSequence': 9810409,
    'LimitAmount': {
      'currency': 'USD',
      'issuer': 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
      'value': '110'
   },
    'Sequence': 11,
    'SigningPubKey': '02AFA3692CC78A804ACC11DBA23DBB99943C6F8D61D3CB07BBE6D28356EB5B9C57',
    'TransactionType': 'TrustSet',
    'TxnSignature': '304402201178957B6ABB7673DB21F05C58E66061D5C753B9D63158032B0C1CC9CB68C94802203CEB99C8B72BB33EF63684B2A6BF77A232448ECACBB5FFC9FD8DCC8065948847',
    'date': 468718190,
    'hash': '0F480D344CFC610DFA5CAC62CC1621C92953A05FE8C319281CA49C5C162AF40E'
 }
};

module.exports.trustResponseRest = {
  trustline: {
    account: addresses.VALID,
    limit: '110',
    currency: 'USD',
    counterparty: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
    account_allows_rippling: false,
    account_trustline_frozen: false,
    authorized: undefined
 },
  hash: '0F480D344CFC610DFA5CAC62CC1621C92953A05FE8C319281CA49C5C162AF40E',
  ledger: '8820111',
  state: 'validated'
};

module.exports.settingResponseTx = {
  'engine_result': 'tesSUCCESS',
  'engine_result_code': 0,
  'engine_result_message': 'The transaction was applied.',
  'tx_blob': '1200032280150000240000003B2B000000022C00000001201B0086956C2021000000072022000000064123463B99B62A72F26ED677CC556C44E85700000000000000000000000000000000000000000000000000000000DEADBEEF68400000000000000C732102F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D874473045022100F748627AA15F53CDDB4708892AA8378450C0AE20C193AD703C2941ED03762961022073B99149232EB07C0F2870EB2E55543C475E2059749EDABD949D09848BF0FBEE770B6578616D706C652E636F6D81144FBFF73DA4ECF9B701940F27341FA8020C313443',
  'tx_json': {
    'Account': addresses.VALID,
    'Fee': '12',
    'Flags': -2146107392,
    'clearFlag': 6,
    'SetFlag': 7,
    'LastLedgerSequence': 8820076,
    'Sequence': 2938,
    'SigningPubKey': '02F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D8',
    'TransactionType': 'AccountSet',
    'TxnSignature': '3044022013ED8E41507111736B4C5EC9E4C01A7B570B273B3DE21302F72D4D1B1F20C4EF0220180C1419108CA39A9FF89E12810EC7429E28468E8D0BA61F793E14DB8D9FEA72',
    'hash': 'AD922400CB1CE0876CA7203DBE0B1277D0D0EAC56A64F26CEC6C78D447EFEA5E'
 },
  'result': 'tesSUCCESS'
};

module.exports.settingResponseRest = {
  settings: {
    no_freeze: false,
    global_freeze: true,
    transaction_sequence: undefined,
    email_hash: '23463B99B62A72F26ED677CC556C44E8',
    wallet_locator: 'DEADBEEF',
    wallet_size: 1,
    message_key: undefined,
    domain: 'example.com',
    transfer_rate: 2,
    signers: undefined,
    require_destination_tag: true,
    require_authorization: true,
    disallow_xrp: true,
    default_ripple: true
 },
  hash: '0F480D344CFC610DFA5CAC62CC1621C92953A05FE8C319281CA49C5C162AF40E',
  ledger: 8820076,
  state: 'validated'
};

module.exports.offerCreateTx = {
    'Account': 'rBxy23n7ZFbUpS699rFVj1V9ZVhAq6EGwC',
    'Fee': '20000',
    'Flags': 131072,
    'Sequence': 609776,
    'SigningPubKey': '03917C08C81FEC424141C50A1C4B7C77A4B1563D51B7FA260797B9717F52C5E6D5',
    'TakerGets': {
      'currency': 'BTC',
      'issuer': addresses.VALID,
      'value': '0.2167622002262332'
   },
    'TakerPays': {
      'currency': 'USD',
      'issuer': addresses.VALID,
      'value': '57.5510124906279'
   },
    'TransactionType': 'OfferCreate',
    'TxnSignature': '304402207E48A159CBA0491684C8BBE31DEF55859A7616EAA2339C43445CF0185DC20A07022017D442BB2F6AB8BB9925765A690473332D1C1157AE310409D3CFD45755708E6F',
    'date': 474426920,
    'hash': '0D13787384301F32E9E180C31F7F16EA0D2521783DBF71736B25AFF253FB6E11',
    'inLedger': 11086861,
    'ledger_index': 11086861,
    'meta': {
      'AffectedNodes': [
        {
          'DeletedNode': {
            'FinalFields': {
              'ExchangeRate': '520D604D6638790F',
              'Flags': 0,
              'RootIndex': '20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520D604D6638790F',
              'TakerGetsCurrency': '0000000000000000000000005553440000000000',
              'TakerGetsIssuer': '0A20B3C85F482532A9578DBB3950B85CA06594D1',
              'TakerPaysCurrency': '0000000000000000000000004254430000000000',
              'TakerPaysIssuer': '0A20B3C85F482532A9578DBB3950B85CA06594D1'
           },
            'LedgerEntryType': 'DirectoryNode',
            'LedgerIndex': '20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520D604D6638790F'
         }
       },
        {
          'DeletedNode': {
            'FinalFields': {
              'Account': addresses.VALID,
              'BookDirectory': '20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520D604D6638790F',
              'BookNode': '0000000000000000',
              'Flags': 0,
              'OwnerNode': '0000000000000000',
              'PreviousTxnID': '97AA291851DE9A894CFCCD4C69C96E9570F9182A5D39937463E1C80132DD65DE',
              'PreviousTxnLgrSeq': 11086861,
              'Sequence': 550,
              'TakerGets': {
                'currency': 'USD',
                'issuer': addresses.VALID,
                'value': '0'
             },
              'TakerPays': {
                'currency': 'BTC',
                'issuer': addresses.VALID,
                'value': '0'
             }
           },
            'LedgerEntryType': 'Offer',
            'LedgerIndex': '276522C8AAF28B5286C48E2373C119C48DAE78C3F8A047AAF67C22E4440C391B',
            'PreviousFields': {
              'TakerGets': {
                'currency': 'USD',
                'issuer': addresses.VALID,
                'value': '0.0000000036076'
             },
              'TakerPays': {
                'currency': 'BTC',
                'issuer': addresses.VALID,
                'value': '1358360000000000e-26'
             }
           }
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Flags': 0,
              'Owner': 'r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ',
              'RootIndex': '38D499A08201B64C001CF6B1803504373BFDA21A01302D3C0E78EF98544E9236'
           },
            'LedgerEntryType': 'DirectoryNode',
            'LedgerIndex': '38D499A08201B64C001CF6B1803504373BFDA21A01302D3C0E78EF98544E9236'
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Balance': {
                'currency': 'BTC',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-0.1151236147503502'
             },
              'Flags': 2228224,
              'HighLimit': {
                'currency': 'BTC',
                'issuer': 'rBxy23n7ZFbUpS699rFVj1V9ZVhAq6EGwC',
                'value': '0'
             },
              'HighNode': '0000000000000000',
              'LowLimit': {
                'currency': 'BTC',
                'issuer': addresses.VALID,
                'value': '0'
             },
              'LowNode': '000000000000028F'
           },
            'LedgerEntryType': 'RippleState',
            'LedgerIndex': '42A6E9991D540C80BE4A43EF5254656DD862F602BBFF99BC576B44FBF6B7D775',
            'PreviousFields': {
              'Balance': {
                'currency': 'BTC',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-0.3322932790173214'
             }
           },
            'PreviousTxnID': 'B7CE60D440E11F31530E19A50A0775246102425D3594C9B886A7724BB1E58367',
            'PreviousTxnLgrSeq': 11086861
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Balance': {
                'currency': 'USD',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-23112.9993818472'
             },
              'Flags': 2228224,
              'HighLimit': {
                'currency': 'USD',
                'issuer': 'r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ',
                'value': '1000000000'
             },
              'HighNode': '0000000000000000',
              'LowLimit': {
                'currency': 'USD',
                'issuer': addresses.VALID,
                'value': '0'
             },
              'LowNode': '0000000000000231'
           },
            'LedgerEntryType': 'RippleState',
            'LedgerIndex': '615463C4F78931AA3E2B65FE49C6DAAC25A456C15679E67D1C19CA0943D98C5A',
            'PreviousFields': {
              'Balance': {
                'currency': 'USD',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-23112.99938185081'
             }
           },
            'PreviousTxnID': '97AA291851DE9A894CFCCD4C69C96E9570F9182A5D39937463E1C80132DD65DE',
            'PreviousTxnLgrSeq': 11086861
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Balance': {
                'currency': 'BTC',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-20.18770947118515'
             },
              'Flags': 131072,
              'HighLimit': {
                'currency': 'BTC',
                'issuer': 'r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ',
                'value': '0'
             },
              'HighNode': '0000000000000000',
              'LowLimit': {
                'currency': 'BTC',
                'issuer': addresses.VALID,
                'value': '0'
             },
              'LowNode': '00000000000002C4'
           },
            'LedgerEntryType': 'RippleState',
            'LedgerIndex': '817EB23FB16D8D17676F29055C989CDFB738B7FC310DF3AB5CA0D06AA2DC1326',
            'PreviousFields': {
              'Balance': {
                'currency': 'BTC',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-20.18770947117157'
             }
           },
            'PreviousTxnID': '97AA291851DE9A894CFCCD4C69C96E9570F9182A5D39937463E1C80132DD65DE',
            'PreviousTxnLgrSeq': 11086861
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Balance': {
                'currency': 'BTC',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-42.47198893790961'
             },
              'Flags': 2228224,
              'HighLimit': {
                'currency': 'BTC',
                'issuer': 'rQE5Z3FgVnRMbVfS6xiVQFgB4J3X162FVD',
                'value': '150'
             },
              'HighNode': '0000000000000000',
              'LowLimit': {
                'currency': 'BTC',
                'issuer': addresses.VALID,
                'value': '0'
             },
              'LowNode': '0000000000000201'
           },
            'LedgerEntryType': 'RippleState',
            'LedgerIndex': 'C688AE8E51943530C931C3B838D15818BDA1F1B60B641B5F866B724AD7D3E79B',
            'PreviousFields': {
              'Balance': {
                'currency': 'BTC',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-42.25525274603999'
             }
           },
            'PreviousTxnID': '1C749407E3676E77693694BEBC73C74196EA39C4EB2BB47781ABD65F4AB315E9',
            'PreviousTxnLgrSeq': 11082323
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Balance': {
                'currency': 'USD',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-283631.3541172556'
             },
              'Flags': 2228224,
              'HighLimit': {
                'currency': 'USD',
                'issuer': 'rQE5Z3FgVnRMbVfS6xiVQFgB4J3X162FVD',
                'value': '5000000'
             },
              'HighNode': '0000000000000000',
              'LowLimit': {
                'currency': 'USD',
                'issuer': addresses.VALID,
                'value': '0'
             },
              'LowNode': '0000000000000201'
           },
            'LedgerEntryType': 'RippleState',
            'LedgerIndex': 'D8F66B71771581E6185072E5264B2C4C0F9C2CA642EE46B62D6F550D897D00FF',
            'PreviousFields': {
              'Balance': {
                'currency': 'USD',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-283689.0202317675'
             }
           },
            'PreviousTxnID': '0419F004A3084E93D4708EDA40D64A9F52F52EAA854961C23E2779EBE400AAD9',
            'PreviousTxnLgrSeq': 11086605
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Account': 'r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ',
              'Balance': '52083119197',
              'Flags': 0,
              'OwnerCount': 8,
              'Sequence': 553
           },
            'LedgerEntryType': 'AccountRoot',
            'LedgerIndex': 'DD314C9308B172885F6D0F5F3F50A2EAB1D2E2BD75A65A4236547E9C1DD625DB',
            'PreviousFields': {
              'OwnerCount': 9
           },
            'PreviousTxnID': 'F07EA8FA7FF285FA5EC5F5A36CCCFC0F3D4B9A9A2910EEABABF058F96F6CD402',
            'PreviousTxnLgrSeq': 11082743
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Balance': {
                'currency': 'USD',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '-57.5510124906279'
             },
              'Flags': 2228224,
              'HighLimit': {
                'currency': 'USD',
                'issuer': 'rBxy23n7ZFbUpS699rFVj1V9ZVhAq6EGwC',
                'value': '0'
             },
              'HighNode': '0000000000000000',
              'LowLimit': {
                'currency': 'USD',
                'issuer': addresses.VALID,
                'value': '0'
             },
              'LowNode': '000000000000028F'
           },
            'LedgerEntryType': 'RippleState',
            'LedgerIndex': 'E929BE69F05FEB6B376C97E22A264D93D88A7E42BE3FE5BFBD1842AC08C85BCF',
            'PreviousFields': {
              'Balance': {
                'currency': 'USD',
                'issuer': 'rrrrrrrrrrrrrrrrrrrrBZbvji',
                'value': '0'
             }
           },
            'PreviousTxnID': '73867036670B2F95ADCFF006A253C700ED45EF83F1B125D4797F2C110B055B60',
            'PreviousTxnLgrSeq': 11086861
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Account': 'rQE5Z3FgVnRMbVfS6xiVQFgB4J3X162FVD',
              'BookDirectory': '20294C923E80A51B487EB9547B3835FD483748B170D2D0A4520D61247A328674',
              'BookNode': '0000000000000000',
              'Flags': 0,
              'OwnerNode': '000000000000001B',
              'Sequence': 114646,
              'TakerGets': {
                'currency': 'USD',
                'issuer': addresses.VALID,
                'value': '0.00000002162526'
             },
              'TakerPays': {
                'currency': 'BTC',
                'issuer': addresses.VALID,
                'value': '8144010000000000e-26'
             }
           },
            'LedgerEntryType': 'Offer',
            'LedgerIndex': 'E9F98B8933C500737D5FD0BCAFC49EADB8F8A9D01170EFB7CA171D0DEF853D02',
            'PreviousFields': {
              'TakerGets': {
                'currency': 'USD',
                'issuer': addresses.VALID,
                'value': '57.55101250864556'
             },
              'TakerPays': {
                'currency': 'BTC',
                'issuer': addresses.VALID,
                'value': '0.2167361919510613'
             }
           },
            'PreviousTxnID': '23433B9508778BEE0E8CE398602BBEDAFAE210F59979BCAC818B6970DCCB91F5',
            'PreviousTxnLgrSeq': 11080258
         }
       },
        {
          'ModifiedNode': {
            'FinalFields': {
              'Account': 'rBxy23n7ZFbUpS699rFVj1V9ZVhAq6EGwC',
              'Balance': '267312570945',
              'Flags': 0,
              'OwnerCount': 25,
              'Sequence': 609777
           },
            'LedgerEntryType': 'AccountRoot',
            'LedgerIndex': 'EAFF4A0B5E891B9BE6A4D484FD0A73356F099FA54F650C9D8FB35D3F29A44176',
            'PreviousFields': {
              'Balance': '267312590945',
              'Sequence': 609776
           },
            'PreviousTxnID': 'B7CE60D440E11F31530E19A50A0775246102425D3594C9B886A7724BB1E58367',
            'PreviousTxnLgrSeq': 11086861
         }
       }
     ],
      'TransactionIndex': 48,
      'TransactionResult': 'tesSUCCESS'
   },
    'validated': true
};

module.exports.parsedOfferCreateTx = {
  hash: '0D13787384301F32E9E180C31F7F16EA0D2521783DBF71736B25AFF253FB6E11',
  ledger: 11086861,
  validated: true,
  timestamp: '2015-01-13T01:15:20.000Z',
  fee: '0.02',
  action: 'order_create',
  direction: 'incoming',
  order:
   {account: 'rBxy23n7ZFbUpS699rFVj1V9ZVhAq6EGwC',
     taker_pays:
      {currency: 'USD',
        counterparty: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
        value: '57.5510124906279'},
     taker_gets:
      {currency: 'BTC',
        counterparty: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
        value: '0.2167622002262332'},
     passive: false,
     immediate_or_cancel: false,
     fill_or_kill: false,
     type: 'buy',
     sequence: 609776},
  balance_changes:
   [{counterparty: 'rBxy23n7ZFbUpS699rFVj1V9ZVhAq6EGwC',
       currency: 'BTC',
       value: '0.2171696642669712'},
     {counterparty: 'r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ',
       currency: 'USD',
       value: '3.61e-9'},
     {counterparty: 'r49y2xKuKVG2dPkNHgWQAV61cjxk8gryjQ',
       currency: 'BTC',
       value: '-1.358e-11'},
     {counterparty: 'rQE5Z3FgVnRMbVfS6xiVQFgB4J3X162FVD',
       currency: 'BTC',
       value: '-0.21673619186962'},
     {counterparty: 'rQE5Z3FgVnRMbVfS6xiVQFgB4J3X162FVD',
       currency: 'USD',
       value: '57.6661145119'},
     {counterparty: 'rBxy23n7ZFbUpS699rFVj1V9ZVhAq6EGwC',
       currency: 'USD',
       value: '-57.5510124906279'}],
  order_changes:
   [{taker_pays:
        {currency: 'BTC',
          counterparty: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
          value: '-1.35836e-11'},
       taker_gets:
        {currency: 'USD',
          counterparty: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
          value: '-3.6076e-9'},
       sequence: 550,
       status: 'closed'}]
};

module.exports.offerCancelTx = {
  'Account': addresses.VALID,
  'Fee': '12000',
  'Flags': 0,
  'LastLedgerSequence': 11236701,
  'OfferSequence': 20,
  'Sequence': 22,
  'SigningPubKey': '039549AB540046941E2BD313CB71F0EEA3A560B587AE4ED75A7120965A67E0D6E1',
  'TransactionType': 'OfferCancel',
  'TxnSignature': '304402200E24DFA7B5F37675CCBE5370EDB51A8EC4E58D55D34ADC19505DE3EE686ED64B0220421C955F4F4D63DFA517E48F81393FB007035C18821D25D8EA8C36D9A71AF0F4',
  'date': 475105560,
  'hash': '3D948699072B40312AE313E7E8297EED83080C9A4D5B564BCACF0951ABF00AC5',
  'inLedger': 11236693,
  'ledger_index': 11236693,
  'meta': {
    'AffectedNodes': [
      {
        'DeletedNode': {
          'FinalFields': {
            'Account': addresses.VALID,
            'BookDirectory': '9F72CA02AB7CBA0FD97EA5F245C03EDC555C3FE97749CD425B038D7EA4C68000',
            'BookNode': '0000000000000000',
            'Flags': 0,
            'OwnerNode': '0000000000000000',
            'PreviousTxnID': '3D768E210A152DFA89C051FEFC26F2FFBF91AC8B794482B8DA906157D3B2C348',
            'PreviousTxnLgrSeq': 11235523,
            'Sequence': 20,
            'TakerGets': {
              'currency': 'JPY',
              'issuer': 'r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN',
              'value': '1000'
           },
            'TakerPays': '1000000000'
         },
          'LedgerEntryType': 'Offer',
          'LedgerIndex': '39A270DE16B6861952C5409626B0FA68FCC1089DD242AF55D8B1CAE6194C0E67'
       }
     },
      {
        'ModifiedNode': {
          'FinalFields': {
            'ExchangeRate': '5B038D7EA4C68000',
            'Flags': 0,
            'RootIndex': '9F72CA02AB7CBA0FD97EA5F245C03EDC555C3FE97749CD425B038D7EA4C68000',
            'TakerGetsCurrency': '0000000000000000000000004A50590000000000',
            'TakerGetsIssuer': '5BBC0F22F61D9224A110650CFE21CC0C4BE13098',
            'TakerPaysCurrency': '0000000000000000000000000000000000000000',
            'TakerPaysIssuer': '0000000000000000000000000000000000000000'
         },
          'LedgerEntryType': 'DirectoryNode',
          'LedgerIndex': '9F72CA02AB7CBA0FD97EA5F245C03EDC555C3FE97749CD425B038D7EA4C68000'
       }
     },
      {
        'ModifiedNode': {
          'FinalFields': {
            'Account': addresses.VALID,
            'Balance': '29988000',
            'Flags': 0,
            'OwnerCount': 1,
            'Sequence': 23
         },
          'LedgerEntryType': 'AccountRoot',
          'LedgerIndex': 'C666A91E2D289AB6DD1A44363E1F4714B60584AA79B2CBFBB3330236610E4E47',
          'PreviousFields': {
            'Balance': '30000000',
            'OwnerCount': 2,
            'Sequence': 22
         },
          'PreviousTxnID': 'FC061E8B2FAE945F4F674E11D4EF25F3B951DEB9116CDE5506B35EF383DC8988',
          'PreviousTxnLgrSeq': 11235525
       }
     },
      {
        'ModifiedNode': {
          'FinalFields': {
            'Flags': 0,
            'Owner': addresses.VALID,
            'RootIndex': 'E8C9FDFB9C7494135DF41ED69DFD0B9747CFE0ADF046E32BA24510B6A1EFDAE0'
         },
          'LedgerEntryType': 'DirectoryNode',
          'LedgerIndex': 'E8C9FDFB9C7494135DF41ED69DFD0B9747CFE0ADF046E32BA24510B6A1EFDAE0'
       }
     }
   ],
    'TransactionIndex': 2,
    'TransactionResult': 'tesSUCCESS'
 },
  'validated': true
};

module.exports.parsedOfferCancelTx = {
  hash: '3D948699072B40312AE313E7E8297EED83080C9A4D5B564BCACF0951ABF00AC5',
  ledger: 11236693,
  validated: true,
  timestamp: '2015-01-20T21:46:00.000Z',
  fee: '0.012',
  action: 'order_cancel',
  direction: 'outgoing',
  order:
   {account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
     type: 'cancel',
     sequence: 22,
     cancel_sequence: 20},
  balance_changes: [{counterparty: '', currency: 'XRP', value: '-0.012'}],
  order_changes:
   [{taker_pays: {currency: 'XRP', counterparty: '', value: '0'},
       taker_gets:
        {currency: 'JPY',
          counterparty: 'r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN',
          value: '0'},
       sequence: 20,
       status: 'canceled'}]
};
