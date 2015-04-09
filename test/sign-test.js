'use strict';
var testutils = require('./testutils');
var fixtures = require('./fixtures/sign');

suite('sign', function() {
  var self = this;
  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/transaction/sign', function(done) {
    testutils.withDeterministicPRNG(function(_done) {
      self.app
        .post(testutils.getSignURL())
        .send(fixtures.signRequest)
        .expect(testutils.checkBody(fixtures.signResponse))
        .expect(testutils.checkStatus(200))
        .expect(testutils.checkHeaders)
        .end(_done);
    }, done);
  });
});
