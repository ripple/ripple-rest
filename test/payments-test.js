var _           = require('lodash');
var assert      = require('assert');
var ripple      = require('ripple-lib');
var testutils   = require('./testutils');
var fixtures    = require('./fixtures').payments;
var errors      = require('./fixtures').errors;
var addresses   = require('./fixtures').addresses;
var utils       = require('./../lib/utils');
var requestPath = fixtures.requestPath;

suite('get payments', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/payments/:identifier', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert.strictEqual(message.command, 'tx');
      assert.strictEqual(message.transaction, fixtures.VALID_TRANSACTION_HASH);
      conn.send(fixtures.transactionResponse(message));
    });

    self.app
    .get(requestPath(addresses.VALID) + '/' + fixtures.VALID_TRANSACTION_HASH)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTTransactionResponse()))
    .end(done);
  });

  test('/accounts/:account/payments/:identifier -- with memos', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert.strictEqual(message.command, 'tx');
      assert.strictEqual(message.transaction, fixtures.VALID_TRANSACTION_HASH_MEMO);
      conn.send(fixtures.transactionResponse(message, {
        memos: [
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
        ]
      }));
    });

    self.wss.once('request_ledger', function(message, conn) {
      assert.strictEqual(message.command, 'ledger');
      conn.send(fixtures.ledgerResponse(message));
    });

    self.app
    .get(requestPath(addresses.VALID) + '/' + fixtures.VALID_TRANSACTION_HASH_MEMO)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTTransactionResponse({
      memos: [
        {
          MemoData: "736F6D655F76616C7565",
          MemoType: "736F6D655F6B6579"
        },
        {
          MemoData: "736F6D655F76616C7565"
        }
      ]
    })))
    .end(done);
  });

  test('/accounts/:account/payments/:identifier -- invalid identifier', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert(false, 'Should not request transaction');
    });

    self.app
    .get(requestPath(addresses.VALID) + '/' + fixtures.INVALID_TRANSACTION_HASH)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'Transaction not found',
      message: 'A transaction hash was not supplied and there were no entries matching the client_resource_id.'
    })))
    .end(done);
  });
});

