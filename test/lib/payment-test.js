/*jshint expr: true*/
var expect = require('chai').expect,
  clone = require('clone'),
  ripple = require('ripple-lib'),
  paymentLib = require('../../lib/payment');

describe('lib/payment', function(){

  var validPayment = {
    src_address: "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
    src_tag: "4294967295",
    dst_address: "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
    dst_tag: "4294967295",
    src_amount: {
      value: ".0001",
      currency: "USD",
      issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    src_slippage: "0.00005",
    dst_amount: {
      value: ".001",
      currency: "XRP",
      issuer: ""
    },
    flag_partial_payment: true,
    flag_no_direct_ripple: false
  };

  describe('.validateNewPayment()', function(){

    it('should throw an error if given an invalid address', function(){

      expect(function(){
        var payment = clone(validPayment);
        payment.src_address = 'badaddress';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: src_address. Must be a valid Ripple address');

      expect(function(){
        var payment = clone(validPayment);
        payment.dst_address = 'badaddress';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: dst_address. Must be a valid Ripple address');

    });

    it('should throw an error if given an invalid tag', function(){

      expect(function(){
        var payment = clone(validPayment);
        payment.src_tag = '---';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: src_tag. Must be a string representation of an unsiged 32-bit integer');

      expect(function(){
        var payment = clone(validPayment);
        payment.src_tag = '4294967296';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: src_tag. Must be a string representation of an unsiged 32-bit integer');

      expect(function(){
        var payment = clone(validPayment);
        payment.src_tag = 'badtag';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: src_tag. Must be a string representation of an unsiged 32-bit integer');

      expect(function(){
        var payment = clone(validPayment);
        payment.dst_tag = '---';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: dst_tag. Must be a string representation of an unsiged 32-bit integer');

      expect(function(){
        var payment = clone(validPayment);
        payment.dst_tag = '4294967296';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: dst_tag. Must be a string representation of an unsiged 32-bit integer');

      expect(function(){
        var payment = clone(validPayment);
        payment.dst_tag = 'badtag';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: dst_tag. Must be a string representation of an unsiged 32-bit integer');

    });

    it('should throw an error if the dst_amount is undefined (this will be changed later)', function(){
      expect(function(){
        var payment = clone(validPayment);
        delete payment.dst_amount;
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    });

    it('should throw an error if given an invalid amount', function(){

      expect(function(){
        var payment = clone(validPayment);
        payment.dst_amount = '';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(validPayment);
        payment.dst_amount = {};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(validPayment);
        payment.dst_amount = {value: '', currency: '', issuer: ''};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(validPayment);
        payment.dst_amount = {value: 'abc', currency: '', issuer: ''};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(validPayment);
        payment.dst_amount = {value: '123', currency: '***', issuer: ''};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(validPayment);
        payment.dst_amount = {value: '123', currency: 'abc', issuer: 'badaddress'};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');

      expect(function(){
        var payment = clone(validPayment);
        payment.dst_amount = {value: '123', currency: 'XRP', issuer: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');


      // expect(function(){
      //   var payment = clone(validPayment);
      //   payment.src_amount = ''; // this is falsey so it passes
      //   return paymentLib.validateNewPayment(payment);
      // }).to.throw('Invalid parameter: src_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(validPayment);
        payment.src_amount = {};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: src_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(validPayment);
        payment.src_amount = {value: '', currency: '', issuer: ''};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: src_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(validPayment);
        payment.src_amount = {value: 'abc', currency: '', issuer: ''};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: src_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(validPayment);
        payment.src_amount = {value: '123', currency: '***', issuer: ''};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: src_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');
    
      expect(function(){
        var payment = clone(validPayment);
        payment.src_amount = {value: '123', currency: 'abc', issuer: 'badaddress'};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: src_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');

      expect(function(){
        var payment = clone(validPayment);
        payment.src_amount = {value: '123', currency: 'XRP', issuer: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: src_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }');

    });

    it('should throw an error if given an invalid slippage amount', function(){

      expect(function(){
        var payment = clone(validPayment);
        payment.src_slippage = 'abc';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: src_slippage. Must be a string representation of a floating point number amount (not %)');

      expect(function(){
        var payment = clone(validPayment);
        payment.src_slippage = '1%';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: src_slippage. Must be a string representation of a floating point number amount (not %)');

    });

    it('should throw an error if given a dst_slippage', function(){

      expect(function(){
        var payment = clone(validPayment);
        payment.dst_slippage = '0.05';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Feature not yet supported: dst_slippage');

    });

    it('should throw an error if given an invalid invoice_id', function(){

      expect(function(){
        var payment = clone(validPayment);
        payment.invoice_id = '&&&';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: invoice_id. Must be alphanumeric string');

    });

    it('should throw an error if given invalid flags', function(){

      expect(function(){
        var payment = clone(validPayment);
        payment.flag_partial_payment = '&&&';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: flag_partial_payment. Must be a boolean');

      expect(function(){
        var payment = clone(validPayment);
        payment.flag_partial_payment = {};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: flag_partial_payment. Must be a boolean');

      expect(function(){
        var payment = clone(validPayment);
        payment.flag_partial_payment = 'true';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: flag_partial_payment. Must be a boolean');


      expect(function(){
        var payment = clone(validPayment);
        payment.flag_no_direct_ripple = '&&&';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: flag_no_direct_ripple. Must be a boolean');

      expect(function(){
        var payment = clone(validPayment);
        payment.flag_no_direct_ripple = {};
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: flag_no_direct_ripple. Must be a boolean');

      expect(function(){
        var payment = clone(validPayment);
        payment.flag_no_direct_ripple = 'true';
        return paymentLib.validateNewPayment(payment);
      }).to.throw('Invalid parameter: flag_no_direct_ripple. Must be a boolean');

    });

    it('should return true if given a valid payment', function(){
      expect(paymentLib.validateNewPayment(validPayment)).to.be.true;
    });

  });

  describe('.paymentToTx()', function(){
    
  });

  describe('.txToPayment()', function(){

  });

});