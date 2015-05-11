/* eslint-disable new-cap */
/* eslint-disable max-len */
'use strict';

var assert = require('assert-diff');
var fixtures = require('./fixtures').txConverter;
var addresses = require('./../fixtures').addresses;
var txToRestConverter = require('./../../api/lib/tx-to-rest-converter.js');

suite('unit - converter - Tx to Rest', function() {
  test('parsePaymentFromTx()', function() {
    var tx = fixtures.paymentTx();
    var message = {tx_json: tx};
    var meta = tx.meta;
    var payment = txToRestConverter.parsePaymentFromTx(addresses.VALID,
      message, meta);
    assert.deepEqual(payment.payment, fixtures.paymentRest);
  });

  test('parsePaymentFromTx() -- complicated meta', function() {
    var tx = fixtures.paymentTx({
      meta: fixtures.COMPLICATED_META
    });
    var message = {tx_json: tx};
    var meta = tx.meta;
    tx.Destination = 'rGAWXLxpsy77vWxgYriPZE5ktUfqa6prbG';
    var payment = txToRestConverter.parsePaymentFromTx(addresses.VALID,
      message, meta).payment;

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
  });

  test('parsePaymentsFromPathFind()', function() {
    var pathFindResults = fixtures.pathFindResultsTx;
    var payments = txToRestConverter.parsePaymentsFromPathFind(pathFindResults);
    assert.deepEqual(payments, fixtures.pathPaymentsRest);
  });

  test('parseCancelOrderFromTx()', function() {
    var txMessage = fixtures.cancelOrderTx;
    var meta = {
      hash: '3fc6fe4050075aa3115f212b64d97565ccd8003412f6404478a256b2f48351f3',
      ledger: '8819996',
      state: 'validated'
    };

    var order = txToRestConverter.parseCancelOrderFromTx(txMessage, meta);
    assert.deepEqual(order, fixtures.cancelOrderResponseRest);
  });

  test('parseSubmitOrderFromTx()', function() {
    var txMessage = fixtures.submitOrderResponseTx;
    var meta = {
      hash: '684fd723577624f4581fd35d3ada8ff9e536f0ce5ab2065a22adf81633be1f2c',
      ledger: '8819982',
      state: 'pending'
    };

    var order = txToRestConverter.parseSubmitOrderFromTx(txMessage, meta);
    assert.deepEqual(order, fixtures.submitOrderResponseRest);
  });

  test('parseTrustResponseFromTx()', function() {
    var txMessage = fixtures.trustResponseTx;
    var meta = {
      hash: '0F480D344CFC610DFA5CAC62CC1621C92953A05FE8C319281CA49C5C162AF40E',
      ledger: '8820111',
      state: 'validated'
    };

    var trustline = txToRestConverter.parseTrustResponseFromTx(txMessage, meta);
    assert.deepEqual(trustline, fixtures.trustResponseRest);
  });

  test('parseSettingsResponseFromTx()', function() {
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

    var settings = txToRestConverter.parseSettingsResponseFromTx(
      params.settings, txMessage, meta);
    assert.deepEqual(settings, fixtures.settingResponseRest);
  });

  test('parseFlagsFromResponse()', function() {
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

    var parsedFlags = txToRestConverter.parseFlagsFromResponse(
      responseFlags, flags);

    assert.deepEqual(parsedFlags, {
      prevent_rippling: true,
      account_trustline_frozen: false,
      authorized: false
    });
  });

  suite('parseOrderFromTx', function() {
    test('parse OfferCreate', function() {
      var options = {
        account: addresses.VALID
      };

      var orderChange = txToRestConverter.parseOrderFromTx(
        fixtures.offerCreateTx, options);
      assert.deepEqual(orderChange, fixtures.parsedOfferCreateTx);
    });

    test('parse OfferCancel', function() {
      var options = {
        account: addresses.VALID
      };

      var orderChange = txToRestConverter.parseOrderFromTx(
        fixtures.offerCancelTx, options);
      assert.deepEqual(orderChange, fixtures.parsedOfferCancelTx);
    });

    test('parse Payment -- invalid transaction type', function() {
      var options = {
        account: addresses.VALID
      };

      assert.throws(function() {
        txToRestConverter.parseOrderFromTx(fixtures.paymentTx(), options);
      }, 'Invalid parameter: identifier. The transaction corresponding to'
          + ' the given identifier is not an order'
      );
    });

    test('parse OfferCreate -- missing options.account', function() {
      var options = {
        account: undefined
      };

      assert.throws(function() {
        txToRestConverter.parseOrderFromTx(fixtures.offerCreateTx, options);
      }, 'Internal Error. must supply options.account');
    });

    test('parse OfferCreate -- invalid secret', function() {
      var options = {
        account: addresses.VALID
      };

      var tx = fixtures.offerCreateTx;
      tx.meta.TransactionResult = 'tejSecretInvalid';

      assert.throws(function() {
        txToRestConverter.parseOrderFromTx(tx, options);
      }, 'Invalid secret provided.');
    });
  });
});
