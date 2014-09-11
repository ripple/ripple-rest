var assert    = require('assert');
var supertest = require('supertest');
var server    = require('./../../lib/app.js');

var app;

before(function() {
  app = supertest(server);
});

describe('Wallet Generation', function() {
  it('should fail to create a new wallet', function(done) {
    app
    .get('/v1/accounts/new')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function(res, error) {
      assert(res.body.success === false);
      assert(res.body.error_type === 'connection_error');
    })
    .end(done);
  });
});
