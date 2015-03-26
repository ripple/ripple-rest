'use strict';
var assert = require('assert');
var validator = require('server/schema-validator');

suite('Address Schema', function() {
  suite('valid addresses', function() {

    var addresses = [
      'rfaw1MJk5613LmHeAiuhUPZpD93KCMKgrH',
      'rf6Dn3kTVy9wL9ZWT9TXWH4ZAaXRJhoVXE',
      'r98y5GiZ5rtSvazRtGiijE1Mra4VtdzjRB',
      'rPMemoGY4bS7HY8sjjHD8LhvoJcBwRyYpV',
      'rsQsbWiVgSQhTDcx76sKFF1gw2dcUJTgkf'
    ];

    addresses.forEach(function(address) {
      test(address, function() {
        assert(validator.isValid(address, 'RippleAddress'));
      });
    });

    test('ACCOUNT_ZERO', function() {
      assert(validator.isValid('rrrrrrrrrrrrrrrrrrrrrhoLvTp', 'RippleAddress'));
    });

    test('ACCOUNT_ONE', function() {
      assert(validator.isValid('rrrrrrrrrrrrrrrrrrrrBZbvji', 'RippleAddress'));
    });

    test('root account', function() {
      assert(validator.isValid(
        'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', 'RippleAddress'));
    });
  });

  suite('invalid addresses', function() {
    test('bitcoin address', function() {
      assert(!validator.isValid(
        '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', 'RippleAddress'));
    });
  });
});
