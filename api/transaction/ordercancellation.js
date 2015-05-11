'use strict';
var ripple = require('ripple-lib');
var utils = require('./utils');
var validate = require('../lib/validate');
var wrapCatch = require('../lib/utils').wrapCatch;

function createOrderCancellationTransaction(account, sequence) {
  validate.address(account);
  validate.sequence(sequence);

  var transaction = new ripple.Transaction();
  transaction.offerCancel(account, sequence);
  return transaction;
}

function prepareOrderCancellation(account, sequence, instructions, callback) {
  var transaction = createOrderCancellationTransaction(account, sequence);
  utils.createTxJSON(transaction, this.remote, instructions, callback);
}

module.exports = {
  createOrderCancellationTransaction: createOrderCancellationTransaction,
  prepareOrderCancellation: wrapCatch(prepareOrderCancellation)
};
