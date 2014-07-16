var request = require('supertest');
var assert = require('assert');
var app = require(__dirname+'/../lib/express_app.js');

describe('Handling no connection to Rippled', function() {
  it('should respond with 200 when reconnected', function(done) {
    this.timeout(10000);
    app.remote.once('connected',function() {
      request(app) 
        .get('/v1/server')
        .expect(200)
        .end(function(error, response) {
          console.log(response.body);
          assert(response.body.success);
          assert(!response.body.error);
          done();
        });
    });
  });

  it('should respond with a 502 Bad Gatewayd', function(done) {
    this.timeout(10000);
    app.remote.disconnect(function() {
      request(app) 
        .get('/v1/server')
        .expect(502)
        .end(function(error, response) {
          assert.strictEqual(response.body.error, 'RippledConnectionError');  
          assert(!response.body.success);
          done();
        });
    });
  });

});

