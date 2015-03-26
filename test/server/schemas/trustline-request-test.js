'use strict';
var _ = require('lodash');
var assert = require('assert');
var validator = require('server/schema-validator');

var defaultRequest = {
  address: 'rfaw1MJk5613LmHeAiuhUPZpD93KCMKgrH',
  currency: 'USD',
  counterparty: 'rf6Dn3kTVy9wL9ZWT9TXWH4ZAaXRJhoVXE',
  limit: '100.1',
  instructions: {
    sequence: 10
  }
};

function validationErrors(request) {
  return validator.validate(request, 'TrustlineRequest').err;
}

function isValid(request) {
  return validationErrors(request).length === 0;
}

suite('TrustlineRequest Schema', function() {
  suite('valid trustline request', function() {
    test('minimal with instructions', function() {
      assert.deepEqual(validationErrors(defaultRequest), []);
    });
  });

  suite('invalid trustline request', function() {
    test('missing limit', function() {
      assert(!isValid(_.omit(defaultRequest, 'limit')));
    });
  });
});
