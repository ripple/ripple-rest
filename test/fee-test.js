var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures');
var errors = require('./fixtures').errors;
var utils = require('../api/lib/utils');

suite('get fee', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/transaction-fee', function(done) {
    self.app
    .get('/v1/transaction-fee')
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(function(res, err) {
      assert.ifError(err);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.fee, '0.000012');
    })
    .end(done);
  });

  test('/transaction-fee -- increased fee', function(done) {
    self.remote._servers[0].emit('message', {
      type: 'serverStatus',
      load_base: 256,
      load_factor: 256 * 2,
      server_status: 'full'
    });

    self.app
    .get('/v1/transaction-fee')
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(function(res, err) {
      assert.ifError(err);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.fee, utils.dropsToXrp('24'));
    })
    .end(done);
  });
});
