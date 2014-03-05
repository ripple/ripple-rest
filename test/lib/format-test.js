/*jshint expr: true*/

var expect = require('chai').expect;
var ripple = require('ripple-lib');
var clone  = require('clone');
var format = require('../../lib/format');

describe('lib/format', function(){

  var payment_xrp = require('../testdata/payment_xrp.json');
  var payment_usd = require('../testdata/payment_xrp.json');
  var tx_payment_xrp = require('../testdata/tx_payment_xrp.json');
  var tx_payment_usd = require('../testdata/tx_payment_usd.json');

  describe('.paymentToRippleLibTransaction()', function(){

    it('should throw an error if the source_account invalid', function(){
      var payment1 = clone(payment_xrp);
      delete payment1.source_account;
      format.paymentToRippleLibTransaction(payment1, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_account. Please refer to the Payment schema for the expected types. Value provided: undefined');
      });

      var payment2 = clone(payment_xrp);
      payment2.source_account = '';
      format.paymentToRippleLibTransaction(payment2, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_account. Please refer to the Payment schema for the expected types. Value provided: ');
      });

      var payment3 = clone(payment_xrp);
      payment3.source_account = 'abc';
      format.paymentToRippleLibTransaction(payment3, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_account. Please refer to the Payment schema for the expected types. Value provided: abc');
      });

      var payment4 = clone(payment_xrp);
      payment4.source_account = 123;
      format.paymentToRippleLibTransaction(payment4, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_account. Please refer to the Payment schema for the expected types. Value provided: 123');
      });
    });

    it('should throw an error if the destination_account invalid', function(){
      var payment1 = clone(payment_xrp);
      delete payment1.destination_account;
      format.paymentToRippleLibTransaction(payment1, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_account. Please refer to the Payment schema for the expected types. Value provided: undefined');
      });

      var payment2 = clone(payment_xrp);
      payment2.destination_account = '';
      format.paymentToRippleLibTransaction(payment2, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_account. Please refer to the Payment schema for the expected types. Value provided: ');
      });

      var payment3 = clone(payment_xrp);
      payment3.destination_account = 'abc';
      format.paymentToRippleLibTransaction(payment3, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_account. Please refer to the Payment schema for the expected types. Value provided: abc');
      });

      var payment4 = clone(payment_xrp);
      payment4.destination_account = 123;
      format.paymentToRippleLibTransaction(payment4, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_account. Please refer to the Payment schema for the expected types. Value provided: 123');
      });
    });

    it('should throw an error if the source_tag is invalid', function(){
      var payment1 = clone(payment_xrp);
      payment1.source_tag = 'abc';
      format.paymentToRippleLibTransaction(payment1, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_tag. Please refer to the Payment schema for the expected types. Value provided: abc');
      });

      var payment2 = clone(payment_xrp);
      payment2.source_tag = '---';
      format.paymentToRippleLibTransaction(payment2, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_tag. Please refer to the Payment schema for the expected types. Value provided: ---');
      });

      var payment3 = clone(payment_xrp);
      payment3.source_tag = '-1';
      format.paymentToRippleLibTransaction(payment3, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_tag. Please refer to the Payment schema for the expected types. Value provided: -1');
      });

      var payment4 = clone(payment_xrp);
      payment4.source_tag = '0.1';
      format.paymentToRippleLibTransaction(payment4, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_tag. Please refer to the Payment schema for the expected types. Value provided: 0.1');
      });

      var payment5 = clone(payment_xrp);
      payment5.source_tag = '4294967296';
      format.paymentToRippleLibTransaction(payment5, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_tag. Please refer to the Payment schema for the expected types. Value provided: 4294967296');
      });

      var payment6 = clone(payment_xrp);
      payment6.source_tag = 4294967295;
      format.paymentToRippleLibTransaction(payment6, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_tag. Please refer to the Payment schema for the expected types. Value provided: 4294967295');
      });

    });

    it('should throw an error if the destination_tag is invalid', function(){
      var payment1 = clone(payment_xrp);
      payment1.destination_tag = 'abc';
      format.paymentToRippleLibTransaction(payment1, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_tag. Please refer to the Payment schema for the expected types. Value provided: abc');
      });

      var payment2 = clone(payment_xrp);
      payment2.destination_tag = '---';
      format.paymentToRippleLibTransaction(payment2, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_tag. Please refer to the Payment schema for the expected types. Value provided: ---');
      });

      var payment3 = clone(payment_xrp);
      payment3.destination_tag = '-1';
      format.paymentToRippleLibTransaction(payment3, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_tag. Please refer to the Payment schema for the expected types. Value provided: -1');
      });

      var payment4 = clone(payment_xrp);
      payment4.destination_tag = '0.1';
      format.paymentToRippleLibTransaction(payment4, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_tag. Please refer to the Payment schema for the expected types. Value provided: 0.1');
      });

      var payment5 = clone(payment_xrp);
      payment5.destination_tag = '4294967296';
      format.paymentToRippleLibTransaction(payment5, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_tag. Please refer to the Payment schema for the expected types. Value provided: 4294967296');
      });

      var payment6 = clone(payment_xrp);
      payment6.destination_tag = 4294967295;
      format.paymentToRippleLibTransaction(payment6, function(err, transaction){
        expect(err).to.exist;
        expect(transaction).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_tag. Please refer to the Payment schema for the expected types. Value provided: 4294967295');
      });

    });

    it('should throw an error if the source_amount or destination_amount is invalid', function(){

    });

    it('should throw an error if the destination_amount is undefined', function(){

    });

    it('should throw an error if the invoice_id is invalid', function(){

    });

    it('should throw an error if one of the flags is invalid', function(){

    });

    it('should replace blank currency issuers with the address of the sender or receiver', function(){

    });

    it('should only set the SendMax if the source_amount and destination_amounts are different', function(){

    });

    it('should accept paths as a string or an object', function(){

    });

    it('should accept payments with no source_amount specified', function(){

    });

    it('should convert a properly formatted payment into a ripple-lib transaction', function(){

    });

  });

  describe('.trustlineToRippleLibTransaction()', function(){

  });

  describe('.orderToRippleLibTransaction()', function(){

  });

  describe('.accountSettingsToRippleLibTransaction()', function(){

  });




});