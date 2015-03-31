/* eslint-disable new-cap */
/* eslint-disable max-len */
'use strict';

var assert = require('assert');
var fixtures = require('./fixtures').restConverter;
var addresses = require('./../fixtures').addresses;
var restToTxConverter = require('./../../api/lib/rest-to-tx-converter.js');

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

  test('convert() -- payment with currency that has same issuer for source and destination amount', function(done) {
    restToTxConverter.convert(fixtures.exportsPaymentRestIssuers({
      sourceIssuer: addresses.VALID,
      destinationIssuer: addresses.VALID
    }), function(err, transaction) {
      assert.strictEqual(err, null);
      assert.strictEqual(transaction.tx_json.SendMax, undefined);
      done();
    });
  });

  test('convert() -- payment with currency that has different issuers for source and destination amount', function(done) {
    restToTxConverter.convert(fixtures.exportsPaymentRestIssuers({
      sourceIssuer: addresses.VALID,
      destinationIssuer: addresses.COUNTERPARTY
    }), function(err, transaction) {
      assert.strictEqual(err, null);
      assert.deepEqual(transaction.tx_json.SendMax, {
        value: '10',
        currency: 'USD',
        issuer: addresses.VALID
      });
      done();
    });
  });

  test('convert() -- payment with currency that has different issuers for source and destination amount and a source_slippage of 0.1', function(done) {
    restToTxConverter.convert(fixtures.exportsPaymentRestIssuers({
      sourceIssuer: addresses.VALID,
      destinationIssuer: addresses.COUNTERPARTY,
      sourceSlippage: '0.1',
      sourceAmount: '10'
    }), function(err, transaction) {
      assert.strictEqual(err, null);
      assert.deepEqual(transaction.tx_json.SendMax, {
        value: '10.1',
        currency: 'USD',
        issuer: addresses.VALID
      });
      done();
    });
  });

});
