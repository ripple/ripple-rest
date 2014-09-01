var fs = require('fs');
var path = require('path');
var nconf = require('nconf');

/** Load Configuration according to the following hierarchy
 *  (where items higher on the list take precedence)
 *
 *  1. Command line arguments
 *  2. Environment variables
 *  3. The config.json file (if it exists) in the root directory
 *  4. The defaults defined below
 */

nconf.argv().env();

var config_url = nconf.get('config') || path.join(process.cwd(), 'config.json');

// Load config.json
try {
  nconf.file(config_url);
} catch (e) {
  if (nconf.get('checkconfig')) {
    console.error(e);
    process.exit(1);
  }
}

// Override `rippled_servers` with `rippled` if it exists
if (/^(wss|ws):\/\/.+:[0-9]+$/.test(nconf.get('rippled'))) {
  nconf.overrides({
    rippled_servers: [ nconf.get('rippled') ]
  });
}

// Config defaults
nconf.defaults({
  //PORT: 5990,
  NODE_ENV: 'development',
  HOST: 'localhost',
  // sqlite: {
  //   schemas: __dirname + '/../schemas-for-sqlite',
  //   files: __dirname + '../'
  // },
  rippled_servers: [
    {
      host: 's-west.ripple.com',
      port: 443,
      secure: true
    }
  ],
  debug: false
});

// Print configuration and exit
if (nconf.get('checkconfig')) {
  console.log(JSON.stringify(nconf.get('PORT'), null, 2));
  process.exit(0);
}

module.exports = nconf;
