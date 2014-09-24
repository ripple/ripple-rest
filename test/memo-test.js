var assert = require('assert');
var ripple = require('ripple-lib');
var _ = require('lodash');
var testutils = require('./testutils');
var fixtures = require('./fixtures').memos;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;

describe('payments with memo field', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/payments -- post payment with invalid memos property', function(done) {

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    body.payment.memos = "some string";

    self.app
      .post('/v1/payments')
      .send(body)
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTResponseNonArrayMemo))
      .end(done);
  });

  it('/payments -- post payment with empty memos array', function(done) {

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    body.payment.memos = [];

    self.app
      .post('/v1/payments')
      .send(body)
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTResponseEmptyMemosArray))
      .end(done);
  });

  it('/payments -- post payment with memo field, MemoType int', function(done) {

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    body.payment.memos[0].MemoType = 1;

    self.app
      .post('/v1/payments')
      .send(body)
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTResponseMemoTypeInt))
      .end(done);
  });

  it('/payments -- post payment with memo field, MemoData int', function(done) {

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    body.payment.memos[0].MemoData = 1;

    self.app
      .post('/v1/payments')
      .send(body)
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTResponseMemoDataInt))
      .end(done);
  });

  it('/payments -- post payment with memo field, forget MemoData', function(done) {

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    delete body.payment.memos[0].MemoData;

    self.app
      .post('/v1/payments')
      .send(body)
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTResponseMissingMemoData))
      .end(done);
  });

  it('/payments -- post payment with memo field', function(done) {

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    })

    self.app
      .post('/v1/payments')
      .send(fixtures.paymentWithMemo)
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTPaymentWithMemoResponse))
      .end(done);
  });

});
