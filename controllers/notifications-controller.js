var _                = require('lodash');
var ErrorController  = require('./error-controller');
var notificationslib = require('../lib/notifications-lib');

module.exports = function(opts) {

  var remote = opts.remote,
    dbinterface = opts.dbinterface,
    config = opts.config;

  return {

    getNotification: function(req, res) {

      var account = req.params.account,
        identifier = req.params.identifier,
        type_string = req.query.types,
        exclude_failed_string = req.query.exclude_failed,
        types = [],
        new_url = req.originalUrl;

      // If query string parameters are not set, redirect to include them

      if (type_string && type_string.length > 0) {
        types = _.map(type_string.split(','), function(type){
          return type.replace(' ', '').toLowerCase();
        });
      } else {
        var possible_types = ['payment', 'offercreate', 'offercancel', 'trustset', 'accountset'];
        new_url += (req.originalUrl.indexOf('?') === -1 ? '?' : '&') + 'types=' + possible_types.join(',');
      }

      if (!exclude_failed_string) {
        new_url += '&exclude_failed=false';
      }

      if (new_url !== req.originalUrl) {
        res.redirect(new_url);
        return;
      }

      // Query Notification lib

      notificationslib.getNotification(remote, dbinterface, {
        account: account,
        identifier: identifier,
        types: types,
        exclude_failed: exclude_failed_string === 'true'
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

        // If the base transaction this notification is built upon does not meet the specified
        // criteria, redirect to the previous_notification_url, which will meet the criteria

        if (types.length > 0 && types.length < 5) {
          if (types.indexOf(notification.type) === -1) {
            res.redirect(notification.previous_notification_url);
            return;
          }
        }

        if (exclude_failed && notification.state !== 'validated') {
          res.redirect(notification.previous_notification_url);
          return;
        }

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