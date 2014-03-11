var ErrorController  = require('./error-controller');
var notificationslib = require('../lib/notifications-lib');

module.exports = function(opts) {

  var remote = opts.remote,
    dbinterface = opts.dbinterface,
    config = opts.config;

  return {

    getNotification: function(req, res) {

      var account = req.params.account,
        identifier = req.params.identifier;

      notificationslib.getNotification(remote, dbinterface, {
        account: account,
        identifier: identifier
      }, function(err, notification){
        if (err) {
          ErrorController.reportError(err, res);
          return;
        }

        if (!notification) {
          ErrorController.reportError(new Error('Transaction Not Found. Could not get the notification corresponding to this transaction identifier. This may be because the transaction was never validated and written into the Ripple ledger or because it was not submitted through this ripple-rest instance. This error may also be seen if the databases of either ripple-rest or rippled were recently created or deleted.'), res);
          return;
        }

        var url_base = req.protocol + '://' + req.host + (config.get('NODE_ENV') === 'development' && config.get('PORT') ? ':' + config.get('PORT') : '');
        var client_resource_id = notification.client_resource_id;
        delete notification.client_resource_id;


        Object.keys(notification).forEach(function(key){
          if (key.indexOf('url') !== -1 && notification[key]) {
            notification[key] = url_base + notification[key];
          }
        });

        res.json({
          success: true,
          client_resource_id: client_resource_id,
          notification: notification
        });
      });

    },

    getNextNotification: function(req, res) {

      var account = req.params.account,
        identifier = req.params.identifier;

      notificationslib.getNotification(remote, dbinterface, {
        account: account,
        identifier: identifier
      }, function(err, notification){
        if (err) {
          ErrorController.reportError(err, res);
          return;
        }

        if (!notification) {
          ErrorController.reportError(new Error('Transaction Not Found. Could not get the notification corresponding to this transaction identifier. This may be because the transaction was never validated and written into the Ripple ledger or because it was not submitted through this ripple-rest instance. This error may also be seen if the databases of either ripple-rest or rippled were recently created or deleted.'), res);
          return;
        }

        res.redirect(notification.next_notification_url);

      });

    }

  };

};