suite('post payments', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/payments -- successful payment with issuer', function(done){
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message, {hash: hash}));
    });

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.payment({
        value: '0.001',
        currency: 'USD',
        issuer: addresses.ISSUER,
        hash: hash
      }))
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTSuccessResponse()))
      .end(done);
  });

  test('/payments -- without issuer', function(done){
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message, {hash: hash}));
    });

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.payment({
        value: '0.001',
        currency: 'USD',
        hash: hash
      }))
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTSuccessResponse()))
      .end(done);
  });

  test('/payments -- with fixed fee', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.Fee, '5000000');
      conn.send(fixtures.requestSubmitResponse(message, {
        hash: hash,
        fee: '5000000'
      }));
    });

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.payment({
        value: '0.001',
        currency: 'USD',
        hash: hash,
        fixed_fee: '5'
      }))
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTSuccessResponse()))
      .end(done);
  });

  test('/payments -- hex currency gold with issuer', function(done){
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message, {hash: hash}));
    });

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.payment({
        value: '0.0001',
        currency: '015841550000000041F78E0A28CBF19200000000',
        issuer: addresses.VALID,
        hash: hash
      }))
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTSuccessResponse()))
      .end(done);
  });

  test('/payments -- with validated true, valid submit response, and transaction verified response', function(done){
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message));

      process.nextTick(function () {
        conn.send(fixtures.transactionVerifiedResponse());
      });
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments?validated=true')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD'
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTTransactionResponse({ 
      hash: fixtures.VALID_SUBMITTED_TRANSACTION_HASH 
    })))
    .end(done);
  });

  test('/payments -- with validated true and fixed fee', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.Fee, '5000000');
      conn.send(fixtures.requestSubmitResponse(message, {
        hash: hash,
        fee: '5000000'
      }));

      process.nextTick(function () {
        conn.send(fixtures.transactionVerifiedResponse({
          hash: hash,
          fee: '5000000'
        }));
      });
    });

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments?validated=true')
      .send(fixtures.payment({
        value: '0.001',
        currency: 'USD',
        fixed_fee: '5'
      }))
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTTransactionResponse({ 
        hash: hash,
        fee: '5'
      })))
      .end(done);
  });

  test('/payments -- hex currency gold with validated true, valid submit response, and transaction verified response', function(done){
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message, {hash: hash}));

      process.nextTick(function () {
        conn.send(fixtures.verifiedResponseComplexCurrency({hash: hash}));
      });
    });

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments?validated=true')
      .send(fixtures.payment({
        value: '0.0001',
        currency: '015841550000000041F78E0A28CBF19200000000',
        issuer: addresses.VALID,
        hash: hash
      }))
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTTransactionResponseComplexCurrencies({
        hash: hash
      })))
      .end(done);
  });

  test('/payments -- with validated true and ledger sequence too high error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.ledgerSequenceTooHighResponse(message));
      testutils.closeLedgers(conn);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments?validated=true')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD'
    }))
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/payments -- with validated true and destination tag needed error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.destinationTagNeededResponse(message));
      testutils.closeLedgers(conn);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments?validated=true')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD'
    }))
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/payments -- with validated true and max fee exceeded error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments?validated=true')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD',
      issuer: addresses.ISSUER,
      max_fee: utils.dropsToXrp(10)
    }))
    .expect(testutils.checkBody(errors.RESTMaxFeeExceeded))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/payments -- with validated false and a valid submit response', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments?validated=false')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD'
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSuccessResponse()))
    .end(done);
  });

  test('/payments -- with validated false and ledger sequence too high error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.ledgerSequenceTooHighResponse(message));
      testutils.closeLedgers(conn);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments?validated=false')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD'
    }))
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/payments -- with validated false and destination tag needed error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.destinationTagNeededResponse(message));
      testutils.closeLedgers(conn);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments?validated=false')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD'
    }))
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/payments -- with validated false and max fee exceeded error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments?validated=false')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD',
      issuer: addresses.ISSUER,
      max_fee: 0.000010
    }))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTMaxFeeExceeded))
    .end(done);
  });

  test('/payments -- ledger sequence too high error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.ledgerSequenceTooHighResponse(message));
      testutils.closeLedgers(conn);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD'
    }))
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/payments -- destination tag needed error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.destinationTagNeededResponse(message));
      testutils.closeLedgers(conn);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD'
    }))
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/payments -- with invalid memos', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      memos: 'some string'
    }))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'Invalid parameter: memos',
      message: 'Must be an array with memo objects'
    })))
    .end(done);
  });

  test('/payments -- with empty memos array', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      memos: []
    }))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'Invalid parameter: memos',
      message: 'Must contain at least one Memo object, otherwise omit the memos property'
    })))
    .end(done);
  });

  test('/payments -- with memo containing a MemoType field with an int value', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      memos: [
        {
          "MemoType": 1,
          "MemoData": "some_value"
        },
        {
          "MemoData": "some_value"
        }
      ]
    }))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'Invalid parameter: MemoType',
      message: 'MemoType must be a string'
    })))
    .end(done);
  });

  test('/payments -- with memo containing a MemoData field with an int value', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      memos: [
        {
          "MemoType": "some_key",
          "MemoData": 1
        },
        {
          "MemoData": "some_value"
        }
      ]
    }))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'Invalid parameter: MemoData',
      message: 'MemoData must be a string'
    })))
    .end(done);
  });

  test('/payments -- with memo, omit MemoData', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      memos: [
        {
          "MemoData": "some_value"
        }
      ]
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSuccessResponse()))
    .end(done);
  });

  test('/payments -- with memo', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      memos: [
        {
          "MemoType": "some_key",
          "MemoData": "some_value"
        },
        {
          "MemoData": "some_value"
        }
      ]
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSuccessResponse()))
    .end(done);
  });

  test('/payments -- with invalid secret', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false);
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      secret: 'foo'
    }))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidSecret))
    .end(done);
  });

  test('/payments -- with ledger sequence below current', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.ledgerSequenceTooHighResponse(message, 1));
      testutils.closeLedgers(conn);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD',
      issuer: addresses.issuer,
      lastLedgerSequence: 1
    }))
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/payments -- with ledger sequence above current', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.LastLedgerSequence, 9036185);
      conn.send(fixtures.requestSubmitResponse(message, { LastLedgerSequence: 9036185 }));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD',
      issuer: addresses.issuer,
      lastLedgerSequence: 9036185
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSuccessResponse()))
    .end(done);
  });

  test('/payments -- with max fee set above computed fee but below expected server fee and remote\'s local_fee flag turned off', function(done) {
    self.app.remote.local_fee = false;

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');

      conn.send(fixtures.rippledSubmitErrorResponse(message, {
        Fee: '15',
        engineResult: 'telINSUF_FEE_P',
        engineResultCode: '-394',
        engineResultMessage: 'Fee insufficient.'
      }));

      testutils.closeLedgers(conn);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD',
      issuer: addresses.ISSUER,
      max_fee: 0.000015
    }))
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/payments -- with max fee set below computed fee', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD',
      issuer: addresses.ISSUER,
      max_fee: 0.000010
    }))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTMaxFeeExceeded))
    .end(done);
  });

  test('/payments -- with max fee set above expected server fee', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.Fee, '12');
      conn.send(fixtures.requestSubmitResponse(message, { Fee: '12' }));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.payment({
      value: '0.001',
      currency: 'USD',
      issuer: addresses.ISSUER,
      max_fee: 0.001200
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSuccessResponse()))
    .end(done);
  });

  test('/payments -- with not enough XRP to create a new account', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_subscribe', function(message, conn) {
      assert.strictEqual(message.command, 'subscribe');
      assert.strictEqual(message.accounts[0], addresses.VALID);
      conn.send(fixtures.rippledSubcribeResponse(message));
    });

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(so.Amount, '1000000');
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.rippledSubmitErrorResponse(message, {
        engineResult: 'tecNO_DST_INSUF_XRP',
        engineResultCode: '125',
        engineResultMessage: 'This should not show up, is not a validated result',
        hash: hash
      }));

      process.nextTick(function () {
        conn.send(fixtures.rippledValidatedErrorResponse(message, {
          engineResult: 'tecNO_DST_INSUF_XRP',
          engineResultCode: '125',
          engineResultMessage: 'Destination does not exist. Too little XRP sent to create it.',
          hash: hash
        }));
      });
    });

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.payment())
      .expect(testutils.checkStatus(500))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(errors.RESTErrorResponse({
        type: 'transaction',
        error: 'tecNO_DST_INSUF_XRP',
        message: 'Destination does not exist. Too little XRP sent to create it.'
      })))
      .end(done);
  });

  test('/payments -- with not enough balance to pay the fee', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_subscribe', function(message, conn) {
      assert.strictEqual(message.command, 'subscribe');
      assert.strictEqual(message.accounts[0], addresses.VALID);
      conn.send(fixtures.rippledSubcribeResponse(message));
    });

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.rippledSubmitErrorResponse(message, {
        engineResult: 'terINSUF_FEE_B',
        engineResultCode: '-99',
        engineResultMessage: 'Account balance can\'t pay fee.',
        hash: hash
      }));
    });

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.payment())
      .expect(testutils.checkStatus(500))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(errors.RESTErrorResponse({
        type: 'transaction',
        error: 'terINSUF_FEE_B',
        message: 'Account balance can\'t pay fee.'
      })))
      .end(done);
  });

  test('/payments -- with an unfunded account', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_subscribe', function(message, conn) {
      assert.strictEqual(message.command, 'subscribe');
      assert.strictEqual(message.accounts[0], addresses.VALID);
      conn.send(fixtures.rippledSubcribeResponse(message));
    });

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.rippledSubmitErrorResponse(message, {
        engineResult: 'terNO_ACCOUNT',
        engineResultCode: '-96',
        engineResultMessage: 'The source account does not exist.',
        hash: hash
      }));
    });

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.payment())
      .expect(testutils.checkStatus(500))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(errors.RESTErrorResponse({
        type: 'transaction',
        error: 'terNO_ACCOUNT',
        message: 'The source account does not exist.'

      })))
      .end(done);
  });

  test('/payments -- with a duplicate client resource id', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message));

      self.wss.once('request_submit', function(message, conn) {
        // second payment should not hit submit
        assert(false);
      });
    });

    var secondPayment = function(err) {
      if (err) {
        assert(false);
        return done(err);
      }

      // 2nd payment
      self.app.post('/v1/accounts/' + addresses.VALID + '/payments')
        .send(fixtures.payment({
          clientResourceId: 'id'
        }))
        .expect(testutils.checkStatus(500))
        .expect(testutils.checkHeaders)
        .expect(testutils.checkBody(errors.RESTErrorResponse({
          type: 'server',
          error: 'Duplicate Transaction',
          message: 'A record already exists in the database for a transaction of this type with the same client_resource_id. If this was not an accidental resubmission please submit the transaction again with a unique client_resource_id'
        })))
        .end(done);
    };

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.payment({
        clientResourceId: 'id'
      }))
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTSuccessResponse({
        clientResourceId: 'id'
      })))
      .end(secondPayment);
  });
});
