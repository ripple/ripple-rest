var http = require('supertest');
var app = require(__dirname+'/../../lib/express_app.js');
var assert = require('assert');

describe('Info HTTP resource', function() {
  before(function(next) {
    setTimeout(next, 10000);
  });
  it.skip('should report server status', function(next) {
    this.timeout(10000);
    http(app)
      .get('/v1/server')
      .expect(200)
      .end(function(error, response) {
        assert.strictEqual(response.body.success, true);
        assert.strictEqual(response.body.api_documentation_url, 'https://github.com/ripple/ripple-rest');
        next();
      });
  });
  it('should response to isConnected', function(next) {
    this.timeout(10000);
    http(app)
      .get('v1/server/connected')
      .expect(200)
      .end(function(error, response) {
        console.log(error, response.body);
        assert.strictEqual(response.body.success, true);
        assert.strictEqual(response.body.connected, true);
        next();
      });
  });
});

