var jayschema = require('jayschema');
var fs  = require('fs');

var validator = new jayschema();

// Load Schemas
var schemas = fs.readdirSync(__dirname + '/../schemas/');
schemas.forEach(function(path){
  var file = fs.readFileSync(__dirname + '/../schemas/' + path, {encoding: 'utf8'}),
    json = JSON.parse(file);

  json.id = json.title;

  validator.register(json);
  
});

console.log(validator.getMissingSchemas());

module.exports = validator;
