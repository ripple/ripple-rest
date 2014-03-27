var fs    = require('fs');
var path  = require('path');
var URL   = require('url');
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

// If config.json exists, load from that
var configPath = nconf.get('config') || path.join(__dirname, '/config.json');

if (fs.existsSync(configPath)) {
  nconf.file(configPath);
}

if (nconf.get('rippled')) {
  var rippledURL = URL.parse(nconf.get('rippled'));

  var opts = {
    host: rippledURL.hostname,
    port: Number(rippledURL.port),
    secure: (rippledURL.protocol === 'wss:')
  }

  nconf.set('rippled_servers', [ opts ]);
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
  ]
});

module.exports = nconf;
