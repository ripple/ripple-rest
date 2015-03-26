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

    test('with maxFee', function() {
      assert(
        validator.isValid(
          {maxFee: validFee}, 'Instructions'));
    });

    test('with fixedFee', function() {
      assert(
        validator.isValid(
          {fixedFee: validFee}, 'Instructions'));
    });

    test('with maxLedgerVersion', function() {
      assert(
        validator.isValid(
          {maxLedgerVersion: validSequence}, 'Instructions'));
    });

    test('with sequence, maxLedgerVersion, maxFee', function() {
      assert(
        validator.isValid({
          sequence: validSequence,
          maxLedgerVersion: validSequence,
          maxFee: validFee}, 'Instructions'));
    });
  });

  suite('invalid instructions', function() {
    test('with maxFee and fixedFee', function() {
      assert(
        !validator.isValid(
          {maxFee: validFee, fixedFee: validFee}, 'Instructions'));
    });

    test('with invalid ledger version -- negative', function() {
      assert(
        !validator.isValid(
          {maxLedgerVersion: -1}, 'Instructions'));
    });

    test('with invalid ledger version -- float', function() {
      assert(
        !validator.isValid(
          {maxLedgerVersion: 1.1}, 'Instructions'));
    });
  });
});
