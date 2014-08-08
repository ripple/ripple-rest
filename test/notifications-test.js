var _             = require('lodash');
var chai          = require('chai');
var sinon         = require('sinon');
var sinonchai     = require('sinon-chai');
var expect        = chai.expect;
var server_lib    = require('../lib/server-lib');
var notifications = require('../api/notifications');
var ripple        = require('ripple-lib');
chai.use(sinonchai);

// Note that these tests use heavily stubbed versions of the 
// dependencies such as ripple-lib. These must be updated if 
// the dependencies are changed in any significant way

describe('api/notifications', function(){

  describe('.getNotification()', function(done){

    it.skip('should respond with an error if there is no connection to rippled', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() - server_lib.CONNECTION_TIMEOUT - 1 // Considered disconnected
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {}
      };

      notifications.get($, {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          identifier: 'some_identifier'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('rippled');
          done();
        }
      });

    });

    it.skip('should respond with an error if the account is missing', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now()
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      notifications.get($, {
        params: {
          identifier: 'some_identifier'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('Missing parameter: account');
          done();
        }
      });

    });

    it.skip('should respond with an error if the account is invalid', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now()
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'notvalid',
          identifier: 'some_identifier'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('Invalid parameter: account');
          done();
        }
      });

    });

    it.skip('should respond with an error if the identifier is missing', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now()
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('identifier');
          done();
        }
      });

    });

    it.skip('should respond with an error if the identifier is invalid', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now()
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          identifier: 'some\n INVALID \nidentifier'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('identifier');
          done();
        }
      });

    });

    it.skip('should respond with an error if the transaction corresponding to the given hash did not affect the specified account', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now()
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback) {
            callback(null, {
              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
              "Amount": "10",
              "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "DestinationTag": 123,
              "Fee": "12",
              "Flags": 2147483648,
              "LastLedgerSequence": 6735147,
              "Sequence": 153,
              "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
              "SourceTag": 456,
              "TransactionType": "Payment",
              "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
              "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
              "inLedger": 6735142,
              "ledger_index": 6735142,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "Balance": "241338604",
                        "Flags": 1048576,
                        "OwnerCount": 6,
                        "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                        "Sequence": 270
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                      "PreviousFields": {
                        "Balance": "241338594"
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "Balance": "79521203",
                        "Flags": 0,
                        "OwnerCount": 9,
                        "Sequence": 154
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                      "PreviousFields": {
                        "Balance": "79521225",
                        "Sequence": 153
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          identifier: '130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('did not affect the given account');
          done();
        }
      }, function(error){
        expect(error).not.to.exist;
      });

    });

    it.skip('should respond with an error if the ledger containing the base transaction is not in the rippleds complete ledger set', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now(),
              _opts: {
                url: ''
              }
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback) {
            callback(null, {
              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
              "Amount": "10",
              "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "DestinationTag": 123,
              "Fee": "12",
              "Flags": 2147483648,
              "LastLedgerSequence": 6735147,
              "Sequence": 153,
              "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
              "SourceTag": 456,
              "TransactionType": "Payment",
              "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
              "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
              "inLedger": 6735142,
              "ledger_index": 6735142,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "Balance": "241338604",
                        "Flags": 1048576,
                        "OwnerCount": 6,
                        "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                        "Sequence": 270
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                      "PreviousFields": {
                        "Balance": "241338594"
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "Balance": "79521203",
                        "Flags": 0,
                        "OwnerCount": 9,
                        "Sequence": 154
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                      "PreviousFields": {
                        "Balance": "79521225",
                        "Sequence": 153
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "close_time": 453925550,
                "close_time_human": "2014-May-20 18:25:50",
                "hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_index": "6735142"
              }
            });
          },
          requestServerInfo: function(callback) {
            callback(null, {
              "info": {
                "complete_ledgers": "6735143-6777223"
                }
            })
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r',
          identifier: '130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('complete ledger set');
          done();
        }
      });


    });

    it.skip('should include the hashes of the previous and next transactions', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now(),
              _opts: {
                url: ''
              }
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback) {
            callback(null, {
              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
              "Amount": "10",
              "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "DestinationTag": 123,
              "Fee": "12",
              "Flags": 2147483648,
              "LastLedgerSequence": 6735147,
              "Sequence": 153,
              "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
              "SourceTag": 456,
              "TransactionType": "Payment",
              "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
              "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
              "inLedger": 6735142,
              "ledger_index": 6735142,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "Balance": "241338604",
                        "Flags": 1048576,
                        "OwnerCount": 6,
                        "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                        "Sequence": 270
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                      "PreviousFields": {
                        "Balance": "241338594"
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "Balance": "79521203",
                        "Flags": 0,
                        "OwnerCount": 9,
                        "Sequence": 154
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                      "PreviousFields": {
                        "Balance": "79521225",
                        "Sequence": 153
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "close_time": 453925550,
                "close_time_human": "2014-May-20 18:25:50",
                "hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_index": "6735142"
              }
            });
          },
          requestServerInfo: function(callback) {
            callback(null, {
              "info": {
                "complete_ledgers": "32570-6777223"
                }
            })
          },
          requestAccountTx: function(params, callback) {
            if (params.ledger_index_max === 6735142 && params.ledger_index_min === 6735142) {
              callback(null, {
                "transactions": [
                  {
                    "meta": {
                      "AffectedNodes": [
                        {
                          "ModifiedNode": {
                            "FinalFields": {
                              "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                              "Balance": "241338604",
                              "Flags": 1048576,
                              "OwnerCount": 6,
                              "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                              "Sequence": 270
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                            "PreviousFields": {
                              "Balance": "241338594"
                            },
                            "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                            "PreviousTxnLgrSeq": 6735099
                          }
                        },
                        {
                          "ModifiedNode": {
                            "FinalFields": {
                              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                              "Balance": "79521203",
                              "Flags": 0,
                              "OwnerCount": 9,
                              "Sequence": 154
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                            "PreviousFields": {
                              "Balance": "79521225",
                              "Sequence": 153
                            },
                            "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                            "PreviousTxnLgrSeq": 6735099
                          }
                        }
                      ],
                      "TransactionIndex": 1,
                      "TransactionResult": "tesSUCCESS"
                    },
                    "tx": {
                      "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                      "Amount": "10",
                      "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                      "DestinationTag": 123,
                      "Fee": "12",
                      "Flags": 2147483648,
                      "LastLedgerSequence": 6735147,
                      "Sequence": 153,
                      "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                      "SourceTag": 456,
                      "TransactionType": "Payment",
                      "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
                      "date": 453925550,
                      "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                      "inLedger": 6735142,
                      "ledger_index": 6735142
                    },
                    "validated": true
                  }
                ]
              });
            } else if (params.ledger_index_min === 6735142) {
              expect(params.forward).to.be.true;
              callback(null, {"transactions": [
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338604",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338594"
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521203",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 154
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521225",
                            "Sequence": 153
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      }
                    ],
                    "TransactionIndex": 1,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "10",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "DestinationTag": 123,
                    "Fee": "12",
                    "Flags": 2147483648,
                    "LastLedgerSequence": 6735147,
                    "Sequence": 153,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "SourceTag": 456,
                    "TransactionType": "Payment",
                    "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
                    "date": 453925550,
                    "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                    "inLedger": 6735142,
                    "ledger_index": 6735142
                  },
                  "validated": true
                },
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338616",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338604"
                          },
                          "PreviousTxnID": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                          "PreviousTxnLgrSeq": 6735142
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521179",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 155
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521203",
                            "Sequence": 154
                          },
                          "PreviousTxnID": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                          "PreviousTxnLgrSeq": 6735142
                        }
                      }
                    ],
                    "TransactionIndex": 7,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "12",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "Fee": "12",
                    "Flags": 0,
                    "Sequence": 154,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "TransactionType": "Payment",
                    "TxnSignature": "304402200540402A3008E1D41645C85E08B16AAFA5FB141EE26996DA470F7CDB657E7DB302200A8D7BDB073788EF486969D993E47E873E94EBEB26069E8C8B1B7969F02E5C01",
                    "date": 454624620,
                    "hash": "A990DDD82F6B4F54CF1763121766C113330A35235C44B547C67EB2AF8E0D3201",
                    "inLedger": 6886435,
                    "ledger_index": 6886435
                  },
                  "validated": true
                }
              ]});
            } else if (params.ledger_index_max === 6735142) {
              expect(params.forward).to.be.false;
              callback(null, {"transactions": [
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338604",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338594"
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521203",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 154
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521225",
                            "Sequence": 153
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      }
                    ],
                    "TransactionIndex": 1,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "10",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "DestinationTag": 123,
                    "Fee": "12",
                    "Flags": 2147483648,
                    "LastLedgerSequence": 6735147,
                    "Sequence": 153,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "SourceTag": 456,
                    "TransactionType": "Payment",
                    "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
                    "date": 453925550,
                    "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                    "inLedger": 6735142,
                    "ledger_index": 6735142
                  },
                  "validated": true
                },
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338594",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338584"
                          },
                          "PreviousTxnID": "AE6516051C46549007AB1553DF75FA50B4DFF24D5AD35BD9476566B72250E956",
                          "PreviousTxnLgrSeq": 6721715
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521225",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 153
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521247",
                            "Sequence": 152
                          },
                          "PreviousTxnID": "AE6516051C46549007AB1553DF75FA50B4DFF24D5AD35BD9476566B72250E956",
                          "PreviousTxnLgrSeq": 6721715
                        }
                      }
                    ],
                    "TransactionIndex": 0,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "10",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "DestinationTag": 123,
                    "Fee": "12",
                    "Flags": 2147483648,
                    "LastLedgerSequence": 6735104,
                    "Sequence": 152,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "SourceTag": 456,
                    "TransactionType": "Payment",
                    "TxnSignature": "304402207FFB353BE1CB6F86CD04CDA632F5797C8C76B5EDE6A649F91A0E5BC7485A7A8D022007C2A71D20BD3EB3DC27465D117A39997D21B7C96473C37695893BFB5F1D34B9",
                    "date": 453925360,
                    "hash": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                    "inLedger": 6735099,
                    "ledger_index": 6735099
                  },
                  "validated": true
                }
              ]});
            }
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          },
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r',
          identifier: '130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);
          expect(json_response.notification.next_hash).to.equal('A990DDD82F6B4F54CF1763121766C113330A35235C44B547C67EB2AF8E0D3201');
          expect(json_response.notification.previous_hash).to.equal('AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940');
          done();
        }
      }, function(err){
        expect(err).not.to.exist;
      });

    });

    it.skip('should include urls pointing to the previous and next transactions', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now(),
              _opts: {
                url: ''
              }
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback) {
            callback(null, {
              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
              "Amount": "10",
              "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "DestinationTag": 123,
              "Fee": "12",
              "Flags": 2147483648,
              "LastLedgerSequence": 6735147,
              "Sequence": 153,
              "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
              "SourceTag": 456,
              "TransactionType": "Payment",
              "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
              "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
              "inLedger": 6735142,
              "ledger_index": 6735142,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "Balance": "241338604",
                        "Flags": 1048576,
                        "OwnerCount": 6,
                        "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                        "Sequence": 270
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                      "PreviousFields": {
                        "Balance": "241338594"
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "Balance": "79521203",
                        "Flags": 0,
                        "OwnerCount": 9,
                        "Sequence": 154
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                      "PreviousFields": {
                        "Balance": "79521225",
                        "Sequence": 153
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "close_time": 453925550,
                "close_time_human": "2014-May-20 18:25:50",
                "hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_index": "6735142"
              }
            });
          },
          requestServerInfo: function(callback) {
            callback(null, {
              "info": {
                "complete_ledgers": "32570-6777223"
                }
            })
          },
          requestAccountTx: function(params, callback) {
            if (params.ledger_index_max === 6735142 && params.ledger_index_min === 6735142) {
              callback(null, {
                "transactions": [
                  {
                    "meta": {
                      "AffectedNodes": [
                        {
                          "ModifiedNode": {
                            "FinalFields": {
                              "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                              "Balance": "241338604",
                              "Flags": 1048576,
                              "OwnerCount": 6,
                              "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                              "Sequence": 270
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                            "PreviousFields": {
                              "Balance": "241338594"
                            },
                            "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                            "PreviousTxnLgrSeq": 6735099
                          }
                        },
                        {
                          "ModifiedNode": {
                            "FinalFields": {
                              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                              "Balance": "79521203",
                              "Flags": 0,
                              "OwnerCount": 9,
                              "Sequence": 154
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                            "PreviousFields": {
                              "Balance": "79521225",
                              "Sequence": 153
                            },
                            "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                            "PreviousTxnLgrSeq": 6735099
                          }
                        }
                      ],
                      "TransactionIndex": 1,
                      "TransactionResult": "tesSUCCESS"
                    },
                    "tx": {
                      "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                      "Amount": "10",
                      "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                      "DestinationTag": 123,
                      "Fee": "12",
                      "Flags": 2147483648,
                      "LastLedgerSequence": 6735147,
                      "Sequence": 153,
                      "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                      "SourceTag": 456,
                      "TransactionType": "Payment",
                      "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
                      "date": 453925550,
                      "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                      "inLedger": 6735142,
                      "ledger_index": 6735142
                    },
                    "validated": true
                  }
                ]
              });
            } else if (params.ledger_index_min === 6735142) {
              expect(params.forward).to.be.true;
              callback(null, {"transactions": [
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338604",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338594"
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521203",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 154
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521225",
                            "Sequence": 153
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      }
                    ],
                    "TransactionIndex": 1,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "10",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "DestinationTag": 123,
                    "Fee": "12",
                    "Flags": 2147483648,
                    "LastLedgerSequence": 6735147,
                    "Sequence": 153,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "SourceTag": 456,
                    "TransactionType": "Payment",
                    "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
                    "date": 453925550,
                    "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                    "inLedger": 6735142,
                    "ledger_index": 6735142
                  },
                  "validated": true
                },
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338616",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338604"
                          },
                          "PreviousTxnID": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                          "PreviousTxnLgrSeq": 6735142
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521179",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 155
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521203",
                            "Sequence": 154
                          },
                          "PreviousTxnID": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                          "PreviousTxnLgrSeq": 6735142
                        }
                      }
                    ],
                    "TransactionIndex": 7,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "12",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "Fee": "12",
                    "Flags": 0,
                    "Sequence": 154,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "TransactionType": "Payment",
                    "TxnSignature": "304402200540402A3008E1D41645C85E08B16AAFA5FB141EE26996DA470F7CDB657E7DB302200A8D7BDB073788EF486969D993E47E873E94EBEB26069E8C8B1B7969F02E5C01",
                    "date": 454624620,
                    "hash": "A990DDD82F6B4F54CF1763121766C113330A35235C44B547C67EB2AF8E0D3201",
                    "inLedger": 6886435,
                    "ledger_index": 6886435
                  },
                  "validated": true
                }
              ]});
            } else if (params.ledger_index_max === 6735142) {
              expect(params.forward).to.be.false;
              callback(null, {"transactions": [
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338604",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338594"
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521203",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 154
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521225",
                            "Sequence": 153
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      }
                    ],
                    "TransactionIndex": 1,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "10",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "DestinationTag": 123,
                    "Fee": "12",
                    "Flags": 2147483648,
                    "LastLedgerSequence": 6735147,
                    "Sequence": 153,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "SourceTag": 456,
                    "TransactionType": "Payment",
                    "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
                    "date": 453925550,
                    "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                    "inLedger": 6735142,
                    "ledger_index": 6735142
                  },
                  "validated": true
                },
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338594",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338584"
                          },
                          "PreviousTxnID": "AE6516051C46549007AB1553DF75FA50B4DFF24D5AD35BD9476566B72250E956",
                          "PreviousTxnLgrSeq": 6721715
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521225",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 153
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521247",
                            "Sequence": 152
                          },
                          "PreviousTxnID": "AE6516051C46549007AB1553DF75FA50B4DFF24D5AD35BD9476566B72250E956",
                          "PreviousTxnLgrSeq": 6721715
                        }
                      }
                    ],
                    "TransactionIndex": 0,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "10",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "DestinationTag": 123,
                    "Fee": "12",
                    "Flags": 2147483648,
                    "LastLedgerSequence": 6735104,
                    "Sequence": 152,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "SourceTag": 456,
                    "TransactionType": "Payment",
                    "TxnSignature": "304402207FFB353BE1CB6F86CD04CDA632F5797C8C76B5EDE6A649F91A0E5BC7485A7A8D022007C2A71D20BD3EB3DC27465D117A39997D21B7C96473C37695893BFB5F1D34B9",
                    "date": 453925360,
                    "hash": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                    "inLedger": 6735099,
                    "ledger_index": 6735099
                  },
                  "validated": true
                }
              ]});
            }
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          },
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          }
        },
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 80;
            }
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r',
          identifier: '130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);
          expect(json_response.notification.next_notification_url).to.equal('http://localhost:80/v1/accounts/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/notifications/A990DDD82F6B4F54CF1763121766C113330A35235C44B547C67EB2AF8E0D3201');
          expect(json_response.notification.previous_notification_url).to.equal('http://localhost:80/v1/accounts/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/notifications/AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940');
          done();
        }
      }, function(err){
        expect(err).not.to.exist;
      });

    });

    it.skip('should include the client_resource_id in the JSON response -- but not in the notification body -- when one is found in the database', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now(),
              _opts: {
                url: ''
              }
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback) {
            callback(null, {
              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
              "Amount": "10",
              "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "DestinationTag": 123,
              "Fee": "12",
              "Flags": 2147483648,
              "LastLedgerSequence": 6735147,
              "Sequence": 153,
              "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
              "SourceTag": 456,
              "TransactionType": "Payment",
              "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
              "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
              "inLedger": 6735142,
              "ledger_index": 6735142,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "Balance": "241338604",
                        "Flags": 1048576,
                        "OwnerCount": 6,
                        "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                        "Sequence": 270
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                      "PreviousFields": {
                        "Balance": "241338594"
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "Balance": "79521203",
                        "Flags": 0,
                        "OwnerCount": 9,
                        "Sequence": 154
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                      "PreviousFields": {
                        "Balance": "79521225",
                        "Sequence": 153
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "close_time": 453925550,
                "close_time_human": "2014-May-20 18:25:50",
                "hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_index": "6735142"
              }
            });
          },
          requestServerInfo: function(callback) {
            callback(null, {
              "info": {
                "complete_ledgers": "32570-6777223"
                }
            })
          },
          requestAccountTx: function(params, callback) {
            callback(null, {
              transactions: []
            });
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback(null, {
              client_resource_id: 'testid'
            });
          },
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          }
        },
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 80;
            }
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r',
          identifier: '130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);
          expect(json_response.notification.client_resource_id).not.to.exist;
          expect(json_response.client_resource_id).to.equal('testid');
          done();
        }
      }, function(err){
        expect(err).not.to.exist;
      });

    });

    it.skip('should correctly identify outgoing transactions', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now(),
              _opts: {
                url: ''
              }
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback) {
            callback(null, {
              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
              "Amount": "10",
              "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "DestinationTag": 123,
              "Fee": "12",
              "Flags": 2147483648,
              "LastLedgerSequence": 6735147,
              "Sequence": 153,
              "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
              "SourceTag": 456,
              "TransactionType": "Payment",
              "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
              "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
              "inLedger": 6735142,
              "ledger_index": 6735142,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "Balance": "241338604",
                        "Flags": 1048576,
                        "OwnerCount": 6,
                        "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                        "Sequence": 270
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                      "PreviousFields": {
                        "Balance": "241338594"
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "Balance": "79521203",
                        "Flags": 0,
                        "OwnerCount": 9,
                        "Sequence": 154
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                      "PreviousFields": {
                        "Balance": "79521225",
                        "Sequence": 153
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "close_time": 453925550,
                "close_time_human": "2014-May-20 18:25:50",
                "hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_index": "6735142"
              }
            });
          },
          requestServerInfo: function(callback) {
            callback(null, {
              "info": {
                "complete_ledgers": "32570-6777223"
                }
            })
          },
          requestAccountTx: function(params, callback) {
            callback(null, {
              transactions: []
            });
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          },
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r',
          identifier: '130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);
          expect(json_response.notification.direction).to.equal('outgoing');
          done();
        }
      }, function(err){
        expect(err).not.to.exist;
      });

    });

    it.skip('should correctly identify incoming transactions', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now(),
              _opts: {
                url: ''
              }
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback) {
            callback(null, {
              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
              "Amount": "10",
              "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "DestinationTag": 123,
              "Fee": "12",
              "Flags": 2147483648,
              "LastLedgerSequence": 6735147,
              "Sequence": 153,
              "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
              "SourceTag": 456,
              "TransactionType": "Payment",
              "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
              "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
              "inLedger": 6735142,
              "ledger_index": 6735142,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "Balance": "241338604",
                        "Flags": 1048576,
                        "OwnerCount": 6,
                        "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                        "Sequence": 270
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                      "PreviousFields": {
                        "Balance": "241338594"
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "Balance": "79521203",
                        "Flags": 0,
                        "OwnerCount": 9,
                        "Sequence": 154
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                      "PreviousFields": {
                        "Balance": "79521225",
                        "Sequence": 153
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "close_time": 453925550,
                "close_time_human": "2014-May-20 18:25:50",
                "hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_index": "6735142"
              }
            });
          },
          requestServerInfo: function(callback) {
            callback(null, {
              "info": {
                "complete_ledgers": "32570-6777223"
                }
            })
          },
          requestAccountTx: function(params, callback) {
            callback(null, {
              transactions: []
            });
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          },
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          identifier: '130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);
          expect(json_response.notification.direction).to.equal('incoming');
          done();
        }
      }, function(err){
        expect(err).not.to.exist;
      });

    });

    it.skip('should correctly identify passthrough transactions', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now(),
              _opts: {
                url: ''
              }
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback) {
            callback(null, {
              "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "Amount": {
                "currency": "BER",
                "issuer": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                "value": "0.1"
              },
              "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "Fee": "12",
              "Flags": 0,
              "SendMax": {
                "currency": "FAK",
                "issuer": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                "value": "0.0202"
              },
              "Sequence": 237,
              "SigningPubKey": "025B32A54BFA33FB781581F49B235C0E2820C929FF41E677ADA5D3E53CFBA46332",
              "TransactionType": "Payment",
              "TxnSignature": "304402206787F455EC1FD2BD4AD2AC60A893201E266F9FAD20E05DBC9073C50B5750B7B3022047620D984B9D92F61D8BD6818CCE563B422E2416C4FFEEF5B5295999C17D1892",
              "hash": "3B8FBB4AA5BECCEF324EE0C947C754F182589A2357C5354303277D4C38B3C4F9",
              "inLedger": 6076661,
              "ledger_index": 6076661,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "Balance": "262338867",
                        "Flags": 0,
                        "OwnerCount": 6,
                        "Sequence": 238
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                      "PreviousFields": {
                        "Balance": "262338879",
                        "OwnerCount": 7,
                        "Sequence": 237
                      },
                      "PreviousTxnID": "7238EC73723695CFCB2D99247E3C33464987DEA942CBC2DA5FC2E70EFD77FA3E",
                      "PreviousTxnLgrSeq": 6076657
                    }
                  },
                  {
                    "DeletedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "BookDirectory": "9F558762D78ED00690C2C8892ACEF67A78C5DB2046D4B81454071AFD498D0000",
                        "BookNode": "0000000000000000",
                        "Flags": 0,
                        "OwnerNode": "0000000000000000",
                        "PreviousTxnID": "B3D525EE750259B84AAF83CBD7F21556B7BF23EAB0886749FAC3C8A66D5D29EE",
                        "PreviousTxnLgrSeq": 6076649,
                        "Sequence": 235,
                        "TakerGets": {
                          "currency": "BER",
                          "issuer": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                          "value": "0"
                        },
                        "TakerPays": {
                          "currency": "FAK",
                          "issuer": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                          "value": "0"
                        }
                      },
                      "LedgerEntryType": "Offer",
                      "LedgerIndex": "750B2948472A5EF2294D2514B24DAC8C9720D282CC8904AB9AC21B15C311D663",
                      "PreviousFields": {
                        "TakerGets": {
                          "currency": "BER",
                          "issuer": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                          "value": "0.1"
                        },
                        "TakerPays": {
                          "currency": "FAK",
                          "issuer": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                          "value": "0.02"
                        }
                      }
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "ExchangeRate": "54071AFD498D0000",
                        "Flags": 0,
                        "RootIndex": "9F558762D78ED00690C2C8892ACEF67A78C5DB2046D4B81454071AFD498D0000",
                        "TakerGetsCurrency": "0000000000000000000000004245520000000000",
                        "TakerGetsIssuer": "D0C3786E1EF7ED5A55715427796C37F6C1953D3F",
                        "TakerPaysCurrency": "00000000000000000000000046414B0000000000",
                        "TakerPaysIssuer": "D0C3786E1EF7ED5A55715427796C37F6C1953D3F"
                      },
                      "LedgerEntryType": "DirectoryNode",
                      "LedgerIndex": "9F558762D78ED00690C2C8892ACEF67A78C5DB2046D4B81454071AFD498D0000"
                    }
                  },
                  {
                    "DeletedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "BookDirectory": "BF1879D38D45250F7431982A7831288FFB9C82141097EBB351038D7EA4C68000",
                        "BookNode": "0000000000000000",
                        "Flags": 0,
                        "OwnerNode": "0000000000000000",
                        "PreviousTxnID": "D7642EEDBB54FA47C4DAE7FF5B66A748BE1CB21B8BA53CC29E8B1CA4F4F35B89",
                        "PreviousTxnLgrSeq": 6076608,
                        "Sequence": 137,
                        "TakerGets": "100000",
                        "TakerPays": {
                          "currency": "FAK",
                          "issuer": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                          "value": "10"
                        }
                      },
                      "LedgerEntryType": "Offer",
                      "LedgerIndex": "A0EA49A5307C09EAE09DAE03993E56D0C725C871C3408385C6BE6C14F2DAB239"
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Flags": 0,
                        "Owner": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "RootIndex": "B01C6AFE2135794EE393651652E00F9C3F5CCDFA7C2149BAAFD5A06752F111C1"
                      },
                      "LedgerEntryType": "DirectoryNode",
                      "LedgerIndex": "B01C6AFE2135794EE393651652E00F9C3F5CCDFA7C2149BAAFD5A06752F111C1"
                    }
                  },
                  {
                    "DeletedNode": {
                      "FinalFields": {
                        "ExchangeRate": "51038D7EA4C68000",
                        "Flags": 0,
                        "RootIndex": "BF1879D38D45250F7431982A7831288FFB9C82141097EBB351038D7EA4C68000",
                        "TakerGetsCurrency": "0000000000000000000000000000000000000000",
                        "TakerGetsIssuer": "0000000000000000000000000000000000000000",
                        "TakerPaysCurrency": "00000000000000000000000046414B0000000000",
                        "TakerPaysIssuer": "D0C3786E1EF7ED5A55715427796C37F6C1953D3F"
                      },
                      "LedgerEntryType": "DirectoryNode",
                      "LedgerIndex": "BF1879D38D45250F7431982A7831288FFB9C82141097EBB351038D7EA4C68000"
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Flags": 0,
                        "Owner": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "RootIndex": "F655EAF4786194E0F98C74517D2444AC6932FDAD9EBB69F06394330298A52C15"
                      },
                      "LedgerEntryType": "DirectoryNode",
                      "LedgerIndex": "F655EAF4786194E0F98C74517D2444AC6932FDAD9EBB69F06394330298A52C15"
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "Balance": "130521538",
                        "Flags": 0,
                        "OwnerCount": 10,
                        "Sequence": 138
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                      "PreviousFields": {
                        "OwnerCount": 11
                      },
                      "PreviousTxnID": "D7642EEDBB54FA47C4DAE7FF5B66A748BE1CB21B8BA53CC29E8B1CA4F4F35B89",
                      "PreviousTxnLgrSeq": 6076608
                    }
                  }
                ],
                "TransactionIndex": 2,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "close_time": 453925550,
                "close_time_human": "2014-May-20 18:25:50",
                "hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_index": "6735142"
              }
            });
          },
          requestServerInfo: function(callback) {
            callback(null, {
              "info": {
                "complete_ledgers": "32570-6777223"
                }
            })
          },
          requestAccountTx: function(params, callback) {
            callback(null, {
              transactions: []
            });
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          },
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r',
          identifier: '3B8FBB4AA5BECCEF324EE0C947C754F182589A2357C5354303277D4C38B3C4F9'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);
          expect(json_response.notification.direction).to.equal('passthrough');
          done();
        }
      }, function(err){
        expect(err).not.to.exist;
      });

    });

    // it.skip('should list the type as the resource, rather than transaction, type (payment, order, trustline, settings)', function(){

    // });

  });

});
