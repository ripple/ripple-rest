var path = require('path');
var nconf = require('nconf');

/**
 * Resolve absolute path of configuration property
 */

function resolvePath(p) {
  return path.resolve(__dirname, '..', p);
};

/**
 * Load Configuration according to the following hierarchy
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

if (nconf.get('db_path')) {
  // Resolve absolute db_path
  nconf.set('db_path', resolvePath(nconf.get('db_path')));
}

if (nconf.get('ssl')) {
  // Resolve absolute ssl cert and key paths
  var sslConfig = nconf.get('ssl');
  var keyPath = sslConfig.key_path;
  var certPath = sslConfig.cert_path;

  if (keyPath) {
    sslConfig.key_path = resolvePath(keyPath);
  }
  if (certPath) {
    sslConfig.cert_path = resolvePath(certPath);
  }

  nconf.set('ssl', sslConfig);
}

// Print configuration and exit
if (nconf.get('checkconfig')) {
  console.log(JSON.stringify(nconf.get(), null, 2));
  process.exit(0);
}

module.exports = nconf;
