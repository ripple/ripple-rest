'use strict';

/* eslint-disable max-len */

var testutils = require('./testutils');
var fixtures = require('./fixtures').transactions;
var hashes = require('./fixtures/hashes');
var errors = require('./fixtures').errors;
var requestPath = fixtures.requestPath;

suite('get transaction', function() {
  var self = this;

  // self.wss: rippled mock
  // self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/transactions/:identifier', function(done) {
    self.app
    .get(requestPath(hashes.VALID_TRANSACTION_HASH))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTTransactionResponse))
    .end(done);
  });

  test('/transactions/:identifier -- invalid transaction hash', function(done) {
    self.app
    .get(requestPath(hashes.INVALID_TRANSACTION_HASH))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(
      errors.RESTInvalidTransactionHashOrClientResourceID))
    .end(done);
  });

  test('/transactions/:identifier -- non-existent transaction hash', function(done) {
    self.app
    .get(requestPath(hashes.NOTFOUND_TRANSACTION_HASH))
    .expect(testutils.checkStatus(404))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTTransactionNotFound))
    .end(done);
  });

  test('/transactions/:identifier?ledger', function(done) {
    self.app
    .get(requestPath(hashes.NOTFOUND_TRANSACTION_HASH) + '?min_ledger=32570&max_ledger=32572')
    .expect(testutils.checkStatus(404))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTTransactionNotFound))
    .end(done);
  });

  test('/transactions/:identifier?ledger -- invalid ledger', function(done) {
    self.app
    .get(requestPath(hashes.VALID_TRANSACTION_HASH) + '?min_ledger=asdf&max_ledger=asdf')
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/transactions/:identifier?ledger -- invalid ledger range', function(done) {
    self.app
    .get(requestPath(hashes.VALID_TRANSACTION_HASH) + '?min_ledger=2&max_ledger=1')
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/transactions/:identifier?ledger -- missing ledger', function(done) {
    self.app
    .get(requestPath(hashes.VALID_TRANSACTION_HASH) + '?min_ledger=1&max_ledger=2')
    .expect(testutils.checkStatus(404))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerNotFound))
    .end(done);
  });
});
