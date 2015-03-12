'use strict';
var fs = require('fs');
var path = require('path');
var nconf = require('nconf');
var JaySchema = require('jayschema');
var formatJaySchemaErrors = require('jayschema-error-messages');
var configSchema = require('../../schemas/config.json');
var exampleConfig = require('../../config-example.json');

/**
 * Resolve absolute path of configuration property
 */

function resolvePath(p) {
  return path.resolve(__dirname, '../..', p);
}

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
nconf.env(['NODE_ENV', 'DATABASE_URL']);

var configPath = nconf.get('config')
  || process.env.TEST_CONFIG
  || path.join(process.cwd(), 'config.json');

if (nconf.get('NODE_ENV') !== 'test' && !fs.existsSync(configPath)) {
  console.error('ERROR: configuration file not found or not accessible at: '
                + configPath);
  process.exit(1);
}

// Load config.json, nconf.file does not fail if file does not exist
try {
  nconf.file(configPath);
} catch (e) {
  console.error(e);
  process.exit(1);
}

if (nconf.get('NODE_ENV') === 'test') {
  nconf.set('port', exampleConfig.port);
  nconf.set('host', exampleConfig.host);
  nconf.set('rippled_servers', exampleConfig.rippled_servers);
}

// Override `rippled_servers` with `rippled` if it exists
if (/^(wss|ws):\/\/.+:[0-9]+$/.test(nconf.get('rippled'))) {
  nconf.overrides({
    rippled_servers: [nconf.get('rippled')]
  });
}

// check that config matches the required schema
var schemaValidator = new JaySchema();
var schemaErrors = schemaValidator.validate(nconf.get(), configSchema);
if (schemaErrors.length > 0) {
  console.error('ERROR: Invalid configuration');
  console.error(JSON.stringify(formatJaySchemaErrors(schemaErrors), null, 2));
  process.exit(1);
}

if (nconf.get('db_path')) {
  // Resolve absolute db_path
  if (nconf.get('db_path') !== ':memory:') {
    nconf.set('db_path', resolvePath(nconf.get('db_path')));
  }
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
  if (sslConfig.reject_unauthorized === false) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  }

  nconf.set('ssl', sslConfig);
}

// Print configuration and exit
if (nconf.get('checkconfig')) {
  console.log(JSON.stringify(nconf.get(), null, 2));
  process.exit(0);
}

module.exports = nconf;
