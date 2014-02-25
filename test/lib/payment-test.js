/*jshint expr: true*/
var expect = require('chai').expect,
  clone = require('clone'),
  ripple = require('ripple-lib'),
  paymentLib = require('../../lib/payment');

describe('lib/payment', function(){

  var valid_payment = {
    source_address: "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
    source_tag: "4294967295",
    destination_address: "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
    destination_tag: "4294967295",
    source_amount: {
      value: ".0001",
      currency: "USD",
      issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    source_slippage: "0.00005",
    destination_amount: {
      value: ".001",
      currency: "XRP",
      issuer: ""
    },
    partial_payment: true,
    no_direct_ripple: false
  };

  describe('.validateNewPayment()', function(){

    it('should throw an error if given an invalid address', function(){

      expect(function(){
        var payment = clone(valid_payment);
        payment.source_address = 'badaddress';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: source_address. Must be a valid Ripple address');

      expect(function(){
        var payment = clone(valid_payment);
        payment.destination_address = 'badaddress';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: destination_address. Must be a valid Ripple address');

    });

    it('should throw an error if given an invalid tag', function(){

      expect(function(){
        var payment = clone(valid_payment);
        payment.source_tag = '---';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer');

      expect(function(){
        var payment = clone(valid_payment);
        payment.source_tag = '4294967296';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer');

      expect(function(){
        var payment = clone(valid_payment);
        payment.source_tag = 'badtag';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer');

      expect(function(){
        var payment = clone(valid_payment);
        payment.destination_tag = '---';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer');

      expect(function(){
        var payment = clone(valid_payment);
        payment.destination_tag = '4294967296';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer');

      expect(function(){
        var payment = clone(valid_payment);
        payment.destination_tag = 'badtag';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer');

    });

    it('should throw an error if the destination_amount is undefined (this will be changed later)', function(){
      expect(function(){
        var payment = clone(valid_payment);
        delete payment.destination_amount;
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    });

    it('should throw an error if given an invalid amount', function(){

      expect(function(){
        var payment = clone(valid_payment);
        payment.destination_amount = '';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(valid_payment);
        payment.destination_amount = {};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(valid_payment);
        payment.destination_amount = {value: '', currency: '', issuer: ''};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(valid_payment);
        payment.destination_amount = {value: 'abc', currency: '', issuer: ''};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(valid_payment);
        payment.destination_amount = {value: '123', currency: '***', issuer: ''};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(valid_payment);
        payment.destination_amount = {value: '123', currency: 'abc', issuer: 'badaddress'};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');

      expect(function(){
        var payment = clone(valid_payment);
        payment.destination_amount = {value: '123', currency: 'XRP', issuer: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');


      // expect(function(){
      //   var payment = clone(valid_payment);
      //   payment.source_amount = ''; // this is falsey so it passes
      //   return paymentLib.validateNewPayment(payment);
      // }).to.throw('Invalid parameter: source_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(valid_payment);
        payment.source_amount = {};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: source_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(valid_payment);
        payment.source_amount = {value: '', currency: '', issuer: ''};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: source_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(valid_payment);
        payment.source_amount = {value: 'abc', currency: '', issuer: ''};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: source_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(valid_payment);
        payment.source_amount = {value: '123', currency: '***', issuer: ''};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: source_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(valid_payment);
        payment.source_amount = {value: '123', currency: 'abc', issuer: 'badaddress'};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: source_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');

      expect(function(){
        var payment = clone(valid_payment);
        payment.source_amount = {value: '123', currency: 'XRP', issuer: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: source_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');

    });

    it('should throw an error if given an invalid slippage amount', function(){

      expect(function(){
        var payment = clone(valid_payment);
        payment.source_slippage = 'abc';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: source_slippage. Must be a string representation of a floating point number amount (not %)');

      expect(function(){
        var payment = clone(valid_payment);
        payment.source_slippage = '1%';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: source_slippage. Must be a string representation of a floating point number amount (not %)');

    });

    it('should throw an error if given a destination_slippage', function(){

      expect(function(){
        var payment = clone(valid_payment);
        payment.destination_slippage = '0.05';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Feature not yet supported: destination_slippage');

    });

    it('should throw an error if given an invalid invoice_id', function(){

      expect(function(){
        var payment = clone(valid_payment);
        payment.invoice_id = '&&&';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: invoice_id. Must be alphanumeric string');

    });

    it('should throw an error if given invalid flags', function(){

      expect(function(){
        var payment = clone(valid_payment);
        payment.partial_payment = '&&&';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: partial_payment. Must be a boolean');

      expect(function(){
        var payment = clone(valid_payment);
        payment.partial_payment = {};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: partial_payment. Must be a boolean');

      expect(function(){
        var payment = clone(valid_payment);
        payment.partial_payment = 'true';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: partial_payment. Must be a boolean');


      expect(function(){
        var payment = clone(valid_payment);
        payment.no_direct_ripple = '&&&';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: no_direct_ripple. Must be a boolean');

      expect(function(){
        var payment = clone(valid_payment);
        payment.no_direct_ripple = {};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: no_direct_ripple. Must be a boolean');

      expect(function(){
        var payment = clone(valid_payment);
        payment.no_direct_ripple = 'true';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: no_direct_ripple. Must be a boolean');

    });

    it('should return true if given a valid payment', function(){
      expect(paymentLib.validateNewPayment(valid_payment)).to.be.true;
    });

  });

  describe('.paymentToTx()', function(){
    
  });

  describe('.txToPayment()', function(){

  });

});