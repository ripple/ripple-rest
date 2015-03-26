'use strict';
var _ = require('lodash');
var assert = require('assert');
var validator = require('server/schema-validator');

var defaultRequest = {
  address: 'rfaw1MJk5613LmHeAiuhUPZpD93KCMKgrH',
  direction: 'buy',
  quantity: {
    value: '1000',
    currency: 'USD',
    counterparty: 'rf6Dn3kTVy9wL9ZWT9TXWH4ZAaXRJhoVXE'
  },
  totalPrice: {
    value: '1',
    currency: 'BTC',
    counterparty: 'rf6Dn3kTVy9wL9ZWT9TXWH4ZAaXRJhoVXE'
  },
  instructions: {
    sequence: 10
  }
};

function validationErrors(request) {
  return validator.validate(request, 'OrderRequest').err;
}

function isValid(request) {
  return validationErrors(request).length === 0;
}

suite('OrderRequest Schema', function() {
  suite('valid order request', function() {
    test('minimal with instructions', function() {
      assert.deepEqual(validationErrors(defaultRequest), []);
    });
  });

  suite('invalid trustline request', function() {
    test('missing direction', function() {
      assert(!isValid(_.omit(defaultRequest, 'direction')));
    });
  });
});
