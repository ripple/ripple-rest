'use strict';
var Info = require('./info');
var Balances = require('./balances');
var Settings = require('./settings');
var Transactions = require('./transactions');
var TrustLines = require('./trustlines');
var Notifications = require('./notifications');
var Orders = require('./orders');
var Payments = require('./payments');
var Wallet = require('./wallet');
var errors = require('./lib/errors');
var serverLib = require('./lib/server-lib');
var remote = require('./lib/remote');

module.exports = {
  info: {
    serverStatus: Info.serverStatus,
    isConnected: Info.isConnected,
    fee: Info.fee,
    uuid: Info.uuid
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

  orders: {
    getOrderBook: Orders.getOrderBook,
    getOrders: Orders.getOrders,
    placeOrder: Orders.placeOrder,
    cancelOrder: Orders.cancelOrder,
    getOrder: Orders.getOrder
  },

  notifications: {
    getNotification: Notifications.getNotification
  },

  wallet: Wallet,

  errors: errors,

  isConnected: function() {
      return serverLib.isConnected(remote);
  }
};
