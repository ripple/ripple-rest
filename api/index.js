var Info          = require('./info');
var Balances      = require('./balances');
var Settings      = require('./settings');
var Transactions  = require('./transactions');
var TrustLines    = require('./trustlines');
var Notifications = require('./notifications');
var Submission    = require('./submission');
var Payments      = require('./payments');

module.exports = (function() {
  var API = {
    info: {
      uuid: Info.uuid,
      serverStatus: Info.serverStatus,
      isConnected: Info.isConnected
    },

    balances: {
      get: Balances.get
    },

    settings: {
      get: Settings.get,
      change: Settings.change
    },

    transactions: {
      get: Transactions.get
    },

    trustlines: {
      get: TrustLines.get,
      add: TrustLines.add
    },

    submission: {
      submit: Submission.submit
    },

    payments: {
      getPayment: Payments.getPayment,
      getBulkPayments: Payments.getBulkPayments,
      getPathFind: Payments.getPathFind
    },

    notifications: {
      getNotification: Notifications.getNotification,
      getNextNotification: Notifications.getNextNotification
    }
  }

  function init(opts) {
    for (var endpoint in API) {
      for (var method in API[endpoint]) {
        API[endpoint][method] = API[endpoint][method].bind(this, opts);
      }
    }

    return API;
  };

  return init;
})();
