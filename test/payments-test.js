var assert = require('assert');
var ripple = require('ripple-lib');
var _ = require('lodash');
var testutils = require('./testutils');
var fixtures = require('./fixtures').payments;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;
var requestPath = fixtures.requestPath;
var Payments = require('./../api/payments');

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
    .expect(testutils.checkBody(fixtures.RESTTransactionResponse(fixtures.VALID_TRANSACTION_HASH)))
    .end(done);
  });

  test('/accounts/:account/payments/:identifier -- with memos', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert.strictEqual(message.command, 'tx');
      assert.strictEqual(message.transaction, fixtures.VALID_TRANSACTION_HASH_MEMO);
      conn.send(fixtures.transactionResponseWithMemo(message));
    });

    self.wss.once('request_ledger', function(message, conn) {
      assert.strictEqual(message.command, 'ledger');
      conn.send(fixtures.ledgerResponse(message));
    });

    self.app
    .get(requestPath('rGUpotx8YYDiocqS577N4T1p1kHBNdEJ9s') + '/' + fixtures.VALID_TRANSACTION_HASH_MEMO)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTTransactionResponseWithMemo))
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
    .expect(testutils.checkBody(errors.RESTInvalidTransactionHash))
    .end(done);
  });
});

suite('post payments', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

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
    .send(fixtures.nonXrpPaymentWithoutIssuer)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTTransactionResponse(fixtures.VALID_SUBMITTED_TRANSACTION_HASH)))
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
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments?validated=true')
    .send(fixtures.nonXrpPaymentWithoutIssuer)
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTResponseLedgerSequenceTooHigh))
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
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments?validated=true')
    .send(fixtures.nonXrpPaymentWithoutIssuer)
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTResponseDestinationTagNeeded))
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
    .send(fixtures.nonXrpWithFee(10))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithMaxFeeExceeded))
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
    .send(fixtures.nonXrpPaymentWithoutIssuer)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithIssuer))
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

      process.nextTick(function () {
        conn.send(fixtures.transactionVerifiedResponse());
      });
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments?validated=false')
    .send(fixtures.nonXrpPaymentWithoutIssuer)
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTResponseLedgerSequenceTooHigh))
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
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments?validated=false')
    .send(fixtures.nonXrpPaymentWithoutIssuer)
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTResponseDestinationTagNeeded))
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
    .send(fixtures.nonXrpWithFee(10))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithMaxFeeExceeded))
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
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.nonXrpPaymentWithoutIssuer)
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTResponseLedgerSequenceTooHigh))
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
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.nonXrpPaymentWithoutIssuer)
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTResponseDestinationTagNeeded))
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
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    body.payment.memos = "some string";

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(body)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTResponseNonArrayMemo))
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
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    body.payment.memos = [];

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(body)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTResponseEmptyMemosArray))
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
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    body.payment.memos[0].MemoType = 1;

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(body)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTResponseMemoTypeInt))
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
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    body.payment.memos[0].MemoData = 1;

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(body)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTResponseMemoDataInt))
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

      process.nextTick(function(){
        conn.send(fixtures.rippledSuccessResponse(message));
      });
    });

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    delete body.payment.memos[0].MemoData;

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(body)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTResponseMissingMemoData))
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

      process.nextTick(function(){
        conn.send(fixtures.rippledSuccessResponse(message));
      });
    })

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.paymentWithMemo)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTPaymentWithMemoResponse))
    .end(done);
  });

  test('/payments -- successful payment with issuer', function(done){
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message));

      process.nextTick(function(){
        conn.send(fixtures.rippledSuccessResponse(message));
      });
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.nonXrpPaymentWithIssuer)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithIssuer))
    .end(done);
  });

  test('/payments -- without issuer', function(done){
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message));

      process.nextTick(function(){
        conn.send(fixtures.rippledSuccessResponse(message));
      });
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.nonXrpPaymentWithoutIssuer)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithIssuer))
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
    .send(fixtures.nonXrpPaymentWithInvalidSecret)
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithInvalidsecret))
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
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.nonXrpWithLastLedgerSequence(1))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithHighLedgerSequence))
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

      process.nextTick(function(){
        conn.send(fixtures.rippledSuccessResponse(message, { LastLedgerSequence: 9036185 }));
      });
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.nonXrpWithLastLedgerSequence(9036185))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithIssuer))
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

    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.nonXrpWithFee(15))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithInsufficientFee))
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
    .send(fixtures.nonXrpWithFee(10))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithMaxFeeExceeded))
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

      process.nextTick(function(){
        conn.send(fixtures.rippledSuccessResponse(message, { Fee: '12' }));
      });
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/payments')
    .send(fixtures.nonXrpWithFee(1200))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithIssuer))
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
      .send(fixtures.xrpPayment('1'))
      .expect(testutils.checkStatus(500))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTErrorResponse({
        type: 'transaction',
        error: 'tecNO_DST_INSUF_XRP',
        message:'Destination does not exist. Too little XRP sent to create it.'

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
      .send(fixtures.xrpPayment('1'))
      .expect(testutils.checkStatus(500))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTErrorResponse({
        type: 'transaction',
        error: 'terINSUF_FEE_B',
        message:'Account balance can\'t pay fee.'

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
      .send(fixtures.xrpPayment('1'))
      .expect(testutils.checkStatus(500))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTErrorResponse({
        type: 'transaction',
        error: 'terNO_ACCOUNT',
        message:'The source account does not exist.'

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

    var secondPayment = function() {
      // 2nd payment
      self.app.post('/v1/accounts/' + addresses.VALID + '/payments')
        .send(fixtures.xrpPayment('1', {clientResourceId: 'id'}))
        .expect(testutils.checkStatus(500))
        .expect(testutils.checkHeaders)
        .expect(testutils.checkBody(fixtures.RESTErrorResponse({
          type: 'server',
          error: 'Duplicate Transaction',
          message: 'A record already exists in the database for a transaction of this type with the same client_resource_id. If this was not an accidental resubmission please submit the transaction again with a unique client_resource_id'
        })))
        .end(done);
    };

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.xrpPayment('1', {clientResourceId: 'id'}))
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTSuccessResponse({clientResourceId: 'id'})))
      .end(secondPayment);
  });

});
/*
//
// Unit test payments
//
suite('unit test payments', function() {

test('should parse payment tx', function(done) {
var transaction = Payments._parsePaymentFromTx(fixtures.txPayment, { account: 'rGUpotx8YYDiocqS577N4T1p1kHBNdEJ9s' }, function(err){
assert(false, 'callback should not have been called');
});
assert.deepEqual(transaction, fixtures.RESTResponsePayment);
done();
});

test('should parse partial payment tx', function(done) {
var transaction = Payments._parsePaymentFromTx(fixtures.txPartialPayment, { account: 'rDuV4ndTFUn5NjLJSTNfEFMTxqQVeafvxC' }, function(err){
assert(false, 'callback should not have been called');
});
assert.deepEqual(transaction, fixtures.RESTResponsePartialPayment);
done();
});

});
*/
