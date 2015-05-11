'use strict';
var ripple = require('ripple-lib');
var utils = require('./utils');
var validate = require('../lib/validate');
var wrapCatch = require('../lib/utils').wrapCatch;
var renameCounterpartyToIssuerInOrder =
  require('../lib/utils').renameCounterpartyToIssuerInOrder;

var OfferCreateFlags = {
  Passive: {name: 'passive', set: 'Passive'},
  ImmediateOrCancel: {name: 'immediate_or_cancel', set: 'ImmediateOrCancel'},
  FillOrKill: {name: 'fill_or_kill', set: 'FillOrKill'}
};

function createOrderTransaction(account, order) {
  validate.address(account);
  validate.order(order);

  order = renameCounterpartyToIssuerInOrder(order);
  var transaction = new ripple.Transaction();
  var takerPays = order.taker_pays.currency !== 'XRP'
    ? order.taker_pays : utils.xrpToDrops(order.taker_pays.value);
  var takerGets = order.taker_gets.currency !== 'XRP'
    ? order.taker_gets : utils.xrpToDrops(order.taker_gets.value);

  transaction.offerCreate(account, ripple.Amount.from_json(takerPays),
    ripple.Amount.from_json(takerGets));

  utils.setTransactionBitFlags(transaction, {
    input: order,
    flags: OfferCreateFlags
  });

  if (order.type === 'sell') {
    transaction.setFlags('Sell');
  }
  return transaction;
}

function prepareOrder(account, order, instructions, callback) {
  var transaction = createOrderTransaction(account, order);
  utils.createTxJSON(transaction, this.remote, instructions, callback);
}

module.exports = {
  prepareOrder: wrapCatch(prepareOrder),
  createOrderTransaction: createOrderTransaction
};

