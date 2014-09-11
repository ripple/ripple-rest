var assert    = require('assert');
var supertest = require('supertest');
var server    = require('./../../lib/express_app.js');

var app;

before(function(done) {
  app = supertest(server);
  server.remote.connect();
  server.remote.once('ledger_closed', function() {
    done();
  });
});

describe('Wallet Generation', function() {
  it('should create a new wallet', function(done) {
    app
    .get('/v1/accounts/new')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function(res, error) {
      assert(res.body.success, 'success was false');
      assert(res.body.account, 'no account returned');
      assert(res.body.account.address, 'missing address');
      assert(res.body.account.secret, 'missing secret');
    })
    .end(done);
  });
});
