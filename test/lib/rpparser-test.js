/*jshint expr: true*/
var expect = require('chai').expect,
  ripple = require('ripple-lib'),
  rpparser = require('../../lib/rpparser');

describe('lib/rpparser', function(){

  describe('.parseBalanceChanges()', function(){

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



  it('should properly parse a relatively simple order exercised', function(){

    var tx = {
      Account : "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
      Fee : "14",
      Flags : 524288,
      Sequence : 83,
      SigningPubKey : "03BFA879C00D58CF55F2B5975FF9B5293008FF49BEFB3EE6BEE2814247BF561A23",
      TakerGets : {
        currency : "USD",
        issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
        value : "0.1"
      },
      TakerPays : "3000000",
      TransactionType : "OfferCreate",
      TxnSignature : "3045022100A867DAE912CEB85E51DFE2C3CC87BA6F4CB2EB809E4445B1D29CEF3D160E32CC022036F217B8364719570156C05765707A3F418B406720261196D18839144929D8EB",
      hash : "3872A76BD339F52345FD94907F345250E072B299F9C5A3E5C593CB03628123BA",
      inLedger : 4293902,
      ledger_index : 4293902,
      meta : {
        AffectedNodes : [
          {
            ModifiedNode : {
              FinalFields : {
                Account : "rsTHTgeUm4ECACddcJQADgK31poXzQ3Ffu",
                Balance : "19818149792",
                Flags : 0,
                OwnerCount : 10,
                Sequence : 1798
              },
              LedgerEntryType : "AccountRoot",
              LedgerIndex : "04B62B86225CE7618ED9F2834D325A17FE0F95137B4B470A4423766ED48CB101",
              PreviousFields : {
                Balance : "19821540772"
              },
              PreviousTxnID : "900F62867705E2B44DF8CA37A346BEBBF42C249589D5704805B4B490B9A5ECDB",
              PreviousTxnLgrSeq : 4293667
            }
          },
          {
            ModifiedNode : {
              FinalFields : {
                Balance : {
                  currency : "USD",
                  issuer : "rrrrrrrrrrrrrrrrrrrrBZbvji",
                  value : "97.4421612782148"
                },
                Flags : 65536,
                HighLimit : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "0"
                },
                HighNode : "0000000000000014",
                LowLimit : {
                  currency : "USD",
                  issuer : "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                  value : "500"
                },
                LowNode : "0000000000000000"
              },
              LedgerEntryType : "RippleState",
              LedgerIndex : "52EA2B8D6B83AACD46CB400F3184B85906F478D1A1D270E95C30D112453BB2CB",
              PreviousFields : {
                Balance : {
                  currency : "USD",
                  issuer : "rrrrrrrrrrrrrrrrrrrrBZbvji",
                  value : "97.5421612782148"
                }
              },
              PreviousTxnID : "DF53AD319A2D962816E1998D0843EEF8C671C5B487D4279DBCA2FA0D388CED81",
              PreviousTxnLgrSeq : 4207848
            }
          },
          {
            ModifiedNode : {
              FinalFields : {
                Account : "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                Balance : "12966832836",
                Flags : 0,
                OwnerCount : 7,
                Sequence : 84
              },
              LedgerEntryType : "AccountRoot",
              LedgerIndex : "73DC951B0AC2FD8A8222BBCDF5B62D712A14F87D007ABAB21A224FD1F336F9EC",
              PreviousFields : {
                Balance : "12963441870",
                Sequence : 83
              },
              PreviousTxnID : "DF53AD319A2D962816E1998D0843EEF8C671C5B487D4279DBCA2FA0D388CED81",
              PreviousTxnLgrSeq : 4207848
            }
          },
          {
            ModifiedNode : {
              FinalFields : {
                Balance : {
                  currency : "USD",
                  issuer : "rrrrrrrrrrrrrrrrrrrrBZbvji",
                  value : "0.1515577810939"
                },
                Flags : 65536,
                HighLimit : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "0"
                },
                HighNode : "0000000000000035",
                LowLimit : {
                  currency : "USD",
                  issuer : "rsTHTgeUm4ECACddcJQADgK31poXzQ3Ffu",
                  value : "1000"
                },
                LowNode : "0000000000000000"
              },
              LedgerEntryType : "RippleState",
              LedgerIndex : "BE125F7184DB31D1729E70F681102793EDFFF0C9F5184866C4BF5A6B5BB3CBCD",
              PreviousFields : {
                Balance : {
                  currency : "USD",
                  issuer : "rrrrrrrrrrrrrrrrrrrrBZbvji",
                  value : "0.0515577810939"
                }
              },
              PreviousTxnID : "994A6512A0D92F154D8ED54F7CE91F8C2C7F973F93FBBBA8CD6067B8A356723D",
              PreviousTxnLgrSeq : 4289968
            }
          },
          {
            ModifiedNode : {
              FinalFields : {
                Account : "rsTHTgeUm4ECACddcJQADgK31poXzQ3Ffu",
                BookDirectory : "CF8D13399C6ED20BA82740CFA78E928DC8D498255249BA634D0A7A1991715000",
                BookNode : "0000000000000000",
                Flags : 131072,
                OwnerNode : "0000000000000000",
                Sequence : 1797,
                TakerGets : "6778609020",
                TakerPays : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "199.90118"
                }
              },
              LedgerEntryType : "Offer",
              LedgerIndex : "D166434DF7E4D8D613B8350642CB18A21C47C754587EFE8FC3EC69EB8E7E4AA2",
              PreviousFields : {
                TakerGets : "6782000000",
                TakerPays : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "200.00118"
                }
              },
              PreviousTxnID : "900F62867705E2B44DF8CA37A346BEBBF42C249589D5704805B4B490B9A5ECDB",
              PreviousTxnLgrSeq : 4293667
            }
          }
        ],
        TransactionIndex : 1,
        TransactionResult : "tesSUCCESS"
      },
      validated : true
    };

    expect(rpparser.parseBalanceChanges(tx, 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM'))
      .to.deep.equal([
        {value: '-0.1', currency: 'USD', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'},
        {value: '3.390966', currency: 'XRP', issuer: ''},
      ]);

  });


  it('should properly parse a convert payment', function(){

    var tx = {
      Account : "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
      Amount : "5000000000",
      Destination : "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
      Fee : "12",
      Flags : 0,
      Paths : [
        [
          {
            account : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            type : 1,
            type_hex : "0000000000000001"
          },
          {
            currency : "XRP",
            type : 16,
            type_hex : "0000000000000010"
          }
        ]
      ],
      SendMax : {
        currency : "USD",
        issuer : "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
        value : "97.80169403"
      },
      Sequence : 103,
      SigningPubKey : "03BFA879C00D58CF55F2B5975FF9B5293008FF49BEFB3EE6BEE2814247BF561A23",
      TransactionType : "Payment",
      TxnSignature : "3045022100DED80AE88482E2E8B15E9E52A5807329684764EDB1AB0AE191233508BB9526F702204720204978E367F91A85064606E053031BA1D1657E79E53FE66090166545BDFA",
      hash : "5A29096700281645BCBA74CD9E6D893A3C2937D14E6CA5FDD85313D7185B3533",
      inLedger : 4604471,
      ledger_index : 4604471,
      meta : {
        AffectedNodes : [
          {
            ModifiedNode : {
              FinalFields : {
                Flags : 0,
                Owner : "r9DJhzL9QjuiX3bVyVqv3Gvx8U9wBiN9Bf",
                RootIndex : "17AA87D04455243D8C9567CEDBD554894C39661BF04C10E23ECC943CB4CF63DE"
              },
              LedgerEntryType : "DirectoryNode",
              LedgerIndex : "17AA87D04455243D8C9567CEDBD554894C39661BF04C10E23ECC943CB4CF63DE"
            }
          },
          {
            DeletedNode : {
              FinalFields : {
                Account : "r9DJhzL9QjuiX3bVyVqv3Gvx8U9wBiN9Bf",
                BookDirectory : "CF8D13399C6ED20BA82740CFA78E928DC8D498255249BA634D06E0E15EBE8554",
                BookNode : "0000000000000000",
                Flags : 0,
                OwnerNode : "0000000000000000",
                PreviousTxnID : "E7C6B46C3023C98DBACA6BCF56503D4C478374F5AFFB7E2EFBB6D84571D6D6EE",
                PreviousTxnLgrSeq : 4604458,
                Sequence : 1021,
                TakerGets : "0",
                TakerPays : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "0"
                }
              },
              LedgerEntryType : "Offer",
              LedgerIndex : "4395ADC919328FB8BA3DBD2CFFA77AA9152D2DD2CB3E7D711363E8B56DF1DC91",
              PreviousFields : {
                TakerGets : "2066000000",
                TakerPays : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "40"
                }
              }
            }
          },
          {
            ModifiedNode : {
              FinalFields : {
                Balance : {
                  currency : "USD",
                  issuer : "rrrrrrrrrrrrrrrrrrrrBZbvji",
                  value : "13.6088008518343"
                },
                Flags : 65536,
                HighLimit : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "0"
                },
                HighNode : "0000000000000014",
                LowLimit : {
                  currency : "USD",
                  issuer : "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                  value : "500"
                },
                LowNode : "0000000000000000"
              },
              LedgerEntryType : "RippleState",
              LedgerIndex : "52EA2B8D6B83AACD46CB400F3184B85906F478D1A1D270E95C30D112453BB2CB",
              PreviousFields : {
                Balance : {
                  currency : "USD",
                  issuer : "rrrrrrrrrrrrrrrrrrrrBZbvji",
                  value : "110.4421612782148"
                }
              },
              PreviousTxnID : "E7C6B46C3023C98DBACA6BCF56503D4C478374F5AFFB7E2EFBB6D84571D6D6EE",
              PreviousTxnLgrSeq : 4604458
            }
          },
          {
            DeletedNode : {
              FinalFields : {
                Account : "rJipdKnTtiYp75mPsbrPpbdfZbYEmmHG4v",
                BookDirectory : "CF8D13399C6ED20BA82740CFA78E928DC8D498255249BA634D06E0C82F7BFDC0",
                BookNode : "0000000000000000",
                Flags : 131072,
                OwnerNode : "0000000000000000",
                PreviousTxnID : "62D4DE144590828BF003CCB54BADB9A033F9D0C4BDB1FABB765D72A4C976CCA9",
                PreviousTxnLgrSeq : 4604466,
                Sequence : 450,
                TakerGets : "0",
                TakerPays : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "0"
                }
              },
              LedgerEntryType : "Offer",
              LedgerIndex : "6A497D9D79DE7FF7E8DE18F888B63C46D54B42122CF038A21EC293CE98DFCDBD",
              PreviousFields : {
                TakerGets : "1000000000",
                TakerPays : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "19.36000255"
                }
              }
            }
          },
          {
            ModifiedNode : {
              FinalFields : {
                Flags : 0,
                Owner : "rJipdKnTtiYp75mPsbrPpbdfZbYEmmHG4v",
                RootIndex : "6EBF3C1CD1DEC17644BC5259FF022B01CF452D5661F29B1A71A0121829A29C87"
              },
              LedgerEntryType : "DirectoryNode",
              LedgerIndex : "6EBF3C1CD1DEC17644BC5259FF022B01CF452D5661F29B1A71A0121829A29C87"
            }
          },
          {
            ModifiedNode : {
              FinalFields : {
                Balance : {
                  currency : "USD",
                  issuer : "rrrrrrrrrrrrrrrrrrrrBZbvji",
                  value : "58.71890844409666"
                },
                Flags : 1114112,
                HighLimit : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "0"
                },
                HighNode : "0000000000000059",
                LowLimit : {
                  currency : "USD",
                  issuer : "rJipdKnTtiYp75mPsbrPpbdfZbYEmmHG4v",
                  value : "301"
                },
                LowNode : "0000000000000000"
              },
              LedgerEntryType : "RippleState",
              LedgerIndex : "71E9B64C34D352E7779ECF98B533D68DE61EAFB121B1585AADDF0D74074C77E8",
              PreviousFields : {
                Balance : {
                  currency : "USD",
                  issuer : "rrrrrrrrrrrrrrrrrrrrBZbvji",
                  value : "39.35890589409666"
                }
              },
              PreviousTxnID : "4B9C521025AB33F76DAFE6321D56DD63D99C4AB14557D40E425C494D3E5ED45A",
              PreviousTxnLgrSeq : 4603898
            }
          },
          {
            ModifiedNode : {
              FinalFields : {
                Account : "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                Balance : "18356931346",
                Flags : 0,
                OwnerCount : 8,
                Sequence : 104
              },
              LedgerEntryType : "AccountRoot",
              LedgerIndex : "73DC951B0AC2FD8A8222BBCDF5B62D712A14F87D007ABAB21A224FD1F336F9EC",
              PreviousFields : {
                Balance : "13356931358",
                Sequence : 103
              },
              PreviousTxnID : "E7C6B46C3023C98DBACA6BCF56503D4C478374F5AFFB7E2EFBB6D84571D6D6EE",
              PreviousTxnLgrSeq : 4604458
            }
          },
          {
            ModifiedNode : {
              FinalFields : {
                Account : "r9DJhzL9QjuiX3bVyVqv3Gvx8U9wBiN9Bf",
                Balance : "5441055159",
                Flags : 0,
                OwnerCount : 6,
                Sequence : 1022
              },
              LedgerEntryType : "AccountRoot",
              LedgerIndex : "A5183FE0AFF7F7096C116BC22D92B8BB10535B8EE759661BF211E80F39F735A9",
              PreviousFields : {
                Balance : "9441055159",
                OwnerCount : 7
              },
              PreviousTxnID : "E7C6B46C3023C98DBACA6BCF56503D4C478374F5AFFB7E2EFBB6D84571D6D6EE",
              PreviousTxnLgrSeq : 4604458
            }
          },
          {
            ModifiedNode : {
              FinalFields : {
                Account : "rJipdKnTtiYp75mPsbrPpbdfZbYEmmHG4v",
                Balance : "1557726033",
                Flags : 0,
                OwnerCount : 2,
                Sequence : 452
              },
              LedgerEntryType : "AccountRoot",
              LedgerIndex : "C43C67A8EB9C1A485D7770141AD9835A46160E3D1B1BE7A87C3D11D9D12329A8",
              PreviousFields : {
                Balance : "2557726033",
                OwnerCount : 3
              },
              PreviousTxnID : "4DCD9945D501DD586218F28E4935502B9D81ABC0A0768AF2F61C2C6415BB1A7F",
              PreviousTxnLgrSeq : 4604467
            }
          },
          {
            ModifiedNode : {
              FinalFields : {
                Balance : {
                  currency : "USD",
                  issuer : "rrrrrrrrrrrrrrrrrrrrBZbvji",
                  value : "88.2902645918431"
                },
                Flags : 65536,
                HighLimit : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "0"
                },
                HighNode : "0000000000000020",
                LowLimit : {
                  currency : "USD",
                  issuer : "r9DJhzL9QjuiX3bVyVqv3Gvx8U9wBiN9Bf",
                  value : "300"
                },
                LowNode : "0000000000000000"
              },
              LedgerEntryType : "RippleState",
              LedgerIndex : "C7A79C7AC0473B3C3E68A321D1E79DE67C8EBCD84AB643298209FE9E3440ECC7",
              PreviousFields : {
                Balance : {
                  currency : "USD",
                  issuer : "rrrrrrrrrrrrrrrrrrrrBZbvji",
                  value : "10.81690671546257"
                }
              },
              PreviousTxnID : "E7C6B46C3023C98DBACA6BCF56503D4C478374F5AFFB7E2EFBB6D84571D6D6EE",
              PreviousTxnLgrSeq : 4604458
            }
          },
          {
            ModifiedNode : {
              FinalFields : {
                Account : "r9DJhzL9QjuiX3bVyVqv3Gvx8U9wBiN9Bf",
                BookDirectory : "CF8D13399C6ED20BA82740CFA78E928DC8D498255249BA634D06E23EBF97BAF3",
                BookNode : "0000000000000000",
                Flags : 0,
                OwnerNode : "0000000000000000",
                Sequence : 1016,
                TakerGets : "622759400",
                TakerPays : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "12.06664212361947"
                }
              },
              LedgerEntryType : "Offer",
              LedgerIndex : "CE3C22CD391999B7BA9FA6677D5FFB835A48A6BFE4BEC1EF805BBED48F18E4F9",
              PreviousFields : {
                TakerGets : "2556759400",
                TakerPays : {
                  currency : "USD",
                  issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
                  value : "49.54"
                }
              },
              PreviousTxnID : "42E33A7CD18E7C8E193859696585E0EF51D14EA49021086C47FBE471F708C985",
              PreviousTxnLgrSeq : 4604281
            }
          },
          {
            DeletedNode : {
              FinalFields : {
                ExchangeRate : "4D06E0C82F7BFDC0",
                Flags : 0,
                RootIndex : "CF8D13399C6ED20BA82740CFA78E928DC8D498255249BA634D06E0C82F7BFDC0",
                TakerGetsCurrency : "0000000000000000000000000000000000000000",
                TakerGetsIssuer : "0000000000000000000000000000000000000000",
                TakerPaysCurrency : "0000000000000000000000005553440000000000",
                TakerPaysIssuer : "DD39C650A96EDA48334E70CC4A85B8B2E8502CD3"
              },
              LedgerEntryType : "DirectoryNode",
              LedgerIndex : "CF8D13399C6ED20BA82740CFA78E928DC8D498255249BA634D06E0C82F7BFDC0"
            }
          },
          {
            DeletedNode : {
              FinalFields : {
                ExchangeRate : "4D06E0E15EBE8554",
                Flags : 0,
                RootIndex : "CF8D13399C6ED20BA82740CFA78E928DC8D498255249BA634D06E0E15EBE8554",
                TakerGetsCurrency : "0000000000000000000000000000000000000000",
                TakerGetsIssuer : "0000000000000000000000000000000000000000",
                TakerPaysCurrency : "0000000000000000000000005553440000000000",
                TakerPaysIssuer : "DD39C650A96EDA48334E70CC4A85B8B2E8502CD3"
              },
              LedgerEntryType : "DirectoryNode",
              LedgerIndex : "CF8D13399C6ED20BA82740CFA78E928DC8D498255249BA634D06E0E15EBE8554"
            }
          }
        ],
        TransactionIndex : 1,
        TransactionResult : "tesSUCCESS"
      },
      validated : true
    };

    expect(rpparser.parseBalanceChanges(tx, 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM'))
      .to.deep.equal([
        {value: '-96.8333604263805', currency: 'USD', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'},
        {value: '4999.999988', currency: 'XRP', issuer: ''}
      ]);

  });


  });


  describe('.xrpToDrops()', function(){

    it('should convert an xrp string to drops', function(){
      expect(rpparser.xrpToDrops('1')).to.equal('1000000');
    });

    it('should convert an xrp number to drops', function(){
      expect(rpparser.xrpToDrops(100)).to.equal('100000000');
    });

  });

  describe('.dropsToXrp()', function(){

    it('should convert a drops string to xrp', function(){
      expect(rpparser.dropsToXrp('12')).to.equal('0.000012');
    });

  });



});
