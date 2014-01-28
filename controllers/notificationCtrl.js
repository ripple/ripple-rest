var notificationLib = require('../lib/notification'),
  errorHandler = require('./errorHandler');

// TODO validate all options

module.exports = function(opts) {

  var remote = opts.remote,
    OutgoingTx = opts.OutgoingTx,
    port = opts.port;  

  return {

    getNextNotification: function(req, res) {

      var address = req.param('address'),
        prev_tx_hash = req.param('prev_tx_hash');

      notificationLib.getNextNotification({
        remote: remote,
        OutgoingTx: OutgoingTx,
        address: address, 
        prev_tx_hash: prev_tx_hash
      }, function(err, notification){
        if (err) {
          errorHandler(res, err);
          return;
        }

        if (notification.tx_url) {
          notification.tx_url = req.protocol + '://' + req.host + (port ? (':' + port) : '') + '/api/v1' + notification.tx_url;
        } else {
          notification.tx_url = '';
        }

        res.send({
          success: true,
          notification: notification
        });

      });
    }
  };

};