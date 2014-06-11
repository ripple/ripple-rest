var _            = require('lodash');
var chai         = require('chai');
var sinon        = require('sinon');
var sinonchai    = require('sinon-chai');
var expect       = chai.expect;
var ripple       = require('ripple-lib');
var payments     = require('../api/payments');
var transactions = require('../api/transactions');
var server_lib   = require('../lib/server-lib');
chai.use(sinonchai);

// Note that these tests use heavily stubbed versions of the 
// dependencies such as ripple-lib. These must be updated if 
// the dependencies are changed in any significant way

describe('api/payments', function(){

  describe('.submit()', function(){

    it('should produce an error if the payment is missing', function(done){
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
       
      Server._lastLedgerClose = Date.now() - 1;
       
      remote._getServer = function() {
        return Server;
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              throw new Error('Not implemented');
            }
          }
        }
      }, {
        body: {
          secret: 'somesecret',
          client_resource_id: 'someid'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('payment');
          done();
        }
      });
    });

    it('should produce an error if the secret is missing', function(done){
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
       
      Server._lastLedgerClose = Date.now() - 1;
       
      remote._getServer = function() {
        return Server;
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              throw new Error('Not implemented');
            }
          }
        }
      }, {
        body: {
          payment: {
            source_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            destination_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
            destination_amount: {
              value: '1',
              currency: 'XRP',
              issuer: ''
            }
          },
          client_resource_id: 'someid'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('secret');
          done();
        }
      });
    });

    it('should produce an error if the client_resource_id is missing', function(done){
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
       
      Server._lastLedgerClose = Date.now() - 1;
       
      remote._getServer = function() {
        return Server;
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              throw new Error('Not implemented');
            }
          }
        }
      }, {
        body: {
          payment: {
            source_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            destination_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
            destination_amount: {
              value: '1',
              currency: 'XRP',
              issuer: ''
            }
          },
          secret: 'somesecret'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('client_resource_id');
          done();
        }
      });
    });

    it('should produce an error if the client_resource_id is invalid', function(done){
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
       
      Server._lastLedgerClose = Date.now() - 1;
       
      remote._getServer = function() {
        return Server;
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              throw new Error('Not implemented');
            }
          }
        }
      }, {
        body: {
          payment: {
            source_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            destination_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
            destination_amount: {
              value: '1',
              currency: 'XRP',
              issuer: ''
            }
          },
          secret: 'somesecret',
          client_resource_id: 'invalid\nclient_resource_id'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('client_resource_id');
          done();
        }
      });
    });

    it('should produce an error if there is no connection to rippled', function(done){
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = {
        _getServer: function() {
          return {
            _lastLedgerClose: Date.now() - server_lib.CONNECTION_TIMEOUT - 1 // Considered disconnected
          };
        },
        once: function(){},
        on: function(){},
        connect: function(){},
        removeListener: function(){}
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              throw new Error('Not implemented');
            }
          }
        }
      }, {
        body: {
          payment: {
            source_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            destination_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
            destination_amount: {
              value: '1',
              currency: 'XRP',
              issuer: ''
            }
          },
          secret: 'somesecret',
          client_resource_id: 'someid'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('rippled');
          done();
        }
      });
    });

    it('should produce an error if the source_account is missing', function(done){
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = {
        _getServer: function() {
          return {
            _lastLedgerClose: Date.now() // Considered connected
          };
        },
        once: function(){},
        on: function(){},
        connect: function(){},
        removeListener: function(){}
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              throw new Error('Not implemented');
            }
          }
        }
      }, {
        body: {
          payment: {
            // source_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            destination_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
            destination_amount: {
              value: '1',
              currency: 'XRP',
              issuer: ''
            }
          },
          secret: 'somesecret',
          client_resource_id: 'someid'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('source_account');
          done();
        }
      });
    });

    it('should produce an error if the source_account is invalid', function(done){
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = {
        _getServer: function() {
          return {
            _lastLedgerClose: Date.now() // Considered connected
          };
        },
        once: function(){},
        on: function(){},
        connect: function(){},
        removeListener: function(){}
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              throw new Error('Not implemented');
            }
          }
        }
      }, {
        body: {
          payment: {
            source_account: 'not an address',
            destination_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
            destination_amount: {
              value: '1',
              currency: 'XRP',
              issuer: ''
            }
          },
          secret: 'somesecret',
          client_resource_id: 'someid'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('source_account');
          done();
        }
      });
    });

    it('should produce an error if the destination_account is missing', function(done){
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = {
        _getServer: function() {
          return {
            _lastLedgerClose: Date.now() // Considered connected
          };
        },
        once: function(){},
        on: function(){},
        connect: function(){},
        removeListener: function(){}
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              throw new Error('Not implemented');
            }
          }
        }
      }, {
        body: {
          payment: {
            source_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            // destination_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
            destination_amount: {
              value: '1',
              currency: 'XRP',
              issuer: ''
            }
          },
          secret: 'somesecret',
          client_resource_id: 'someid'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('destination_account');
          done();
        }
      });
    });

    it('should produce an error if the destination_account is invalid', function(done){
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = {
        _getServer: function() {
          return {
            _lastLedgerClose: Date.now() // Considered connected
          };
        },
        once: function(){},
        on: function(){},
        connect: function(){},
        removeListener: function(){}
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              throw new Error('Not implemented');
            }
          }
        }
      }, {
        body: {
          payment: {
            source_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            destination_account: 'not an address',
            destination_amount: {
              value: '1',
              currency: 'XRP',
              issuer: ''
            }
          },
          secret: 'somesecret',
          client_resource_id: 'someid'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('destination_account');
          done();
        }
      });
    });


    it('should produce an error if the destination_amount is missing', function(done){
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = {
        _getServer: function() {
          return {
            _lastLedgerClose: Date.now() // Considered connected
          };
        },
        once: function(){},
        on: function(){},
        connect: function(){},
        removeListener: function(){}
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              throw new Error('Not implemented');
            }
          }
        }
      }, {
        body: {
          payment: {
            source_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            destination_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
            // destination_amount: {
            //   value: '1',
            //   currency: 'XRP',
            //   issuer: ''
            // }
          },
          secret: 'somesecret',
          client_resource_id: 'someid'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('destination_amount');
          done();
        }
      });
    });

    it('should produce an error if the destination_amount is invalid', function(done){
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = {
        _getServer: function() {
          return {
            _lastLedgerClose: Date.now() // Considered connected
          };
        },
        once: function(){},
        on: function(){},
        connect: function(){},
        removeListener: function(){}
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              throw new Error('Not implemented');
            }
          }
        }
      }, {
        body: {
          payment: {
            source_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            destination_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
            destination_amount: {
              // value: '1',
              currency: 'XRP',
              issuer: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM'
            }
          },
          secret: 'somesecret',
          client_resource_id: 'someid'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('destination_amount');
          done();
        }
      });
    });

    it('should respond with the client_resource_id and the status_url if the submission was successful', function(done){

      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = {
        _getServer: function() {
          return {
            _lastLedgerClose: Date.now() // Considered connected
          };
        },
        once: function(){},
        on: function(){},
        connect: function(){},
        removeListener: function(){},
        account: function(){
          return {
            submit: function(transaction){
              transaction.emit('proposed');
            }
          };
        }
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              expect(false, 'Should not get here');
            }
          }
        }
      }, {
        body: {
          payment: {
            source_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            destination_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
            destination_amount: {
              value: '1',
              currency: 'XRP',
              issuer: ''
            }
          },
          secret: 'somesecret',
          client_resource_id: 'someid'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);
          expect(json_response.success).to.be.true;
          expect(json_response.client_resource_id).to.equal('someid');
          expect(json_response.status_url).to.equal('http://localhost:5990/v1/accounts/rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz/payments/someid');
          done();
        }
      });

    });

    it('should pass an error to the Express.js next function if there is an error after submission but before the "proposed" event', function(done){

      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: function(transaction, callback) {
          callback();
        }
      };
       
      var remote = {
        _getServer: function() {
          return {
            _lastLedgerClose: Date.now() // Considered connected
          };
        },
        once: function(){},
        on: function(){},
        connect: function(){},
        removeListener: function(){},
        account: function(){
          return {
            submit: function(transaction){
              transaction.emit('error', new Error('some error'));
            }
          };
        }
      };

      payments.submit({
        remote: remote,
        dbinterface: dbinterface,
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 5990;
            } else {
              expect(false, 'Should not get here');
            }
          }
        }
      }, {
        body: {
          payment: {
            source_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            destination_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
            destination_amount: {
              value: '1',
              currency: 'XRP',
              issuer: ''
            }
          },
          secret: 'somesecret',
          client_resource_id: 'someid'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(false, 'Should not get here');
        }
      }, function(err){
        expect(err.message).to.equal('some error');
        done();
      });

    });

  });

  describe('.get()', function(){

    it('should respond with an error if the account is missing', function(done){

      var $ = {};
      var req = {
        params: {
          identifier: 'someid'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('account');
          done();
        }
      };
      var next = function(err){};

      payments.get($, req, res, next);

    });

    it('should respond with an error if the account is invalid', function(done){

      var $ = {};
      var req = {
        params: {
          account: 'not a valid account',
          identifier: 'someid'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('account');
          done();
        }
      };
      var next = function(err){};

      payments.get($, req, res, next);

    });

    it('should respond with an error if the identifier is missing', function(done){

      var $ = {};
      var req = {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('hash or client_resource_id');
          done();
        }
      };
      var next = function(err){};

      payments.get($, req, res, next);

    });

    it('should respond with an error if the account is invalid', function(done){

      var $ = {};
      var req = {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          identifier: 'not\n a\n valid\n identifier\n'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('hash or client_resource_id');
          done();
        }
      };
      var next = function(err){};

      payments.get($, req, res, next);

    });

    it('should respond with an error if there is no connection to rippled', function(done){

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
        }
      };
      var req = {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          identifier: 'someid'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.message).to.contain('rippled');
          done();
        }
      };
      var next = function(err){};

      payments.get($, req, res, next);

    });

    it('should respond with an error if no transaction is found for the given identifier', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() // Considered connected
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback){
            callback();
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };
      var req = {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          identifier: 'FAKE6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(404);
          expect(json_response.message).to.contain('Transaction not found');
          done();
        }
      };
      var next = function(err){};

      payments.get($, req, res, next);

    });

    it('should respond with an error if the transaction is not a payment', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() // Considered connected
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback){
            callback(null, {
              "Account": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
              "Fee": "10",
              "Flags": 0,
              "Sequence": 1,
              "SigningPubKey": "02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D",
              "TakerGets": "2000000",
              "TakerPays": {
                "currency": "BTC",
                "issuer": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
                "value": "1"
              },
              "TransactionType": "OfferCreate",
              "TxnSignature": "3045022100A3A1E59ABC619E212AED87E8E72A44FF6F5FB9866668A89EE818FD93CE66C8FB02207A290146B1438D16CE77976602C1E32070974A010A27355D574DF61A5B19E002",
              "hash": "389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B",
              "inLedger": 95405,
              "ledger_index": 95405,
              "meta": {
                // Truncated
              }
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "accepted": true,
                "account_hash": "8993B803417A7EAAC0937778D94B76D63C73A907C7BDDF6B785C5D449DF34926",
                "close_time": 411616880,
                "close_time_human": "2013-Jan-16 02:01:20",
                "close_time_resolution": 10,
                "closed": true,
                "hash": "E8E3880B31BAD79D8D8EFADE645A71181F6B181FDD282555118A5233090BDE4A",
                "ledger_hash": "E8E3880B31BAD79D8D8EFADE645A71181F6B181FDD282555118A5233090BDE4A",
                "ledger_index": "95405",
                "parent_hash": "7175BCE102D9FF9237D6CB7F031FD02234CCC678FD4C7F71267AC2778853653D",
                "seqNum": "95405",
                "totalCoins": "99999999999990910",
                "total_coins": "99999999999990910",
                "transaction_hash": "0A5B102B91F3113C368D042EB642EA65D4AC4396766895660E0A2CE63B615E64"
              }
            });
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          identifier: '389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('Not a payment');
          done();
        }
      };
      var next = function(err){};

      payments.get($, req, res, next);

    });

    it('should produce a payment object with all of the possible fields, even if they are empty strings', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() // Considered connected
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback){
            callback(null, {
              "Account": "r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH",
              "Amount": {
                "currency": "USD",
                "issuer": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
                "value": "1"
              },
              "Destination": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
              "Fee": "10",
              "Flags": 0,
              "Paths": [
                [
                  {
                    "account": "r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV",
                    "currency": "USD",
                    "issuer": "r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV",
                    "type": 49,
                    "type_hex": "0000000000000031"
                  }
                ],
                [
                  {
                    "account": "rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x",
                    "currency": "USD",
                    "issuer": "rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x",
                    "type": 49,
                    "type_hex": "0000000000000031"
                  },
                  {
                    "account": "rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY",
                    "currency": "USD",
                    "issuer": "rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY",
                    "type": 49,
                    "type_hex": "0000000000000031"
                  },
                  {
                    "account": "r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV",
                    "currency": "USD",
                    "issuer": "r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV",
                    "type": 49,
                    "type_hex": "0000000000000031"
                  }
                ]
              ],
              "SendMax": {
                "currency": "USD",
                "issuer": "r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH",
                "value": "1.01"
              },
              "Sequence": 88,
              "SigningPubKey": "02EAE5DAB54DD8E1C49641D848D5B97D1B29149106174322EDF98A1B2CCE5D7F8E",
              "TransactionType": "Payment",
              "TxnSignature": "30440220791B6A3E036ECEFFE99E8D4957564E8C84D1548C8C3E80A87ED1AA646ECCFB16022037C5CAC97E34E3021EBB426479F2ACF3ACA75DB91DCC48D1BCFB4CF547CFEAA0",
              "hash": "E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7",
              "inLedger": 348734,
              "ledger_index": 348734,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH",
                        "Balance": "59328999119",
                        "Flags": 0,
                        "OwnerCount": 11,
                        "Sequence": 89
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "E0D7BDE68B468FF0B8D948FD865576517DA987569833A05374ADB9A72E870A06",
                      "PreviousFields": {
                        "Balance": "59328999129",
                        "Sequence": 88
                      },
                      "PreviousTxnID": "C26AA6B4F7C3B9F55E17CD0D11F12032A1C7AD2757229FFD277C9447A8815E6E",
                      "PreviousTxnLgrSeq": 348700
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Balance": {
                          "currency": "USD",
                          "issuer": "rrrrrrrrrrrrrrrrrrrrBZbvji",
                          "value": "-1"
                        },
                        "Flags": 131072,
                        "HighLimit": {
                          "currency": "USD",
                          "issuer": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
                          "value": "100"
                        },
                        "HighNode": "0000000000000000",
                        "LowLimit": {
                          "currency": "USD",
                          "issuer": "r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH",
                          "value": "0"
                        },
                        "LowNode": "0000000000000000"
                      },
                      "LedgerEntryType": "RippleState",
                      "LedgerIndex": "EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959",
                      "PreviousFields": {
                        "Balance": {
                          "currency": "USD",
                          "issuer": "rrrrrrrrrrrrrrrrrrrrBZbvji",
                          "value": "0"
                        }
                      },
                      "PreviousTxnID": "53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8",
                      "PreviousTxnLgrSeq": 343570
                    }
                  }
                ],
                "TransactionIndex": 0,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "accepted": true,
                "account_hash": "14140639C82776D045EF962B6D14D5099A94067AE34DEA0E26D9D5C628697903",
                "close_time": 416445410,
                "close_time_human": "2013-Mar-12 23:16:50",
                "close_time_resolution": 10,
                "closed": true,
                "hash": "195F62F34EB2CCFA4C5888BA20387E82EB353DDB4508BAE6A835AF19FB8B0C09",
                "ledger_hash": "195F62F34EB2CCFA4C5888BA20387E82EB353DDB4508BAE6A835AF19FB8B0C09",
                "ledger_index": "348734",
                "parent_hash": "C9E7A882E7B506F13657B3BEB2E2F7236A13A848DDA134986A8672C0CF3C7ABB",
                "seqNum": "348734",
                "totalCoins": "99999999999691710",
                "total_coins": "99999999999691710",
                "transaction_hash": "F8CFE8553BA1688FD606F96414BB8C7858472A08C7BB021D718F5961BB284B59"
              }
            });
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          identifier: '389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);

          // List of keys taken from Payment schema
          expect(json_response.payment).to.have.keys([
            'source_account',
            'source_tag',
            'source_amount',
            'source_slippage',
            'destination_account',
            'destination_tag',
            'destination_amount',
            'invoice_id',
            'paths',
            'partial_payment',
            'no_direct_ripple',
            'direction',
            'state',
            'result',
            'ledger',
            'hash',
            'timestamp',
            'fee',
            'source_balance_changes',
            'destination_balance_changes'
          ]);
          done();
        }
      };
      var next = function(err){};

      payments.get($, req, res, next);

    });

    // TODO: add more tests for this
    it('should parse the source_balance_changes and destination_balance_changes correctly', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() // Considered connected
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback){
            callback(null, {
              "Account": "r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH",
              "Amount": {
                "currency": "USD",
                "issuer": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
                "value": "1"
              },
              "Destination": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
              "Fee": "10",
              "Flags": 0,
              "Paths": [
                [
                  {
                    "account": "r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV",
                    "currency": "USD",
                    "issuer": "r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV",
                    "type": 49,
                    "type_hex": "0000000000000031"
                  }
                ],
                [
                  {
                    "account": "rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x",
                    "currency": "USD",
                    "issuer": "rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x",
                    "type": 49,
                    "type_hex": "0000000000000031"
                  },
                  {
                    "account": "rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY",
                    "currency": "USD",
                    "issuer": "rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY",
                    "type": 49,
                    "type_hex": "0000000000000031"
                  },
                  {
                    "account": "r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV",
                    "currency": "USD",
                    "issuer": "r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV",
                    "type": 49,
                    "type_hex": "0000000000000031"
                  }
                ]
              ],
              "SendMax": {
                "currency": "USD",
                "issuer": "r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH",
                "value": "1.01"
              },
              "Sequence": 88,
              "SigningPubKey": "02EAE5DAB54DD8E1C49641D848D5B97D1B29149106174322EDF98A1B2CCE5D7F8E",
              "TransactionType": "Payment",
              "TxnSignature": "30440220791B6A3E036ECEFFE99E8D4957564E8C84D1548C8C3E80A87ED1AA646ECCFB16022037C5CAC97E34E3021EBB426479F2ACF3ACA75DB91DCC48D1BCFB4CF547CFEAA0",
              "hash": "E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7",
              "inLedger": 348734,
              "ledger_index": 348734,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH",
                        "Balance": "59328999119",
                        "Flags": 0,
                        "OwnerCount": 11,
                        "Sequence": 89
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "E0D7BDE68B468FF0B8D948FD865576517DA987569833A05374ADB9A72E870A06",
                      "PreviousFields": {
                        "Balance": "59328999129",
                        "Sequence": 88
                      },
                      "PreviousTxnID": "C26AA6B4F7C3B9F55E17CD0D11F12032A1C7AD2757229FFD277C9447A8815E6E",
                      "PreviousTxnLgrSeq": 348700
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Balance": {
                          "currency": "USD",
                          "issuer": "rrrrrrrrrrrrrrrrrrrrBZbvji",
                          "value": "-1"
                        },
                        "Flags": 131072,
                        "HighLimit": {
                          "currency": "USD",
                          "issuer": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
                          "value": "100"
                        },
                        "HighNode": "0000000000000000",
                        "LowLimit": {
                          "currency": "USD",
                          "issuer": "r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH",
                          "value": "0"
                        },
                        "LowNode": "0000000000000000"
                      },
                      "LedgerEntryType": "RippleState",
                      "LedgerIndex": "EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959",
                      "PreviousFields": {
                        "Balance": {
                          "currency": "USD",
                          "issuer": "rrrrrrrrrrrrrrrrrrrrBZbvji",
                          "value": "0"
                        }
                      },
                      "PreviousTxnID": "53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8",
                      "PreviousTxnLgrSeq": 343570
                    }
                  }
                ],
                "TransactionIndex": 0,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "accepted": true,
                "account_hash": "14140639C82776D045EF962B6D14D5099A94067AE34DEA0E26D9D5C628697903",
                "close_time": 416445410,
                "close_time_human": "2013-Mar-12 23:16:50",
                "close_time_resolution": 10,
                "closed": true,
                "hash": "195F62F34EB2CCFA4C5888BA20387E82EB353DDB4508BAE6A835AF19FB8B0C09",
                "ledger_hash": "195F62F34EB2CCFA4C5888BA20387E82EB353DDB4508BAE6A835AF19FB8B0C09",
                "ledger_index": "348734",
                "parent_hash": "C9E7A882E7B506F13657B3BEB2E2F7236A13A848DDA134986A8672C0CF3C7ABB",
                "seqNum": "348734",
                "totalCoins": "99999999999691710",
                "total_coins": "99999999999691710",
                "transaction_hash": "F8CFE8553BA1688FD606F96414BB8C7858472A08C7BB021D718F5961BB284B59"
              }
            });
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          identifier: '389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);
          expect(json_response.payment.source_balance_changes).to.deep.equal([{
            value: '-0.00001',
            currency: 'XRP',
            issuer: ''
          }, {
            value: '-1',
            currency: 'USD',
            issuer: 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH'
          }]);
          expect(json_response.payment.destination_balance_changes).to.deep.equal([{
            value: '1',
            currency: 'USD',
            issuer: 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH'
          }]);
          done();
        }
      };
      var next = function(err){};

      payments.get($, req, res, next);

    });

  });

  describe('.getAccountPayments()', function(){

    it('should respond with an error if the account is missing', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() // Considered connected
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        }
      };
      var req = {
        params: {},
        query: {}
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('account');
          done();
        }
      };
      var next = function(error){};

      payments.getAccountPayments($, req, res, next);

    });

    it('should respond with an error if the account is invalid', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() // Considered connected
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        }
      };
      var req = {
        params: {
          account: 'not a valid account'
        },
        query: {}
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('account');
          done();
        }
      };
      var next = function(error){};

      payments.getAccountPayments($, req, res, next);

    });

    it('should respond with an error if there is no connection to rippled', function(done){

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
        }
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59'
        },
        query: {}
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.message).to.contain('rippled');
          done();
        }
      };
      var next = function(error){};

      payments.getAccountPayments($, req, res, next);

    });

    it('should filter the results to include only payments', function(done){

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
          requestAccountTx: function(params, callback) {
            callback(null, JSON.parse('{"account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","ledger_index_max":6978623,"ledger_index_min":32570,"limit":10,"offset":0,"transactions":[{"meta":{"AffectedNodes":[{"CreatedNode":{"LedgerEntryType":"DirectoryNode","LedgerIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","NewFields":{"ExchangeRate":"4E11C37937E08000","RootIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"}}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999990","Flags":0,"OwnerCount":1,"Sequence":2},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10000000000","OwnerCount":0,"Sequence":1},"PreviousTxnID":"B24159F8552C355D35E43623F0E5AD965ADBF034D482421529E2703904E1EC09","PreviousTxnLgrSeq":16154}},{"CreatedNode":{"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","NewFields":{"ExchangeRate":"4E11C37937E08000","RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"}}},{"CreatedNode":{"LedgerEntryType":"Offer","LedgerIndex":"FDB2F7F93640D13069BF495097F971B7138ED69B2BFB9E28C8A3DEF592498651","NewFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","BookDirectory":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","Sequence":1,"TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"}}}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Sequence":1,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"},"TransactionType":"OfferCreate","TxnSignature":"3045022100A3A1E59ABC619E212AED87E8E72A44FF6F5FB9866668A89EE818FD93CE66C8FB02207A290146B1438D16CE77976602C1E32070974A010A27355D574DF61A5B19E002","date":411616880,"hash":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","inLedger":95405,"ledger_index":95405},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999980","Flags":0,"OwnerCount":2,"Sequence":3},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999990","OwnerCount":1,"Sequence":2},"PreviousTxnID":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","PreviousTxnLgrSeq":95405}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"718C6D58DD3BBAAAEBFE48B8FBE3C32C9F6F2EBC395233BA95D0057078EE07DB","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"LowLimit":{"currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","value":"0"}}}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","RootIndex":"77F65EFF930ED7E93C6CC839C421E394D6B1B6A47CEA8A140D63EC9C712F46F5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"77F65EFF930ED7E93C6CC839C421E394D6B1B6A47CEA8A140D63EC9C712F46F5"}},{"ModifiedNode":{"FinalFields":{"Account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","Balance":"78991384535796","Flags":0,"OwnerCount":3,"Sequence":188},"LedgerEntryType":"AccountRoot","LedgerIndex":"B33FDD5CF3445E1A7F2BE9B06336BEBD73A5E3EE885D3EF93F7E3E2992E46F1A","PreviousTxnID":"E9E1988A0F061679E5D14DE77DB0163CE0BBDC00F29E396FFD1DA0366E7D8904","PreviousTxnLgrSeq":195455}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","value":"100"},"Sequence":2,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"304402200EF81EC32E0DFA9BE376B20AFCA11765ED9FEA04CA8B77C7178DAA699F7F5AFF02202DA484DBD66521AC317D84F7717EC4614E2F5DB743E313E8B48440499CC0DBA4","date":413620090,"hash":"002AA492496A1543DBD3680BF8CF21B6D6A078CE4A01D2C1A4B63778033792CE","inLedger":195480,"ledger_index":195480},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999970","Flags":0,"OwnerCount":3,"Sequence":4},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999980","OwnerCount":2,"Sequence":3},"PreviousTxnID":"002AA492496A1543DBD3680BF8CF21B6D6A078CE4A01D2C1A4B63778033792CE","PreviousTxnLgrSeq":195480}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","RootIndex":"A39F044D860C5B5846AA7E0FAAD44DC8897F0A62B2F628AA073B21B3EC146010"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"A39F044D860C5B5846AA7E0FAAD44DC8897F0A62B2F628AA073B21B3EC146010"}},{"ModifiedNode":{"LedgerEntryType":"AccountRoot","LedgerIndex":"E0D7BDE68B468FF0B8D948FD865576517DA987569833A05374ADB9A72E870A06","PreviousTxnID":"0222B59280D165D40C464EA75AAD08A4D152C46A38C0625DEECF6EE87FC5B9E1","PreviousTxnLgrSeq":343555}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"}}}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"100"},"Sequence":3,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"3044022058A89552068D1A274EE72BA71363E33E54E6608BC28A84DEC6EE530FC2B5C979022029F4D1EA1237A1F717C5F5EC526E6CFB6DF54C30BADD25EDDE7D2FDBC8F17E34","date":416347560,"hash":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","inLedger":343570,"ledger_index":343570},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Balance":"59328999119","Flags":0,"OwnerCount":11,"Sequence":89},"LedgerEntryType":"AccountRoot","LedgerIndex":"E0D7BDE68B468FF0B8D948FD865576517DA987569833A05374ADB9A72E870A06","PreviousFields":{"Balance":"59328999129","Sequence":88},"PreviousTxnID":"C26AA6B4F7C3B9F55E17CD0D11F12032A1C7AD2757229FFD277C9447A8815E6E","PreviousTxnLgrSeq":348700}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-1"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"},"LowNode":"0000000000000000"},"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"}},"PreviousTxnID":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","PreviousTxnLgrSeq":343570}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Amount":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"},"Destination":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Paths":[[{"account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","type":49,"type_hex":"0000000000000031"}],[{"account":"rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x","currency":"USD","issuer":"rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x","type":49,"type_hex":"0000000000000031"},{"account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","currency":"USD","issuer":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","type":49,"type_hex":"0000000000000031"},{"account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","type":49,"type_hex":"0000000000000031"}]],"SendMax":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1.01"},"Sequence":88,"SigningPubKey":"02EAE5DAB54DD8E1C49641D848D5B97D1B29149106174322EDF98A1B2CCE5D7F8E","TransactionType":"Payment","TxnSignature":"30440220791B6A3E036ECEFFE99E8D4957564E8C84D1548C8C3E80A87ED1AA646ECCFB16022037C5CAC97E34E3021EBB426479F2ACF3ACA75DB91DCC48D1BCFB4CF547CFEAA0","date":416445410,"hash":"E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7","inLedger":348734,"ledger_index":348734},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","BookDirectory":"4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5E03E788E09BB000","BookNode":"0000000000000000","Flags":0,"OwnerNode":"0000000000000000","Sequence":58,"TakerGets":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"5.648998"},"TakerPays":"6208248802"},"LedgerEntryType":"Offer","LedgerIndex":"3CFB3C79D4F1BDB1EE5245259372576D926D9A875713422F7169A6CC60AFA68B","PreviousFields":{"TakerGets":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"5.65"},"TakerPays":"6209350000"},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-0.001"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"0000000000000002"},"LedgerEntryType":"RippleState","LedgerIndex":"4BD1874F8F3A60EDB0C23F5BD43E07953C2B8741B226648310D113DE2B486F01","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"}},"PreviousTxnID":"5B2006DAD0B3130F57ACF7CC5CCAC2EEBCD4B57AAA091A6FD0A24B073D08ABB8","PreviousTxnLgrSeq":343703}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9998898762","Flags":0,"OwnerCount":3,"Sequence":5},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999970","Sequence":4},"PreviousTxnID":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","PreviousTxnLgrSeq":343570}},{"ModifiedNode":{"FinalFields":{"Account":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","Balance":"912695302618","Flags":0,"OwnerCount":10,"Sequence":59},"LedgerEntryType":"AccountRoot","LedgerIndex":"F3E119AAA87AF3607CF87F5523BB8278A83BCB4142833288305D767DD30C392A","PreviousFields":{"Balance":"912694201420"},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-5.5541638883365"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","value":"1000"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000C"},"LedgerEntryType":"RippleState","LedgerIndex":"FA1255C2E0407F1945BCF9351257C7C5C28B0F5F09BB81C08D35A03E9F0136BC","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-5.5551658883365"}},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Amount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0.001"},"Destination":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Fee":"10","Flags":0,"Paths":[[{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","type":48,"type_hex":"0000000000000030"},{"account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","type":49,"type_hex":"0000000000000031"}]],"SendMax":"1112209","Sequence":4,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"Payment","TxnSignature":"304502204EE3E9D1B01D8959B08450FCA9E22025AF503DEF310E34A93863A85CAB3C0BC5022100B61F5B567F77026E8DEED89EED0B7CAF0E6C96C228A2A65216F0DC2D04D52083","date":416447810,"hash":"F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF","inLedger":348860,"ledger_index":348860},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9998898752","Flags":0,"OwnerCount":3,"Sequence":6},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9998898762","Sequence":5},"PreviousTxnID":"F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF","PreviousTxnLgrSeq":348860}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"},"LowNode":"0000000000000000"},"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-1"}},"PreviousTxnID":"E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7","PreviousTxnLgrSeq":348734}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Amount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1"},"Destination":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Fee":"10","Flags":0,"SendMax":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1.01"},"Sequence":5,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"Payment","TxnSignature":"3043021F020E98325F14580E2EC21D46F29A42A61CE1FBDCCE1A4AAA1EB98B0DF2A2FF022033AEB52BA4FBCCC138F0B1403D3F7E6AD18B104C43501C6C60A35DEC3A3A3865","date":416448130,"hash":"26A65B64446B5704EBE99BC8831ADBFD0B4B38953289C29047E1C6ACE4F43231","inLedger":348878,"ledger_index":348878},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898752","Flags":0,"OwnerCount":3,"Sequence":6},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9998898752"},"PreviousTxnID":"26A65B64446B5704EBE99BC8831ADBFD0B4B38953289C29047E1C6ACE4F43231","PreviousTxnLgrSeq":348878}},{"ModifiedNode":{"FinalFields":{"Account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","Balance":"66675028897760","Flags":0,"OwnerCount":30,"Sequence":225},"LedgerEntryType":"AccountRoot","LedgerIndex":"9B242A0D59328CE964FFFBFF7D3BBF8B024F9CB1A212923727B42F24ADC93930","PreviousFields":{"Balance":"66675228897770","Sequence":224},"PreviousTxnID":"C19F013CF5CC01CCB0253A571983F2B569A388DB6FA6C115AE7A8786513BBA98","PreviousTxnLgrSeq":348903}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","Amount":"200000000","Destination":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Sequence":224,"SigningPubKey":"02082622E4DA1DC6EA6B38A48956D816881E000ACF0C5F5B52863B9F698799D474","TransactionType":"Payment","TxnSignature":"3045022100C99FD5702C0A4827812C82B822A936E6ADF3B56BF8D9F4CF1DFF6DBA75D9CE6B0220232DB5AE5141A76F9D309D6118CADBC2761C1D3FE42E8A821E3434E59A4467C1","date":416448890,"hash":"F19FED29BDB5F3EA957925153A2F7E49F6C2EB86E05A26BAB984513679D01A13","inLedger":348917,"ledger_index":348917},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898742","Flags":0,"OwnerCount":4,"Sequence":7},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898752","OwnerCount":3,"Sequence":6},"PreviousTxnID":"F19FED29BDB5F3EA957925153A2F7E49F6C2EB86E05A26BAB984513679D01A13","PreviousTxnLgrSeq":348917}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","RootIndex":"7E1247F78EFC74FA9C0AE39F37AF433966615EB9B757D8397C068C2849A8F4A5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"7F41B7EAB2C3D1B37ACE8EA32841A11A565E6EF7FB37DA55F7EC4F5C2025FC41"}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"826CF5BFD28F3934B518D0BDF3231259CBD3FD0946E3C3CA0C97D2C75D2D1A09","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"200"},"LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000E"}}},{"ModifiedNode":{"FinalFields":{"Account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","Balance":"89999759275","Domain":"6269747374616D702E6E6574","EmailHash":"5B33B93C7FFE384D53450FC666BB11FB","Flags":131072,"OwnerCount":0,"Sequence":49,"TransferRate":1002000000},"LedgerEntryType":"AccountRoot","LedgerIndex":"B7D526FDDF9E3B3F95C3DC97C353065B0482302500BBB8051A5C090B596C6133","PreviousTxnID":"5646054641419C5B81E53A10E9A612BB07B74D8DE9267AC14880CF9A74E3476C","PreviousTxnLgrSeq":348786}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"200"},"Sequence":6,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"30450221008AB8644FFB22F1198BD2A3EDBE5FF828431F3521C9FAE87B89CE1EB135F107BF022041FBD8A063608CDBCBAC7DA3DB0986D29AF2BDAE03FA42B49AD44205FBC92282","date":416449280,"hash":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","inLedger":348937,"ledger_index":348937},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898732","Flags":0,"OwnerCount":5,"Sequence":8},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898742","OwnerCount":4,"Sequence":7},"PreviousTxnID":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","PreviousTxnLgrSeq":348937}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"767C12AF647CDF5FEB9019B37018748A79C50EDAF87E8D4C7F39F78AA7CA9765","NewFields":{"Balance":{"currency":"BTC","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"2"},"LowLimit":{"currency":"BTC","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000E"}}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","RootIndex":"7E1247F78EFC74FA9C0AE39F37AF433966615EB9B757D8397C068C2849A8F4A5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"7F41B7EAB2C3D1B37ACE8EA32841A11A565E6EF7FB37DA55F7EC4F5C2025FC41"}},{"ModifiedNode":{"FinalFields":{"Account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","Balance":"89999759275","Domain":"6269747374616D702E6E6574","EmailHash":"5B33B93C7FFE384D53450FC666BB11FB","Flags":131072,"OwnerCount":0,"Sequence":49,"TransferRate":1002000000},"LedgerEntryType":"AccountRoot","LedgerIndex":"B7D526FDDF9E3B3F95C3DC97C353065B0482302500BBB8051A5C090B596C6133","PreviousTxnID":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","PreviousTxnLgrSeq":348937}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"BTC","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"2"},"Sequence":7,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"3046022100A76CB4A0E9F1BA76526E2BEE3B7DFF21FC75DA58163F5323A082505F7AA88C48022100B80AC23EC9F1EF237FDB1F10C51AC898C89EA702FC82BCBA0F7B356024CEE345","date":416449330,"hash":"A1E5AAF3E07723DF73ABF2E244F131A35751D615BC3003E4A10197A6630AD270","inLedger":348941,"ledger_index":348941},"validated":true},{"meta":{"AffectedNodes":[{"DeletedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000"}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898722","Flags":0,"OwnerCount":4,"Sequence":9},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898732","OwnerCount":5,"Sequence":8},"PreviousTxnID":"A1E5AAF3E07723DF73ABF2E244F131A35751D615BC3003E4A10197A6630AD270","PreviousTxnLgrSeq":348941}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}},{"DeletedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","BookDirectory":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","BookNode":"0000000000000000","Flags":0,"OwnerNode":"0000000000000000","PreviousTxnID":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","PreviousTxnLgrSeq":95405,"Sequence":1,"TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"}},"LedgerEntryType":"Offer","LedgerIndex":"FDB2F7F93640D13069BF495097F971B7138ED69B2BFB9E28C8A3DEF592498651"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"OfferSequence":1,"Sequence":8,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"OfferCancel","TxnSignature":"304402207715B145DC919A600F8F03361CC77CF17B39FAAC293A0CEE8ED98B14B1D3AFAA02202B325218DBD52C2B6649AEEBB3EC564A483DA3E4BA93A0D73F58D5732B5F8214","date":416450400,"hash":"728C76EA082515D4C1FC55E4A367AAD3CA3D24210604EE56B7FA77AABDB72807","inLedger":349004,"ledger_index":349004},"validated":true}],"validated":true}'));
          }
        },
        dbinterface: {
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          },
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59'
        },
        query: {}
      };
      var res = {
        json: function(status_code, json_response) {
          expect(json_response.payments).to.have.length(4);
          _.each(json_response.payments, function(payment_entry){
            expect(payment_entry.payment).to.have.keys([
              'source_account',
              'source_tag',
              'source_amount',
              'source_slippage',
              'destination_account',
              'destination_tag',
              'destination_amount',
              'invoice_id',
              'paths',
              'partial_payment',
              'no_direct_ripple',
              'direction',
              'state',
              'result',
              'ledger',
              'hash',
              'timestamp',
              'fee',
              'source_balance_changes',
              'destination_balance_changes'
            ]);
          });
          done();
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };

      payments.getAccountPayments($, req, res, next);

    });

    it('should produce an array of objects that have a "client_resource_id" field and a "payment" field', function(done){

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
          requestAccountTx: function(params, callback) {
            callback(null, JSON.parse('{"account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","ledger_index_max":6978623,"ledger_index_min":32570,"limit":10,"offset":0,"transactions":[{"meta":{"AffectedNodes":[{"CreatedNode":{"LedgerEntryType":"DirectoryNode","LedgerIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","NewFields":{"ExchangeRate":"4E11C37937E08000","RootIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"}}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999990","Flags":0,"OwnerCount":1,"Sequence":2},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10000000000","OwnerCount":0,"Sequence":1},"PreviousTxnID":"B24159F8552C355D35E43623F0E5AD965ADBF034D482421529E2703904E1EC09","PreviousTxnLgrSeq":16154}},{"CreatedNode":{"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","NewFields":{"ExchangeRate":"4E11C37937E08000","RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"}}},{"CreatedNode":{"LedgerEntryType":"Offer","LedgerIndex":"FDB2F7F93640D13069BF495097F971B7138ED69B2BFB9E28C8A3DEF592498651","NewFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","BookDirectory":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","Sequence":1,"TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"}}}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Sequence":1,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"},"TransactionType":"OfferCreate","TxnSignature":"3045022100A3A1E59ABC619E212AED87E8E72A44FF6F5FB9866668A89EE818FD93CE66C8FB02207A290146B1438D16CE77976602C1E32070974A010A27355D574DF61A5B19E002","date":411616880,"hash":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","inLedger":95405,"ledger_index":95405},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999980","Flags":0,"OwnerCount":2,"Sequence":3},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999990","OwnerCount":1,"Sequence":2},"PreviousTxnID":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","PreviousTxnLgrSeq":95405}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"718C6D58DD3BBAAAEBFE48B8FBE3C32C9F6F2EBC395233BA95D0057078EE07DB","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"LowLimit":{"currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","value":"0"}}}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","RootIndex":"77F65EFF930ED7E93C6CC839C421E394D6B1B6A47CEA8A140D63EC9C712F46F5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"77F65EFF930ED7E93C6CC839C421E394D6B1B6A47CEA8A140D63EC9C712F46F5"}},{"ModifiedNode":{"FinalFields":{"Account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","Balance":"78991384535796","Flags":0,"OwnerCount":3,"Sequence":188},"LedgerEntryType":"AccountRoot","LedgerIndex":"B33FDD5CF3445E1A7F2BE9B06336BEBD73A5E3EE885D3EF93F7E3E2992E46F1A","PreviousTxnID":"E9E1988A0F061679E5D14DE77DB0163CE0BBDC00F29E396FFD1DA0366E7D8904","PreviousTxnLgrSeq":195455}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","value":"100"},"Sequence":2,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"304402200EF81EC32E0DFA9BE376B20AFCA11765ED9FEA04CA8B77C7178DAA699F7F5AFF02202DA484DBD66521AC317D84F7717EC4614E2F5DB743E313E8B48440499CC0DBA4","date":413620090,"hash":"002AA492496A1543DBD3680BF8CF21B6D6A078CE4A01D2C1A4B63778033792CE","inLedger":195480,"ledger_index":195480},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999970","Flags":0,"OwnerCount":3,"Sequence":4},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999980","OwnerCount":2,"Sequence":3},"PreviousTxnID":"002AA492496A1543DBD3680BF8CF21B6D6A078CE4A01D2C1A4B63778033792CE","PreviousTxnLgrSeq":195480}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","RootIndex":"A39F044D860C5B5846AA7E0FAAD44DC8897F0A62B2F628AA073B21B3EC146010"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"A39F044D860C5B5846AA7E0FAAD44DC8897F0A62B2F628AA073B21B3EC146010"}},{"ModifiedNode":{"LedgerEntryType":"AccountRoot","LedgerIndex":"E0D7BDE68B468FF0B8D948FD865576517DA987569833A05374ADB9A72E870A06","PreviousTxnID":"0222B59280D165D40C464EA75AAD08A4D152C46A38C0625DEECF6EE87FC5B9E1","PreviousTxnLgrSeq":343555}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"}}}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"100"},"Sequence":3,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"3044022058A89552068D1A274EE72BA71363E33E54E6608BC28A84DEC6EE530FC2B5C979022029F4D1EA1237A1F717C5F5EC526E6CFB6DF54C30BADD25EDDE7D2FDBC8F17E34","date":416347560,"hash":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","inLedger":343570,"ledger_index":343570},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Balance":"59328999119","Flags":0,"OwnerCount":11,"Sequence":89},"LedgerEntryType":"AccountRoot","LedgerIndex":"E0D7BDE68B468FF0B8D948FD865576517DA987569833A05374ADB9A72E870A06","PreviousFields":{"Balance":"59328999129","Sequence":88},"PreviousTxnID":"C26AA6B4F7C3B9F55E17CD0D11F12032A1C7AD2757229FFD277C9447A8815E6E","PreviousTxnLgrSeq":348700}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-1"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"},"LowNode":"0000000000000000"},"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"}},"PreviousTxnID":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","PreviousTxnLgrSeq":343570}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Amount":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"},"Destination":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Paths":[[{"account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","type":49,"type_hex":"0000000000000031"}],[{"account":"rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x","currency":"USD","issuer":"rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x","type":49,"type_hex":"0000000000000031"},{"account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","currency":"USD","issuer":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","type":49,"type_hex":"0000000000000031"},{"account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","type":49,"type_hex":"0000000000000031"}]],"SendMax":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1.01"},"Sequence":88,"SigningPubKey":"02EAE5DAB54DD8E1C49641D848D5B97D1B29149106174322EDF98A1B2CCE5D7F8E","TransactionType":"Payment","TxnSignature":"30440220791B6A3E036ECEFFE99E8D4957564E8C84D1548C8C3E80A87ED1AA646ECCFB16022037C5CAC97E34E3021EBB426479F2ACF3ACA75DB91DCC48D1BCFB4CF547CFEAA0","date":416445410,"hash":"E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7","inLedger":348734,"ledger_index":348734},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","BookDirectory":"4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5E03E788E09BB000","BookNode":"0000000000000000","Flags":0,"OwnerNode":"0000000000000000","Sequence":58,"TakerGets":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"5.648998"},"TakerPays":"6208248802"},"LedgerEntryType":"Offer","LedgerIndex":"3CFB3C79D4F1BDB1EE5245259372576D926D9A875713422F7169A6CC60AFA68B","PreviousFields":{"TakerGets":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"5.65"},"TakerPays":"6209350000"},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-0.001"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"0000000000000002"},"LedgerEntryType":"RippleState","LedgerIndex":"4BD1874F8F3A60EDB0C23F5BD43E07953C2B8741B226648310D113DE2B486F01","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"}},"PreviousTxnID":"5B2006DAD0B3130F57ACF7CC5CCAC2EEBCD4B57AAA091A6FD0A24B073D08ABB8","PreviousTxnLgrSeq":343703}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9998898762","Flags":0,"OwnerCount":3,"Sequence":5},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999970","Sequence":4},"PreviousTxnID":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","PreviousTxnLgrSeq":343570}},{"ModifiedNode":{"FinalFields":{"Account":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","Balance":"912695302618","Flags":0,"OwnerCount":10,"Sequence":59},"LedgerEntryType":"AccountRoot","LedgerIndex":"F3E119AAA87AF3607CF87F5523BB8278A83BCB4142833288305D767DD30C392A","PreviousFields":{"Balance":"912694201420"},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-5.5541638883365"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","value":"1000"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000C"},"LedgerEntryType":"RippleState","LedgerIndex":"FA1255C2E0407F1945BCF9351257C7C5C28B0F5F09BB81C08D35A03E9F0136BC","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-5.5551658883365"}},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Amount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0.001"},"Destination":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Fee":"10","Flags":0,"Paths":[[{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","type":48,"type_hex":"0000000000000030"},{"account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","type":49,"type_hex":"0000000000000031"}]],"SendMax":"1112209","Sequence":4,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"Payment","TxnSignature":"304502204EE3E9D1B01D8959B08450FCA9E22025AF503DEF310E34A93863A85CAB3C0BC5022100B61F5B567F77026E8DEED89EED0B7CAF0E6C96C228A2A65216F0DC2D04D52083","date":416447810,"hash":"F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF","inLedger":348860,"ledger_index":348860},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9998898752","Flags":0,"OwnerCount":3,"Sequence":6},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9998898762","Sequence":5},"PreviousTxnID":"F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF","PreviousTxnLgrSeq":348860}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"},"LowNode":"0000000000000000"},"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-1"}},"PreviousTxnID":"E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7","PreviousTxnLgrSeq":348734}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Amount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1"},"Destination":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Fee":"10","Flags":0,"SendMax":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1.01"},"Sequence":5,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"Payment","TxnSignature":"3043021F020E98325F14580E2EC21D46F29A42A61CE1FBDCCE1A4AAA1EB98B0DF2A2FF022033AEB52BA4FBCCC138F0B1403D3F7E6AD18B104C43501C6C60A35DEC3A3A3865","date":416448130,"hash":"26A65B64446B5704EBE99BC8831ADBFD0B4B38953289C29047E1C6ACE4F43231","inLedger":348878,"ledger_index":348878},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898752","Flags":0,"OwnerCount":3,"Sequence":6},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9998898752"},"PreviousTxnID":"26A65B64446B5704EBE99BC8831ADBFD0B4B38953289C29047E1C6ACE4F43231","PreviousTxnLgrSeq":348878}},{"ModifiedNode":{"FinalFields":{"Account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","Balance":"66675028897760","Flags":0,"OwnerCount":30,"Sequence":225},"LedgerEntryType":"AccountRoot","LedgerIndex":"9B242A0D59328CE964FFFBFF7D3BBF8B024F9CB1A212923727B42F24ADC93930","PreviousFields":{"Balance":"66675228897770","Sequence":224},"PreviousTxnID":"C19F013CF5CC01CCB0253A571983F2B569A388DB6FA6C115AE7A8786513BBA98","PreviousTxnLgrSeq":348903}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","Amount":"200000000","Destination":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Sequence":224,"SigningPubKey":"02082622E4DA1DC6EA6B38A48956D816881E000ACF0C5F5B52863B9F698799D474","TransactionType":"Payment","TxnSignature":"3045022100C99FD5702C0A4827812C82B822A936E6ADF3B56BF8D9F4CF1DFF6DBA75D9CE6B0220232DB5AE5141A76F9D309D6118CADBC2761C1D3FE42E8A821E3434E59A4467C1","date":416448890,"hash":"F19FED29BDB5F3EA957925153A2F7E49F6C2EB86E05A26BAB984513679D01A13","inLedger":348917,"ledger_index":348917},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898742","Flags":0,"OwnerCount":4,"Sequence":7},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898752","OwnerCount":3,"Sequence":6},"PreviousTxnID":"F19FED29BDB5F3EA957925153A2F7E49F6C2EB86E05A26BAB984513679D01A13","PreviousTxnLgrSeq":348917}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","RootIndex":"7E1247F78EFC74FA9C0AE39F37AF433966615EB9B757D8397C068C2849A8F4A5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"7F41B7EAB2C3D1B37ACE8EA32841A11A565E6EF7FB37DA55F7EC4F5C2025FC41"}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"826CF5BFD28F3934B518D0BDF3231259CBD3FD0946E3C3CA0C97D2C75D2D1A09","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"200"},"LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000E"}}},{"ModifiedNode":{"FinalFields":{"Account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","Balance":"89999759275","Domain":"6269747374616D702E6E6574","EmailHash":"5B33B93C7FFE384D53450FC666BB11FB","Flags":131072,"OwnerCount":0,"Sequence":49,"TransferRate":1002000000},"LedgerEntryType":"AccountRoot","LedgerIndex":"B7D526FDDF9E3B3F95C3DC97C353065B0482302500BBB8051A5C090B596C6133","PreviousTxnID":"5646054641419C5B81E53A10E9A612BB07B74D8DE9267AC14880CF9A74E3476C","PreviousTxnLgrSeq":348786}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"200"},"Sequence":6,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"30450221008AB8644FFB22F1198BD2A3EDBE5FF828431F3521C9FAE87B89CE1EB135F107BF022041FBD8A063608CDBCBAC7DA3DB0986D29AF2BDAE03FA42B49AD44205FBC92282","date":416449280,"hash":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","inLedger":348937,"ledger_index":348937},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898732","Flags":0,"OwnerCount":5,"Sequence":8},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898742","OwnerCount":4,"Sequence":7},"PreviousTxnID":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","PreviousTxnLgrSeq":348937}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"767C12AF647CDF5FEB9019B37018748A79C50EDAF87E8D4C7F39F78AA7CA9765","NewFields":{"Balance":{"currency":"BTC","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"2"},"LowLimit":{"currency":"BTC","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000E"}}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","RootIndex":"7E1247F78EFC74FA9C0AE39F37AF433966615EB9B757D8397C068C2849A8F4A5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"7F41B7EAB2C3D1B37ACE8EA32841A11A565E6EF7FB37DA55F7EC4F5C2025FC41"}},{"ModifiedNode":{"FinalFields":{"Account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","Balance":"89999759275","Domain":"6269747374616D702E6E6574","EmailHash":"5B33B93C7FFE384D53450FC666BB11FB","Flags":131072,"OwnerCount":0,"Sequence":49,"TransferRate":1002000000},"LedgerEntryType":"AccountRoot","LedgerIndex":"B7D526FDDF9E3B3F95C3DC97C353065B0482302500BBB8051A5C090B596C6133","PreviousTxnID":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","PreviousTxnLgrSeq":348937}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"BTC","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"2"},"Sequence":7,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"3046022100A76CB4A0E9F1BA76526E2BEE3B7DFF21FC75DA58163F5323A082505F7AA88C48022100B80AC23EC9F1EF237FDB1F10C51AC898C89EA702FC82BCBA0F7B356024CEE345","date":416449330,"hash":"A1E5AAF3E07723DF73ABF2E244F131A35751D615BC3003E4A10197A6630AD270","inLedger":348941,"ledger_index":348941},"validated":true},{"meta":{"AffectedNodes":[{"DeletedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000"}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898722","Flags":0,"OwnerCount":4,"Sequence":9},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898732","OwnerCount":5,"Sequence":8},"PreviousTxnID":"A1E5AAF3E07723DF73ABF2E244F131A35751D615BC3003E4A10197A6630AD270","PreviousTxnLgrSeq":348941}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}},{"DeletedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","BookDirectory":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","BookNode":"0000000000000000","Flags":0,"OwnerNode":"0000000000000000","PreviousTxnID":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","PreviousTxnLgrSeq":95405,"Sequence":1,"TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"}},"LedgerEntryType":"Offer","LedgerIndex":"FDB2F7F93640D13069BF495097F971B7138ED69B2BFB9E28C8A3DEF592498651"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"OfferSequence":1,"Sequence":8,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"OfferCancel","TxnSignature":"304402207715B145DC919A600F8F03361CC77CF17B39FAAC293A0CEE8ED98B14B1D3AFAA02202B325218DBD52C2B6649AEEBB3EC564A483DA3E4BA93A0D73F58D5732B5F8214","date":416450400,"hash":"728C76EA082515D4C1FC55E4A367AAD3CA3D24210604EE56B7FA77AABDB72807","inLedger":349004,"ledger_index":349004},"validated":true}],"validated":true}'));
          }
        },
        dbinterface: {
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          },
          getTransaction: function(params, callback) {
            if (params.hash === 'F19FED29BDB5F3EA957925153A2F7E49F6C2EB86E05A26BAB984513679D01A13') {
              callback(null, {
                client_resource_id: '0'
              });
            } else if (params.hash === '26A65B64446B5704EBE99BC8831ADBFD0B4B38953289C29047E1C6ACE4F43231') {
              callback(null, {
                client_resource_id: '1'
              });
            } else if (params.hash === 'F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF') {
              callback(null, {
                client_resource_id: '2'
              });
            } else if (params.hash === 'E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7') {
              callback(null, {
                client_resource_id: '3'
              });
            }
          }
        }
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59'
        },
        query: {}
      };
      var res = {
        json: function(status_code, json_response) {
          expect(json_response.payments).to.have.length(4);
          _.each(json_response.payments, function(payment_entry, index){

            // This is only true for the test payments
            expect(payment_entry.client_resource_id).to.equal('' + index);
            expect(payment_entry).to.have.keys([
              'client_resource_id',
              'payment'
            ]);
          });
          done();
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };

      payments.getAccountPayments($, req, res, next);

    });

    it('should filter the results based on source_account and destination_account, if specified', function(done){

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
          requestAccountTx: function(params, callback) {
            callback(null, JSON.parse('{"account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","ledger_index_max":6978623,"ledger_index_min":32570,"limit":10,"offset":0,"transactions":[{"meta":{"AffectedNodes":[{"CreatedNode":{"LedgerEntryType":"DirectoryNode","LedgerIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","NewFields":{"ExchangeRate":"4E11C37937E08000","RootIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"}}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999990","Flags":0,"OwnerCount":1,"Sequence":2},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10000000000","OwnerCount":0,"Sequence":1},"PreviousTxnID":"B24159F8552C355D35E43623F0E5AD965ADBF034D482421529E2703904E1EC09","PreviousTxnLgrSeq":16154}},{"CreatedNode":{"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","NewFields":{"ExchangeRate":"4E11C37937E08000","RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"}}},{"CreatedNode":{"LedgerEntryType":"Offer","LedgerIndex":"FDB2F7F93640D13069BF495097F971B7138ED69B2BFB9E28C8A3DEF592498651","NewFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","BookDirectory":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","Sequence":1,"TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"}}}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Sequence":1,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"},"TransactionType":"OfferCreate","TxnSignature":"3045022100A3A1E59ABC619E212AED87E8E72A44FF6F5FB9866668A89EE818FD93CE66C8FB02207A290146B1438D16CE77976602C1E32070974A010A27355D574DF61A5B19E002","date":411616880,"hash":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","inLedger":95405,"ledger_index":95405},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999980","Flags":0,"OwnerCount":2,"Sequence":3},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999990","OwnerCount":1,"Sequence":2},"PreviousTxnID":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","PreviousTxnLgrSeq":95405}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"718C6D58DD3BBAAAEBFE48B8FBE3C32C9F6F2EBC395233BA95D0057078EE07DB","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"LowLimit":{"currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","value":"0"}}}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","RootIndex":"77F65EFF930ED7E93C6CC839C421E394D6B1B6A47CEA8A140D63EC9C712F46F5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"77F65EFF930ED7E93C6CC839C421E394D6B1B6A47CEA8A140D63EC9C712F46F5"}},{"ModifiedNode":{"FinalFields":{"Account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","Balance":"78991384535796","Flags":0,"OwnerCount":3,"Sequence":188},"LedgerEntryType":"AccountRoot","LedgerIndex":"B33FDD5CF3445E1A7F2BE9B06336BEBD73A5E3EE885D3EF93F7E3E2992E46F1A","PreviousTxnID":"E9E1988A0F061679E5D14DE77DB0163CE0BBDC00F29E396FFD1DA0366E7D8904","PreviousTxnLgrSeq":195455}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","value":"100"},"Sequence":2,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"304402200EF81EC32E0DFA9BE376B20AFCA11765ED9FEA04CA8B77C7178DAA699F7F5AFF02202DA484DBD66521AC317D84F7717EC4614E2F5DB743E313E8B48440499CC0DBA4","date":413620090,"hash":"002AA492496A1543DBD3680BF8CF21B6D6A078CE4A01D2C1A4B63778033792CE","inLedger":195480,"ledger_index":195480},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999970","Flags":0,"OwnerCount":3,"Sequence":4},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999980","OwnerCount":2,"Sequence":3},"PreviousTxnID":"002AA492496A1543DBD3680BF8CF21B6D6A078CE4A01D2C1A4B63778033792CE","PreviousTxnLgrSeq":195480}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","RootIndex":"A39F044D860C5B5846AA7E0FAAD44DC8897F0A62B2F628AA073B21B3EC146010"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"A39F044D860C5B5846AA7E0FAAD44DC8897F0A62B2F628AA073B21B3EC146010"}},{"ModifiedNode":{"LedgerEntryType":"AccountRoot","LedgerIndex":"E0D7BDE68B468FF0B8D948FD865576517DA987569833A05374ADB9A72E870A06","PreviousTxnID":"0222B59280D165D40C464EA75AAD08A4D152C46A38C0625DEECF6EE87FC5B9E1","PreviousTxnLgrSeq":343555}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"}}}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"100"},"Sequence":3,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"3044022058A89552068D1A274EE72BA71363E33E54E6608BC28A84DEC6EE530FC2B5C979022029F4D1EA1237A1F717C5F5EC526E6CFB6DF54C30BADD25EDDE7D2FDBC8F17E34","date":416347560,"hash":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","inLedger":343570,"ledger_index":343570},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Balance":"59328999119","Flags":0,"OwnerCount":11,"Sequence":89},"LedgerEntryType":"AccountRoot","LedgerIndex":"E0D7BDE68B468FF0B8D948FD865576517DA987569833A05374ADB9A72E870A06","PreviousFields":{"Balance":"59328999129","Sequence":88},"PreviousTxnID":"C26AA6B4F7C3B9F55E17CD0D11F12032A1C7AD2757229FFD277C9447A8815E6E","PreviousTxnLgrSeq":348700}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-1"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"},"LowNode":"0000000000000000"},"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"}},"PreviousTxnID":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","PreviousTxnLgrSeq":343570}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Amount":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"},"Destination":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Paths":[[{"account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","type":49,"type_hex":"0000000000000031"}],[{"account":"rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x","currency":"USD","issuer":"rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x","type":49,"type_hex":"0000000000000031"},{"account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","currency":"USD","issuer":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","type":49,"type_hex":"0000000000000031"},{"account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","type":49,"type_hex":"0000000000000031"}]],"SendMax":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1.01"},"Sequence":88,"SigningPubKey":"02EAE5DAB54DD8E1C49641D848D5B97D1B29149106174322EDF98A1B2CCE5D7F8E","TransactionType":"Payment","TxnSignature":"30440220791B6A3E036ECEFFE99E8D4957564E8C84D1548C8C3E80A87ED1AA646ECCFB16022037C5CAC97E34E3021EBB426479F2ACF3ACA75DB91DCC48D1BCFB4CF547CFEAA0","date":416445410,"hash":"E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7","inLedger":348734,"ledger_index":348734},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","BookDirectory":"4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5E03E788E09BB000","BookNode":"0000000000000000","Flags":0,"OwnerNode":"0000000000000000","Sequence":58,"TakerGets":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"5.648998"},"TakerPays":"6208248802"},"LedgerEntryType":"Offer","LedgerIndex":"3CFB3C79D4F1BDB1EE5245259372576D926D9A875713422F7169A6CC60AFA68B","PreviousFields":{"TakerGets":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"5.65"},"TakerPays":"6209350000"},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-0.001"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"0000000000000002"},"LedgerEntryType":"RippleState","LedgerIndex":"4BD1874F8F3A60EDB0C23F5BD43E07953C2B8741B226648310D113DE2B486F01","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"}},"PreviousTxnID":"5B2006DAD0B3130F57ACF7CC5CCAC2EEBCD4B57AAA091A6FD0A24B073D08ABB8","PreviousTxnLgrSeq":343703}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9998898762","Flags":0,"OwnerCount":3,"Sequence":5},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999970","Sequence":4},"PreviousTxnID":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","PreviousTxnLgrSeq":343570}},{"ModifiedNode":{"FinalFields":{"Account":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","Balance":"912695302618","Flags":0,"OwnerCount":10,"Sequence":59},"LedgerEntryType":"AccountRoot","LedgerIndex":"F3E119AAA87AF3607CF87F5523BB8278A83BCB4142833288305D767DD30C392A","PreviousFields":{"Balance":"912694201420"},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-5.5541638883365"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","value":"1000"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000C"},"LedgerEntryType":"RippleState","LedgerIndex":"FA1255C2E0407F1945BCF9351257C7C5C28B0F5F09BB81C08D35A03E9F0136BC","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-5.5551658883365"}},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Amount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0.001"},"Destination":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Fee":"10","Flags":0,"Paths":[[{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","type":48,"type_hex":"0000000000000030"},{"account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","type":49,"type_hex":"0000000000000031"}]],"SendMax":"1112209","Sequence":4,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"Payment","TxnSignature":"304502204EE3E9D1B01D8959B08450FCA9E22025AF503DEF310E34A93863A85CAB3C0BC5022100B61F5B567F77026E8DEED89EED0B7CAF0E6C96C228A2A65216F0DC2D04D52083","date":416447810,"hash":"F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF","inLedger":348860,"ledger_index":348860},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9998898752","Flags":0,"OwnerCount":3,"Sequence":6},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9998898762","Sequence":5},"PreviousTxnID":"F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF","PreviousTxnLgrSeq":348860}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"},"LowNode":"0000000000000000"},"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-1"}},"PreviousTxnID":"E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7","PreviousTxnLgrSeq":348734}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Amount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1"},"Destination":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Fee":"10","Flags":0,"SendMax":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1.01"},"Sequence":5,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"Payment","TxnSignature":"3043021F020E98325F14580E2EC21D46F29A42A61CE1FBDCCE1A4AAA1EB98B0DF2A2FF022033AEB52BA4FBCCC138F0B1403D3F7E6AD18B104C43501C6C60A35DEC3A3A3865","date":416448130,"hash":"26A65B64446B5704EBE99BC8831ADBFD0B4B38953289C29047E1C6ACE4F43231","inLedger":348878,"ledger_index":348878},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898752","Flags":0,"OwnerCount":3,"Sequence":6},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9998898752"},"PreviousTxnID":"26A65B64446B5704EBE99BC8831ADBFD0B4B38953289C29047E1C6ACE4F43231","PreviousTxnLgrSeq":348878}},{"ModifiedNode":{"FinalFields":{"Account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","Balance":"66675028897760","Flags":0,"OwnerCount":30,"Sequence":225},"LedgerEntryType":"AccountRoot","LedgerIndex":"9B242A0D59328CE964FFFBFF7D3BBF8B024F9CB1A212923727B42F24ADC93930","PreviousFields":{"Balance":"66675228897770","Sequence":224},"PreviousTxnID":"C19F013CF5CC01CCB0253A571983F2B569A388DB6FA6C115AE7A8786513BBA98","PreviousTxnLgrSeq":348903}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","Amount":"200000000","Destination":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Sequence":224,"SigningPubKey":"02082622E4DA1DC6EA6B38A48956D816881E000ACF0C5F5B52863B9F698799D474","TransactionType":"Payment","TxnSignature":"3045022100C99FD5702C0A4827812C82B822A936E6ADF3B56BF8D9F4CF1DFF6DBA75D9CE6B0220232DB5AE5141A76F9D309D6118CADBC2761C1D3FE42E8A821E3434E59A4467C1","date":416448890,"hash":"F19FED29BDB5F3EA957925153A2F7E49F6C2EB86E05A26BAB984513679D01A13","inLedger":348917,"ledger_index":348917},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898742","Flags":0,"OwnerCount":4,"Sequence":7},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898752","OwnerCount":3,"Sequence":6},"PreviousTxnID":"F19FED29BDB5F3EA957925153A2F7E49F6C2EB86E05A26BAB984513679D01A13","PreviousTxnLgrSeq":348917}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","RootIndex":"7E1247F78EFC74FA9C0AE39F37AF433966615EB9B757D8397C068C2849A8F4A5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"7F41B7EAB2C3D1B37ACE8EA32841A11A565E6EF7FB37DA55F7EC4F5C2025FC41"}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"826CF5BFD28F3934B518D0BDF3231259CBD3FD0946E3C3CA0C97D2C75D2D1A09","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"200"},"LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000E"}}},{"ModifiedNode":{"FinalFields":{"Account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","Balance":"89999759275","Domain":"6269747374616D702E6E6574","EmailHash":"5B33B93C7FFE384D53450FC666BB11FB","Flags":131072,"OwnerCount":0,"Sequence":49,"TransferRate":1002000000},"LedgerEntryType":"AccountRoot","LedgerIndex":"B7D526FDDF9E3B3F95C3DC97C353065B0482302500BBB8051A5C090B596C6133","PreviousTxnID":"5646054641419C5B81E53A10E9A612BB07B74D8DE9267AC14880CF9A74E3476C","PreviousTxnLgrSeq":348786}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"200"},"Sequence":6,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"30450221008AB8644FFB22F1198BD2A3EDBE5FF828431F3521C9FAE87B89CE1EB135F107BF022041FBD8A063608CDBCBAC7DA3DB0986D29AF2BDAE03FA42B49AD44205FBC92282","date":416449280,"hash":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","inLedger":348937,"ledger_index":348937},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898732","Flags":0,"OwnerCount":5,"Sequence":8},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898742","OwnerCount":4,"Sequence":7},"PreviousTxnID":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","PreviousTxnLgrSeq":348937}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"767C12AF647CDF5FEB9019B37018748A79C50EDAF87E8D4C7F39F78AA7CA9765","NewFields":{"Balance":{"currency":"BTC","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"2"},"LowLimit":{"currency":"BTC","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000E"}}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","RootIndex":"7E1247F78EFC74FA9C0AE39F37AF433966615EB9B757D8397C068C2849A8F4A5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"7F41B7EAB2C3D1B37ACE8EA32841A11A565E6EF7FB37DA55F7EC4F5C2025FC41"}},{"ModifiedNode":{"FinalFields":{"Account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","Balance":"89999759275","Domain":"6269747374616D702E6E6574","EmailHash":"5B33B93C7FFE384D53450FC666BB11FB","Flags":131072,"OwnerCount":0,"Sequence":49,"TransferRate":1002000000},"LedgerEntryType":"AccountRoot","LedgerIndex":"B7D526FDDF9E3B3F95C3DC97C353065B0482302500BBB8051A5C090B596C6133","PreviousTxnID":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","PreviousTxnLgrSeq":348937}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"BTC","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"2"},"Sequence":7,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"3046022100A76CB4A0E9F1BA76526E2BEE3B7DFF21FC75DA58163F5323A082505F7AA88C48022100B80AC23EC9F1EF237FDB1F10C51AC898C89EA702FC82BCBA0F7B356024CEE345","date":416449330,"hash":"A1E5AAF3E07723DF73ABF2E244F131A35751D615BC3003E4A10197A6630AD270","inLedger":348941,"ledger_index":348941},"validated":true},{"meta":{"AffectedNodes":[{"DeletedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000"}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898722","Flags":0,"OwnerCount":4,"Sequence":9},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898732","OwnerCount":5,"Sequence":8},"PreviousTxnID":"A1E5AAF3E07723DF73ABF2E244F131A35751D615BC3003E4A10197A6630AD270","PreviousTxnLgrSeq":348941}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}},{"DeletedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","BookDirectory":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","BookNode":"0000000000000000","Flags":0,"OwnerNode":"0000000000000000","PreviousTxnID":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","PreviousTxnLgrSeq":95405,"Sequence":1,"TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"}},"LedgerEntryType":"Offer","LedgerIndex":"FDB2F7F93640D13069BF495097F971B7138ED69B2BFB9E28C8A3DEF592498651"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"OfferSequence":1,"Sequence":8,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"OfferCancel","TxnSignature":"304402207715B145DC919A600F8F03361CC77CF17B39FAAC293A0CEE8ED98B14B1D3AFAA02202B325218DBD52C2B6649AEEBB3EC564A483DA3E4BA93A0D73F58D5732B5F8214","date":416450400,"hash":"728C76EA082515D4C1FC55E4A367AAD3CA3D24210604EE56B7FA77AABDB72807","inLedger":349004,"ledger_index":349004},"validated":true}],"validated":true}'));
          }
        },
        dbinterface: {
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          },
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59'
        },
        query: {
          source_account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(json_response.payments).to.have.length(2);
          _.each(json_response.payments, function(payment_entry){
            expect(payment_entry.payment.source_account).to.equal('r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59');
            expect(payment_entry.payment.destination_account).to.equal('r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH');
          });
          done();
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };

      payments.getAccountPayments($, req, res, next);

    });

    it('should filter the results based on the direction, if specified', function(done){

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
          requestAccountTx: function(params, callback) {
            callback(null, JSON.parse('{"account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","ledger_index_max":6978623,"ledger_index_min":32570,"limit":10,"offset":0,"transactions":[{"meta":{"AffectedNodes":[{"CreatedNode":{"LedgerEntryType":"DirectoryNode","LedgerIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","NewFields":{"ExchangeRate":"4E11C37937E08000","RootIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"}}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999990","Flags":0,"OwnerCount":1,"Sequence":2},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10000000000","OwnerCount":0,"Sequence":1},"PreviousTxnID":"B24159F8552C355D35E43623F0E5AD965ADBF034D482421529E2703904E1EC09","PreviousTxnLgrSeq":16154}},{"CreatedNode":{"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","NewFields":{"ExchangeRate":"4E11C37937E08000","RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"}}},{"CreatedNode":{"LedgerEntryType":"Offer","LedgerIndex":"FDB2F7F93640D13069BF495097F971B7138ED69B2BFB9E28C8A3DEF592498651","NewFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","BookDirectory":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","Sequence":1,"TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"}}}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Sequence":1,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"},"TransactionType":"OfferCreate","TxnSignature":"3045022100A3A1E59ABC619E212AED87E8E72A44FF6F5FB9866668A89EE818FD93CE66C8FB02207A290146B1438D16CE77976602C1E32070974A010A27355D574DF61A5B19E002","date":411616880,"hash":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","inLedger":95405,"ledger_index":95405},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999980","Flags":0,"OwnerCount":2,"Sequence":3},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999990","OwnerCount":1,"Sequence":2},"PreviousTxnID":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","PreviousTxnLgrSeq":95405}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"718C6D58DD3BBAAAEBFE48B8FBE3C32C9F6F2EBC395233BA95D0057078EE07DB","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"LowLimit":{"currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","value":"0"}}}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","RootIndex":"77F65EFF930ED7E93C6CC839C421E394D6B1B6A47CEA8A140D63EC9C712F46F5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"77F65EFF930ED7E93C6CC839C421E394D6B1B6A47CEA8A140D63EC9C712F46F5"}},{"ModifiedNode":{"FinalFields":{"Account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","Balance":"78991384535796","Flags":0,"OwnerCount":3,"Sequence":188},"LedgerEntryType":"AccountRoot","LedgerIndex":"B33FDD5CF3445E1A7F2BE9B06336BEBD73A5E3EE885D3EF93F7E3E2992E46F1A","PreviousTxnID":"E9E1988A0F061679E5D14DE77DB0163CE0BBDC00F29E396FFD1DA0366E7D8904","PreviousTxnLgrSeq":195455}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","value":"100"},"Sequence":2,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"304402200EF81EC32E0DFA9BE376B20AFCA11765ED9FEA04CA8B77C7178DAA699F7F5AFF02202DA484DBD66521AC317D84F7717EC4614E2F5DB743E313E8B48440499CC0DBA4","date":413620090,"hash":"002AA492496A1543DBD3680BF8CF21B6D6A078CE4A01D2C1A4B63778033792CE","inLedger":195480,"ledger_index":195480},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999970","Flags":0,"OwnerCount":3,"Sequence":4},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999980","OwnerCount":2,"Sequence":3},"PreviousTxnID":"002AA492496A1543DBD3680BF8CF21B6D6A078CE4A01D2C1A4B63778033792CE","PreviousTxnLgrSeq":195480}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","RootIndex":"A39F044D860C5B5846AA7E0FAAD44DC8897F0A62B2F628AA073B21B3EC146010"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"A39F044D860C5B5846AA7E0FAAD44DC8897F0A62B2F628AA073B21B3EC146010"}},{"ModifiedNode":{"LedgerEntryType":"AccountRoot","LedgerIndex":"E0D7BDE68B468FF0B8D948FD865576517DA987569833A05374ADB9A72E870A06","PreviousTxnID":"0222B59280D165D40C464EA75AAD08A4D152C46A38C0625DEECF6EE87FC5B9E1","PreviousTxnLgrSeq":343555}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"}}}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"100"},"Sequence":3,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"3044022058A89552068D1A274EE72BA71363E33E54E6608BC28A84DEC6EE530FC2B5C979022029F4D1EA1237A1F717C5F5EC526E6CFB6DF54C30BADD25EDDE7D2FDBC8F17E34","date":416347560,"hash":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","inLedger":343570,"ledger_index":343570},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Balance":"59328999119","Flags":0,"OwnerCount":11,"Sequence":89},"LedgerEntryType":"AccountRoot","LedgerIndex":"E0D7BDE68B468FF0B8D948FD865576517DA987569833A05374ADB9A72E870A06","PreviousFields":{"Balance":"59328999129","Sequence":88},"PreviousTxnID":"C26AA6B4F7C3B9F55E17CD0D11F12032A1C7AD2757229FFD277C9447A8815E6E","PreviousTxnLgrSeq":348700}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-1"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"},"LowNode":"0000000000000000"},"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"}},"PreviousTxnID":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","PreviousTxnLgrSeq":343570}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Amount":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"},"Destination":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Paths":[[{"account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","type":49,"type_hex":"0000000000000031"}],[{"account":"rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x","currency":"USD","issuer":"rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x","type":49,"type_hex":"0000000000000031"},{"account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","currency":"USD","issuer":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","type":49,"type_hex":"0000000000000031"},{"account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","type":49,"type_hex":"0000000000000031"}]],"SendMax":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1.01"},"Sequence":88,"SigningPubKey":"02EAE5DAB54DD8E1C49641D848D5B97D1B29149106174322EDF98A1B2CCE5D7F8E","TransactionType":"Payment","TxnSignature":"30440220791B6A3E036ECEFFE99E8D4957564E8C84D1548C8C3E80A87ED1AA646ECCFB16022037C5CAC97E34E3021EBB426479F2ACF3ACA75DB91DCC48D1BCFB4CF547CFEAA0","date":416445410,"hash":"E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7","inLedger":348734,"ledger_index":348734},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","BookDirectory":"4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5E03E788E09BB000","BookNode":"0000000000000000","Flags":0,"OwnerNode":"0000000000000000","Sequence":58,"TakerGets":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"5.648998"},"TakerPays":"6208248802"},"LedgerEntryType":"Offer","LedgerIndex":"3CFB3C79D4F1BDB1EE5245259372576D926D9A875713422F7169A6CC60AFA68B","PreviousFields":{"TakerGets":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"5.65"},"TakerPays":"6209350000"},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-0.001"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"0000000000000002"},"LedgerEntryType":"RippleState","LedgerIndex":"4BD1874F8F3A60EDB0C23F5BD43E07953C2B8741B226648310D113DE2B486F01","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"}},"PreviousTxnID":"5B2006DAD0B3130F57ACF7CC5CCAC2EEBCD4B57AAA091A6FD0A24B073D08ABB8","PreviousTxnLgrSeq":343703}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9998898762","Flags":0,"OwnerCount":3,"Sequence":5},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999970","Sequence":4},"PreviousTxnID":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","PreviousTxnLgrSeq":343570}},{"ModifiedNode":{"FinalFields":{"Account":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","Balance":"912695302618","Flags":0,"OwnerCount":10,"Sequence":59},"LedgerEntryType":"AccountRoot","LedgerIndex":"F3E119AAA87AF3607CF87F5523BB8278A83BCB4142833288305D767DD30C392A","PreviousFields":{"Balance":"912694201420"},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-5.5541638883365"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","value":"1000"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000C"},"LedgerEntryType":"RippleState","LedgerIndex":"FA1255C2E0407F1945BCF9351257C7C5C28B0F5F09BB81C08D35A03E9F0136BC","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-5.5551658883365"}},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Amount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0.001"},"Destination":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Fee":"10","Flags":0,"Paths":[[{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","type":48,"type_hex":"0000000000000030"},{"account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","type":49,"type_hex":"0000000000000031"}]],"SendMax":"1112209","Sequence":4,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"Payment","TxnSignature":"304502204EE3E9D1B01D8959B08450FCA9E22025AF503DEF310E34A93863A85CAB3C0BC5022100B61F5B567F77026E8DEED89EED0B7CAF0E6C96C228A2A65216F0DC2D04D52083","date":416447810,"hash":"F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF","inLedger":348860,"ledger_index":348860},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9998898752","Flags":0,"OwnerCount":3,"Sequence":6},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9998898762","Sequence":5},"PreviousTxnID":"F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF","PreviousTxnLgrSeq":348860}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"},"LowNode":"0000000000000000"},"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-1"}},"PreviousTxnID":"E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7","PreviousTxnLgrSeq":348734}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Amount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1"},"Destination":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Fee":"10","Flags":0,"SendMax":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1.01"},"Sequence":5,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"Payment","TxnSignature":"3043021F020E98325F14580E2EC21D46F29A42A61CE1FBDCCE1A4AAA1EB98B0DF2A2FF022033AEB52BA4FBCCC138F0B1403D3F7E6AD18B104C43501C6C60A35DEC3A3A3865","date":416448130,"hash":"26A65B64446B5704EBE99BC8831ADBFD0B4B38953289C29047E1C6ACE4F43231","inLedger":348878,"ledger_index":348878},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898752","Flags":0,"OwnerCount":3,"Sequence":6},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9998898752"},"PreviousTxnID":"26A65B64446B5704EBE99BC8831ADBFD0B4B38953289C29047E1C6ACE4F43231","PreviousTxnLgrSeq":348878}},{"ModifiedNode":{"FinalFields":{"Account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","Balance":"66675028897760","Flags":0,"OwnerCount":30,"Sequence":225},"LedgerEntryType":"AccountRoot","LedgerIndex":"9B242A0D59328CE964FFFBFF7D3BBF8B024F9CB1A212923727B42F24ADC93930","PreviousFields":{"Balance":"66675228897770","Sequence":224},"PreviousTxnID":"C19F013CF5CC01CCB0253A571983F2B569A388DB6FA6C115AE7A8786513BBA98","PreviousTxnLgrSeq":348903}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","Amount":"200000000","Destination":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Sequence":224,"SigningPubKey":"02082622E4DA1DC6EA6B38A48956D816881E000ACF0C5F5B52863B9F698799D474","TransactionType":"Payment","TxnSignature":"3045022100C99FD5702C0A4827812C82B822A936E6ADF3B56BF8D9F4CF1DFF6DBA75D9CE6B0220232DB5AE5141A76F9D309D6118CADBC2761C1D3FE42E8A821E3434E59A4467C1","date":416448890,"hash":"F19FED29BDB5F3EA957925153A2F7E49F6C2EB86E05A26BAB984513679D01A13","inLedger":348917,"ledger_index":348917},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898742","Flags":0,"OwnerCount":4,"Sequence":7},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898752","OwnerCount":3,"Sequence":6},"PreviousTxnID":"F19FED29BDB5F3EA957925153A2F7E49F6C2EB86E05A26BAB984513679D01A13","PreviousTxnLgrSeq":348917}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","RootIndex":"7E1247F78EFC74FA9C0AE39F37AF433966615EB9B757D8397C068C2849A8F4A5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"7F41B7EAB2C3D1B37ACE8EA32841A11A565E6EF7FB37DA55F7EC4F5C2025FC41"}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"826CF5BFD28F3934B518D0BDF3231259CBD3FD0946E3C3CA0C97D2C75D2D1A09","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"200"},"LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000E"}}},{"ModifiedNode":{"FinalFields":{"Account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","Balance":"89999759275","Domain":"6269747374616D702E6E6574","EmailHash":"5B33B93C7FFE384D53450FC666BB11FB","Flags":131072,"OwnerCount":0,"Sequence":49,"TransferRate":1002000000},"LedgerEntryType":"AccountRoot","LedgerIndex":"B7D526FDDF9E3B3F95C3DC97C353065B0482302500BBB8051A5C090B596C6133","PreviousTxnID":"5646054641419C5B81E53A10E9A612BB07B74D8DE9267AC14880CF9A74E3476C","PreviousTxnLgrSeq":348786}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"200"},"Sequence":6,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"30450221008AB8644FFB22F1198BD2A3EDBE5FF828431F3521C9FAE87B89CE1EB135F107BF022041FBD8A063608CDBCBAC7DA3DB0986D29AF2BDAE03FA42B49AD44205FBC92282","date":416449280,"hash":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","inLedger":348937,"ledger_index":348937},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898732","Flags":0,"OwnerCount":5,"Sequence":8},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898742","OwnerCount":4,"Sequence":7},"PreviousTxnID":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","PreviousTxnLgrSeq":348937}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"767C12AF647CDF5FEB9019B37018748A79C50EDAF87E8D4C7F39F78AA7CA9765","NewFields":{"Balance":{"currency":"BTC","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"2"},"LowLimit":{"currency":"BTC","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000E"}}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","RootIndex":"7E1247F78EFC74FA9C0AE39F37AF433966615EB9B757D8397C068C2849A8F4A5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"7F41B7EAB2C3D1B37ACE8EA32841A11A565E6EF7FB37DA55F7EC4F5C2025FC41"}},{"ModifiedNode":{"FinalFields":{"Account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","Balance":"89999759275","Domain":"6269747374616D702E6E6574","EmailHash":"5B33B93C7FFE384D53450FC666BB11FB","Flags":131072,"OwnerCount":0,"Sequence":49,"TransferRate":1002000000},"LedgerEntryType":"AccountRoot","LedgerIndex":"B7D526FDDF9E3B3F95C3DC97C353065B0482302500BBB8051A5C090B596C6133","PreviousTxnID":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","PreviousTxnLgrSeq":348937}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"BTC","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"2"},"Sequence":7,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"3046022100A76CB4A0E9F1BA76526E2BEE3B7DFF21FC75DA58163F5323A082505F7AA88C48022100B80AC23EC9F1EF237FDB1F10C51AC898C89EA702FC82BCBA0F7B356024CEE345","date":416449330,"hash":"A1E5AAF3E07723DF73ABF2E244F131A35751D615BC3003E4A10197A6630AD270","inLedger":348941,"ledger_index":348941},"validated":true},{"meta":{"AffectedNodes":[{"DeletedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000"}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898722","Flags":0,"OwnerCount":4,"Sequence":9},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898732","OwnerCount":5,"Sequence":8},"PreviousTxnID":"A1E5AAF3E07723DF73ABF2E244F131A35751D615BC3003E4A10197A6630AD270","PreviousTxnLgrSeq":348941}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}},{"DeletedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","BookDirectory":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","BookNode":"0000000000000000","Flags":0,"OwnerNode":"0000000000000000","PreviousTxnID":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","PreviousTxnLgrSeq":95405,"Sequence":1,"TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"}},"LedgerEntryType":"Offer","LedgerIndex":"FDB2F7F93640D13069BF495097F971B7138ED69B2BFB9E28C8A3DEF592498651"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"OfferSequence":1,"Sequence":8,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"OfferCancel","TxnSignature":"304402207715B145DC919A600F8F03361CC77CF17B39FAAC293A0CEE8ED98B14B1D3AFAA02202B325218DBD52C2B6649AEEBB3EC564A483DA3E4BA93A0D73F58D5732B5F8214","date":416450400,"hash":"728C76EA082515D4C1FC55E4A367AAD3CA3D24210604EE56B7FA77AABDB72807","inLedger":349004,"ledger_index":349004},"validated":true}],"validated":true}'));
          }
        },
        dbinterface: {
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          },
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59'
        },
        query: {
          direction: 'incoming'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(json_response.payments).to.have.length(2);
          _.each(json_response.payments, function(payment_entry){
            expect(payment_entry.payment.destination_account).to.equal('r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59');
            expect(payment_entry.payment.direction).to.equal('incoming');
          });
          done();
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };

      payments.getAccountPayments($, req, res, next);

    });

    it('should filter the results based on state (validated / failed), if specified', function(done){

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
          requestAccountTx: function(params, callback) {
            callback(null, JSON.parse('{"account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","ledger_index_max":6978623,"ledger_index_min":32570,"limit":10,"offset":0,"transactions":[{"meta":{"AffectedNodes":[{"CreatedNode":{"LedgerEntryType":"DirectoryNode","LedgerIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","NewFields":{"ExchangeRate":"4E11C37937E08000","RootIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"}}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999990","Flags":0,"OwnerCount":1,"Sequence":2},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10000000000","OwnerCount":0,"Sequence":1},"PreviousTxnID":"B24159F8552C355D35E43623F0E5AD965ADBF034D482421529E2703904E1EC09","PreviousTxnLgrSeq":16154}},{"CreatedNode":{"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","NewFields":{"ExchangeRate":"4E11C37937E08000","RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"}}},{"CreatedNode":{"LedgerEntryType":"Offer","LedgerIndex":"FDB2F7F93640D13069BF495097F971B7138ED69B2BFB9E28C8A3DEF592498651","NewFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","BookDirectory":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","Sequence":1,"TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"}}}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Sequence":1,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"},"TransactionType":"OfferCreate","TxnSignature":"3045022100A3A1E59ABC619E212AED87E8E72A44FF6F5FB9866668A89EE818FD93CE66C8FB02207A290146B1438D16CE77976602C1E32070974A010A27355D574DF61A5B19E002","date":411616880,"hash":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","inLedger":95405,"ledger_index":95405},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999980","Flags":0,"OwnerCount":2,"Sequence":3},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999990","OwnerCount":1,"Sequence":2},"PreviousTxnID":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","PreviousTxnLgrSeq":95405}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"718C6D58DD3BBAAAEBFE48B8FBE3C32C9F6F2EBC395233BA95D0057078EE07DB","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"LowLimit":{"currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","value":"0"}}}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","RootIndex":"77F65EFF930ED7E93C6CC839C421E394D6B1B6A47CEA8A140D63EC9C712F46F5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"77F65EFF930ED7E93C6CC839C421E394D6B1B6A47CEA8A140D63EC9C712F46F5"}},{"ModifiedNode":{"FinalFields":{"Account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","Balance":"78991384535796","Flags":0,"OwnerCount":3,"Sequence":188},"LedgerEntryType":"AccountRoot","LedgerIndex":"B33FDD5CF3445E1A7F2BE9B06336BEBD73A5E3EE885D3EF93F7E3E2992E46F1A","PreviousTxnID":"E9E1988A0F061679E5D14DE77DB0163CE0BBDC00F29E396FFD1DA0366E7D8904","PreviousTxnLgrSeq":195455}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","value":"100"},"Sequence":2,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"304402200EF81EC32E0DFA9BE376B20AFCA11765ED9FEA04CA8B77C7178DAA699F7F5AFF02202DA484DBD66521AC317D84F7717EC4614E2F5DB743E313E8B48440499CC0DBA4","date":413620090,"hash":"002AA492496A1543DBD3680BF8CF21B6D6A078CE4A01D2C1A4B63778033792CE","inLedger":195480,"ledger_index":195480},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9999999970","Flags":0,"OwnerCount":3,"Sequence":4},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999980","OwnerCount":2,"Sequence":3},"PreviousTxnID":"002AA492496A1543DBD3680BF8CF21B6D6A078CE4A01D2C1A4B63778033792CE","PreviousTxnLgrSeq":195480}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","RootIndex":"A39F044D860C5B5846AA7E0FAAD44DC8897F0A62B2F628AA073B21B3EC146010"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"A39F044D860C5B5846AA7E0FAAD44DC8897F0A62B2F628AA073B21B3EC146010"}},{"ModifiedNode":{"LedgerEntryType":"AccountRoot","LedgerIndex":"E0D7BDE68B468FF0B8D948FD865576517DA987569833A05374ADB9A72E870A06","PreviousTxnID":"0222B59280D165D40C464EA75AAD08A4D152C46A38C0625DEECF6EE87FC5B9E1","PreviousTxnLgrSeq":343555}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"}}}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"100"},"Sequence":3,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"3044022058A89552068D1A274EE72BA71363E33E54E6608BC28A84DEC6EE530FC2B5C979022029F4D1EA1237A1F717C5F5EC526E6CFB6DF54C30BADD25EDDE7D2FDBC8F17E34","date":416347560,"hash":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","inLedger":343570,"ledger_index":343570},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Balance":"59328999119","Flags":0,"OwnerCount":11,"Sequence":89},"LedgerEntryType":"AccountRoot","LedgerIndex":"E0D7BDE68B468FF0B8D948FD865576517DA987569833A05374ADB9A72E870A06","PreviousFields":{"Balance":"59328999129","Sequence":88},"PreviousTxnID":"C26AA6B4F7C3B9F55E17CD0D11F12032A1C7AD2757229FFD277C9447A8815E6E","PreviousTxnLgrSeq":348700}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-1"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"},"LowNode":"0000000000000000"},"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"}},"PreviousTxnID":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","PreviousTxnLgrSeq":343570}}],"TransactionIndex":0,"TransactionResult":"tecSOME_OTHER_ERROR"},"tx":{"Account":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Amount":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"},"Destination":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Paths":[[{"account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","type":49,"type_hex":"0000000000000031"}],[{"account":"rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x","currency":"USD","issuer":"rD1jovjQeEpvaDwn9wKaYokkXXrqo4D23x","type":49,"type_hex":"0000000000000031"},{"account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","currency":"USD","issuer":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","type":49,"type_hex":"0000000000000031"},{"account":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","currency":"USD","issuer":"r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV","type":49,"type_hex":"0000000000000031"}]],"SendMax":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1.01"},"Sequence":88,"SigningPubKey":"02EAE5DAB54DD8E1C49641D848D5B97D1B29149106174322EDF98A1B2CCE5D7F8E","TransactionType":"Payment","TxnSignature":"30440220791B6A3E036ECEFFE99E8D4957564E8C84D1548C8C3E80A87ED1AA646ECCFB16022037C5CAC97E34E3021EBB426479F2ACF3ACA75DB91DCC48D1BCFB4CF547CFEAA0","date":416445410,"hash":"E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7","inLedger":348734,"ledger_index":348734},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","BookDirectory":"4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5E03E788E09BB000","BookNode":"0000000000000000","Flags":0,"OwnerNode":"0000000000000000","Sequence":58,"TakerGets":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"5.648998"},"TakerPays":"6208248802"},"LedgerEntryType":"Offer","LedgerIndex":"3CFB3C79D4F1BDB1EE5245259372576D926D9A875713422F7169A6CC60AFA68B","PreviousFields":{"TakerGets":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"5.65"},"TakerPays":"6209350000"},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-0.001"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"0000000000000002"},"LedgerEntryType":"RippleState","LedgerIndex":"4BD1874F8F3A60EDB0C23F5BD43E07953C2B8741B226648310D113DE2B486F01","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"}},"PreviousTxnID":"5B2006DAD0B3130F57ACF7CC5CCAC2EEBCD4B57AAA091A6FD0A24B073D08ABB8","PreviousTxnLgrSeq":343703}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9998898762","Flags":0,"OwnerCount":3,"Sequence":5},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9999999970","Sequence":4},"PreviousTxnID":"53354D84BAE8FDFC3F4DA879D984D24B929E7FEB9100D2AD9EFCD2E126BCCDC8","PreviousTxnLgrSeq":343570}},{"ModifiedNode":{"FinalFields":{"Account":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","Balance":"912695302618","Flags":0,"OwnerCount":10,"Sequence":59},"LedgerEntryType":"AccountRoot","LedgerIndex":"F3E119AAA87AF3607CF87F5523BB8278A83BCB4142833288305D767DD30C392A","PreviousFields":{"Balance":"912694201420"},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-5.5541638883365"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr","value":"1000"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000C"},"LedgerEntryType":"RippleState","LedgerIndex":"FA1255C2E0407F1945BCF9351257C7C5C28B0F5F09BB81C08D35A03E9F0136BC","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-5.5551658883365"}},"PreviousTxnID":"8F571C346688D89AC1F737AE3B6BB5D976702B171CC7B4DE5CA3D444D5B8D6B4","PreviousTxnLgrSeq":348433}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Amount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0.001"},"Destination":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Fee":"10","Flags":0,"Paths":[[{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","type":48,"type_hex":"0000000000000030"},{"account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","type":49,"type_hex":"0000000000000031"}]],"SendMax":"1112209","Sequence":4,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"Payment","TxnSignature":"304502204EE3E9D1B01D8959B08450FCA9E22025AF503DEF310E34A93863A85CAB3C0BC5022100B61F5B567F77026E8DEED89EED0B7CAF0E6C96C228A2A65216F0DC2D04D52083","date":416447810,"hash":"F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF","inLedger":348860,"ledger_index":348860},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"9998898752","Flags":0,"OwnerCount":3,"Sequence":6},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9998898762","Sequence":5},"PreviousTxnID":"F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF","PreviousTxnLgrSeq":348860}},{"ModifiedNode":{"FinalFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"100"},"HighNode":"0000000000000000","LowLimit":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"0"},"LowNode":"0000000000000000"},"LedgerEntryType":"RippleState","LedgerIndex":"EA4BF03B4700123CDFFB6EB09DC1D6E28D5CEB7F680FB00FC24BC1C3BB2DB959","PreviousFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-1"}},"PreviousTxnID":"E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7","PreviousTxnLgrSeq":348734}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Amount":{"currency":"USD","issuer":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","value":"1"},"Destination":"r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH","Fee":"10","Flags":0,"SendMax":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1.01"},"Sequence":5,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"Payment","TxnSignature":"3043021F020E98325F14580E2EC21D46F29A42A61CE1FBDCCE1A4AAA1EB98B0DF2A2FF022033AEB52BA4FBCCC138F0B1403D3F7E6AD18B104C43501C6C60A35DEC3A3A3865","date":416448130,"hash":"26A65B64446B5704EBE99BC8831ADBFD0B4B38953289C29047E1C6ACE4F43231","inLedger":348878,"ledger_index":348878},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898752","Flags":0,"OwnerCount":3,"Sequence":6},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"9998898752"},"PreviousTxnID":"26A65B64446B5704EBE99BC8831ADBFD0B4B38953289C29047E1C6ACE4F43231","PreviousTxnLgrSeq":348878}},{"ModifiedNode":{"FinalFields":{"Account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","Balance":"66675028897760","Flags":0,"OwnerCount":30,"Sequence":225},"LedgerEntryType":"AccountRoot","LedgerIndex":"9B242A0D59328CE964FFFBFF7D3BBF8B024F9CB1A212923727B42F24ADC93930","PreviousFields":{"Balance":"66675228897770","Sequence":224},"PreviousTxnID":"C19F013CF5CC01CCB0253A571983F2B569A388DB6FA6C115AE7A8786513BBA98","PreviousTxnLgrSeq":348903}}],"TransactionIndex":0,"TransactionResult":"tecPATH_DRY"},"tx":{"Account":"rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY","Amount":"200000000","Destination":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"Sequence":224,"SigningPubKey":"02082622E4DA1DC6EA6B38A48956D816881E000ACF0C5F5B52863B9F698799D474","TransactionType":"Payment","TxnSignature":"3045022100C99FD5702C0A4827812C82B822A936E6ADF3B56BF8D9F4CF1DFF6DBA75D9CE6B0220232DB5AE5141A76F9D309D6118CADBC2761C1D3FE42E8A821E3434E59A4467C1","date":416448890,"hash":"F19FED29BDB5F3EA957925153A2F7E49F6C2EB86E05A26BAB984513679D01A13","inLedger":348917,"ledger_index":348917},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898742","Flags":0,"OwnerCount":4,"Sequence":7},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898752","OwnerCount":3,"Sequence":6},"PreviousTxnID":"F19FED29BDB5F3EA957925153A2F7E49F6C2EB86E05A26BAB984513679D01A13","PreviousTxnLgrSeq":348917}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","RootIndex":"7E1247F78EFC74FA9C0AE39F37AF433966615EB9B757D8397C068C2849A8F4A5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"7F41B7EAB2C3D1B37ACE8EA32841A11A565E6EF7FB37DA55F7EC4F5C2025FC41"}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"826CF5BFD28F3934B518D0BDF3231259CBD3FD0946E3C3CA0C97D2C75D2D1A09","NewFields":{"Balance":{"currency":"USD","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"USD","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"200"},"LowLimit":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000E"}}},{"ModifiedNode":{"FinalFields":{"Account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","Balance":"89999759275","Domain":"6269747374616D702E6E6574","EmailHash":"5B33B93C7FFE384D53450FC666BB11FB","Flags":131072,"OwnerCount":0,"Sequence":49,"TransferRate":1002000000},"LedgerEntryType":"AccountRoot","LedgerIndex":"B7D526FDDF9E3B3F95C3DC97C353065B0482302500BBB8051A5C090B596C6133","PreviousTxnID":"5646054641419C5B81E53A10E9A612BB07B74D8DE9267AC14880CF9A74E3476C","PreviousTxnLgrSeq":348786}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"USD","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"200"},"Sequence":6,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"30450221008AB8644FFB22F1198BD2A3EDBE5FF828431F3521C9FAE87B89CE1EB135F107BF022041FBD8A063608CDBCBAC7DA3DB0986D29AF2BDAE03FA42B49AD44205FBC92282","date":416449280,"hash":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","inLedger":348937,"ledger_index":348937},"validated":true},{"meta":{"AffectedNodes":[{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898732","Flags":0,"OwnerCount":5,"Sequence":8},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898742","OwnerCount":4,"Sequence":7},"PreviousTxnID":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","PreviousTxnLgrSeq":348937}},{"CreatedNode":{"LedgerEntryType":"RippleState","LedgerIndex":"767C12AF647CDF5FEB9019B37018748A79C50EDAF87E8D4C7F39F78AA7CA9765","NewFields":{"Balance":{"currency":"BTC","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"0"},"Flags":131072,"HighLimit":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"2"},"LowLimit":{"currency":"BTC","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"0"},"LowNode":"000000000000000E"}}},{"ModifiedNode":{"FinalFields":{"Flags":0,"Owner":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","RootIndex":"7E1247F78EFC74FA9C0AE39F37AF433966615EB9B757D8397C068C2849A8F4A5"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"7F41B7EAB2C3D1B37ACE8EA32841A11A565E6EF7FB37DA55F7EC4F5C2025FC41"}},{"ModifiedNode":{"FinalFields":{"Account":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","Balance":"89999759275","Domain":"6269747374616D702E6E6574","EmailHash":"5B33B93C7FFE384D53450FC666BB11FB","Flags":131072,"OwnerCount":0,"Sequence":49,"TransferRate":1002000000},"LedgerEntryType":"AccountRoot","LedgerIndex":"B7D526FDDF9E3B3F95C3DC97C353065B0482302500BBB8051A5C090B596C6133","PreviousTxnID":"71540F79F801C8B57AC0A77D245F7F38B8FD277AE50A1DFF99D2210B1867D625","PreviousTxnLgrSeq":348937}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"LimitAmount":{"currency":"BTC","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B","value":"2"},"Sequence":7,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"TrustSet","TxnSignature":"3046022100A76CB4A0E9F1BA76526E2BEE3B7DFF21FC75DA58163F5323A082505F7AA88C48022100B80AC23EC9F1EF237FDB1F10C51AC898C89EA702FC82BCBA0F7B356024CEE345","date":416449330,"hash":"A1E5AAF3E07723DF73ABF2E244F131A35751D615BC3003E4A10197A6630AD270","inLedger":348941,"ledger_index":348941},"validated":true},{"meta":{"AffectedNodes":[{"DeletedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000"}},{"ModifiedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Balance":"10198898722","Flags":0,"OwnerCount":4,"Sequence":9},"LedgerEntryType":"AccountRoot","LedgerIndex":"4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05","PreviousFields":{"Balance":"10198898732","OwnerCount":5,"Sequence":8},"PreviousTxnID":"A1E5AAF3E07723DF73ABF2E244F131A35751D615BC3003E4A10197A6630AD270","PreviousTxnLgrSeq":348941}},{"ModifiedNode":{"FinalFields":{"ExchangeRate":"4E11C37937E08000","Flags":0,"RootIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93","TakerGetsCurrency":"0000000000000000000000000000000000000000","TakerGetsIssuer":"0000000000000000000000000000000000000000","TakerPaysCurrency":"0000000000000000000000004254430000000000","TakerPaysIssuer":"5E7B112523F68D2F5E879DB4EAC51C6698A69304"},"LedgerEntryType":"DirectoryNode","LedgerIndex":"F60ADF645E78B69857D2E4AEC8B7742FEABC8431BD8611D099B428C3E816DF93"}},{"DeletedNode":{"FinalFields":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","BookDirectory":"4B389454C83BD1C687FBCE6B0FDC6BAD4DABEBEF2E83432E4E11C37937E08000","BookNode":"0000000000000000","Flags":0,"OwnerNode":"0000000000000000","PreviousTxnID":"389720F6FD8A144F171708F9ECB334D704CBCFEFBCDA152D931AC34FB5F9E32B","PreviousTxnLgrSeq":95405,"Sequence":1,"TakerGets":"2000000","TakerPays":{"currency":"BTC","issuer":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","value":"1"}},"LedgerEntryType":"Offer","LedgerIndex":"FDB2F7F93640D13069BF495097F971B7138ED69B2BFB9E28C8A3DEF592498651"}}],"TransactionIndex":0,"TransactionResult":"tesSUCCESS"},"tx":{"Account":"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59","Fee":"10","Flags":0,"OfferSequence":1,"Sequence":8,"SigningPubKey":"02BC8C02199949B15C005B997E7C8594574E9B02BA2D0628902E0532989976CF9D","TransactionType":"OfferCancel","TxnSignature":"304402207715B145DC919A600F8F03361CC77CF17B39FAAC293A0CEE8ED98B14B1D3AFAA02202B325218DBD52C2B6649AEEBB3EC564A483DA3E4BA93A0D73F58D5732B5F8214","date":416450400,"hash":"728C76EA082515D4C1FC55E4A367AAD3CA3D24210604EE56B7FA77AABDB72807","inLedger":349004,"ledger_index":349004},"validated":true}],"validated":true}'));
          }
        },
        dbinterface: {
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          },
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59'
        },
        query: {
          exclude_failed: 'true'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(json_response.payments).to.have.length(2);
          _.each(json_response.payments, function(payment_entry){
            expect(payment_entry.payment.state).to.equal('validated');
          });
          done();
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };

      payments.getAccountPayments($, req, res, next);

    });

  });

  describe('.getPathFind()', function(){

    it('should respond with an error if the source_account is missing', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          // account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          destination_amount_string: '1+XRP'
        },
        query: {

        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('source_account');
          done();
        }
      };
      var next = function(error){};
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now() - 1;
      $.remote._getServer = function() {
        return Server;
      };

      payments.getPathFind($, req, res, next);

    });

    it('should respond with an error if the source_account is invalid', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'some invalid account',
          destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          destination_amount_string: '1+XRP'
        },
        query: {

        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('source_account');
          done();
        }
      };
      var next = function(error){};
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now() - 1;
      $.remote._getServer = function() {
        return Server;
      };

      payments.getPathFind($, req, res, next);

    });

    it('should respond with an error if the destination_account is missing', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          // destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          destination_amount_string: '1+XRP'
        },
        query: {

        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('destination_account');
          done();
        }
      };
      var next = function(error){};
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now() - 1;
      $.remote._getServer = function() {
        return Server;
      };

      payments.getPathFind($, req, res, next);

    });

    it('should respond with an error if the destination_account is invalid', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'some invalid account',
          destination_amount_string: '1+XRP'
        },
        query: {

        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('destination_account');
          done();
        }
      };
      var next = function(error){};
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now() - 1;
      $.remote._getServer = function() {
        return Server;
      };

      payments.getPathFind($, req, res, next);

    });

    it('should respond with an error if the destination_amount is missing', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          // destination_amount_string: '1+XRP'
        },
        query: {

        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('destination_amount');
          done();
        }
      };
      var next = function(error){};
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now() - 1;
      $.remote._getServer = function() {
        return Server;
      };

      payments.getPathFind($, req, res, next);

    });

    it('should respond with an error if the destination_amount is invalid', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          destination_amount_string: '1XRP'
        },
        query: {

        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('destination_amount');
          done();
        }
      };
      var next = function(error){};
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now() - 1;
      $.remote._getServer = function() {
        return Server;
      };

      payments.getPathFind($, req, res, next);

    });

    it('should respond with an error if the source_currencies list is invalid', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          destination_amount_string: '1+XRP'
        },
        query: {
          source_currencies: 'USD,XRP,BTCr9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.contain('source_currencies');
          done();
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now() - 1;
      $.remote._getServer = function() {
        return Server;
      };

      payments.getPathFind($, req, res, next);

    });

    it('should respond with an error if there is no connection to rippled', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          destination_amount_string: '1+XRP'
        },
        query: {
          source_currencies: 'USD,XRP,BTC r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.message).to.contain('No connection to rippled');
          done();
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now() - (server_lib.CONNECTION_TIMEOUT + 1);
      Server.connect = function(){};
      $.remote._servers.push(Server);
      $.remote._getServer = function() {
        return Server;
      };

      payments.getPathFind($, req, res, next);

    });

    it('should convert the parameters into the form expected by ripple-lib', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          destination_amount_string: '1+XRP'
        },
        query: {
          source_currencies: 'USD,XRP,BTC r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(false, 'This should not be called');
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      Server.connect = function(){};
      $.remote._servers.push(Server);
      $.remote._getServer = function() {
        return Server;
      };

      $.remote.requestRipplePathFind = function(params) {
        expect(params.src_account).to.equal('r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59');
        expect(params.dst_account).to.equal('rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz');
        expect(params.dst_amount).to.equal('1000000');
        expect(params.src_currencies).to.deep.equal([ 
          { currency: 'USD' },
          { currency: 'XRP' },
          { currency: 'BTC',
            issuer: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59' } 
        ]);

        done();

        return {
          once: function(){},
          timeout: function(){},
          request: function(){}
        };
      };

      payments.getPathFind($, req, res, next);

    });

    it('should add a direct XRP path where applicable (because rippled assumes the direct path is obvious)', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          destination_amount_string: '1+XRP'
        },
        query: {
          source_currencies: 'XRP'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);
          expect(json_response.payments).to.have.length(1);
          expect(json_response.payments[0].source_amount.currency).to.equal('XRP');
          expect(json_response.payments[0].destination_amount.currency).to.equal('XRP');
          done();
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      Server.connect = function(){};
      $.remote._servers.push(Server);
      $.remote._getServer = function() {
        return Server;
      };

      $.remote.requestRipplePathFind = function(params) {
        return {
          once: function(event_name, event_handler){
            if (event_name === 'success') {
              event_handler({
                alternatives: [],
                destination_currencies: [ 'XRP' ]
              });
            }
          },
          timeout: function(){},
          request: function(){}
        };
      };
      $.remote.requestAccountInfo = function(account, callback) {
        callback(null, {
          account_data: {
            Balance: '100000000000'
          }
        });
      };

      payments.getPathFind($, req, res, next);

    });

    it('should respond with an error if the destination_account does not accept the specified currency', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          destination_amount_string: '1+XRP'
        },
        query: {
          source_currencies: 'XRP'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(404);
          expect(json_response.message).to.equal('No paths found. The destination_account does not accept XRP, they only accept: USD');
          done();
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      Server.connect = function(){};
      $.remote._servers.push(Server);
      $.remote._getServer = function() {
        return Server;
      };

      $.remote.requestRipplePathFind = function(params) {
        return {
          once: function(event_name, event_handler){
            if (event_name === 'success') {
              event_handler({
                alternatives: [],
                destination_currencies: [ 'USD' ]
              });
            }
          },
          timeout: function(){},
          request: function(){}
        };
      };

      payments.getPathFind($, req, res, next);

    });

    it('shoudld respond with an error if there is no path found because of insufficient liquidity', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          destination_amount_string: '1+XRP'
        },
        query: {
          source_currencies: 'XRP'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(404);
          expect(json_response.message).to.contain('No paths found');
          expect(json_response.message).to.contain('insufficient liquidity');
          done();
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      Server.connect = function(){};
      $.remote._servers.push(Server);
      $.remote._getServer = function() {
        return Server;
      };

      $.remote.requestRipplePathFind = function(params) {
        return {
          once: function(event_name, event_handler){
            if (event_name === 'success') {
              event_handler({
                alternatives: [],
                destination_currencies: [ 'XRP', 'BTC' ]
              });
            }
          },
          timeout: function(){},
          request: function(){}
        };
      };
      $.remote.requestAccountInfo = function(account, callback) {
        callback(null, {
          account_data: {
            Balance: '0'
          }
        });
      };

      payments.getPathFind($, req, res, next);

    });

    it('should produce an array of payment objects, each with all of the available fields included even if they are empty strings', function(done){

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          destination_amount_string: '0.001+USD'
        },
        query: {
          source_currencies: 'XRP,USD,BTC'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);

          json_response.payments.forEach(function(payment){
            expect(payment).to.have.keys([
              'source_account',
              'source_tag',
              'source_amount',
              'source_slippage',
              'destination_account',
              'destination_tag',
              'destination_amount',
              'invoice_id',
              'paths',
              'partial_payment',
              'no_direct_ripple'
            ]);
          });

          done();
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      Server.connect = function(){};
      $.remote._servers.push(Server);
      $.remote._getServer = function() {
        return Server;
      };

      $.remote.requestRipplePathFind = function(params) {
        return {
          once: function(event_name, event_handler){
            if (event_name === 'success') {
              event_handler({
                "alternatives": [
                  {
                    "paths_canonical": [],
                    "paths_computed": [
                      [
                        {
                          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                          "type": 1,
                          "type_hex": "0000000000000001"
                        }
                      ]
                    ],
                    "source_amount": {
                      "currency": "USD",
                      "issuer": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
                      "value": "0.001002"
                    }
                  },
                  {
                    "paths_canonical": [],
                    "paths_computed": [
                      [
                        {
                          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                          "type": 1,
                          "type_hex": "0000000000000001"
                        },
                        {
                          "currency": "XRP",
                          "type": 16,
                          "type_hex": "0000000000000010"
                        },
                        {
                          "currency": "USD",
                          "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                          "type": 48,
                          "type_hex": "0000000000000030"
                        },
                        {
                          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                          "type": 1,
                          "type_hex": "0000000000000001"
                        }
                      ],
                      [
                        {
                          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                          "type": 1,
                          "type_hex": "0000000000000001"
                        },
                        {
                          "currency": "USD",
                          "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                          "type": 48,
                          "type_hex": "0000000000000030"
                        },
                        {
                          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                          "type": 1,
                          "type_hex": "0000000000000001"
                        }
                      ],
                      [
                        {
                          "account": "rpgKWEmNqSDAGFhy5WDnsyPqfQxbWxKeVd",
                          "type": 1,
                          "type_hex": "0000000000000001"
                        },
                        {
                          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                          "type": 1,
                          "type_hex": "0000000000000001"
                        },
                        {
                          "currency": "USD",
                          "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                          "type": 48,
                          "type_hex": "0000000000000030"
                        },
                        {
                          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                          "type": 1,
                          "type_hex": "0000000000000001"
                        }
                      ],
                      [
                        {
                          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                          "type": 1,
                          "type_hex": "0000000000000001"
                        },
                        {
                          "currency": "XRP",
                          "type": 16,
                          "type_hex": "0000000000000010"
                        },
                        {
                          "currency": "USD",
                          "issuer": "rBVuBbPYvLyf8HvMdf48nayR8XF8X9J3Ds",
                          "type": 48,
                          "type_hex": "0000000000000030"
                        },
                        {
                          "account": "rBVuBbPYvLyf8HvMdf48nayR8XF8X9J3Ds",
                          "type": 1,
                          "type_hex": "0000000000000001"
                        },
                        {
                          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                          "type": 1,
                          "type_hex": "0000000000000001"
                        }
                      ]
                    ],
                    "source_amount": {
                      "currency": "BTC",
                      "issuer": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
                      "value": "0.000001530700999096105"
                    }
                  }
                ],
                "destination_account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                "destination_currencies": [
                  "FAK",
                  "BER",
                  "USD",
                  "XRP"
                ]
              });
            }
          },
          timeout: function(){},
          request: function(){}
        };
      };
      $.remote.requestAccountInfo = function(account, callback) {
        callback(null, {
          account_data: {
            Balance: '10000000'
          }
        });
      };

      payments.getPathFind($, req, res, next);

    });

    it('should include the stringified path in the payment object', function(done){

      var test_pathfind_result = {
        "alternatives": [
          {
            "paths_canonical": [],
            "paths_computed": [
              [
                {
                  "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                  "type": 1,
                  "type_hex": "0000000000000001"
                }
              ]
            ],
            "source_amount": {
              "currency": "USD",
              "issuer": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
              "value": "0.001002"
            }
          },
          {
            "paths_canonical": [],
            "paths_computed": [
              [
                {
                  "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                  "type": 1,
                  "type_hex": "0000000000000001"
                },
                {
                  "currency": "XRP",
                  "type": 16,
                  "type_hex": "0000000000000010"
                },
                {
                  "currency": "USD",
                  "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                  "type": 48,
                  "type_hex": "0000000000000030"
                },
                {
                  "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                  "type": 1,
                  "type_hex": "0000000000000001"
                }
              ],
              [
                {
                  "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                  "type": 1,
                  "type_hex": "0000000000000001"
                },
                {
                  "currency": "USD",
                  "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                  "type": 48,
                  "type_hex": "0000000000000030"
                },
                {
                  "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                  "type": 1,
                  "type_hex": "0000000000000001"
                }
              ],
              [
                {
                  "account": "rpgKWEmNqSDAGFhy5WDnsyPqfQxbWxKeVd",
                  "type": 1,
                  "type_hex": "0000000000000001"
                },
                {
                  "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                  "type": 1,
                  "type_hex": "0000000000000001"
                },
                {
                  "currency": "USD",
                  "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                  "type": 48,
                  "type_hex": "0000000000000030"
                },
                {
                  "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                  "type": 1,
                  "type_hex": "0000000000000001"
                }
              ],
              [
                {
                  "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                  "type": 1,
                  "type_hex": "0000000000000001"
                },
                {
                  "currency": "XRP",
                  "type": 16,
                  "type_hex": "0000000000000010"
                },
                {
                  "currency": "USD",
                  "issuer": "rBVuBbPYvLyf8HvMdf48nayR8XF8X9J3Ds",
                  "type": 48,
                  "type_hex": "0000000000000030"
                },
                {
                  "account": "rBVuBbPYvLyf8HvMdf48nayR8XF8X9J3Ds",
                  "type": 1,
                  "type_hex": "0000000000000001"
                },
                {
                  "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                  "type": 1,
                  "type_hex": "0000000000000001"
                }
              ]
            ],
            "source_amount": {
              "currency": "BTC",
              "issuer": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
              "value": "0.000001530700999096105"
            }
          }
        ],
        "destination_account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
        "destination_currencies": [
          "FAK",
          "BER",
          "USD",
          "XRP"
        ]
      };

      var $ = {
        remote: new ripple.Remote({
          servers: [ ]
        }),
        dbinterface: {}
      };
      var req = {
        params: {
          account: 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59',
          destination_account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          destination_amount_string: '0.001+USD'
        },
        query: {
          source_currencies: 'XRP,USD,BTC'
        }
      };
      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);

          json_response.payments.forEach(function(payment){
            if (payment.source_amount.currency === 'XRP') {
              expect(payment.paths).to.equal('[]');
            } else if (payment.source_amount.currency === 'USD') {
              expect(payment.paths).to.equal(JSON.stringify(test_pathfind_result.alternatives[0].paths_computed));
            } else if (payment.source_amount.currency === 'BTC') {
              expect(payment.paths).to.equal(JSON.stringify(test_pathfind_result.alternatives[1].paths_computed));
            } 
          });

          done();
        }
      };
      var next = function(error){
        expect(error).not.to.exist;
      };
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      Server.connect = function(){};
      $.remote._servers.push(Server);
      $.remote._getServer = function() {
        return Server;
      };

      $.remote.requestRipplePathFind = function(params) {
        return {
          once: function(event_name, event_handler){
            if (event_name === 'success') {
              event_handler(test_pathfind_result);
            }
          },
          timeout: function(){},
          request: function(){}
        };
      };
      $.remote.requestAccountInfo = function(account, callback) {
        callback(null, {
          account_data: {
            Balance: '10000000'
          }
        });
      };

      payments.getPathFind($, req, res, next);

    });


  });

});
