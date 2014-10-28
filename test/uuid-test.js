var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures');
var errors = require('./fixtures').errors;

suite('get uuid', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/uuid', function(done) {
    self.app
    .get('/v1/uuid')
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(function(res, err) {
      assert.ifError(err);
      assert.strictEqual(res.body.success, true);
      assert(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/.test(res.body.uuid));
    })
    .end(done);
  });
});
