var http = require('supertest');
var app = require(__dirname+'/../../lib/express_app.js');
var assert = require('assert');
var remote = require(__dirname+'/../../lib/remote.js');

describe('Info HTTP resource', function() {
  before(function(done) {
    remote.connect(done);
  });
  it('should report server status', function(next) {
    http(app)
      .get('/v1/server')
      .expect(200)
      .end(function(error, response) {
        assert.strictEqual(response.body.success, true);
        assert.strictEqual(response.body.api_documentation_url, 'https://github.com/ripple/ripple-rest');
        assert(response.body.rippled_server_status);
        assert(response.body.rippled_server_status.peers);
        next();
      });
  });
  it.skip('should response to isConnected', function(next) {
    this.timeout(10000);
    http(app)
      .get('v1/server/connected')
      .expect(200)
      .end(function(error, response) {
        console.log(response);
        console.log(error, response.body);
        assert.strictEqual(response.body.success, true);
        assert.strictEqual(response.body.connected, true);
        next();
      });
  });
});

