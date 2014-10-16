var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures');
var errors = require('./fixtures').errors;

describe('wallet', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/wallet/new', function(done) {
    self.app
    .get('/v1/wallet/new')
    .expect(200)
    .expect(testutils.checkHeaders)
    .expect(function(res, err) {
      assert.ifError(err);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(typeof res.body.wallet, 'object');
      assert(ripple.UInt160.is_valid(res.body.wallet.address), 'Generated account is invalid');
      assert(ripple.Seed.from_json(res.body.wallet.secret).get_key(res.body.wallet.address), 'Secret is invalid');
    })
    .end(done);
  });
});
