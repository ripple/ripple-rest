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

    var onLedgerClosed = function() {
      if (isConnected(remote)) {
        remote.removeListener('ledger_closed', onLedgerClosed);
        callback(null, true);
        return;
      }
    };

    remote.on('ledger_closed', onLedgerClosed);

    setTimeout(function(){
      remote.removeListener('ledger_closed', onLedgerClosed);
      callback(new Error('Cannot connect to the Ripple network. Please check your internet connection and server settings and try again.'));
      return;
    }, 10000);
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
