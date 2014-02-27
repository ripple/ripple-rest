var remoteConnect = require('./remoteConnect');

function getStatus(remote, callback) {

  var status = {
    api_server_status: 'online'
  };

  remoteConnect.ensureConnected(remote, function(err, connected){
    if (err) {
      callback(err);
      return;
    }

    remote.requestServerInfo(function(err, remote_status){
      if (err) {
        callback(err);
        return;
      }

      status.rippled_server_url = remote._getServer()._opts.url;
      status.rippled_server_status = remote_status;

      callback(null, status);
    });
  });
}

function isConnected(remote, callback) {

  remoteConnect.ensureConnected(remote, callback);

}

function remoteHasLedger(remote, ledger, callback) {

  var ledger_index = parseInt(ledger, 10);

  getStatus(remote, function(err, status){
    if (err) {
      callback(err);
      return;
    }

    var ledger_range = status.rippled_server_status.info.complete_ledgers,
      min_max = ledger_range.split('-'),
      min = parseInt(min_max[0], 10),
      max = parseInt(min_max[1], 10);

    if (ledger_index >= min && ledger_index <= max) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  });
}

module.exports.isConnected     = isConnected;
module.exports.getStatus       = getStatus;
module.exports.remoteHasLedger = remoteHasLedger;