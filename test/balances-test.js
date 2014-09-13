var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').balances;
var errors = require('./fixtures').errors;

describe('get balances', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/accounts/:account/balances', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, 'rLy6UWsjzxsQrTATf1bwDYSaJMoTGvfY2Q');
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, 'rLy6UWsjzxsQrTATf1bwDYSaJMoTGvfY2Q');
      conn.send(fixtures.accountLinesResponse(message));
    });

    self.app
    .get('/v1/accounts/rLy6UWsjzxsQrTATf1bwDYSaJMoTGvfY2Q/balances')
    .expect(200)
    .expect(testutils.checkHeaders)
    .expect(function(res, err) {
      assert.ifError(err);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(JSON.stringify(res.body), fixtures.RESTAccountBalancesResponse);
    })
    .end(done);
  });

  it('/accounts/:account/balances -- invalid account', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });
    self.wss.once('request_account_lines', function(message, conn) {
      assert(false, 'Should not request account lines');
    });

    self.app
    .get('/v1/accounts/rxxLy6UWsjzxsQrTATf1bwDYSaJMoTGvfY2Q/trustlines')
    .expect(400)
    .expect(testutils.checkHeaders)
    .expect(function(res, err) {
      assert.ifError(err);
      assert.deepEqual(JSON.stringify(res.body), errors.RESTInvalidAccount);
    })
    .end(done);
  });
});
