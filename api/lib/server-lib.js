/* eslint-disable valid-jsdoc */
'use strict';
var errors = require('./errors');

/**
 * If a ledger is not received in this time, consider the connection offline
 */
var CONNECTION_TIMEOUT = 1000 * 30;

/**
 * Determine if remote is connected based on time of last ledger closed
 *
 * @param {Server} server
 * @return {Boolean}
 */
function isConnected(remote) {
  if (isNaN(remote._ledger_current_index)) {
    // Remote is missing the index of last ledger closed. Unprepared to submit
    // transactions
    return false;
  }

  var server = remote.getServer();
  if (!server) {
    return false;
  }

  if (remote._stand_alone) {
    // If rippled is in standalone mode we can assume there will not be a
    // ledger close within 30 seconds.
    return true;
  }

  return (Date.now() - server._lastLedgerClose) <= CONNECTION_TIMEOUT;
}

/**
 * Check if remote is connected and attempt to reconnect if not
 *
 * @param {Remote} remote
 * @param {Function} callback
 */
function ensureConnected(remote, callback) {
  if (remote.getServer()) {
    callback(null, isConnected(remote));
  } else {
    callback(null, false);
  }
}

/**
 * @param {Remote} remote
 * @param {Function} callback
 */
function getStatus(remote, callback) {
  remote.requestServerInfo(function(error, serverInfo) {
    if (error) {
      callback(error);
    } else {
      var server = remote.getServer();
      if (!server) {
        callback(new errors.RippledNetworkError('Not connected'));
      } else {
        callback(null, {
          rippled_server_url: server._url,
          rippled_server_status: serverInfo.info
        });
      }
    }
  });
}

/**
 * @param {Remote} remote
 * @param {Number|String} ledger
 * @param {Function} callback
 */
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

    if (ledger_index >= min && ledger_index <= max) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }

  getStatus(remote, handleStatus);
}

module.exports = {
  CONNECTION_TIMEOUT: CONNECTION_TIMEOUT,
  getStatus: getStatus,
  isConnected: isConnected,
  ensureConnected: ensureConnected,
  remoteHasLedger: remoteHasLedger
};
