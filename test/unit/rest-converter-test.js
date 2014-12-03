var assert            = require('assert');
var fixtures          = require('./fixtures').restConverter;
var addresses         = require('./../fixtures').addresses;
var restToTxConverter = require('./../../lib/rest-to-tx-converter.js');

suite('unit - converter - Rest to Tx', function() {

  test('convert() -- payment with IOU and issuer', function(done) {
    restToTxConverter.convert(fixtures.paymentRest, function(err, transaction) {
      assert.strictEqual(err, null);
      assert.deepEqual(transaction.summary(), fixtures.paymentTx);
      done();
    });
  });

  test('convert() -- payment with XRP', function(done) {
    restToTxConverter.convert(fixtures.paymentRestXRP, function(err, transaction) {
      assert.strictEqual(err, null);
      assert.deepEqual(transaction.summary(), fixtures.paymentTxXRP);
      done();
    });

  });

  test('convert() -- payment with additional flags', function(done) {
    restToTxConverter.convert(fixtures.paymentRestComplex, function(err, transaction) {
      assert.strictEqual(err, null);
      assert.deepEqual(transaction.summary(), fixtures.paymentTxComplex);
      done();
    });

  });

});
