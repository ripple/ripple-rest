var notificationLib = require('../lib/notification'),
  errorHandler = require('./errorHandler');

// TODO validate all options

function NotificationCtrl (remote) {
  
  return {

    getNextNotification: function(req, res) {

      var address = req.param('address'),
        prev_tx_hash = req.param('prev_tx_hash');

      notificationLib.getNextNotification(remote, {
        address: address, 
        prev_tx_hash: prev_tx_hash
      }, function(err, next_notification){
        if (err) {
          errorHandler(res, err);
          return;
        }

        res.send({
          success: true,
          notification: next_notification
        });

      });
    }
  };
}

module.exports = NotificationCtrl;
