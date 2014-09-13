var ripple  = require('ripple-lib');
var config = require(__dirname+'/config-loader');
var dbinterface = require(__dirname+'/db-interface');

var remoteOpts = {
  servers: config.get('rippled_servers'),
  storage: dbinterface
};

if (config.get('debug')) {
  remoteOpts.trace = true;
}

var remote = new ripple.Remote(remoteOpts);

module.exports = remote;

if (config.get('NODE_ENV') === 'test') {
  return;
}

var connect = remote.connect;

remote.connect = function() {
  console.log('Attempting to connect to the Ripple Network...');
  connect.apply(remote, arguments);
};

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
      console.log('Connected to rippled server at:', remote._getServer()._opts.url);
      console.log('ripple-rest server ready');
    }
  });
});

setInterval(function() {
  var pingRequest = remote.request('ping');
  pingRequest.on('error', function(){});
  pingRequest.broadcast();
}, 1000 * 15);
