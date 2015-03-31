/* eslint-disable new-cap */
/* eslint-disable max-len */
'use strict';

var assert = require('assert-diff');
var fixtures = require('./fixtures').txConverter;
var addresses = require('./../fixtures').addresses;
var txToRestConverter = require('./../../api/lib/tx-to-rest-converter.js');

suite('unit - converter - Tx to Rest', function() {
  test('parsePaymentFromTx()', function(done) {
    var tx = fixtures.paymentTx();
    var options = {
      account: addresses.VALID
    };

    txToRestConverter.parsePaymentFromTx(tx, options, function(err, payment) {
      assert.strictEqual(err, null);
      assert.deepEqual(payment, fixtures.paymentRest);
      done();
    });
  });

  test('parsePaymentFromTx() -- complicated meta', function(done) {
    var tx = fixtures.paymentTx({
      meta: fixtures.COMPLICATED_META
    });
    tx.Destination = 'rGAWXLxpsy77vWxgYriPZE5ktUfqa6prbG';
    var options = {
      account: addresses.VALID
    };

    txToRestConverter.parsePaymentFromTx(tx, options, function(err, payment) {
      assert.strictEqual(err, null);

      assert.deepEqual(payment.source_balance_changes, [
        {
          value: '-0.834999999999999',
          currency: 'EUR',
          issuer: 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH'
        },
        {
          value: '-0.015',
          currency: 'XRP',
          issuer: ''}
      ]);

      assert.deepEqual(payment.destination_balance_changes, [
        {
          value: '-1',
          currency: 'USD',
          issuer: 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH'
        },
        {
         value: '0.833333333333',
         currency: 'EUR',
         issuer: 'r3PDtZSa5LiYp1Ysn1vMuMzB59RzV3W9QH'
        }
      ]);

      done();
    });
  });

  test('parsePaymentsFromPathFind()', function(done) {
    var pathFindResults = fixtures.pathFindResultsTx;

    txToRestConverter.parsePaymentsFromPathFind(pathFindResults, function(err, payments) {
      assert.strictEqual(err, null);
      assert.deepEqual(payments, fixtures.pathPaymentsRest);
      done();
    });
  });

  test('parseCancelOrderFromTx()', function(done) {
    var txMessage = fixtures.cancelOrderTx;
    var meta = {
      hash: '3fc6fe4050075aa3115f212b64d97565ccd8003412f6404478a256b2f48351f3',
      ledger: '8819996',
      state: 'validated'
    };

    txToRestConverter.parseCancelOrderFromTx(txMessage, meta, function(err, orderObj) {
      assert.strictEqual(err, null);
      assert.deepEqual(orderObj, fixtures.cancelOrderResponseRest);
      done();
    });
  });

  test('parseSubmitOrderFromTx()', function(done) {
    var txMessage = fixtures.submitOrderResponseTx;
    var meta = {
      hash: '684fd723577624f4581fd35d3ada8ff9e536f0ce5ab2065a22adf81633be1f2c',
      ledger: '8819982',
      state: 'pending'
    };

    txToRestConverter.parseSubmitOrderFromTx(txMessage, meta, function(err, orderObj) {
      assert.strictEqual(err, null);
      assert.deepEqual(orderObj, fixtures.submitOrderResponseRest);
      done();
    });
  });

  test('parseTrustResponseFromTx()', function(done) {
    var txMessage = fixtures.trustResponseTx;
    var meta = {
      hash: '0F480D344CFC610DFA5CAC62CC1621C92953A05FE8C319281CA49C5C162AF40E',
      ledger: '8820111',
      state: 'validated'
    };

    txToRestConverter.parseTrustResponseFromTx(txMessage, meta, function(err, trustObj) {
      assert.strictEqual(err, null);
      assert.deepEqual(trustObj, fixtures.trustResponseRest);
      done();
    });
  });

  test('parseSettingResponseFromTx()', function(done) {
    var params = {
      account: addresses.VALID,
      secret: addresses.SECRET,
      settings: {
        require_destination_tag: true,
        require_authorization: true,
        disallow_xrp: true,
        domain: 'example.com',
        email_hash: '23463B99B62A72F26ED677CC556C44E8',
        wallet_locator: 'DEADBEEF',
        wallet_size: 1,
        transfer_rate: 2,
        no_freeze: false,
        global_freeze: true,
        default_ripple: true
      }
    };

    var txMessage = fixtures.settingResponseTx;
    var meta = {
      hash: '0F480D344CFC610DFA5CAC62CC1621C92953A05FE8C319281CA49C5C162AF40E',
      ledger: 8820076,
      state: 'validated'
    };

    txToRestConverter.parseSettingResponseFromTx(params.settings, txMessage, meta, function(err, settingObj) {
      assert.strictEqual(err, null);
      assert.deepEqual(settingObj, fixtures.settingResponseRest);
      done();
    });
  });

  test('parseFlagsFromResponse()', function(done) {
    var responseFlags = 2147614720;
    var flags = {
      NoRipple: {
        name: 'prevent_rippling',
        value: 131072
      },
      SetFreeze: {
        name: 'account_trustline_frozen',
        value: 1048576
      },
      SetAuth: {
        name: 'authorized',
        value: 65536
      }
    };

    var parsedFlags = txToRestConverter.parseFlagsFromResponse(responseFlags, flags);

    assert.deepEqual(parsedFlags, {
      prevent_rippling: true,
      account_trustline_frozen: false,
      authorized: false
    });

    done();
  });

  suite('parseOrderFromTx', function() {
    test('parse OfferCreate', function(done) {
      var options = {
        account: addresses.VALID
      };

      txToRestConverter.parseOrderFromTx(fixtures.offerCreateTx, options)
      .then(function(orderChange) {
        assert.deepEqual(orderChange, fixtures.parsedOfferCreateTx);
        done();
      })
      .catch(done);
    });

    test('parse OfferCancel', function(done) {
      var options = {
        account: addresses.VALID
      };

      txToRestConverter.parseOrderFromTx(fixtures.offerCancelTx, options)
      .then(function(orderChange) {
        assert.deepEqual(orderChange, fixtures.parsedOfferCancelTx);
        done();
      })
      .catch(done);
    });

    test('parse Payment -- invalid transaction type', function(done) {
      var options = {
        account: addresses.VALID
      };

      txToRestConverter.parseOrderFromTx(fixtures.paymentTx(), options)
      .catch(function(err) {
        assert.strictEqual(err.message, 'Invalid parameter: identifier. The transaction corresponding to the given identifier is not an order');
      })
      .then(done);
    });

    test('parse OfferCreate -- missing options.account', function(done) {
      var options = {
        account: undefined
      };

      txToRestConverter.parseOrderFromTx(fixtures.offerCreateTx, options)
      .catch(function(err) {
        assert.strictEqual(err.message, 'Internal Error. must supply options.account');
      })
      .then(done);
    });

    test('parse OfferCreate -- invalid secret', function(done) {
      var options = {
        account: addresses.VALID
      };

      var tx = fixtures.offerCreateTx;
      tx.meta.TransactionResult = 'tejSecretInvalid';

      txToRestConverter.parseOrderFromTx(tx, options)
      .catch(function(err) {
        assert.strictEqual(err.message, 'Invalid secret provided.');
      })
      .then(done);
    });
  });

});
