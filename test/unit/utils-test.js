'use strict';

var assert = require('assert');
var utils = require('../../api/lib/utils.js');
var convertAmount = require('../../api/transaction/utils').convertAmount;
var addresses = require('./../fixtures/addresses.js');
var _ = require('lodash');

suite('unit - utils.parseLedger()', function() {
  var DEFAULT_LEDGER = 'validated';

  test('parseLedger() -- ledger (empty string)', function() {
    var ledger = '';
    assert.strictEqual(utils.parseLedger(ledger), DEFAULT_LEDGER);
  });

  test('parseLedger() -- ledger (undefined)', function() {
    assert.strictEqual(utils.parseLedger(undefined), DEFAULT_LEDGER);
  });

  test('parseLedger() -- ledger (hash)', function() {
    var ledger_hash =
      'FD22E2A8D665A01711C0147173ECC0A32466BA976DE697E95197933311267BE8';
    assert.strictEqual(utils.parseLedger(ledger_hash), ledger_hash);
  });

  test('parseLedger() -- ledger (sequence)', function() {
    var ledger_sequence = '9592219';
    assert.strictEqual(utils.parseLedger(ledger_sequence), 9592219);
  });

  test('parseLedger() -- ledger (validated)', function() {
    var ledger = 'validated';
    assert.strictEqual(utils.parseLedger(ledger), ledger);
  });

  test('parseLedger() -- ledger (closed)', function() {
    var ledger = 'closed';
    assert.strictEqual(utils.parseLedger(ledger), ledger);
  });

  test('parseLedger() -- ledger (current)', function() {
    var ledger = 'current';
    assert.strictEqual(utils.parseLedger(ledger), ledger);
  });

  test('parseLedger() -- ledger (foo)', function() {
    var ledger = 'foo';
    assert.strictEqual(utils.parseLedger(ledger), DEFAULT_LEDGER);
  });

  test('parseLedger() -- ledger (negative number)', function() {
    var ledger = -1;
    assert.strictEqual(utils.parseLedger(ledger), DEFAULT_LEDGER);
  });

  test('parseLedger() -- ledger (zero)', function() {
    var ledger = -1;
    assert.strictEqual(utils.parseLedger(ledger), DEFAULT_LEDGER);
  });

  test('parseLedger() -- ledger (infinity)', function() {
    var ledger = -1;
    assert.strictEqual(utils.parseLedger(ledger), DEFAULT_LEDGER);
  });

  test('parseLedger() -- ledger (invalid hash)', function() {
    var ledger =
      'FD22E2A8D665A01711C0147173ECC0A32466BA976DE697E95197933311267BE';
    assert.strictEqual(ledger.length, 63);
    assert.strictEqual(utils.parseLedger(ledger), DEFAULT_LEDGER);
  });
});

suite('unit - utils.parseCurrencyAmount()', function() {
  var nativeAmount = '1000000';
  var usdAmount = {
    currency: 'USD',
    issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
    amount: '100'
  };

  test('parseCurrencyAmount() -- XRP', function() {
    assert.deepEqual(utils.parseCurrencyAmount(nativeAmount), {
      currency: 'XRP',
      counterparty: '',
      value: utils.dropsToXrp(nativeAmount)
    });
  });

  test('parseCurrencyAmount() -- USD', function() {
    assert.deepEqual(utils.parseCurrencyAmount(usdAmount), {
      currency: usdAmount.currency,
      counterparty: usdAmount.issuer,
      value: usdAmount.value
    });
  });
});

