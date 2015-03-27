'use strict';
var _ = require('lodash');
var assert = require('assert-diff');
var validator = require('server/schema-validator');

var iouAmount = {
  value: '100.1',
  currency: 'USD',
  counterparty: 'rfaw1MJk5613LmHeAiuhUPZpD93KCMKgrH'
};

var xrpAmount = {
  value: '10',
  currency: 'XRP'
};

function validationErrors(request) {
  return validator.validate(request, 'Amount').errors;
}

function isValid(request) {
  return validationErrors(request).length === 0;
}

suite('Amount Schema', function() {
  suite('valid amount', function() {
    test('IOU amount', function() {
      assert.deepEqual(validationErrors(iouAmount), validator.noError);
    });
    test('XRP amount', function() {
      assert.deepEqual(validationErrors(xrpAmount), validator.noError);
    });
  });

  suite('invalid amount', function() {
    test('xrp with counterparty', function() {
      var amount = _.assign(_.clone(xrpAmount), {counterparty:
        'rfaw1MJk5613LmHeAiuhUPZpD93KCMKgrH'});
      assert(!isValid(amount));
    });
    test('iou without counterparty', function() {
      assert(!isValid(_.omit(iouAmount, 'counterparty')));
    });
  });
});
