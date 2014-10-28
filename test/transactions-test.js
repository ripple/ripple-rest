var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').transactions;
var errors = require('./fixtures').errors;
var requestPath = fixtures.requestPath;

suite('get transaction', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/transactions/:identifier', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert.strictEqual(message.command, 'tx');
      assert.strictEqual(message.transaction, fixtures.VALID_TRANSACTION_HASH);
      conn.send(fixtures.transactionResponse(message));
    });

    self.app
    .get(requestPath(fixtures.VALID_TRANSACTION_HASH))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTTransactionResponse))
    .end(done);
  });

  test('/transactions/:identifier -- invalid transaction hash', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert(false, 'Should not request transaction');
    });

    self.app
    .get(requestPath(fixtures.INVALID_TRANSACTION_HASH))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidTransactionHash))
    .end(done);
  });

  test('/transactions/:identifier -- non-existent transaction hash', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert.strictEqual(message.command, 'tx');
      assert.strictEqual(message.transaction, fixtures.VALID_TRANSACTION_HASH);
      conn.send(fixtures.transactionNotFoundResponse(message));
    });

    self.app
    .get(requestPath(fixtures.VALID_TRANSACTION_HASH))
    .expect(testutils.checkStatus(404))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTTransactionNotFound))
    .end(done);
  });
});
