/*jshint expr: true*/
var expect = require('chai').expect,
  ripple = require('ripple-lib'),
  rpparser = require('../../lib/rpparser');

describe('rpparser', function(){

  describe('parseBalanceChanges()', function(){

    it('should properly parse a simple XRP payment', function(){

      var tx = {
        Account : "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
        Amount : "1000000",
        Destination : "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
        Fee : "12",
        Flags : 0,
        Sequence : 54,
        SigningPubKey : "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
        TransactionType : "Payment",
        TxnSignature : "3045022100845176B7B3735AF0806BC259371D461D1AF76F3D0364E83EA084DC58B0EC7F9B02200AF92190073D11DEDC2452557BC55405516BEDD513F5F456E1A799F9A494A683",
        hash : "E0113B5745559AE8B7E69E9AEEAD66ABC608A7557CBF159BC3FC12FD104D333E",
        inLedger : 4608575,
        ledger_index : 4608575,
        meta : {
          AffectedNodes : [
            {
              ModifiedNode : {
                FinalFields : {
                  Account : "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                  Balance : "152000001",
                  Flags : 0,
                  OwnerCount : 0,
                  Sequence : 1
                },
                LedgerEntryType : "AccountRoot",
                LedgerIndex : "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                PreviousFields : {
                  Balance : "151000001"
                },
                PreviousTxnID : "58A09718D1BA2889A9A1E57D1514906137FC5F37BA7F01F5CF104DB26F0C97E9",
                PreviousTxnLgrSeq : 4608553
              }
            },
            {
              ModifiedNode : {
                FinalFields : {
                  Account : "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                  Balance : "47418046",
                  Flags : 0,
                  OwnerCount : 1,
                  Sequence : 55
                },
                LedgerEntryType : "AccountRoot",
                LedgerIndex : "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                PreviousFields : {
                  Balance : "48418058",
                  Sequence : 54
                },
                PreviousTxnID : "58A09718D1BA2889A9A1E57D1514906137FC5F37BA7F01F5CF104DB26F0C97E9",
                PreviousTxnLgrSeq : 4608553
              }
            }
          ],
          TransactionIndex : 4,
          TransactionResult : "tesSUCCESS"
        },
        validated : true
      };

    expect(rpparser.parseBalanceChanges(tx, 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'))
      .to.deep.equal([{value: '1', currency: 'XRP', issuer: ''}]);

    expect(rpparser.parseBalanceChanges(tx, 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r'))
      .to.deep.equal([{value: '-1.000012', currency: 'XRP', issuer: ''}]);

    expect(rpparser.parseBalanceChanges(tx, ''))
      .to.deep.equal([]);

    });

  });



});
