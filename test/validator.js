var validator = require(__dirname+'/../lib/schema-validator');
var assert = require('assert');

describe('Schema Validator', function(){

  describe('Ripple Address', function(){

    it('should reject an invalid ripple address', function(){
      assert(!validator.isValid('someinvalidrippleaddress', 'RippleAddress'));
    });

    it('should accept a valid ripple address', function(){
      assert(validator.isValid('r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk', 'RippleAddress'));
    });

  });
});

