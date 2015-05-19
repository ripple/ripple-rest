'use strict';
var assert = require('assert');
var testutils = require('./testutils');
var fixtures = require('./fixtures').server;
var errors = require('./fixtures').errors;

suite('get server info', function() {
  var self = this;

  // self.wss: rippled mock
  // self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/', function(done) {
    self.app
    .get('/v1')
    .expect(testutils.checkBody(fixtures.RESTServerIndexResponse))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/v1', function(done) {
    self.app
    .get('/v1')
    .expect(testutils.checkBody(fixtures.RESTServerIndexResponse))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/server', function(done) {
    self.app
    .get('/v1/server')
    .expect(function(res, err) {
      assert.ifError(err);
      var expected = JSON.parse(fixtures.RESTServerInfoResponse);
      if (res.body.rippled_server_url) {
        res.body.rippled_server_url = res.body.rippled_server_url.replace(
          /:[0-9]*$/, ':5995');
      }
      assert.deepEqual(res.body, expected);
    })
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/server/connected', function(done) {
    self.app
    .get('/v1/server/connected')
    .expect(testutils.checkBody(fixtures.RESTServerConnectedResponse))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/server/connected -- no ledger close', function(done) {
    var closeTime = new Date();
    closeTime.setSeconds(closeTime.getSeconds() - 60);
    self.remote.getServer()._lastLedgerClose = closeTime.getTime();

    self.app
    .get('/v1/server/connected')
    .expect(testutils.checkBody(errors.RESTCannotConnectToRippleD))
    .expect(testutils.checkStatus(502))
    .expect(testutils.checkHeaders)
    .end(done);
  });
});
