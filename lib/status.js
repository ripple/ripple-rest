var remoteConnect = require('./remoteConnect');

module.exports.getStatus = function(remote, callback) {

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

};
