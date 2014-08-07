var _            = require('lodash');
var chai         = require('chai');
var sinon        = require('sinon');
var sinonchai    = require('sinon-chai');
var expect       = chai.expect;
var transactions = require('../api/transactions');
var server_lib   = require('../lib/server-lib');
var ripple       = require('ripple-lib');
chai.use(sinonchai);

// Note that these tests use heavily stubbed versions of the 
// dependencies such as ripple-lib. These must be updated if 
// the dependencies are changed in any significant way

describe('api/transactions', function(){

  describe('.submit()', function(){

    it.skip('should respond with an error if the remote is disconnected', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() - (server_lib.CONNECTION_TIMEOUT + 1) // Considered disconnected
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {}
      };

      transactions.submit($, {}, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.message).to.contain('Cannot connect to rippled');
          done();
        }
      }, function(err, res){});

    });

    it.skip('should block duplicate Payments (same account same client_resource_id)', function(done){

      var test_transaction = new ripple.Transaction(),
        client_resource_id = 'ebb9d857-fc71-440f-8b0a-f1ea3535986a';
      test_transaction.payment({
        from: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        to: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        amount: '10XRP'
      });

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() - 1 // Considered connected
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            if (params.source_account === 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM' &&
              params.client_resource_id === client_resource_id &&
              params.type === 'payment') {

              callback(null, {
                source_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
                type: 'payment',
                client_resource_id: client_resource_id,
                hash: '108847C3EFA523EE412DDDA1C319B7AA80F257708DF1EC6F02E52BE93FF59051',
                ledger: '6098806',
                state: 'validated',
                result: 'tesSUCCESS'
              });
            } else {
              callback(new Error('Cannot get record'));
            }
          }
        }
      };

      transactions.submit($, {
        account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        transaction: test_transaction,
        client_resource_id: client_resource_id
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.message).to.contain('Duplicate Transaction');
          done();
        }
      }, function(err, res){
        expect(err).not.to.exist;
      });

    });

    it.skip('should block duplicate OfferCreates and OfferCancels', function(done){

      var test_transaction = new ripple.Transaction(),
        client_resource_id = 'a107e1e3-b552-41a5-8452-c8a413cdb7c2';
      test_transaction.offerCreate({
        account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        taker_pays: '10000',
        taker_gets: {
          value: '10',
          currency: 'USD',
          issuer: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
        }
      });

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() - 1 // Considered connected
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            if (params.source_account === 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM' &&
              params.client_resource_id === client_resource_id &&
              params.type === 'offercreate') {

              callback(null, {
                source_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
                type: 'offercreate',
                client_resource_id: client_resource_id,
                hash: '208847C3EFA523EE412DDDA1C319B7AA80F257708DF1EC6F02E52BE93FF59051',
                ledger: '6098807',
                state: 'validated',
                result: 'tesSUCCESS'
              });
            } else {
              callback(new Error('Cannot get record'));
            }
          }
        }
      };

      transactions.submit($, {
        account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        transaction: test_transaction,
        client_resource_id: client_resource_id
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.message).to.contain('Duplicate Transaction');
          done();
        }
      }, function(err, res){
        expect(err).not.to.exist;
      });

    });

    it.skip('should call the callback if there is an error before the "proposed" event is emitted', function(done){

      var test_transaction = new ripple.Transaction(),
        client_resource_id = 'ebb9d857-fc71-440f-8b0a-f1ea3535986a';
      test_transaction.payment({
        from: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        to: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        amount: '10XRP'
      });

      test_transaction.submit = function() {
        this.emit('error', 'Some Error');
      };

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
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      transactions.submit($, {
        account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        transaction: test_transaction,
        client_resource_id: client_resource_id
      }, {
        json: function() {}
      }, function(err, res){
        expect(err).to.exist;
        expect(err).to.equal('Some Error');
        done();
      });

    });

    it.skip('should save the transaction to the database every time the transaction state is changed', function(done){

      var states = [ 'unsubmitted', 'submitted', 'pending', 'validated' ];
 
      // Count the number of times saveTransaction is called and
      // call done when it has been called once per state change
      var times_called = 0;
       
      function saveTransaction(transaction_data, callback) {
        var state = transaction_data.state;
       
        if (state === states[times_called]) {
          times_called++;
        }
              
        if (times_called === states.length) {
          done();
        }
      };
       
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: saveTransaction
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
      remote.connect = function(){};
       
      var test_transaction = new ripple.Transaction();
       
      var client_resource_id = 'ebb9d857-fc71-440f-8b0a-f1ea3535986a';
       
      test_transaction.payment({
        from: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        to: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        amount: '10XRP'
      });
       
      test_transaction.remote = remote;
      test_transaction.tx_json.Sequence = 10;
       
      test_transaction.complete = function() {
        return test_transaction;
      };
       
      var transaction_manager = remote.account(test_transaction.tx_json.Account)._transactionManager;
       
      transaction_manager._nextSequence = 1;
       
      transaction_manager._request = function(transaction) {
        transaction.emit('save');
        states.forEach(function(state) {
          transaction.setState(state);
        });
      };
       
      transactions.submit(
        {
          remote: remote,
          dbinterface: dbinterface
        },
        {
          account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuMX',
          transaction: test_transaction,
          client_resource_id: client_resource_id
        },
        { json: console.log.bind(this, 'res.JSON') }
      );

    });

    it.skip('should call the callback with the client_resource_id when the "proposed" event is emitted', function(done){

      var test_transaction = new ripple.Transaction(),
        client_resource_id = 'ebb9d857-fc71-440f-8b0a-f1ea3535986a';
      test_transaction.payment({
        from: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        to: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        amount: '10XRP'
      });

      test_transaction.submit = function() {
        this.emit('proposed');
      };

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() - 1 // Considered connected
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

      transactions.submit($, {
        account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        transaction: test_transaction,
        client_resource_id: client_resource_id
      }, {
        json: function() {}
      }, function(err, client_resource_id){
        expect(err).not.to.exist;
        expect(client_resource_id).to.equal(client_resource_id);
        done();
      });

    });

    it.skip('should save errors that happen after the "proposed" event to the database but not report them to the client', function(done){
      
      var callback_function_already_called = false;

      function saveTransaction(transaction_data, callback) {
        if (transaction_data.state === 'failed' && callback_function_already_called) {
          done();
        }
      };
       
      var dbinterface = {
        getTransaction: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        },
        saveTransaction: saveTransaction
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
       
      var test_transaction = new ripple.Transaction();
       
      var client_resource_id = 'ebb9d857-fc71-440f-8b0a-f1ea3535986a';
       
      test_transaction.payment({
        from: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        to: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
        amount: '10XRP'
      });
       
      test_transaction.remote = remote;
      test_transaction.tx_json.Sequence = 10;
       
      test_transaction.complete = function() {
        return test_transaction;
      };
       
      var transaction_manager = remote.account(test_transaction.tx_json.Account)._transactionManager;
       
      transaction_manager._nextSequence = 1;
       
      transaction_manager._request = function(transaction) {
        transaction.emit('submitted');
        transaction.emit('proposed');

        // Simulating an error returned after the initial result 
        // has already been sent back to the client
        transaction.emit('error', new Error('Some Error'));
      };
       
      transactions.submit(
        {
          remote: remote,
          dbinterface: dbinterface
        },
        {
          account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuMX',
          transaction: test_transaction,
          client_resource_id: client_resource_id
        },
        { 
          json: console.log.bind(this, 'res.JSON') 
        },
        function(err, res) {          
          expect(err).not.to.exist;
          expect(res).to.equal(client_resource_id);

          callback_function_already_called = true;
        });

    });

  });

  // Note that internally .get() is .getTransaction
  describe('.get()', function(){

    // it.skip('should call getTransactionHelper and respond directly to the client with the transaction', function(done){

    //   var normal_getTransactionHelper = transactions.getTransactionHelper;
    //   transactions.getTransactionHelper = function($, req, res, callback) {
    //     callback(null, {
    //       success: true, 
    //       transaction: 'This should be a Transaction'
    //     });
    //   };

    //   transactions.get({}, {}, {
    //     json: function(status_code, json_response){
    //       expect(status_code).to.equal(200);
    //       expect(json_response.success).to.be.true;
    //       expect(json_response.transaction).to.equal('This should be a Transaction');
    //       done();
    //     }
    //   });

    //   transactions.getTransactionHelper = normal_getTransactionHelper;

    // });

    // it.skip('should pass errors to the Express.js next() function', function(){

    //   var normal_getTransactionHelper = transactions.getTransactionHelper;
    //   transactions.getTransactionHelper = function($, req, res, callback) {
    //     callback(new Error('Some error'));
    //   };

    //   transactions.get({}, {}, {}, function(err){
    //     expect(err.message).to.equal('Some error');
    //     done();
    //   });

    //   transactions.getTransactionHelper = normal_getTransactionHelper;

    // });

  });

  describe('.getTransactionHelper()', function(){

    it.skip('should respond with an error if the identifier is neither a hash nor a valid client_resource_id', function(done){

      var $ = {
        remote: {},
        dbinterface: {}
      };

      var req = {
        params: {
          account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          identifier: 'Invalid\n Identifier'
        }
      };

      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.equal('Parameter not a valid transaction hash or client_resource_id: identifier');
          done();
        }
      };

      var callback = function(err, res){};

      transactions.getTransactionHelper($, req, res, callback);

    });

    it.skip('should respond with an error if there is no connection to rippled', function(done){

      var normal_CONNECTION_TIMEOUT = server_lib.CONNECTION_TIMEOUT;
      server_lib.CONNECTION_TIMEOUT = 0;

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() - (1000 * 20 + 1)
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {}
      };

      var req = {
        params: {
          account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          identifier: 'Valid Identifier'
        }
      };

      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.message).to.contain('Cannot connect to rippled');
          done();
        }
      };

      var callback = function(err, res){};

      transactions.getTransactionHelper($, req, res, callback);

      server_lib.CONNECTION_TIMEOUT = normal_CONNECTION_TIMEOUT;

    });

    it.skip('should query the remote if no record is found in the database', function(done){

      var tx_hash = '1C3FFA4EDD96193BE0DF65E0C2D8692803538DEF761E721B571812B7B527D702';

      var $ = {
        remote: {
          requestTx: function(hash, callback){
            if (hash === tx_hash) {
              done();
            }
          },
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
          getTransaction: function(opts, callback) {
            callback();
          }
        }
      };

      var req = {
        params: {
          account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          identifier: tx_hash
        }
      };

      var res = {
        json: function(status_code, json_response) {}
      };

      var callback = function(err, res){};

      transactions.getTransactionHelper($, req, res, callback);

    });

    it.skip('should query the remote if only the record in the client_resource_id_records is found', function(done){

      var tx_hash = '1C3FFA4EDD96193BE0DF65E0C2D8692803538DEF761E721B571812B7B527D702';

      var $ = {
        remote: {
          requestTx: function(hash, callback){
            if (hash === tx_hash) {
              done();
            }
          },
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
          getTransaction: function(opts, callback) {
            if (opts.hash === tx_hash) {
              callback(null, {
                source_account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
                type: 'payment',
                client_resource_id: 'someid',
                hash: tx_hash,
                ledger: '1000000',
                state: 'validated',
                result: 'tesSUCCESS'
              });
            }
          }
        }
      };

      var req = {
        params: {
          account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          identifier: tx_hash
        }
      };

      var res = {
        json: function(status_code, json_response) {
          expect(status_code).not.to.exist;
        }
      };

      var callback = function(err, res){
        expect(err).not.to.exist;
      };

      transactions.getTransactionHelper($, req, res, callback);

    });

    it.skip('should respond with an error if the account is specified but the transaction did not affect the given account', function(done){

      var tx_hash = '1C3FFA4EDD96193BE0DF65E0C2D8692803538DEF761E721B571812B7B527D702';

      var $ = {
        remote: {
          requestTx: function(hash, callback){
            if (hash === tx_hash) {
              callback(null, {
                Account : "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                Amount : "1000000",
                Destination : "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",
                Fee : "12",
                Flags : 2147483648,
                LastLedgerSequence : 6487173,
                Sequence : 269,
                SigningPubKey : "02FA03AED689EF4D9EFA21CA40F7CD8C84D5386AAE2924ED65688841336D366BB6",
                TransactionType : "Payment",
                TxnSignature : "304402200BFFC043A170F37F95F7921AA8A9C06F0D6D78E45AFC3380F154AA33858D9A410220557D3617006FEE7A32C8534632FED9AE8ECAD4FD20D206DA23D6DCE005EE6AD5",
                date : 452727320,
                hash : tx_hash,
                inLedger : 6487166,
                ledger_index : 6487166
              });
            }
          },
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
          getTransaction: function(opts, callback) {
            callback();
          }
        }
      };

      var req = {
        params: {
          account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          identifier: tx_hash
        }
      };

      var res = {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.equal('Transaction specified did not affect the given account');
          done();
        }
      };

      var callback = function(err, res){};

      transactions.getTransactionHelper($, req, res, callback);

    });

    it.skip('should query the remote to attach the date to the transaction', function(done){

      var tx_hash = '1B724D76A5B800B3AB380A92D0EFCD542F033D73A872A67B9EF11B77C58AD38B';

      var containing_ledger = {
        "accepted": true,
        "account_hash": "25D7F5E99981336F685FAC95DDB2CC181AC449215CF874E330315090C9309677",
        "close_time": 452725380,
        "close_time_human": "2014-May-06 21:03:00",
        "close_time_resolution": 10,
        "closed": true,
        "hash": "427CE04FA2756F9F38B0A875EFA90191189D13BCE73B4A89E0A14DA63D50871F",
        "ledger_hash": "427CE04FA2756F9F38B0A875EFA90191189D13BCE73B4A89E0A14DA63D50871F",
        "ledger_index": "6486744",
        "parent_hash": "C32ED042C7605D31AA9163A5BAB291DEFE8A85CD35ADFA24B2B16E323BA49D04",
        "seqNum": "6486744",
        "totalCoins": "99999992265525078",
        "total_coins": "99999992265525078",
        "transaction_hash": "1D575B7E22FD7C75B3ECA4AF3CB437A0D8557F31624073169FA75B8AF8D9C61B"
      };

      var $ = {
        remote: {
          requestLedger: function(ledger_index, callback) {
            if (ledger_index === 6486744) {
              callback(null, {
                "ledger": containing_ledger
              });
            } else {
              callback(new Error('Wrong ledger_index'));
            }
          },
          requestTx: function(hash, callback){
            if (hash === tx_hash) {
              callback(null, {
                "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                "Amount": "1000000",
                "Destination": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                "Fee": "12",
                "Flags": 2147483648,
                "LastLedgerSequence": 6486752,
                "Sequence": 261,
                "SigningPubKey": "02FA03AED689EF4D9EFA21CA40F7CD8C84D5386AAE2924ED65688841336D366BB6",
                "TransactionType": "Payment",
                "TxnSignature": "3045022100C008524654B3C595B2140DB1A9EA79888030B2A26850E0D80E396DDBE95C9B14022016A3EF1E4300CC16D5A0EDFCE895AC6609D41B0C62919E69CC0E7A5E76E68AE9",
                "hash": "1B724D76A5B800B3AB380A92D0EFCD542F033D73A872A67B9EF11B77C58AD38B",
                "inLedger": 6486744,
                "ledger_index": 6486744
              });
            }
          },
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
          getTransaction: function(opts, callback) {
            callback();
          }
        }
      };

      var req = {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          identifier: tx_hash
        }
      };

      var res = {
        json: function(status_code, json_response) {}
      };

      var callback = function(err, res){
        expect(err).not.to.exist;
        expect(res.date).to.exist;
        expect(res.date).to.equal(new Date(containing_ledger.close_time_human + "Z").valueOf()); 
        done();
      };

      transactions.getTransactionHelper($, req, res, callback);

    });

    it.skip('should call the callback with the transaction in JSON format (Payment)', function(done){

      var tx_hash = '1B724D76A5B800B3AB380A92D0EFCD542F033D73A872A67B9EF11B77C58AD38B';

      var containing_ledger = {
        "accepted": true,
        "account_hash": "25D7F5E99981336F685FAC95DDB2CC181AC449215CF874E330315090C9309677",
        "close_time": 452725380,
        "close_time_human": "2014-May-06 21:03:00",
        "close_time_resolution": 10,
        "closed": true,
        "hash": "427CE04FA2756F9F38B0A875EFA90191189D13BCE73B4A89E0A14DA63D50871F",
        "ledger_hash": "427CE04FA2756F9F38B0A875EFA90191189D13BCE73B4A89E0A14DA63D50871F",
        "ledger_index": "6486744",
        "parent_hash": "C32ED042C7605D31AA9163A5BAB291DEFE8A85CD35ADFA24B2B16E323BA49D04",
        "seqNum": "6486744",
        "totalCoins": "99999992265525078",
        "total_coins": "99999992265525078",
        "transaction_hash": "1D575B7E22FD7C75B3ECA4AF3CB437A0D8557F31624073169FA75B8AF8D9C61B"
      };

      var $ = {
        remote: {
          requestLedger: function(ledger_index, callback) {
            if (ledger_index === 6486744) {
              callback(null, {
                "ledger": containing_ledger
              });
            } else {
              callback(new Error('Wrong ledger_index'));
            }
          },
          requestTx: function(hash, callback){
            if (hash === tx_hash) {
              callback(null, {
                "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                "Amount": "1000000",
                "Destination": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                "Fee": "12",
                "Flags": 2147483648,
                "LastLedgerSequence": 6486752,
                "Sequence": 261,
                "SigningPubKey": "02FA03AED689EF4D9EFA21CA40F7CD8C84D5386AAE2924ED65688841336D366BB6",
                "TransactionType": "Payment",
                "TxnSignature": "3045022100C008524654B3C595B2140DB1A9EA79888030B2A26850E0D80E396DDBE95C9B14022016A3EF1E4300CC16D5A0EDFCE895AC6609D41B0C62919E69CC0E7A5E76E68AE9",
                "hash": "1B724D76A5B800B3AB380A92D0EFCD542F033D73A872A67B9EF11B77C58AD38B",
                "inLedger": 6486744,
                "ledger_index": 6486744,
                "meta": {
                  "AffectedNodes": [
                    {
                      "ModifiedNode": {
                        "FinalFields": {
                          "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                          "Balance": "249338560",
                          "Flags": 1114112,
                          "OwnerCount": 6,
                          "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                          "Sequence": 262
                        },
                        "LedgerEntryType": "AccountRoot",
                        "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                        "PreviousFields": {
                          "Balance": "250338572",
                          "Sequence": 261
                        },
                        "PreviousTxnID": "9CFF1F565D8E7256B948908CB42AD73DC9EBBB8383D91D66955C9B5EFA906E3D",
                        "PreviousTxnLgrSeq": 6486456
                      }
                    },
                    {
                      "ModifiedNode": {
                        "FinalFields": {
                          "Account": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM",
                          "Balance": "52531724295",
                          "Flags": 0,
                          "OwnerCount": 8,
                          "Sequence": 187
                        },
                        "LedgerEntryType": "AccountRoot",
                        "LedgerIndex": "73DC951B0AC2FD8A8222BBCDF5B62D712A14F87D007ABAB21A224FD1F336F9EC",
                        "PreviousFields": {
                          "Balance": "52530724295"
                        },
                        "PreviousTxnID": "9CFF1F565D8E7256B948908CB42AD73DC9EBBB8383D91D66955C9B5EFA906E3D",
                        "PreviousTxnLgrSeq": 6486456
                      }
                    }
                  ],
                  "TransactionIndex": 0,
                  "TransactionResult": "tesSUCCESS"
                },
                "validated": true
              });
            }
          },
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
          getTransaction: function(opts, callback) {
            callback();
          }
        }
      };

      var req = {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          identifier: tx_hash
        }
      };

      var res = {
        json: function(status_code, json_response) {}
      };

      var callback = function(err, res){
        expect(err).not.to.exist;

        expect(res).to.contain.keys(['TransactionType', 'Flags', 'Account', 'Sequence', 'TxnSignature', 'Destination', 'ledger_index', 'date']);
        done();
      };

      transactions.getTransactionHelper($, req, res, callback);

    });

    it.skip('should handle OfferCreate transactions', function(done){

      var tx_hash = '956BF1E33BA2F09EB7C499F2A20D8417CD21BDC0CF0AE63E3004267159B49CFA';

      var containing_ledger = {
        "accepted": true,
        "account_hash": "CCF7510A3DB3F1642C696AB696C45EA04F3FA1135BBFC4C38A424F6983218AC8",
        "close_time": 452178260,
        "close_time_human": "2014-Apr-30 13:04:20",
        "close_time_resolution": 10,
        "closed": true,
        "hash": "F336CE1621E6089781980C9618BAAE7A2431E167C36CF4F4F2462D8ED37BC888",
        "ledger_hash": "F336CE1621E6089781980C9618BAAE7A2431E167C36CF4F4F2462D8ED37BC888",
        "ledger_index": "6366138",
        "parent_hash": "E2FD660BB75EC7AFE2141DAF9382B30922B4C4393F535D04C7C77BB2754BF4B9",
        "seqNum": "6366138",
        "totalCoins": "99999993595731720",
        "total_coins": "99999993595731720",
        "transaction_hash": "F4C62169D2205F3B2D328C4FFDB81F84DF611A720A4EED4492DF24606A162A2A"
      };

      var $ = {
        remote: {
          requestLedger: function(ledger_index, callback) {
            if (ledger_index === 6366138) {
              callback(null, {
                "ledger": containing_ledger
              });
            } else {
              callback(new Error('Wrong ledger_index'));
            }
          },
          requestTx: function(hash, callback){
            if (hash === tx_hash) {
              callback(null, {
                Account : "rG2pEp6WtqLfThH8wsVM9XYYvy9wSe9Zqu",
                Fee : "12",
                Flags : 0,
                Sequence : 580,
                SigningPubKey : "02B49D2C38E5660F13A1CBD03C9578BA2EEF893D255AA6914F5FEF21A44539A3CE",
                TakerGets : {
                  currency : "USD",
                  issuer : "r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV",
                  value : "0.52"
                },
                TakerPays : "100000000",
                TransactionType : "OfferCreate",
                TxnSignature : "304402203462F530DCFCC5F57BEE03597F85F0D14E08EE400017F993CFD317F88E75168302201DB03B6B9FC0BFDB5434176C575164F1A7B11DB2F51A7F86C3AE4472CCF23E99",
                hash : "956BF1E33BA2F09EB7C499F2A20D8417CD21BDC0CF0AE63E3004267159B49CFA",
                inLedger : 6366138,
                ledger_index : 6366138,
                meta : {
                  AffectedNodes : [
                    {
                      CreatedNode : {
                        LedgerEntryType : "DirectoryNode",
                        LedgerIndex : "3B0C945A00BD2BE46B64017AD10FE533B69382F941DB55615D06D5073CE0313B",
                        NewFields : {
                          ExchangeRate : "5D06D5073CE0313B",
                          RootIndex : "3B0C945A00BD2BE46B64017AD10FE533B69382F941DB55615D06D5073CE0313B",
                          TakerGetsCurrency : "0000000000000000000000005553440000000000",
                          TakerGetsIssuer : "550FC62003E785DC231A1058A05E56E3F09CF4E6"
                        }
                      }
                    },
                    {
                      CreatedNode : {
                        LedgerEntryType : "Offer",
                        LedgerIndex : "6A33E1C4DD60FED2D37B533B6456889EE097C51A751471BF8ABF9161115C8B66",
                        NewFields : {
                          Account : "rG2pEp6WtqLfThH8wsVM9XYYvy9wSe9Zqu",
                          BookDirectory : "3B0C945A00BD2BE46B64017AD10FE533B69382F941DB55615D06D5073CE0313B",
                          Sequence : 580,
                          TakerGets : {
                            currency : "USD",
                            issuer : "r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV",
                            value : "0.52"
                          },
                          TakerPays : "100000000"
                        }
                      }
                    },
                    {
                      ModifiedNode : {
                        FinalFields : {
                          Account : "rG2pEp6WtqLfThH8wsVM9XYYvy9wSe9Zqu",
                          Balance : "214689277947",
                          Flags : 0,
                          OwnerCount : 28,
                          Sequence : 581
                        },
                        LedgerEntryType : "AccountRoot",
                        LedgerIndex : "A802FB09E89F1512C137F7E16E954C18362B1389A894DD4DE2DDC498E7178A3A",
                        PreviousFields : {
                          Balance : "214689277959",
                          OwnerCount : 27,
                          Sequence : 580
                        },
                        PreviousTxnID : "E9DD46FE3C643B23373DD35FE572A8C4D18037C6D8926D0E0C7BE6BCD9234CAC",
                        PreviousTxnLgrSeq : 6366081
                      }
                    },
                    {
                      ModifiedNode : {
                        FinalFields : {
                          Flags : 0,
                          Owner : "rG2pEp6WtqLfThH8wsVM9XYYvy9wSe9Zqu",
                          RootIndex : "BAC87E7052DDDE978A73DB9C036B6A283809708AD2D1FB5609CC33D021DC3F9D"
                        },
                        LedgerEntryType : "DirectoryNode",
                        LedgerIndex : "BAC87E7052DDDE978A73DB9C036B6A283809708AD2D1FB5609CC33D021DC3F9D"
                      }
                    }
                  ],
                  TransactionIndex : 2,
                  TransactionResult : "tesSUCCESS"
                },
                validated : true
              });
            }
          },
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
          getTransaction: function(opts, callback) {
            callback();
          }
        }
      };

      var req = {
        params: {
          account: 'rG2pEp6WtqLfThH8wsVM9XYYvy9wSe9Zqu',
          identifier: tx_hash
        }
      };

      var res = {
        json: function(status_code, json_response) {}
      };

      var callback = function(err, res){
        expect(err).not.to.exist;

        expect(res).to.contain.keys(['TransactionType', 'Flags', 'Account', 'Sequence', 'TxnSignature', 'TakerPays', 'TakerGets', 'ledger_index', 'meta', 'date']);
        done();
      };

      transactions.getTransactionHelper($, req, res, callback);

    });

    it.skip('should handle OfferCancel transactions', function(done){

      var tx_hash = '2BC30199857879FA3F17C6AF4F4C0D5B294C0E8B30B74E2061676D7ECE378642';

      var containing_ledger = {
        "accepted": true,
        "account_hash": "378393812FEB1EC86ACC50040E8AE3D468EEF8DBE72E3B39915E818E4C460698",
        "close_time": 452193350,
        "close_time_human": "2014-Apr-30 17:15:50",
        "close_time_resolution": 10,
        "closed": true,
        "hash": "9816197E6C1C609A5F1FCC2348D334ACF60037E03EA424E110546A05DC4DE174",
        "ledger_hash": "9816197E6C1C609A5F1FCC2348D334ACF60037E03EA424E110546A05DC4DE174",
        "ledger_index": "6369306",
        "parent_hash": "5A0937AEAEA0A997AD40C615741BD7E5CB3331F34100CB5B1448F8EB392C2031",
        "seqNum": "6369306",
        "totalCoins": "99999993594021285",
        "total_coins": "99999993594021285",
        "transaction_hash": "2339DAB9FF5409D81E49ED89AA5EEA5A07985B9CE8C3046CF512292DB58815E7"
      };

      var $ = {
        remote: {
          requestLedger: function(ledger_index, callback) {
            if (ledger_index === 6369306) {
              callback(null, {
                "ledger": containing_ledger
              });
            } else {
              callback(new Error('Wrong ledger_index'));
            }
          },
          requestTx: function(hash, callback){
            if (hash === tx_hash) {
              callback(null, {
                Account : "rG2pEp6WtqLfThH8wsVM9XYYvy9wSe9Zqu",
                Fee : "12",
                Flags : 0,
                OfferSequence : 580,
                Sequence : 586,
                SigningPubKey : "02B49D2C38E5660F13A1CBD03C9578BA2EEF893D255AA6914F5FEF21A44539A3CE",
                TransactionType : "OfferCancel",
                TxnSignature : "30450220689C26B53AF3013681C179E5FCC5AF400982FBBAAEB3EE477736ABF1BEA6E8B8022100D799A5634EA2CF2C5C427C0739F325C914374C5CAAC686855F1A94A80E192D91",
                hash : "2BC30199857879FA3F17C6AF4F4C0D5B294C0E8B30B74E2061676D7ECE378642",
                inLedger : 6369306,
                ledger_index : 6369306,
                meta : {
                  AffectedNodes : [
                    {
                      DeletedNode : {
                        FinalFields : {
                          ExchangeRate : "5D06D5073CE0313B",
                          Flags : 0,
                          RootIndex : "3B0C945A00BD2BE46B64017AD10FE533B69382F941DB55615D06D5073CE0313B",
                          TakerGetsCurrency : "0000000000000000000000005553440000000000",
                          TakerGetsIssuer : "550FC62003E785DC231A1058A05E56E3F09CF4E6",
                          TakerPaysCurrency : "0000000000000000000000000000000000000000",
                          TakerPaysIssuer : "0000000000000000000000000000000000000000"
                        },
                        LedgerEntryType : "DirectoryNode",
                        LedgerIndex : "3B0C945A00BD2BE46B64017AD10FE533B69382F941DB55615D06D5073CE0313B"
                      }
                    },
                    {
                      DeletedNode : {
                        FinalFields : {
                          Account : "rG2pEp6WtqLfThH8wsVM9XYYvy9wSe9Zqu",
                          BookDirectory : "3B0C945A00BD2BE46B64017AD10FE533B69382F941DB55615D06D5073CE0313B",
                          BookNode : "0000000000000000",
                          Flags : 0,
                          OwnerNode : "0000000000000000",
                          PreviousTxnID : "956BF1E33BA2F09EB7C499F2A20D8417CD21BDC0CF0AE63E3004267159B49CFA",
                          PreviousTxnLgrSeq : 6366138,
                          Sequence : 580,
                          TakerGets : {
                            currency : "USD",
                            issuer : "r3kmLJN5D28dHuH8vZNUZpMC43pEHpaocV",
                            value : "0.52"
                          },
                          TakerPays : "100000000"
                        },
                        LedgerEntryType : "Offer",
                        LedgerIndex : "6A33E1C4DD60FED2D37B533B6456889EE097C51A751471BF8ABF9161115C8B66"
                      }
                    },
                    {
                      ModifiedNode : {
                        FinalFields : {
                          Account : "rG2pEp6WtqLfThH8wsVM9XYYvy9wSe9Zqu",
                          Balance : "214689277875",
                          Flags : 0,
                          OwnerCount : 27,
                          Sequence : 587
                        },
                        LedgerEntryType : "AccountRoot",
                        LedgerIndex : "A802FB09E89F1512C137F7E16E954C18362B1389A894DD4DE2DDC498E7178A3A",
                        PreviousFields : {
                          Balance : "214689277887",
                          OwnerCount : 28,
                          Sequence : 586
                        },
                        PreviousTxnID : "A1DC17366FB43362EA9E24E662967A3E0D1C54DA847E85FD832D38A5051529D6",
                        PreviousTxnLgrSeq : 6369296
                      }
                    },
                    {
                      ModifiedNode : {
                        FinalFields : {
                          Flags : 0,
                          Owner : "rG2pEp6WtqLfThH8wsVM9XYYvy9wSe9Zqu",
                          RootIndex : "BAC87E7052DDDE978A73DB9C036B6A283809708AD2D1FB5609CC33D021DC3F9D"
                        },
                        LedgerEntryType : "DirectoryNode",
                        LedgerIndex : "BAC87E7052DDDE978A73DB9C036B6A283809708AD2D1FB5609CC33D021DC3F9D"
                      }
                    }
                  ],
                  TransactionIndex : 0,
                  TransactionResult : "tesSUCCESS"
                },
                validated : true
              });
            }
          },
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
          getTransaction: function(opts, callback) {
            callback();
          }
        }
      };

      var req = {
        params: {
          account: 'rG2pEp6WtqLfThH8wsVM9XYYvy9wSe9Zqu',
          identifier: tx_hash
        }
      };

      var res = {
        json: function(status_code, json_response) {}
      };

      var callback = function(err, res){
        expect(err).not.to.exist;

        expect(res).to.contain.keys(['TransactionType', 'Flags', 'Account', 'Sequence', 'TxnSignature', 'OfferSequence', 'ledger_index', 'meta', 'date']);
        done();
      };

      transactions.getTransactionHelper($, req, res, callback);

    });

    // it.skip('should handle TrustSet transactions', function(){
    //   // TODO
    // });

    // it.skip('should handle AccountSet transactions', function(){
    //   // TODO
    // });

    // it.skip('should handle RegularKeySet transactions', function(){
    //   // TODO
    // });

  });

  describe('.getAccountTransactions()', function(){

    it.skip('should respond with an error if the account is missing', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        // account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.include('account');
          done();
        }
      }, function(err, resulting_transactions){

      });

    });

    it.skip('should respond with an error if the account is invalid', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'not a valid account'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.message).to.include('account');
          done();
        }
      }, function(err, resulting_transactions){

      });

    });

    it.skip('should report an error if there is no connection to rippled', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          //console.log('dbinterface.getTransaction');
          callback();
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now() - (20 * 1000 + 1);
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.message).to.include('Cannot connect to rippled');
          done();
        }
      }, function(err, resulting_transactions){

      });
       
    });
      
    it.skip('should query the database for failed transactions matching the given opts', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          expect(params.account).to.equal('rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz');
          expect(params.ledger_index_min).to.equal(-1);
          expect(params.ledger_index_max).to.equal(5000000);
          expect(params.earliest_first).to.be.true;
          done();
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: -1,
        ledger_index_max: 5000000,
        binary: false,
        earliest_first: true,
        types: [ 'payment', 'offercreate', 'trustset' ]
      }, {
        json: function(status_code, json_response) {

        }
      }, function(err, resulting_transactions){

      });

    });

    it.skip('should query the Remote for transactions', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          callback();
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};
      remote.requestAccountTx = function(params, callback) {
        expect(params.account).to.equal('rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz');
        expect(params.ledger_index_min).to.equal(-1);
        expect(params.ledger_index_max).to.equal(5000000);
        expect(params.forward).to.be.true;
        done();
      };

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: -1,
        ledger_index_max: 5000000,
        binary: false,
        earliest_first: true,
        types: [ 'payment', 'offercreate', 'trustset' ]
      }, {
        json: function(status_code, json_response) {

        }
      }, function(err, resulting_transactions){

      });

    });

    it.skip('should merge the local and remote transactions and filter them based on the given opts (exclude_failed = true)', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          callback(null, [{

          }]);
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};
      remote.requestAccountTx = function(params, callback) {
        callback(null, {
          transactions: [{
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'Payment',
              hash: 'transaction hash 1',
              ledger_index: 1
            },
              meta: { TransactionResult: 'tesSUCCESS' },
              validated: true
          }, {
            tx: {
              Account: 'other account',
              Destination: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'Payment',
              hash: 'transaction hash 3',
              ledger_index: 10
            },
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, {
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 4',
              ledger_index: 15
            },
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, 

          // The following transactions should not be included in the results
          {
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'TrustSet',
              hash: 'transaction hash 5',
              ledger_index: 15
            },
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, {
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 6',
              ledger_index: 20
            },
            meta: { TransactionResult: 'tecSOMETHING_BAD' },
            validated: true
          }, {
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 4',
              ledger_index: 15
            },
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: false
          }]
        });
      };

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: -1,
        ledger_index_max: 25,
        binary: false,
        earliest_first: true,
        types: [ 'payment', 'offercreate' ],
        exclude_failed: true
      }, {
        json: function(status_code, json_response) {

        }
      }, function(err, resulting_transactions){
        expect(err).not.to.exist;

        function createFindFunction(tx_number) {
          return function(txs){
            return !!_.find(txs, function(tx){
              return tx.hash.indexOf(tx_number) !== -1;
            });
          }
        }

        expect(resulting_transactions).to.have.length(3);
        expect(resulting_transactions).to.satisfy(createFindFunction(1));
        expect(resulting_transactions).to.satisfy(createFindFunction(3));
        expect(resulting_transactions).to.satisfy(createFindFunction(4));

        done();
      });

    });

    it.skip('should merge the local and remote transactions and filter them based on the given opts (exclude_failed = false)', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          callback(null, [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 2',
            ledger_index: 5,
            meta: { TransactionResult: 'tecPATH_DRY' }
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCancel',
            hash: 'transaction hash 7',
            ledger_index: 21,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 8',
            ledger_index: 22,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }]);
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};
      remote.requestAccountTx = function(params, callback) {
        callback(null, {
          transactions: [{
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'Payment',
              hash: 'transaction hash 1',
              ledger_index: 1
            },
              meta: { TransactionResult: 'tesSUCCESS' },
              validated: true
          }, {
            tx: {
              Account: 'other account',
              Destination: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'Payment',
              hash: 'transaction hash 3',
              ledger_index: 10
            },
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, {
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 4',
              ledger_index: 15
            },
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, {
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'TrustSet',
              hash: 'transaction hash 5',
              ledger_index: 15
            },
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, {
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 6',
              ledger_index: 20
            },
            meta: { TransactionResult: 'tecSOMETHING_BAD' },
            validated: true
          }, {
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 4',
              ledger_index: 15
            },
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: false
          }]
        });
      };

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: -1,
        ledger_index_max: 25,
        binary: false,
        earliest_first: false,
        types: [ 'payment', 'offercreate' ],
        exclude_failed: false
      }, {
        json: function(status_code, json_response) {

        }
      }, function(err, resulting_transactions){
        expect(err).not.to.exist;

        function createFindFunction(tx_number) {
          return function(txs){
            return !!_.find(txs, function(tx){
              return tx.hash.indexOf(tx_number) !== -1;
            });
          }
        }

        expect(resulting_transactions).to.have.length(6);
        expect(resulting_transactions).to.satisfy(createFindFunction(1));
        expect(resulting_transactions).to.satisfy(createFindFunction(3));
        expect(resulting_transactions).to.satisfy(createFindFunction(4));
        expect(resulting_transactions).to.satisfy(createFindFunction(2));
        expect(resulting_transactions).to.satisfy(createFindFunction(6));
        expect(resulting_transactions).to.satisfy(createFindFunction(8));

        done();
      });

    });

    it.skip('should sort the transactions based on ledger index and hash for transactions in the same ledger', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          callback(null, [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 1',
            ledger_index: 5,
            meta: { TransactionResult: 'tecPATH_DRY' }
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 3',
            ledger_index: 22,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 5',
            ledger_index: 24,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }]);
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};
      remote.requestAccountTx = function(params, callback) {
        callback(null, {
          transactions: [{
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'Payment',
              hash: 'transaction hash 0',
              ledger_index: 1
            },
              meta: { TransactionResult: 'tesSUCCESS' },
              validated: true
          }, {
            tx: {
              Account: 'other account',
              Destination: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'Payment',
              hash: 'transaction hash 2',
              ledger_index: 10
            },
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, {
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 4',
              ledger_index: 22
            },
            meta: { TransactionResult: 'tecSOMETHING_BAD' },
            validated: true
          }]
        });
      };

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: -1,
        ledger_index_max: 25,
        binary: false,
        earliest_first: false,
        types: [ 'payment', 'offercreate' ],
        exclude_failed: false
      }, {
        json: function(status_code, json_response) {

        }
      }, function(err, resulting_transactions){
        expect(err).not.to.exist;

        function createFindFunction(tx_number) {
          return function(txs){
            return !!_.find(txs, function(tx){
              return tx.hash.indexOf(tx_number) !== -1;
            });
          }
        }

        expect(resulting_transactions[0].hash).to.contain(5);
        expect(resulting_transactions[1].hash).to.contain(4);
        expect(resulting_transactions[2].hash).to.contain(3);
        expect(resulting_transactions[3].hash).to.contain(2);
        expect(resulting_transactions[4].hash).to.contain(1);
        expect(resulting_transactions[5].hash).to.contain(0);

        done();
      });

    });

    it.skip('should reverse the sorting order if earliest_first is set', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          callback(null, [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 1',
            ledger_index: 5,
            meta: { TransactionResult: 'tecPATH_DRY' }
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 3',
            ledger_index: 22,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 5',
            ledger_index: 24,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }]);
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};
      remote.requestAccountTx = function(params, callback) {
        callback(null, {
          transactions: [{
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'Payment',
              hash: 'transaction hash 0',
              ledger_index: 1
            },
              meta: { TransactionResult: 'tesSUCCESS' },
              validated: true
          }, {
            tx: {
              Account: 'other account',
              Destination: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'Payment',
              hash: 'transaction hash 2',
              ledger_index: 10
            },
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, {
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 4',
              ledger_index: 22
            },
            meta: { TransactionResult: 'tecSOMETHING_BAD' },
            validated: true
          }]
        });
      };

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: -1,
        ledger_index_max: 25,
        binary: false,
        earliest_first: true,
        types: [ 'payment', 'offercreate' ],
        exclude_failed: false
      }, {
        json: function(status_code, json_response) {

        }
      }, function(err, resulting_transactions){
        expect(err).not.to.exist;

        function createFindFunction(tx_number) {
          return function(txs){
            return !!_.find(txs, function(tx){
              return tx.hash.indexOf(tx_number) !== -1;
            });
          }
        }

        expect(resulting_transactions[0].hash).to.contain(0);
        expect(resulting_transactions[1].hash).to.contain(1);
        expect(resulting_transactions[2].hash).to.contain(2);
        expect(resulting_transactions[3].hash).to.contain(3);
        expect(resulting_transactions[4].hash).to.contain(4);
        expect(resulting_transactions[5].hash).to.contain(5);

        done();
      });

    });

    it.skip('should merge the transactions with any transactions carried over from a previous recursive call', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          callback(null, [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 3',
            ledger_index: 22,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 5',
            ledger_index: 24,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }]);
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};
      remote.requestAccountTx = function(params, callback) {
        callback(null, {
          transactions: [{
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 4',
              ledger_index: 22
            },
            meta: { TransactionResult: 'tecSOMETHING_BAD' },
            validated: true
          }]
        });
      };

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: -1,
        ledger_index_max: 25,
        binary: false,
        earliest_first: true,
        types: [ 'payment', 'offercreate' ],
        exclude_failed: false,
        previous_transactions: [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 0',
            ledger_index: 1,
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 1',
            ledger_index: 5,
            meta: { TransactionResult: 'tecPATH_DRY' }
          }, {
            Account: 'other account',
            Destination: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 2',
            ledger_index: 10,
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }]
      }, {
        json: function(status_code, json_response) {

        }
      }, function(err, resulting_transactions){
        expect(err).not.to.exist;

        function createFindFunction(tx_number) {
          return function(txs){
            return !!_.find(txs, function(tx){
              return tx.hash.indexOf(tx_number) !== -1;
            });
          }
        }

        expect(resulting_transactions[0].hash).to.contain(0);
        expect(resulting_transactions[1].hash).to.contain(1);
        expect(resulting_transactions[2].hash).to.contain(2);
        expect(resulting_transactions[3].hash).to.contain(3);
        expect(resulting_transactions[4].hash).to.contain(4);
        expect(resulting_transactions[5].hash).to.contain(5);

        done();
      });

    });

    it.skip('should truncate the results if they exceed the opts.max', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          callback(null, [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 3',
            ledger_index: 22,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 5',
            ledger_index: 24,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }]);
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};
      remote.requestAccountTx = function(params, callback) {
        callback(null, {
          transactions: [{
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 4',
              ledger_index: 22
            },
            meta: { TransactionResult: 'tecSOMETHING_BAD' },
            validated: true
          }]
        });
      };

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: -1,
        ledger_index_max: 25,
        binary: false,
        earliest_first: true,
        types: [ 'payment', 'offercreate' ],
        exclude_failed: false,
        max: 5,
        previous_transactions: [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 0',
            ledger_index: 1,
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 1',
            ledger_index: 5,
            meta: { TransactionResult: 'tecPATH_DRY' }
          }, {
            Account: 'other account',
            Destination: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 2',
            ledger_index: 10,
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }]
      }, {
        json: function(status_code, json_response) {

        }
      }, function(err, resulting_transactions){
        expect(err).not.to.exist;

        function createFindFunction(tx_number) {
          return function(txs){
            return !!_.find(txs, function(tx){
              return tx.hash.indexOf(tx_number) !== -1;
            });
          }
        }

        expect(resulting_transactions).to.have.length(5);

        expect(resulting_transactions[0].hash).to.contain(0);
        expect(resulting_transactions[1].hash).to.contain(1);
        expect(resulting_transactions[2].hash).to.contain(2);
        expect(resulting_transactions[3].hash).to.contain(3);
        expect(resulting_transactions[4].hash).to.contain(4);

        done();
      });

    });

    it.skip('should remove the first transactions based on the specified offset', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          callback(null, [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 3',
            ledger_index: 22,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 5',
            ledger_index: 24,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }]);
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};
      remote.requestAccountTx = function(params, callback) {
        callback(null, {
          transactions: [{
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 4',
              ledger_index: 22
            },
            meta: { TransactionResult: 'tecSOMETHING_BAD' },
            validated: true
          }]
        });
      };

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: -1,
        ledger_index_max: 25,
        binary: false,
        earliest_first: true,
        types: [ 'payment', 'offercreate' ],
        exclude_failed: false,
        offset: 2,
        previous_transactions: [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 0',
            ledger_index: 1,
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 1',
            ledger_index: 5,
            meta: { TransactionResult: 'tecPATH_DRY' }
          }, {
            Account: 'other account',
            Destination: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 2',
            ledger_index: 10,
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }]
      }, {
        json: function(status_code, json_response) {

        }
      }, function(err, resulting_transactions){
        expect(err).not.to.exist;

        function createFindFunction(tx_number) {
          return function(txs){
            return !!_.find(txs, function(tx){
              return tx.hash.indexOf(tx_number) !== -1;
            });
          }
        }

        expect(resulting_transactions).to.have.length(4);

        expect(resulting_transactions[0].hash).to.contain(2);
        expect(resulting_transactions[1].hash).to.contain(3);
        expect(resulting_transactions[2].hash).to.contain(4);
        expect(resulting_transactions[3].hash).to.contain(5);

        done();
      });

    });

    it.skip('should call the callback with the transactions if no opts.min is specified', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          callback(null, [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 3',
            ledger_index: 22,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 5',
            ledger_index: 24,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }]);
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};
      remote.requestAccountTx = function(params, callback) {
        callback(null, {
          transactions: [{
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 4',
              ledger_index: 22
            },
            meta: { TransactionResult: 'tecSOMETHING_BAD' },
            validated: true
          }]
        });
      };

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: -1,
        ledger_index_max: 25,
        binary: false,
        earliest_first: true,
        types: [ 'payment', 'offercreate' ],
        exclude_failed: false,
        marker: {
          ledger: 'some ledger',
          seq: 'some seq'
        },
        previous_transactions: [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 0',
            ledger_index: 1,
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 1',
            ledger_index: 5,
            meta: { TransactionResult: 'tecPATH_DRY' }
          }, {
            Account: 'other account',
            Destination: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 2',
            ledger_index: 10,
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }]
      }, {
        json: function(status_code, json_response) {

        }
      }, function(err, resulting_transactions){
        expect(err).not.to.exist;
        expect(resulting_transactions).to.exist;
        expect(resulting_transactions).to.have.length(6);

        done();
      });

    });

    it.skip('should call the callback with the transactions if opts.marker is undefined (meaning rippled had no more transactions to return)', function(done){

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          callback(null, [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 3',
            ledger_index: 22,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'OfferCreate',
            hash: 'transaction hash 5',
            ledger_index: 24,
            meta: { TransactionResult: 'tejSecretUnknown' }
          }]);
        }
      };
       
      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};
      remote.requestAccountTx = function(params, callback) {
        callback(null, {
          transactions: [{
            tx: {
              Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
              TransactionType: 'OfferCreate',
              hash: 'transaction hash 4',
              ledger_index: 22
            },
            meta: { TransactionResult: 'tecSOMETHING_BAD' },
            validated: true
          }]
        });
      };

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: -1,
        ledger_index_max: 25,
        binary: false,
        earliest_first: true,
        types: [ 'payment', 'offercreate' ],
        exclude_failed: false,
        min: 10,
        previous_transactions: [{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 0',
            ledger_index: 1,
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }, {
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 1',
            ledger_index: 5,
            meta: { TransactionResult: 'tecPATH_DRY' }
          }, {
            Account: 'other account',
            Destination: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            TransactionType: 'Payment',
            hash: 'transaction hash 2',
            ledger_index: 10,
            meta: { TransactionResult: 'tesSUCCESS' },
            validated: true
          }]
      }, {
        json: function(status_code, json_response) {

        }
      }, function(err, resulting_transactions){
        expect(err).not.to.exist;
        expect(resulting_transactions).to.exist;
        expect(resulting_transactions).to.have.length(6);

        done();
      });

    });

    it.skip('should call itself recursively until the opts.min requirement is filled', function(done){

      var MIN_TRANSACTIONS = 25;

      var normal_DEFAULT_RESULTS_PER_PAGE = transactions.DEFAULT_RESULTS_PER_PAGE;
      transactions.DEFAULT_RESULTS_PER_PAGE = 5;

      var transaction_list = [];
      for (var t = 0; t < 40; t++) {
        var transaction = {
          tx:{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            hash: 'transaction hash ' + t,
            ledger_index: 2 * t
          },
          meta: { TransactionResult: 'tesSUCCESS' },
          validated: true
        };

        // Make 1/3 of them OfferCreates, the rest Payments
        if (t % 3 === 0) {
          transaction.tx.TransactionType = 'OfferCreate';
        } else {
          transaction.tx.TransactionType = 'Payment';
        }

        transaction_list.push(transaction);
      }

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          callback(null, []);
        }
      };

      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};
      remote.requestAccountTx = function(params, callback) {
        var matching_transactions = [];
        for (var t = 0; t < transaction_list.length; t++) {
          var transaction = transaction_list[t];
          if (transaction.tx.ledger_index >= params.ledger_index_min && 
            transaction.tx.ledger_index <= params.ledger_index_max &&
            (!params.marker || transaction.tx.ledger_index >= params.marker.ledger)) {
            matching_transactions.push(transaction);
          }
          if (matching_transactions.length >= params.limit) {
            break;
          }
        }
        var response = { 
          transactions: matching_transactions 
        };

        if (matching_transactions.length === params.limit) {
          response.marker = {
            ledger: matching_transactions[matching_transactions.length - 1].tx.ledger_index,
            sequence: 1
          };
        }

        callback(null, response);
      };

      var spy = sinon.spy(remote, 'requestAccountTx');

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: 0,
        ledger_index_max: 80,
        types: [ 'payment' ],
        earliest_first: true,
        min: MIN_TRANSACTIONS
      }, {
        json: function(status_code, json_response) {
          expect(false, 'This should not be called');
        }
      }, function(err, resulting_transactions) {
        expect(err).not.to.exist;

        expect(resulting_transactions).to.have.length(MIN_TRANSACTIONS);
        expect(spy.callCount).to.equal(2);
        done();

      });

      transactions.DEFAULT_RESULTS_PER_PAGE = normal_DEFAULT_RESULTS_PER_PAGE;

    });

    it.skip('should call itself recursively until the rippled does not return a marker (meaning there are no more transactions for the account)', function(done){

      var MIN_TRANSACTIONS = 25;

      var normal_DEFAULT_RESULTS_PER_PAGE = transactions.DEFAULT_RESULTS_PER_PAGE;
      transactions.DEFAULT_RESULTS_PER_PAGE = 5;

      var transaction_list = [];
      for (var t = 0; t < 20; t++) {
        var transaction = {
          tx:{
            Account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
            hash: 'transaction hash ' + t,
            ledger_index: 2 * t
          },
          meta: { TransactionResult: 'tesSUCCESS' },
          validated: true
        };

        // Make 1/3 of them OfferCreates, the rest Payments
        if (t % 3 === 0) {
          transaction.tx.TransactionType = 'OfferCreate';
        } else {
          transaction.tx.TransactionType = 'Payment';
        }

        transaction_list.push(transaction);
      }

      var dbinterface = {
        getFailedTransactions: function(params, callback) {
          callback(null, []);
        }
      };

      var remote = new ripple.Remote({
        servers: [ ],
        storage: dbinterface
      });
       
      var Server = new process.EventEmitter;
      Server._lastLedgerClose = Date.now();
      remote._getServer = function() {
        return Server;
      };
      remote.connect = function(){};
      remote.requestAccountTx = function(params, callback) {
        var matching_transactions = [];
        for (var t = 0; t < transaction_list.length; t++) {
          var transaction = transaction_list[t];
          if (transaction.tx.ledger_index >= params.ledger_index_min && 
            transaction.tx.ledger_index <= params.ledger_index_max &&
            (!params.marker || transaction.tx.ledger_index >= params.marker.ledger)) {
            matching_transactions.push(transaction);
          }
          if (matching_transactions.length >= params.limit) {
            break;
          }
        }
        var response = { 
          transactions: matching_transactions 
        };

        if (matching_transactions.length === params.limit) {
          response.marker = {
            ledger: matching_transactions[matching_transactions.length - 1].tx.ledger_index,
            sequence: 1
          };
        }

        callback(null, response);
      };

      var spy = sinon.spy(remote, 'requestAccountTx');

      transactions.getAccountTransactions({
        remote: remote,
        dbinterface: dbinterface
      }, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
        ledger_index_min: 0,
        ledger_index_max: 40,
        types: [ 'payment' ],
        earliest_first: true,
        min: MIN_TRANSACTIONS
      }, {
        json: function(status_code, json_response) {
          expect(false, 'This should not be called');
        }
      }, function(err, resulting_transactions) {
        expect(err).not.to.exist;

        expect(resulting_transactions).to.have.length(20 - Math.ceil(20 / 3));
        expect(spy.callCount).to.equal(1);
        done();

      });

      transactions.DEFAULT_RESULTS_PER_PAGE = normal_DEFAULT_RESULTS_PER_PAGE;

    });

  });

});
