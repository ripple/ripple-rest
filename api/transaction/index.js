'use strict';
var payment = require('./payment');
var trustline = require('./trustline');
var order = require('./order');
var ordercancellation = require('./ordercancellation');
var settings = require('./settings');
var sign = require('./sign');
var submit = require('./submit');

module.exports = {
  preparePayment: payment.preparePayment,
  prepareTrustLine: trustline.prepareTrustLine,
  prepareOrder: order.prepareOrder,
  prepareOrderCancellation: ordercancellation.prepareOrderCancellation,
  prepareSettings: settings.prepareSettings,
  sign: sign,
  submit: submit,

  // The following are exposed to support legacy transaction submission
  // and should be unexposed when this legacy functionality is removed
  createPaymentTransaction: payment.createPaymentTransaction,
  createTrustLineTransaction: trustline.createTrustLineTransaction,
  createOrderTransaction: order.createOrderTransaction,
  createOrderCancellationTransaction:
    ordercancellation.createOrderCancellationTransaction,
  createSettingsTransaction: settings.createSettingsTransaction
};
