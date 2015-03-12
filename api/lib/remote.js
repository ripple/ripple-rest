'use strict';
var ripple = require('ripple-lib');
var config = require('./config');
var logger = require('./logger.js').logger;

var remoteOpts = {
  servers: config.get('rippled_servers'),
  max_fee: parseFloat(config.get('max_transaction_fee'))
};

if (config.get('debug')) {
  remoteOpts.trace = true;
}

var remote = new ripple.Remote(remoteOpts);

function prepareRemote() {
  var connect = remote.connect;
  var connected = false;

  function ready() {
    if (!connected) {
      logger.info('[RIPD] Connection established');
      connected = true;
    }
  }

  remote.connect = function() {
    logger.info('[RIPD] Attempting to connect to the Ripple network...');
    connect.apply(remote, arguments);
  };

  remote.on('error', function(err) {
    logger.error('[RIPD] error: ', err);
  });

  remote.on('disconnect', function() {
    logger.info('[RIPD] Disconnected from the Ripple network');
    connected = false;
  });

  remote._servers.forEach(function(server) {
    server.on('connect', function() {
      logger.info('[RIPD] Connected to rippled server:', server.getServerID());
      server.once('ledger_closed', ready);
    });
    server.on('disconnect', function() {
      logger.info('[RIPD] Disconnected from rippled server:',
        server.getServerID());
    });
  });

  process.on('SIGHUP', function() {
    logger.info('Received signal SIGHUP, reconnecting to Ripple network');
    remote.reconnect();
  });

  setInterval(function() {
    var pingRequest = remote.request('ping');
    pingRequest.on('error', function() {});
    pingRequest.broadcast();
  }, 1000 * 15);

  remote.connect();
}

if (config.get('NODE_ENV') !== 'test') {
  prepareRemote();
}

module.exports = remote;
