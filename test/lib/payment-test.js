/*jshint expr: true*/
var expect = require('chai').expect,
  ripple = require('ripple-lib'),
  paymentLib = require('../../lib/payment');

describe('lib/payment', function(){

  describe('.validateNewPayment()', function(){
    var validate = function(){
      paymentLib.validateNewPayment({
        src_address: 'hello'
      });
    };
    expect(validate).to.throw('Invalid parameter: src_address. Must be a valid Ripple address');
  });

  describe('.paymentToTx()', function(){
    
  });

  describe('.txToPayment()', function(){

  });

});