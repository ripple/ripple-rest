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

nconf.argv();

// These variables should be reconsidered
nconf.env([ 'NODE_ENV', 'DATABASE_URL' ]);

var configURL = nconf.get('config') || process.env['TEST_CONFIG'] || path.join(__dirname, '/../config.json');

// Load config.json
try {
  nconf.file(configURL);
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

// Print configuration and exit
if (nconf.get('checkconfig')) {
  console.log(JSON.stringify(nconf.get(), null, 2));
  process.exit(0);
}

module.exports = nconf;
