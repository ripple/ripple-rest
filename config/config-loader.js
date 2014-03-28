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

// If config.json exists, load from that
try {
  var config_url = nconf.get('config') || './config.json';
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

console.log(nconf.get());

module.exports = nconf;