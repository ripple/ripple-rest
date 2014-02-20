var fs    = require('fs');
var nconf = require('nconf');


/* Load Configuration */
nconf
  .argv()
  .env();

// If config.json exists, load from that
try {
  var config_url = './config.json';
  fs.readFileSync(config_url);
  nconf.file(config_url);
} catch (err) {}

// Load defaults
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

if (!/postgres:\/\/([^:]+):?([^@]*)@([^:]+):(\d+)\/?(.*)/.test(nconf.get('DATABASE_URL'))) {
  throw(new Error('Invalid DATABASE_URL: ' + nconf.get('DATABASE_URL')));
}

module.exports = nconf;
