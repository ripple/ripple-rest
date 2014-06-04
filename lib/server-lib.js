var async = require('async');
var ripple = require('ripple-lib');

const CONNECTION_TIMEOUT = 1000 * 25;

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
  if (!(remote instanceof ripple.Remote)) {
    return false;
  }

  var server = remote._getServer();

  if (!server) {
    // No connected servers
    return false;
  }

  var delta = Date.now() - server._lastLedgerClose;

  // Ledgers should close within ~20s
  return delta < CONNECTION_TIMEOUT;
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

  var timeout_duration;

  if (remote._getServer() && remote._getServer().server) {
    timeout_duration = Date.now() - remote._getServer().server._lastLedgerClose;
  } else {
    timeout_duration = CONNECTION_TIMEOUT;
  }

  setTimeout(function() {
    if (connected) {
      return;
    }

    remote.removeListener('ledger_closed', onLedgerClosed);

    callback(new Error('Cannot connect to rippled. No "ledger_closed" events were heard within 20 seconds, most likely indicating that the connection to rippled has been interrupted or the rippled is unresponsive. Please check your internet connection and server settings and try again.'));
  }, timeout_duration);

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

    callback(null, hasLedger);
  };

  getStatus(remote, handleStatus);
};

module.exports.getStatus       = getStatus;
module.exports.isConnected     = isConnected;
module.exports.ensureConnected = ensureConnected;
module.exports.remoteHasLedger = remoteHasLedger;
