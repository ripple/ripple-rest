var request = require('supertest');
var assert = require('assert');

var ADDRESS = 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk';
var VALID_TRANSACTION_HASH = 'E60D0518D907491FDFD1984269369827DEC41E910C91013F8F2C44F884AE725B';

var rippleRest = require(__dirname+'/../../index');
var app = require(__dirname+'/../../app');

describe('HTTP Payments endpoints', function(){
  before(function(callback){
    rippleRest.connectRemote(callback);
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
        callback();
      });
  });

  it('should get a single payment', function(callback){
    request(app)
      .get('/v1/accounts/'+ADDRESS+'/payments/'+VALID_TRANSACTION_HASH)
      .expect(200)
      .end(callback);
  });

});

