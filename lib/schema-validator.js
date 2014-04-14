var jayschema = require('jayschema');
var path = require('path');
var fs  = require('fs');

var baseDir   = path.join(__dirname, '/../schemas');

module.exports = (function() {
  var validator = new jayschema();
  var validate  = validator.validate;

  // If schema is valid, return true. Otherwise
  // return array of validation errors
  validator.validate = function() {
    var result = validate.apply(validator, arguments);
    return result.length
    ? { isValid: false, err: result }
    : { isValid: true, err: [ ] }
  };

  validator.isValid = function() {
    return validator.validate.apply(validator, arguments).isValid;
  };

  // Load Schemas
  var schemas = fs.readdirSync(baseDir)
  .map(function(fileName) {
    return JSON.parse(fs.readFileSync(path.join(baseDir, fileName), 'utf8'));
  })
  .forEach(function(schema) {
    schema.id = schema.title;
    validator.register(schema);
  });

  return validator;
})();
