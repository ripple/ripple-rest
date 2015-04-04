/* eslint-disable valid-jsdoc */
'use strict';
var bignum = require('bignumber.js');
var validator = require('./schema-validator.js');
var ripple = require('ripple-lib');

function renameCounterpartyToIssuer(amount) {
  if (amount && amount.counterparty) {
    amount.issuer = amount.counterparty;
    delete amount.counterparty;
  }
  return amount;
}

function dropsToXrp(drops) {
  return bignum(drops).dividedBy(1000000.0).toString();
}

function xrpToDrops(xrp) {
  return bignum(xrp).times(1000000.0).floor().toString();
}

function isValidHash256(hash) {
  return validator.isValid(hash, 'Hash256');
}

function parseLedger(ledger) {
  if (/^current$|^closed$|^validated$/.test(ledger)) {
    return ledger;
  }

  if (ledger && Number(ledger) >= 0 && isFinite(Number(ledger))) {
    return Number(ledger);
  }

  if (isValidHash256(ledger)) {
    return ledger;
  }

  return 'validated';
}

function parseCurrencyAmount(rippledAmount, useIssuer) {
  var amount = {};

  if (typeof rippledAmount === 'string') {
    amount.currency = 'XRP';
    amount.value = dropsToXrp(rippledAmount);
    if (useIssuer) {
      amount.issuer = '';
    } else {
      amount.counterparty = '';
    }
  } else {
    amount.currency = rippledAmount.currency;
    amount.value = rippledAmount.value;
    if (useIssuer) {
      amount.issuer = rippledAmount.issuer;
    } else {
      amount.counterparty = rippledAmount.issuer;
    }
  }

  return amount;
}

function txFromRestAmount(restAmount) {
  if (restAmount.currency === 'XRP') {
    return xrpToDrops(restAmount.value);
  }
  return {
    currency: restAmount.currency,
    issuer: restAmount.counterparty ?
      restAmount.counterparty : restAmount.issuer,
    value: restAmount.value
  };
}

function parseCurrencyQuery(query) {
  var params = query.split('+');

  if (!isNaN(params[0])) {
    return {
      value: (params.length >= 1 ? params[0] : ''),
      currency: (params.length >= 2 ? params[1] : ''),
      counterparty: (params.length >= 3 ? params[2] : '')
    };
  }
  return {
    currency: (params.length >= 1 ? params[0] : ''),
    counterparty: (params.length >= 2 ? params[1] : '')
  };
}

function signum(num) {
  return (num === 0) ? 0 : (num > 0 ? 1 : -1);
}

/**
 *  Order two rippled transactions based on their ledger_index.
 *  If two transactions took place in the same ledger, sort
 *  them based on TransactionIndex
 *  See: https://ripple.com/build/transactions/
 *
 *  @param {Object} first
 *  @param {Object} second
 *  @returns {Number} [-1, 0, 1]
 */
function compareTransactions(first, second) {
  if (first.ledger_index === second.ledger_index) {
    return signum(first.meta.TransactionIndex - second.meta.TransactionIndex);
  }
  return first.ledger_index < second.ledger_index ? -1 : 1;
}

function isValidLedgerSequence(ledger) {
  return (Number(ledger) >= 0) && isFinite(Number(ledger));
}

function isValidLedgerHash(ledger) {
  return ripple.UInt256.is_valid(ledger);
}

function isValidLedgerWord(ledger) {
  return (/^current$|^closed$|^validated$/.test(ledger));
}

function getFeeDrops(remote) {
  var feeUnits = 10; // all transactions currently have a fee of 10 fee units
  return remote.feeTx(feeUnits).to_text();
}

function addTxInstructions(tx_json, account, remote, options, callback) {
  if (options.lastLedgerSequence !== undefined) {
    tx_json.LastLedgerSequence = options.lastLedgerSequence;
  } else {
    var offset = options.lastLedgerOffset !== undefined ?
      options.lastLedgerOffset : 3;
    tx_json.LastLedgerSequence = remote.getLedgerSequence() + offset;
  }

  if (options.fixedFee !== undefined) {
    tx_json.Fee = xrpToDrops(options.fixedFee);
  } else {
    var serverFeeDrops = getFeeDrops(remote);
    if (options.maxFee !== undefined) {
      var maxFeeDrops = xrpToDrops(options.maxFee);
      tx_json.Fee = bignum.min(serverFeeDrops, maxFeeDrops).toString();
    } else {
      tx_json.Fee = serverFeeDrops;
    }
  }

  if (options.sequence !== undefined) {
    tx_json.Sequence = options.sequence;
    callback(null, {tx_json: tx_json});
  } else {
    remote.findAccount(account).getNextSequence(function(error, sequence) {
      tx_json.Sequence = sequence;
      callback(null, {tx_json: tx_json});
    });
  }
}

function createTxJSON(setTxParameters, remote, instructions, callback) {
  var transaction = new ripple.Transaction();
  setTxParameters(transaction);
  transaction.complete();
  var account = transaction.getAccount();
  var tx_json = transaction.tx_json;
  addTxInstructions(tx_json, account, remote, instructions, callback);
}

module.exports = {
  isValidLedgerSequence: isValidLedgerSequence,
  isValidLedgerWord: isValidLedgerWord,
  isValidLedgerHash: isValidLedgerHash,
  dropsToXrp: dropsToXrp,
  xrpToDrops: xrpToDrops,
  parseLedger: parseLedger,
  parseCurrencyAmount: parseCurrencyAmount,
  parseCurrencyQuery: parseCurrencyQuery,
  txFromRestAmount: txFromRestAmount,
  compareTransactions: compareTransactions,
  renameCounterpartyToIssuer: renameCounterpartyToIssuer,
  createTxJSON: createTxJSON
};

