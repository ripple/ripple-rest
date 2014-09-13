var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').settings;
var errors = require('./fixtures').errors;

describe('get settings', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/accounts/:account/settings', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, 'rLy6UWsjzxsQrTATf1bwDYSaJMoTGvfY2Q');
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.app
    .get('/v1/accounts/rLy6UWsjzxsQrTATf1bwDYSaJMoTGvfY2Q/settings')
    .expect(200)
    .expect(testutils.checkHeaders)
    .expect(function(res, err) {
      assert.ifError(err);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(JSON.stringify(res.body), fixtures.RESTAccountSettingsResponse);
    })
    .end(done);
  });

  it('/accounts/:account/settings -- invalid account', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.app
    .get('/v1/accounts/rxxLy6UWsjzxsQrTATf1bwDYSaJMoTGvfY2Q/settings')
    .expect(400)
    .expect(testutils.checkHeaders)
    .expect(function(res, err) {
      assert.ifError(err);
      assert.deepEqual(JSON.stringify(res.body), errors.RESTInvalidAccount);
    })
    .end(done);
  });
});
