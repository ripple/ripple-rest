/* eslint-disable valid-jsdoc */
'use strict';
var BigNumber = require('bignumber.js');

function renameCounterpartyToIssuer(amount) {
  if (amount && amount.counterparty) {
    amount.issuer = amount.counterparty;
    delete amount.counterparty;
  }
  return amount;
}

function xrpToDrops(xrp) {
  return (new BigNumber(xrp)).times(1000000.0).floor().toString();
}

function convertAmount(amount) {
  if (amount.currency === 'XRP') {
    return xrpToDrops(amount.value);
  }
  return {
    currency: amount.currency,
    issuer: amount.counterparty ? amount.counterparty : amount.issuer,
    value: amount.value
  };
}

/**
 * Helper that sets bit flags on transactions
 *
 * @param {Transaction} transaction - Transaction object that is used to submit
 *                                    requests to ripple
 * @param {Object} options
 * @param {Object} options.flags - Holds flag names to set on transaction when
 *                                 parameter values are true or false on input
 * @param {Object} options.input - Holds parameter values
 * @param {String} options.clear_setting - Used to check if parameter values
 *                                         besides false mean false
 *
 *
 * @returns undefined
 */
function setTransactionBitFlags(transaction, options) {
  for (var flagName in options.flags) {
    var flag = options.flags[flagName];

    // Set transaction flags
    if (!(flag.name in options.input)) {
      continue;
    }

    var value = options.input[flag.name];

    if (value === options.clear_setting) {
      value = false;
    }

    if (flag.unset) {
      transaction.setFlags(value ? flag.set : flag.unset);
    } else if (flag.set && value) {
      transaction.setFlags(flag.set);
    }
  }
}

function getFeeDrops(remote) {
  var feeUnits = 10; // all transactions currently have a fee of 10 fee units
  return remote.feeTx(feeUnits).to_text();
}

function createTxJSON(transaction, remote, instructions, callback) {
  transaction.complete();
  var account = transaction.getAccount();
  var tx_json = transaction.tx_json;

  if (instructions.lastLedgerSequence !== undefined) {
    tx_json.LastLedgerSequence = instructions.lastLedgerSequence;
  } else {
    var offset = instructions.lastLedgerOffset !== undefined ?
      instructions.lastLedgerOffset : 3;
    tx_json.LastLedgerSequence = remote.getLedgerSequence() + offset;
  }

  if (instructions.fixedFee !== undefined) {
    tx_json.Fee = xrpToDrops(instructions.fixedFee);
  } else {
    var serverFeeDrops = getFeeDrops(remote);
    if (instructions.maxFee !== undefined) {
      var maxFeeDrops = xrpToDrops(instructions.maxFee);
      tx_json.Fee = BigNumber.min(serverFeeDrops, maxFeeDrops).toString();
    } else {
      tx_json.Fee = serverFeeDrops;
    }
  }

  if (instructions.sequence !== undefined) {
    tx_json.Sequence = instructions.sequence;
    callback(null, {tx_json: tx_json});
  } else {
    remote.findAccount(account).getNextSequence(function(error, sequence) {
      tx_json.Sequence = sequence;
      callback(null, {tx_json: tx_json});
    });
  }
}

module.exports = {
  setTransactionBitFlags: setTransactionBitFlags,
  createTxJSON: createTxJSON,
  convertAmount: convertAmount,
  renameCounterpartyToIssuer: renameCounterpartyToIssuer,
  xrpToDrops: xrpToDrops
};
