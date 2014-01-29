/*jshint expr: true*/
var expect = require('chai').expect,
  txLib = require('../../lib/tx');

describe('lib/tx', function(){

  describe('.getTx()', function(){

    var remote = {
        _connected: true,
        requestTx: function(tx_hash, callback) {
          if (tx_hash === '5A29096700281645BCBA74CD9E6D893A3C2937D14E6CA5FDD85313D7185B3533') {
            callback(null, {
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
            });
          } else {
            callback(new Error('not supported'));
          }
        },
        requestLedger: function(ledger, callback) {
          if (ledger === 4604471) {
            callback(null, {ledger: {
              accepted : true,
              account_hash : "9B172C57781558D1A7B447033001E680BC6D09C2562A331133878BC1CEFC7A33",
              close_time : 443910600,
              close_time_human : "2014-Jan-24 20:30:00",
              close_time_resolution : 10,
              closed : true,
              hash : "4C8FB6851B5919A09428A8BE965B266366FDD0343B05E628ADF2766491EB7BEE",
              ledger_hash : "4C8FB6851B5919A09428A8BE965B266366FDD0343B05E628ADF2766491EB7BEE",
              ledger_index : "4604471",
              parent_hash : "360481C011A2A4CA539B4C8807C93DAD711D039980D06930F2EF3FFD2AF46D2F",
              seqNum : "4604471",
              totalCoins : "99999998091796722",
              total_coins : "99999998091796722",
              transaction_hash : "7CA843FE9B12A95D2C99EAD1ED5B111A6CE646BB2CBF9291BB06FF0F1B953BB5",
              transactions : []
            }});
          } else {
            callback(new Error('not supported'));
          }
        }
      };

    it('should get a full ripple tx', function(done){

      txLib.getTx({
        remote: remote, 
        hash: '5A29096700281645BCBA74CD9E6D893A3C2937D14E6CA5FDD85313D7185B3533'
      }, function(err, res){
        expect(err).not.to.exist;
        expect(res).to.deep.equal({
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
          validated : true,
          close_time_unix: 1390595400000
        });
        done();
      });
    });

    it('should respond with an error if given an invalid hash', function(done){

      txLib.getTx({
        remote: remote,
        hash: 'badhash'
      }, function(err, res){
        expect(err).to.exist;
        expect(res).not.to.exist;
        done();
      });

    });

  });


  describe('.submitTx()', function(){

    // it('should accept transactions in JSON format', function(){
    //   txLib.submitTx({

    //   }, function(err, res){

    //   });
    // });

    // it('should accept transactions in ripple-lib Transaction object format', function(){

    // });

    // it('should respond with an error if given an invalid secret', function(){

    // });

    // it('should respond with an error if given an invalid transaction', function(){

    // });

  });

});

