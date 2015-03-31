var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').server;
var errors = require('./fixtures').errors;

suite('get server info', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/', function(done) {
    self.wss.once('request_server_info', function(message, conn) {
      assert(false, 'should not request server info');
    });

    self.app
    .get('/v1')
    .expect(testutils.checkBody(fixtures.RESTServerIndexResponse))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/v1', function(done) {
    self.wss.once('request_server_info', function(message, conn) {
      assert(false, 'should not request server info');
    });

    self.app
    .get('/v1')
    .expect(testutils.checkBody(fixtures.RESTServerIndexResponse))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/server', function(done) {
    self.wss.once('request_server_info', function(message, conn) {
      assert.strictEqual(message.command, 'server_info');
      conn.send(fixtures.serverInfoResponse(message));
    });

    self.app
    .get('/v1/server')
    .expect(testutils.checkBody(fixtures.RESTServerInfoResponse))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/server/connected', function(done) {
    self.wss.once('request_server_info', function(message, conn) {
      assert(false, 'Should not request server info');
    });

    self.app
    .get('/v1/server/connected')
    .expect(testutils.checkBody(fixtures.RESTServerConnectedResponse))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/server/connected -- no ledger close', function(done) {
    self.wss.once('request_server_info', function(message, conn) {
      assert(false, 'Should not request server info');
    });

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
