var fs  = require('fs');
var path = require('path');
var jayschema = require('jayschema');

var baseDir = path.join(__dirname, '/../schemas');

module.exports = (function() {
  var validator = new jayschema();
  var validate  = validator.validate;

  // If schema is valid, return true. Otherwise
  // return array of validation errors
  validator.validate = function() {
    var result = { err: validate.apply(validator, arguments) };
    result.isValid = Boolean(result.err.length);
    return result;
  };

  validator.isValid = function() {
    return validator.validate.apply(validator, arguments).isValid;
  };

  // Load Schemas
  var schemas = fs.readdirSync(baseDir)
  .filter(function(fileName) {
    return /^[\w\s]+\.json$/.test(fileName);
  })
  .map(function(fileName) {
    try {
      return JSON.parse(fs.readFileSync(path.join(baseDir, fileName), 'utf8'));
    } catch (e) {
      throw new Error('Failed to parse schema: ' + fileName);
    }
  })
  .forEach(function(schema) {
    schema.id = schema.title;
    validator.register(schema);
  });

  return validator;
})();
