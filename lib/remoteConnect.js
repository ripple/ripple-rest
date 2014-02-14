module.exports.ensureConnected = function(remote, callback) {

  if (!remote || typeof remote !== 'object' || remote.constructor.name !== 'Remote') {
    if (typeof remote === 'function') {
      callback = remote;
    } else if (typeof callback !== 'function') {
      throw(new Error('Invalid parameter: remote. This function needs a ripple-lib Remote'));
    }
    callback(new Error('Invalid parameter: remote. This function needs a ripple-lib Remote'));
    return;
  }

  if (isConnected(remote)) {
    callback(null, true);
    return;
  } else {
    var connected = false;

    var onLedgerClosed = function() {
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
        callback(new Error('Cannot connect to rippled. No "ledger_closed" events were heard within 20 seconds, most likely indicating that the connection to rippled has been interrupted or the rippled is unresponsive. Please check your internet connection and server settings and try again.'));
      }
      return;
    }, 20000);

    remote.connect();
  }

};


function isConnected(remote) {
  var server = remote._getServer();
  // console.log('server: ', server);
  if (server && Date.now() - server._lastLedgerClose <= 1000 * 20) {
    return true;
  } else {
    return false;
  }
}
