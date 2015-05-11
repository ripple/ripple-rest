/* eslint-disable valid-jsdoc */
'use strict';
var BigNumber = require('bignumber.js');
var validate = require('../lib/validate');

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
  instructions = instructions || {};
  validate.options(instructions);

  transaction.complete();
  var account = transaction.getAccount();
  var tx_json = transaction.tx_json;

  if (instructions.last_ledger_sequence !== undefined) {
    tx_json.LastLedgerSequence =
      parseInt(instructions.last_ledger_sequence, 10);
  } else {
    var offset = instructions.last_ledger_offset !== undefined ?
      parseInt(instructions.last_ledger_offset, 10) : 3;
    tx_json.LastLedgerSequence = remote.getLedgerSequence() + offset;
  }

  if (instructions.fixed_fee !== undefined) {
    tx_json.Fee = xrpToDrops(instructions.fixed_fee);
  } else {
    var serverFeeDrops = getFeeDrops(remote);
    if (instructions.max_fee !== undefined) {
      var maxFeeDrops = xrpToDrops(instructions.max_fee);
      tx_json.Fee = BigNumber.min(serverFeeDrops, maxFeeDrops).toString();
    } else {
      tx_json.Fee = serverFeeDrops;
    }
  }

  if (instructions.sequence !== undefined) {
    tx_json.Sequence = parseInt(instructions.sequence, 10);
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
  xrpToDrops: xrpToDrops
};
