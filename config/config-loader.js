var fs    = require('fs');
var nconf = require('nconf');


/** Load Configuration according to the following hierarchy 
 *  (where items higher on the list take precedence)
 *
 *  1. Command line arguments
 *  2. Environment variables
 *  3. The config.json file (if it exists) in the root directory
 *  4. The defaults defined below
 */


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