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

nconf.defaults({
  "PORT": 5990,
  "NODE_ENV": "development",
  "HOST": "localhost",
  "rippled_servers": [
    {
      "host": "s-west.ripple.com",
      "port": 443,
      "secure": true
    }
  ]
});

module.exports = nconf;