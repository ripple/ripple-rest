var ripple  = require('ripple-lib');
var config = require('./config-loader');
var dbinterface = require('./db-interface');
var logger = require('./logger.js').logger;

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
  logger.info('Attempting to connect to the Ripple Network...');
  connect.apply(remote, arguments);
};

remote.on('error', function(err) {
  logger.error('ripple-lib Remote error: ', err);
});

remote.on('disconnect', function() {
  logger.info('Disconnected from rippled');
});

remote.on('connect', function() {
  logger.info('Connected to rippled');
  logger.info('Waiting for confirmation of network activity...');

  remote.once('ledger_closed', function() {
    if (remote._getServer()) {
      logger.info('Connected to rippled server at:', remote._getServer()._opts.url);
      logger.info('ripple-rest server ready');
    }
  });
});

setInterval(function() {
  var pingRequest = remote.request('ping');
  pingRequest.on('error', function(){});
  pingRequest.broadcast();
}, 1000 * 15);
