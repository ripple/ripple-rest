var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').payments;
var errors = require('./fixtures').errors;

describe('get payments', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/accounts/:account/payments/:identifier', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert.strictEqual(message.command, 'tx');
      assert.strictEqual(message.transaction, 'F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF');
      conn.send(fixtures.transactionResponse(message));
    });

    self.app
    .get('/v1/accounts/r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59/payments/F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF')
    .expect(200)
    .expect(testutils.checkHeaders)
    .expect(function(res, err) {
      assert.ifError(err);
      assert.strictEqual(res.body.success, true);
      assert.deepEqual(JSON.stringify(res.body), fixtures.RESTTransactionResponse);
    })
    .end(done);
  });

  it('/accounts/:account/payments/:identifier -- invalid identifier', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert(false, 'Should not request transaction');
    });

    self.app
    .get('/v1/accounts/r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59/payments/XF4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF')
    .expect(404) //XXX Should be 400
    .expect(testutils.checkHeaders)
    .expect(function(res, err) {
      assert.strictEqual(JSON.stringify(res.body), errors.RESTInvalidTransactionHash);
    })
    .end(done);
  });
});
