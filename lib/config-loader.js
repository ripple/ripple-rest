var fs    = require('fs');
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

// Get rippled from command line args, if supplied
if (nconf.get('rippled')) {
  var match = nconf.get('rippled').match(/^(wss|ws):\/\/(.+):([0-9]+)$/);
  if (match) {
    nconf.overrides({
      rippled_servers: [{
        host: match[2],
        port: match[3],
        secure: (match[1] === 'wss')
      }]
    });
  }
}

function checkConfig() {
  // Print configuration and exit

  try {
    fs.readFileSync(config_url);
  } catch (e) {
    console.error('failed to load configuration ' + config_url);
    process.exit(1);
  }

  nconf.file(config_url);

  console.log(JSON.stringify(nconf.get(), null, 2));

  process.exit(0);
};

if (~process.argv.indexOf('--checkconfig')) {
  return checkConfig();
}

// If config.json exists, load from that
try {
  nconf.file(config_url);
} catch (e) {
}

nconf.defaults({
  PORT: 5990,
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

module.exports = nconf;
