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
var createRemote = require('./lib/remote');
var DatabaseInterface = require('./lib/db-interface');
var transaction = require('./transaction');

function RippleAPI(options) {
  this.remote = createRemote(options);
  this.db = new DatabaseInterface(options.database_path || ':memory:',
                                  options.logger);
}

RippleAPI.prototype = {
  getServerStatus: Info.serverStatus,
  isTrue: Info.isConnected,
  getFee: Info.fee,
  getUUID: Info.uuid,

  getBalances: Balances.get,

  getSettings: Settings.get,
  changeSettings: Settings.change,

  getTransaction: Transactions.get,

  getTrustLines: TrustLines.get,
  addTrustLine: TrustLines.add,

  submitPayment: Payments.submit,
  getPayment: Payments.get,
  getAccountPayments: Payments.getAccountPayments,
  getPathFind: Payments.getPathFind,

  getOrderBook: Orders.getOrderBook,
  getOrders: Orders.getOrders,
  submitOrder: Orders.placeOrder,
  cancelOrder: Orders.cancelOrder,
  getOrder: Orders.getOrder,

  getNotification: Notifications.getNotification,
  getNotifications: Notifications.getNotifications,

  wallet: Wallet,

  preparePayment: transaction.preparePayment,
  prepareTrustLine: transaction.prepareTrustLine,
  prepareOrder: transaction.prepareOrder,
  prepareOrderCancellation: transaction.prepareOrderCancellation,
  prepareSettings: transaction.prepareSettings,
  sign: transaction.sign,
  submit: transaction.submit,

  errors: errors,

  isConnected: function() {
    return serverLib.isConnected(this.remote);
  }
};

module.exports = RippleAPI;
