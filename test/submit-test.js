'use strict';
var testutils = require('./testutils');
var fixtures = require('./fixtures/submit');

suite('submit', function() {
  var self = this;
  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/transaction/submit', function(done) {
    self.wss.once('request_submit', function(message, conn) {
      conn.send(fixtures.submitRippledResponse(message));
    });

    self.app
      .post(testutils.getSubmitURL())
      .send(fixtures.submitRequest)
      .expect(testutils.checkBody(fixtures.submitResponse))
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .end(done);
  });
});
