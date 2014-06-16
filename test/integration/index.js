var request = require('supertest');
var assert = require('assert');

var ADDRESS = 'r34hCTPrhtKntvxGChTRhLGu7zenBd627J';
var SECRET = process.env.RIPPLE_ACCOUNT_SECRET;
var RECIPIENT = 'rp4u5gEskM8DtBZvonZwbu6dspgVdeAGM6';
var VALID_TRANSACTION_HASH = '605A22E57C5ACA2D8F7C54930F5F93085D25AFB7BBB2967EE041FA4BA58A0C0E';

var app = require(__dirname+'/../../lib/express_app.js');

describe('HTTP Payments endpoints', function(){
  before(function(callback){
    setTimeout(callback, 5000);
  });

  it('should get the root of api', function(callback){
    request(app)
      .get('/v1')
      .expect(200)
      .end(function(error, response){
        assert.strictEqual(response.body.documentation, 'https://github.com/ripple/ripple-rest');
        assert.strictEqual(response.body.endpoints.submit_payment, "/v1/payments");
        callback();
      });
  });

  it('should get payments in bulk', function(callback){
    request(app)
      .get('/v1/accounts/'+ADDRESS+'/payments')
      .expect(200)
      .end(callback);
  });
  
  it('should error with an invalid ripple address', function(callback){
    request(app)
      .get('/v1/accounts/someinvalidaddress/payments')
      .expect(500)
      .end(function(error, response){
        assert.strictEqual(response.statusCode, 500);
        assert(!response.body.success);
        assert.strictEqual(response.body.message, 'Specified address is invalid: account');
        callback();
      });
  });

  it('should get a single payment', function(callback){
    request(app)
      .get('/v1/accounts/'+ADDRESS+'/payments/'+VALID_TRANSACTION_HASH)
      .expect(200)
      .end(callback);
  });

  it('should list account balances', function(done) {
    request(app)
      .get('/v1/accounts/'+ADDRESS+'/balances')
      .expect(200)
      .end(function(error, response) {
        assert(response.body.success); 
        assert(response.body.balances.length > 0);
        done();
      });
  });

  it('should perform a payment path find', function(done) {
    request(app)
      .get('/v1/accounts/'+ADDRESS+'/payments/paths/'+RECIPIENT+'/1.21+SGZ')
      .expect(200)
      .end(function(error, response) {
        assert(response.body);
        assert.strictEqual(response.body.payments[0].source_account, ADDRESS);
        assert.strictEqual(response.body.payments[0].destination_account, RECIPIENT);
        assert.strictEqual(response.body.payments[0].destination_amount.currency, 'SGZ');
        assert.strictEqual(response.body.payments[0].destination_amount.value, '1.21');
        done();
      });
  });

  it('should list account settings', function(done) {
    request(app)
      .get('/v1/accounts/'+ADDRESS+'/settings')
      .expect(200)
      .end(function(error, response) {
        assert(response.body.success);
        assert.strictEqual(response.body.settings.account, ADDRESS);
        assert.strictEqual(response.body.settings.require_authorization, false);
        done();
      });
  });

  it('should list account trust lines', function(done) {
    request(app)
      .get('/v1/accounts/'+ADDRESS+'/trustlines')
      .expect(200)
      .end(function(error, response) {
        assert(response.body.success);
        assert(response.body.trustlines.length > 0);
        done();
      });
  });

  it('should generate a uuid', function(done) {
    request(app)
      .get('/v1/uuid')
      .expect(200)
      .end(function(error, response) {
        assert(response.body.success);
        assert(response.body.uuid);
        done();
      });
  });

  it('should get the server status', function(done) {
    request(app)
      .get('/v1/server')
      .expect(200)
      .end(function(error, response) {
        assert(response.body.success);
        assert.strictEqual(response.body.rippled_server_url, "wss://s-west.ripple.com:443");
        done();
      });
  });

  it('should list account payments', function(done) {
    request(app)
      .get('/v1/accounts/'+ADDRESS+'/payments')
      .expect(200)
      .end(function(error, response) {
        assert(response.body.success);
        assert(response.body.payments.length > 0);
        done();
      });
  });

  if (SECRET) {
    it('should submit a payment to another account', function(done) {
      request(app)
        .get('/v1/accounts/'+ADDRESS+'/payments/paths/'+RECIPIENT+'/1.21+SGZ')
        .expect(200)
        .end(function(error, response) {
          var payment = response.body.payments[0];
          request(app)
            .get('/v1/uuid')
            .end(function(error, response){
              var clientResourceId = response.body.uuid
              var params = {
                client_resource_id: clientResourceId,
                payment: payment,
                secret: SECRET
              };
              request(app)
                .post('/v1/payments')
                .send(params)
                .end(function(error, response) {
                  assert(response.body.success);
                  assert(response.body.status_url);
                  assert.strictEqual(response.body.client_resource_id, clientResourceId);
                  done();
                });
            });
        });
      });
  } else {
    it.skip('should submit a payment to another account');
  }

});

