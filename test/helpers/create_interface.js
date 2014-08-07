var ripple = require('ripple-lib');

function createInterface() {
  var server = new process.EventEmitter;

  server._connected = true;
  server._lastLedgerClose = Date.now() - 1;
  server._opts = { url: 'wss://example.com' };

  server.computeFee = function() {
    return '12';
  };

  var remote = new ripple.Remote({
    servers: [ ]
  });

  remote._servers.push(server);

  remote._getServer = function() {
    return server;
  };

  return { remote: remote }
};

module.exports = createInterface;

