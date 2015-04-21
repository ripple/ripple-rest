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

  test('convert() -- payment with XRP and no source amount', function(done) {
    restToTxConverter.convert(fixtures.paymentRestXRP, function(err, transaction) {
      assert.strictEqual(err, null);
      assert.deepEqual(transaction.summary(), fixtures.paymentTxXRP);
      assert.strictEqual(transaction.tx_json.SendMax, undefined);
      done();
    });
  });

  test('convert() -- payment XRP to XRP', function(done) {
    restToTxConverter.convert(fixtures.paymentRestXRPtoXRP, function(err, transaction) {
      assert.strictEqual(err, null);
      assert.strictEqual(transaction.tx_json.SendMax, undefined);
      done();
    });
  });

  test('convert() -- payment XRP to non-XRP', function(done) {
    restToTxConverter.convert(fixtures.exportsPaymentRestIssuers({
      sourceAccount: addresses.VALID,
      sourceAmount: '10',
      sourceCurrency: 'XRP',
      destinationAccount: addresses.COUNTERPARTY,
      sourceIssuer: '',
      destinationIssuer: addresses.ISSUER
    }), function(err, transaction) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(transaction.tx_json.SendMax, '10000000');
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
      sourceAccount: addresses.VALID,
      destinationAccount: addresses.COUNTERPARTY,
      sourceIssuer: addresses.ISSUER,
      destinationIssuer: addresses.ISSUER
    }), function(err, transaction) {
      if (err) {
        return done(err);
      }
      assert.deepEqual(transaction.tx_json.SendMax, {
        value: '10',
        currency: 'USD',
        issuer: addresses.ISSUER
      });
      done();
    });
  });

  test('convert() -- payment with currency that has different issuers for source and destination amount', function(done) {
    restToTxConverter.convert(fixtures.exportsPaymentRestIssuers({
      sourceAccount: addresses.VALID,
      destinationAccount: addresses.COUNTERPARTY,
      sourceIssuer: addresses.VALID2,
      destinationIssuer: addresses.ISSUER2
    }), function(err, transaction) {
      assert.strictEqual(err, null);
      assert.deepEqual(transaction.tx_json.SendMax, {
        value: '10',
        currency: 'USD',
        issuer: addresses.VALID2
      });
      done();
    });
  });

  test('convert() -- payment with currency that has different issuers for source and destination amount and a source_slippage of 0.1', function(done) {
    restToTxConverter.convert(fixtures.exportsPaymentRestIssuers({
      sourceAccount: addresses.VALID,
      destinationAccount: addresses.COUNTERPARTY,
      sourceIssuer: addresses.VALID2,
      destinationIssuer: addresses.ISSUER2,
      sourceSlippage: '0.1',
      sourceAmount: '10'
    }), function(err, transaction) {
      assert.strictEqual(err, null);
      assert.deepEqual(transaction.tx_json.SendMax, {
        value: '10.1',
        currency: 'USD',
        issuer: addresses.VALID2
      });
      done();
    });
  });

  test('convert() -- payment with same currency for source and destination, no issuer for source amount', function(done) {
    restToTxConverter.convert(fixtures.exportsPaymentRestIssuers({
      sourceAccount: addresses.VALID,
      destinationAccount: addresses.COUNTERPARTY,
      sourceIssuer: '',
      destinationIssuer: addresses.ISSUER2
    }), function(err, transaction) {
      if (err) {
        return done(err);
      }
      assert.deepEqual(transaction.tx_json.SendMax, {
        value: '10',
        currency: 'USD',
        issuer: addresses.VALID
      });
      done();
    });
  });

  test('convert() -- payment with same currency for source and destination, no issuer for source and destination amount', function(done) {
    restToTxConverter.convert(fixtures.exportsPaymentRestIssuers({
      sourceAccount: addresses.VALID,
      sourceIssuer: '',
      destinationAccount: addresses.COUNTERPARTY,
      destinationIssuer: ''
    }), function(err, transaction) {
      if (err) {
        return done(err);
      }
      assert.deepEqual(transaction.tx_json.SendMax, {
        value: '10',
        currency: 'USD',
        issuer: addresses.VALID
      });
      done();
    });
  });

  test('convert() -- payment with same currency for source and destination, no issuer for destination amount', function(done) {
    restToTxConverter.convert(fixtures.exportsPaymentRestIssuers({
      sourceAccount: addresses.VALID,
      sourceIssuer: addresses.VALID, // source account is source issuer
      destinationAccount: addresses.COUNTERPARTY,
      destinationIssuer: ''
    }), function(err, transaction) {
      if (err) {
        return done(err);
      }
      assert.deepEqual(transaction.tx_json.SendMax, {
        value: '10',
        currency: 'USD',
        issuer: addresses.VALID
      });
      done();
    });
  });

  test('convert() -- payment with same currency for source and destination, issuers are source and destination', function(done) {
    restToTxConverter.convert(fixtures.exportsPaymentRestIssuers({
      sourceAccount: addresses.VALID,
      sourceIssuer: addresses.VALID, // source account is source issuer
      destinationAccount: addresses.COUNTERPARTY,
      destinationIssuer: addresses.COUNTERPARTY // destination account is destination issuer
    }), function(err, transaction) {
      if (err) {
        return done(err);
      }
      assert.deepEqual(transaction.tx_json.SendMax, {
        value: '10',
        currency: 'USD',
        issuer: addresses.VALID
      });
      done();
    });
  });
});
