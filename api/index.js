var Info          = require('./info');
var Balances      = require('./balances');
var Settings      = require('./settings');
var Transactions  = require('./transactions');
var TrustLines    = require('./trustlines');
var Notifications = require('./notifications');
var Payments      = require('./payments');
var Wallet        = require('./wallet');

module.exports = {
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

  payments: {
    submit: Payments.submit,
    get: Payments.get,
    getAccountPayments: Payments.getAccountPayments,
    getPathFind: Payments.getPathFind
  },

  notifications: {
    getNotification: Notifications.getNotification
  },

  wallet: Wallet
}

