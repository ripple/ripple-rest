var ripple  = require('ripple-lib');
var config = require(__dirname+'/config-loader');
var dbinterface = require(__dirname+'/db-interface');

var remote_opts = {
  servers: config.get('rippled_servers'),
  storage: dbinterface,
  ping: 15,
};

if (config.get('debug')) {
  remote_opts.trace = true;
}

var remote = new ripple.Remote(remoteOpts);

remote.on('error', function(err) {
  console.error('ripple-lib Remote error: ', err);
});

remote.on('disconnect', function() {
  console.log('Disconnected from rippled');
});

remote.on('connect', function() {
  console.log('Connected to rippled');
  console.log('Waiting for confirmation of network activity...');

  remote.once('ledger_closed', function() {
    if (remote._getServer()) {
      console.log('Connected to rippled server at:', remote._getServer()._remoteOpts.url);
      console.log('ripple-rest server ready');
    }
  });
});

console.log('Attempting to connect to the Ripple Network...');

module.exports = remote;

