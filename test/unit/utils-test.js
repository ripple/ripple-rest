var assert = require('assert');
var utils = require('./../../lib/utils.js');

const DEFAULT_LEDGER = 'validated';

suite('unit - utils', function() {
  test('parseLedger() -- ledger (empty string)', function() {
    var ledger = '';
    assert.strictEqual(utils.parseLedger(ledger), DEFAULT_LEDGER);
  });

  test('parseLedger() -- ledger (void)', function() {
    var ledger = void(0);
    assert.strictEqual(utils.parseLedger(ledger), DEFAULT_LEDGER);
  });

  test('parseLedger() -- ledger (hash)', function() {
    var ledger_hash = 'FD22E2A8D665A01711C0147173ECC0A32466BA976DE697E95197933311267BE8';
    assert.strictEqual(utils.parseLedger(ledger_hash), ledger_hash);
  });

  test('parseLedger() -- ledger (sequence)', function() {
    var ledger_sequence = '9592219';
    assert.strictEqual(utils.parseLedger(ledger_sequence), ledger_sequence);
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
    var ledger = 'FD22E2A8D665A01711C0147173ECC0A32466BA976DE697E95197933311267BE';
    assert.strictEqual(ledger.length, 63);
    assert.strictEqual(utils.parseLedger(ledger), DEFAULT_LEDGER);
  });
});
