var assert = require('assert');
var ripple = require('ripple-lib');
var remote = require('../lib/remote');
var testutils = require('./testutils');
var fixtures = require('./fixtures').server;
var errors = require('./fixtures').errors;

describe('get server info', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/', function(done) {
    self.wss.once('request_server_info', function(message, conn) {
      assert(false, 'should not request server info');
    });

    self.app
      .get('/v1')
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTServerIndexResponse))
      .end(done);
  });

  it('/v1', function(done) {
    self.wss.once('request_server_info', function(message, conn) {
      assert(false, 'should not request server info');
    });

    self.app
      .get('/v1')
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTServerIndexResponse))
      .end(done);
  });

  it('/server', function(done) {
    self.wss.once('request_server_info', function(message, conn) {
      assert.strictEqual(message.command, 'server_info');
      conn.send(fixtures.serverInfoResponse(message));
    });

    self.app
    .get('/v1/server')
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTServerInfoResponse))
    .end(done);
  });

  it('/server/connected', function(done) {
    self.wss.once('request_server_info', function(message, conn) {
      assert(false, 'Should not request server info');
    });

    self.app
    .get('/v1/server/connected')
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTServerConnectedResponse))
    .end(done);
  });

  it('/server/connected -- no ledger close', function(done) {
    self.wss.once('request_server_info', function(message, conn) {
      assert(false, 'Should not request server info');
    });

    var closeTime = new Date();
    closeTime.setSeconds(closeTime.getSeconds() - 60);
    remote.getServer()._lastLedgerClose = closeTime.getTime();

    self.app
    .get('/v1/server/connected')
    .expect(testutils.checkStatus(502))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTNoLedgerClose))
    .end(done);
  });
});