suite('unit - utils.parseCurrencyQuery()', function() {

  test('parseCurrencyQuery() -- value+XRP', function() {
    assert.deepEqual(utils.parseCurrencyQuery('123+XRP'), {
      value: '123',
      currency: 'XRP',
      counterparty: ''
    });
  });

  test('parseCurrencyQuery() -- XRP', function() {
    assert.deepEqual(utils.parseCurrencyQuery('XRP'), {
      currency: 'XRP',
      counterparty: ''
    });
  });

  test('parseCurrencyQuery() -- USD', function() {
    assert.deepEqual(utils.parseCurrencyQuery('USD'), {
      currency: 'USD',
      counterparty: ''
    });
  });

  test('parseCurrencyQuery() -- 123+USD', function() {
    assert.deepEqual(utils.parseCurrencyQuery('123+USD'), {
      value: '123',
      currency: 'USD',
      counterparty: ''
    });
  });

  test('parseCurrencyQuery() -- USD+counterparty', function() {
    assert.deepEqual(utils.parseCurrencyQuery('USD+' + addresses.VALID), {
      currency: 'USD',
      counterparty: addresses.VALID
    });
  });

  test('parseCurrencyQuery() -- 123+USD+counterparty', function() {
    assert.deepEqual(utils.parseCurrencyQuery('123+USD+' + addresses.VALID), {
      value: '123',
      currency: 'USD',
      counterparty: addresses.VALID
    });
  });

  test('parseCurrencyQuery() -- XRP+counterparty', function() {
    assert.deepEqual(utils.parseCurrencyQuery('XRP+' + addresses.VALID), {
      currency: 'XRP',
      counterparty: addresses.VALID
    });
  });

  test('parseCurrencyQuery() -- 123+XRP+counterparty', function() {
    assert.deepEqual(utils.parseCurrencyQuery('123+XRP+' + addresses.VALID), {
      value: '123',
      currency: 'XRP',
      counterparty: addresses.VALID
    });
  });

  test('parseCurrencyQuery() -- XRP+', function() {
    assert.deepEqual(utils.parseCurrencyQuery('XRP+'), {
      currency: 'XRP',
      counterparty: ''
    });
  });

  test('parseCurrencyQuery() -- 123+XRP+', function() {
    assert.deepEqual(utils.parseCurrencyQuery('123+XRP+'), {
      value: '123',
      currency: 'XRP',
      counterparty: ''
    });
  });

  test('parseCurrencyQuery() -- 123', function() {
    assert.deepEqual(utils.parseCurrencyQuery('123'), {
      value: '123',
      currency: '',
      counterparty: ''
    });
  });
});

suite('unit - convertAmount()', function() {

  test('convertAmount() -- XRP', function() {
    var amount = {
      value: '1',
      currency: 'XRP',
      counterparty: ''
    };

    assert.strictEqual(convertAmount(amount), '1000000');
  });

  test('convertAmount() -- USD', function() {
    var amount = {
      value: '1',
      currency: 'USD',
      counterparty: addresses.COUNTERPARTY
    };

    assert.deepEqual(convertAmount(amount), {
      value: '1',
      currency: 'USD',
      issuer: addresses.COUNTERPARTY
    });
  });

  test('convertAmount() -- XRP, using issuer in amount', function() {
    var amount = {
      value: '1',
      currency: 'XRP',
      issuer: ''
    };

    assert.strictEqual(convertAmount(amount), '1000000');
  });

  test('convertAmount() -- USD, using issuer in amount', function() {
    var amount = {
      value: '1',
      currency: 'USD',
      issuer: addresses.COUNTERPARTY
    };

    assert.deepEqual(convertAmount(amount), {
      value: '1',
      currency: 'USD',
      issuer: addresses.COUNTERPARTY
    });
  });
});

suite('unit - utils.compareTransactions()', function() {

  function toStringValues(tx) {
    return _.mapValues(tx, function(val) {
      if (typeof val === 'number') {
        return val.toString();
      } else if (typeof val === 'object') {
        return toStringValues(val);
      }
      return val;
    });
  }

  test('compareTransactions() -- different ledgers', function() {
    var tx1 = {
      ledger_index: 1
    };

    var tx2 = {
      ledger_index: 2
    };

    assert.strictEqual(utils.compareTransactions(tx1, tx2), -1);
    assert.strictEqual(
      utils.compareTransactions(
        toStringValues(tx1), toStringValues(tx2)), -1);
  });

  test('compareTransactions() -- same ledger', function() {
    var tx1 = {
      ledger_index: 1,
      meta: {
        TransactionIndex: 2
      }
    };

    var tx2 = {
      ledger_index: 1,
      meta: {
        TransactionIndex: 1
      }
    };

    assert.strictEqual(utils.compareTransactions(tx1, tx2), 1);
    assert.strictEqual(
      utils.compareTransactions(
        toStringValues(tx1), toStringValues(tx2)), 1);
  });

  test('compareTransactions() -- same transaction', function() {
    var tx1 = {
      ledger_index: 1,
      meta: {
        TransactionIndex: 2
      }
    };

    assert.strictEqual(utils.compareTransactions(tx1, tx1), 0);
    assert.strictEqual(
      utils.compareTransactions(
        toStringValues(tx1), toStringValues(tx1)), 0);
  });

});
