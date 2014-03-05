var tv4 = require('tv4');
var fs  = require('fs');

// Load Schemas
var schemas = fs.readdirSync('../schemas');
schemas.forEach(function(path){
  var file = fs.readFileSync(path, {encoding: 'utf8'}),
    json = JSON.parse(file);

  // Set checkRecursive flag and add schema to tv4
  if (json.properties.previous) {
    tv4.addSchema(json.title, json, true, true);
  } else {
    tv4.addSchema(json.title, json, false, true);
  }
  
});

module.exports = tv4;
