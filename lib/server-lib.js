var async = require('async');
var ripple = require('ripple-lib');

module.exports = {
  CONNECTION_TIMEOUT: 60000,
  getStatus: getStatus,
  isConnected: isConnected,
  ensureConnected: ensureConnected,
  remoteHasLedger: remoteHasLedger
};

/**
 *  Check if remote is connected and attempt to reconnect if not
 */

function ensureConnected(remote, callback) {
  if (isConnected(remote)) {
    callback(null, true);
  } else {
    attemptConnect(remote, callback);
  }
};

/**
 *  Determine if remote is connected based on time of last ledger closed
 */

function isConnected(remote) {
  var result = false;

  try {
    var server = remote._getServer();
    var closeDiff = Date.now() - server._lastLedgerClose;
    result = closeDiff <= module.exports.CONNECTION_TIMEOUT;
  } catch (e) { }

  return result;
};

/**
 *  Attempt to reconnect, waiting no longer than 20
 *  seconds after the last ledger_closed event was heard
 */

function attemptConnect(remote, callback) {
  var connected = false;

  function onLedgerClosed() {
    if (isConnected(remote)) {
      connected = true;
      remote.removeListener('ledger_closed', onLedgerClosed);
      callback(null, true);
      return;
    }
  };

  remote.once('ledger_closed', onLedgerClosed);

  setTimeout(function(){
    remote.removeListener('ledger_closed', onLedgerClosed);
    if (!connected) {
      callback(new Error('Cannot connect to rippled. ' +
        'No "ledger_closed" events were heard within 20 seconds, ' +
        'most likely indicating that the connection to rippled has ' +
        'been interrupted or the rippled is unresponsive. Please ' + 
        'check your internet connection and server settings and try again.'));
    }
    return;
  }, module.exports.CONNECTION_TIMEOUT - (Date.now() - remote._getServer()._lastLedgerClose));

  remote.connect();
};

function getStatus(remote, callback) {
  var status = {
    api_server_status: 'online'
  };

  function checkConnectivity(callback) {
    ensureConnected(remote, callback);
  };

  function requestServerInfo(connected, callback) {
    remote.requestServerInfo(callback);
  };

  function prepareResponse(server_info, callback) {
    var results = {};

    results.rippled_server_url = remote._getServer()._opts.url;
    results.rippled_server_status = server_info.info;

    callback(null, results);
  };

  var steps = [
    checkConnectivity,
    requestServerInfo,
    prepareResponse
  ];

  async.waterfall(steps, callback);
};

function remoteHasLedger(remote, ledger, callback) {
  var ledger_index = Number(ledger);

  function handleStatus(err, status) {
    if (err) {
      return callback(err);
    }

    var ledger_range = status.rippled_server_status.complete_ledgers;
    var match = ledger_range.match(/([0-9]+)-([0-9]+)$/);
    var min = Number(match[1]);
    var max = Number(match[2]);
    var hasLedger = ledger_index >= min && ledger_index <= max;

    if (ledger_index >= min && ledger_index <= max) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }

  getStatus(remote, handleStatus);
}
