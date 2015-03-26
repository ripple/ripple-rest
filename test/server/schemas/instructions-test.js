'use strict';
var assert = require('assert');
var validator = require('server/schema-validator');

var validSequence = 12345;
var validFee = '1.1';

suite('Instructions Schema', function() {
  suite('valid instructions', function() {
    test('with sequence', function() {
      assert(
        validator.isValid(
          {sequence: validSequence}, 'Instructions'));
    });

    test('with max_fee', function() {
      assert(
        validator.isValid(
          {max_fee: validFee}, 'Instructions'));
    });

    test('with fixed_fee', function() {
      assert(
        validator.isValid(
          {fixed_fee: validFee}, 'Instructions'));
    });

    test('with max_ledger_version', function() {
      assert(
        validator.isValid(
          {max_ledger_version: validSequence}, 'Instructions'));
    });

    test('with sequence, max_ledger_version, max_fee', function() {
      assert(
        validator.isValid({
          sequence: validSequence,
          max_ledger_version: validSequence,
          max_fee: validFee}, 'Instructions'));
    });
  });

  suite('invalid instructions', function() {
    test('with max_fee and fixed_fee', function() {
      assert(
        !validator.isValid(
          {max_fee: validFee, fixed_fee: validFee}, 'Instructions'));
    });

    test('with invalid ledger version -- negative', function() {
      assert(
        !validator.isValid(
          {max_ledger_version: -1}, 'Instructions'));
    });

    test('with invalid ledger version -- float', function() {
      assert(
        !validator.isValid(
          {max_ledger_version: 1.1}, 'Instructions'));
    });
  });
});
