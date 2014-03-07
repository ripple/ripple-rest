/*jshint expr: true*/

var expect         = require('chai').expect;
var ripple         = require('ripple-lib');
var clone          = require('clone');
var payment_format = require('../../lib/formats/payment-format');

var payment_xrp    = require('../testdata/payment_xrp.json');
var payment_usd    = require('../testdata/payment_usd.json');
var tx_payment_xrp = require('../testdata/tx_payment_xrp.json');
var tx_payment_usd = require('../testdata/tx_payment_usd.json');
var pathfind       = require('../testdata/pathfind.json');

describe('lib/formats/payments', function(){

  describe('.paymentIsValid()', function(){

    it('should respond with an error if the source_account invalid', function(done){
      var payment1 = clone(payment_xrp);
      delete payment1.source_account;
      payment_format.paymentIsValid(payment1, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_account. Must be a valid Ripple address');
      });

      var payment2 = clone(payment_xrp);
      payment2.source_account = '';
      payment_format.paymentIsValid(payment2, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_account. Must be a valid Ripple address');
      });

      var payment3 = clone(payment_xrp);
      payment3.source_account = 'abc';
      payment_format.paymentIsValid(payment3, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_account. Must be a valid Ripple address');
      });

      var payment4 = clone(payment_xrp);
      payment4.source_account = 123;
      payment_format.paymentIsValid(payment4, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_account. Must be a valid Ripple address');
        done();
      });
    });

    it('should respond with an error if the destination_account invalid', function(done){
      var payment1 = clone(payment_xrp);
      delete payment1.destination_account;
      payment_format.paymentIsValid(payment1, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_account. Must be a valid Ripple address');
      });

      var payment2 = clone(payment_xrp);
      payment2.destination_account = '';
      payment_format.paymentIsValid(payment2, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_account. Must be a valid Ripple address');
      });

      var payment3 = clone(payment_xrp);
      payment3.destination_account = 'abc';
      payment_format.paymentIsValid(payment3, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_account. Must be a valid Ripple address');
      });

      var payment4 = clone(payment_xrp);
      payment4.destination_account = 123;
      payment_format.paymentIsValid(payment4, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_account. Must be a valid Ripple address');
        done();
      });
    });

    it('should respond with an error if the source_tag is invalid', function(done){
      var payment1 = clone(payment_xrp);
      payment1.source_tag = 'abc';
      payment_format.paymentIsValid(payment1, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer');
      });

      var payment2 = clone(payment_xrp);
      payment2.source_tag = '---';
      payment_format.paymentIsValid(payment2, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer');
      });

      var payment3 = clone(payment_xrp);
      payment3.source_tag = '-1';
      payment_format.paymentIsValid(payment3, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer');
      });

      var payment4 = clone(payment_xrp);
      payment4.source_tag = '0.1';
      payment_format.paymentIsValid(payment4, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer');
      });

      var payment5 = clone(payment_xrp);
      payment5.source_tag = '4294967296';
      payment_format.paymentIsValid(payment5, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer');
      });

      var payment6 = clone(payment_xrp);
      payment6.source_tag = 4294967295;
      payment_format.paymentIsValid(payment6, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer');
        done();
      });

    });

    it('should respond with an error if the destination_tag is invalid', function(done){
      var payment1 = clone(payment_xrp);
      payment1.destination_tag = 'abc';
      payment_format.paymentIsValid(payment1, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer');
      });

      var payment2 = clone(payment_xrp);
      payment2.destination_tag = '---';
      payment_format.paymentIsValid(payment2, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer');
      });

      var payment3 = clone(payment_xrp);
      payment3.destination_tag = '-1';
      payment_format.paymentIsValid(payment3, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer');
      });

      var payment4 = clone(payment_xrp);
      payment4.destination_tag = '0.1';
      payment_format.paymentIsValid(payment4, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer');
      });

      var payment5 = clone(payment_xrp);
      payment5.destination_tag = '4294967296';
      payment_format.paymentIsValid(payment5, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer');
      });

      var payment6 = clone(payment_xrp);
      payment6.destination_tag = 4294967295;
      payment_format.paymentIsValid(payment6, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer');
        done();
      });

    });

    it('should respond with an error if the source_amount is invalid', function(done){

      var payment1 = clone(payment_xrp);
      payment1.source_amount = '1+USD';
      payment_format.paymentIsValid(payment1, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_amount. Must be a valid Amount object');
      });

      var payment2 = clone(payment_xrp);
      payment2.source_amount = {};
      payment_format.paymentIsValid(payment2, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_amount. Must be a valid Amount object');
      });

      var payment3 = clone(payment_xrp);
      payment3.source_amount = {
        "currency": "USD",
        "issuer": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r"
      };
      payment_format.paymentIsValid(payment3, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: source_amount. Must be a valid Amount object');
        done();
      });
    });

    it('should respond with an error if the destination_amount is invalid', function(done){

      var payment1 = clone(payment_xrp);
      payment1.destination_amount = '';
      payment_format.paymentIsValid(payment1, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_amount. Must be a valid Amount object');
      });

      var payment2 = clone(payment_xrp);
      payment2.destination_amount = {};
      payment_format.paymentIsValid(payment2, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_amount. Must be a valid Amount object');
      });

      var payment3 = clone(payment_xrp);
      payment3.destination_amount = {
        "currency": "USD",
        "issuer": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r"
      };
      payment_format.paymentIsValid(payment3, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_amount. Must be a valid Amount object');
        done();
      });

    });

    it('should respond with an error if the destination_amount is undefined', function(done){
      var payment1 = clone(payment_xrp);
      delete payment1.destination_amount;
      payment_format.paymentIsValid(payment1, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: destination_amount. Must be a valid Amount object');
        done();
      });
    });

    it('should respond with an error if the invoice_id is invalid', function(done){
      var payment1 = clone(payment_xrp);
      payment1.invoice_id = 'abc';
      payment_format.paymentIsValid(payment1, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: invoice_id. Must be a valid Hash256');
      });

      var payment2 = clone(payment_xrp);
      payment2.invoice_id = 123;
      payment_format.paymentIsValid(payment2, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: invoice_id. Must be a valid Hash256');
        done();
      });
    });

    it('should respond with an error if one of the flags is invalid', function(done){
      var payment1 = clone(payment_xrp);
      payment1.partial_payment = 'abc';
      payment_format.paymentIsValid(payment1, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: partial_payment. Must be a boolean');
      });

      var payment2 = clone(payment_xrp);
      payment2.partial_payment = 123;
      payment_format.paymentIsValid(payment2, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: partial_payment. Must be a boolean');
      });

      var payment3 = clone(payment_xrp);
      payment3.no_direct_ripple = 'abc';
      payment_format.paymentIsValid(payment3, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: no_direct_ripple. Must be a boolean');
      });

      var payment4 = clone(payment_xrp);
      payment4.no_direct_ripple = 'abc';
      payment_format.paymentIsValid(payment4, function(err, valid){
        expect(err).to.exist;
        expect(valid).not.to.exist;
        expect(err.message).to.equal('Invalid parameter: no_direct_ripple. Must be a boolean');
        done();
      });
    });

  });

  describe('.paymentToRippleLibTransaction()', function(){

    it('should replace blank currency issuers with the address of the sender or receiver', function(done){
      var payment1 = clone(payment_usd);
      payment1.destination_amount.issuer = '';
      payment_format.paymentToRippleLibTransaction(payment1, function(err, transaction){
        expect(err).not.to.exist;
        expect(transaction).to.exist;
        expect(transaction.tx_json.Amount.issuer).to.equal(transaction.tx_json.Destination);
        done();
      });
    });

    it('should only set the SendMax if the source_amount and destination_amounts are different', function(done){
      var payment1 = clone(payment_xrp);
      payment_format.paymentToRippleLibTransaction(payment1, function(err, transaction){
        expect(err).not.to.exist;
        expect(transaction).to.exist;
        expect(transaction.tx_json.SendMax).not.to.exist;
      });

      var payment2 = clone(payment_usd);
      payment2.source_amount = payment2.destination_amount;
      payment_format.paymentToRippleLibTransaction(payment2, function(err, transaction){
        expect(err).not.to.exist;
        expect(transaction).to.exist;
        expect(transaction.tx_json.SendMax).not.to.exist;
        done();
      });
    });

    it('should accept paths as a string or an object', function(done){
      var payment1 = clone(payment_usd);
      payment_format.paymentToRippleLibTransaction(payment1, function(err, transaction){
        expect(err).not.to.exist;
        expect(transaction).to.exist;
        expect(transaction.tx_json.Paths).to.exist;
      });

      var payment2 = clone(payment_usd);
      payment2.pahts = JSON.parse(payment2.paths);
      payment_format.paymentToRippleLibTransaction(payment2, function(err, transaction){
        expect(err).not.to.exist;
        expect(transaction).to.exist;
        expect(transaction.tx_json.Paths).to.exist;
        done();
      });

    });

    it('should accept payments with no source_amount specified', function(done){

      var payment1 = clone(payment_usd);
      delete payment1.source_amount;
      payment_format.paymentToRippleLibTransaction(payment1, function(err, transaction){
        expect(err).not.to.exist;
        expect(transaction).to.exist;
      });

      var payment2 = clone(payment_xrp);
      delete payment2.source_amount;
      payment_format.paymentToRippleLibTransaction(payment2, function(err, transaction){
        expect(err).not.to.exist;
        expect(transaction).to.exist;
        done();
      });

    });

    it('should convert a properly formatted payment into a ripple-lib transaction', function(done){

      var payment1 = clone(payment_usd);
      payment_format.paymentToRippleLibTransaction(payment1, function(err, transaction){
        expect(err).not.to.exist;
        expect(transaction).to.exist;
        expect(transaction.tx_json).to.deep.equal({
          Flags: 0,
          Paths: JSON.parse(payment_usd.paths),
          SendMax: "62888",
          TransactionType: 'Payment',
          Account: payment_usd.source_account,
          Destination: payment_usd.destination_account,
          Amount: payment_usd.destination_amount,
        });

        done();
      });

    });

  });

  describe('.parsePaymentFromTx()', function(){

    it('should parse all amounts as objects', function(done){
      var tx1 = clone(tx_payment_usd);
      payment_format.parsePaymentFromTx(tx1, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
      }, function(err, payment){
        expect(err).not.to.exist;
        expect(payment).to.exist;
        expect(payment.source_amount).to.deep.equal({
          "value": "0.062888",
          "currency": "XRP",
          "issuer": ""
        });
        expect(payment.destination_amount).to.deep.equal({
          "currency": "USD",
          "issuer": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
          "value": "0.001"
        });
        done();
      });
    });

    it('should set the source_amount whether or not there is a SendMax', function(done){
      var tx1 = clone(tx_payment_xrp);
      payment_format.parsePaymentFromTx(tx1, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
      }, function(err, payment){
        expect(err).not.to.exist;
        expect(payment).to.exist;
        expect(payment).to.haveOwnProperty('source_amount');
        expect(payment.source_amount).to.deep.equal(payment.destination_amount);
        done();
      });
    });

    it('should properly parse individual flags', function(done){
      var tx1 = clone(tx_payment_xrp);
      tx1.Flags = 0 | 0x00010000;
      payment_format.parsePaymentFromTx(tx1, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
      }, function(err, payment){
        expect(err).not.to.exist;
        expect(payment).to.exist;
        expect(payment.no_direct_ripple).to.be.true;
      });

      var tx2 = clone(tx_payment_xrp);
      tx2.Flags = 0 | 0x00020000;
      payment_format.parsePaymentFromTx(tx2, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
      }, function(err, payment){
        expect(err).not.to.exist;
        expect(payment).to.exist;
        expect(payment.partial_payment).to.be.true;
        done();
      });

    });

    it('should parse individual Flags when multiple are set', function(done){
      var tx1 = clone(tx_payment_xrp);
      tx1.Flags = 0x00010000 | 0x00020000;
      payment_format.parsePaymentFromTx(tx1, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
      }, function(err, payment){
        expect(err).not.to.exist;
        expect(payment).to.exist;
        expect(payment.no_direct_ripple).to.be.true;
        expect(payment.partial_payment).to.be.true;
        done();
      });
    });

    it('should stringify the pathset object', function(done){
      var tx1 = clone(tx_payment_xrp);
      payment_format.parsePaymentFromTx(tx1, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
      }, function(err, payment){
        expect(err).not.to.exist;
        expect(payment).to.exist;
        expect(payment.paths).to.equal('[]');
      });

      var tx2 = clone(tx_payment_usd);
      payment_format.parsePaymentFromTx(tx2, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
      }, function(err, payment){
        expect(err).not.to.exist;
        expect(payment).to.exist;
        expect(payment.paths).to.equal("[[{\"currency\":\"USD\",\"issuer\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rE8L4Kbz1PoUQR7aqWWDK1muGBrTQ47Vrc\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rnziParaNb8nsU4aruQdwYE3j5jUcqjzFm\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}],[{\"currency\":\"USD\",\"issuer\":\"rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59\",\"type\":1,\"type_hex\":\"0000000000000001\"},{\"account\":\"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B\",\"type\":1,\"type_hex\":\"0000000000000001\"}]]");
        done();
      });
    });

    it('should parse the date as an ISO string or leave it blank if there is no date', function(done) {
      var tx1 = clone(tx_payment_xrp);
      payment_format.parsePaymentFromTx(tx1, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
      }, function(err, payment){
        expect(err).not.to.exist;
        expect(payment).to.exist;
        expect(payment.timestamp).to.equal('');
        done();
      });

      var tx2 = clone(tx_payment_xrp);
      tx2.date = 446257420;
      payment_format.parsePaymentFromTx(tx2, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
      }, function(err, payment){
        expect(err).not.to.exist;
        expect(payment).to.exist;
        expect(payment.timestamp).to.equal('2014-02-21T00:23:40.000Z');
      });

    });

    it('should produce an object with all of the keys, even if they are empty strings', function(done){

      var tx1 = clone(tx_payment_xrp);
      payment_format.parsePaymentFromTx(tx1, {
        account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
      }, function(err, payment){
        expect(err).not.to.exist;
        expect(payment).to.exist;
        expect(payment).keys(payment_format.keys);
        done();
      });

    });

  });

  describe('.parsePaymentsFromPathfind()', function(){

    it('should convert a ripple path set to an array of payment objects', function(done){

      var pathfind1 = clone(pathfind);
      payment_format.parsePaymentsFromPathfind(pathfind1, function(err, payments){
        expect(err).not.to.exist;
        expect(payments).to.have.length(2);
        expect(payments[0]).to.have.keys(payment_format.submission_keys);
        expect(payments[1]).to.have.keys(payment_format.submission_keys);
        done();
      });

    });

    it('should convert a path set with destination_amount in XRP to an array of payments', function(done){

      var pathfind1 = clone(pathfind);
      pathfind1.destination_amount = "1000000";
      payment_format.parsePaymentsFromPathfind(pathfind1, function(err, payments){
        expect(err).not.to.exist;
        expect(payments).to.have.length(2);
        expect(payments[0].destination_amount).to.deep.equal({
          "value": "1",
          "currency": "XRP",
          "issuer": ""
        });
        done();
      });
      
    });

    it('should properly handle when the destination_amount.issuer is the destination_account', function(done){

      var pathfind1 = clone(pathfind);
      pathfind1.destination_amount.issuer = pathfind1.destination_account;
      payment_format.parsePaymentsFromPathfind(pathfind1, function(err, payments){
        expect(err).not.to.exist;
        expect(payments).to.have.length(2);
        expect(payments[0].destination_amount).to.deep.equal({
          "value": "0.001",
          "currency": "USD",
          "issuer": ""
        });
        done();
      });

    });


    it('should convert an empty path set to an empty array', function(done){

      var pathfind1 = {
        "alternatives": [],
        "destination_account": "rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB",
        "destination_amount": {
            "currency": "BTC",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "value": "1"
        },
        "id": 1,
        "source_account": "rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM"
      };

      payment_format.parsePaymentsFromPathfind(pathfind1, function(err, payments){
        expect(err).not.to.exist;
        expect(payments).to.have.length(0);
        done();
      });

    });

  });

});
