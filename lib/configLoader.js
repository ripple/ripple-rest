var fs    = require('fs');
var nconf = require('nconf');


/* Load Configuration */
nconf.defaults({
  "PORT": 5990,
  "NODE_ENV": "development",
  "HOST": "localhost",
  "DATABASE_URL": "postgres://ripple_rest_user:password@localhost:5432/ripple_rest_db",
  "rippled_servers": [
    {
      "host": "s_west.ripple.com",
      "port": 443,
      "secure": true
    }
  ]
});

// If config-example.json exists, overwrite previous settings
try {
  var config_example_url = './config-example.json';
  fs.readFileSync(config_example_url);
  nconf.file(config_example_url);
} catch (err) {}

// If config.json exists, overwrite previous settings 
try {
  var config_url = './config.json';
  fs.readFileSync(config_url);
  nconf.file(config_url);
} catch (err) {}

// If environment variables are set, overwrite previous settings
nconf.env();

// If command line options are used, overwrite previous settings
nconf.argv();

module.exports = nconf;
