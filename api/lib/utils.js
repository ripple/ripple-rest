/* eslint-disable valid-jsdoc */
'use strict';
var bignum = require('bignumber.js');
var validator = require('./schema-validator.js');

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

function parseCurrencyAmount(rippledAmount) {
  if (typeof rippledAmount === 'string') {
    return {
      currency: 'XRP',
      counterparty: '',
      value: dropsToXrp(rippledAmount)
    };
  }
  return {
    currency: rippledAmount.currency,
    counterparty: rippledAmount.issuer,
    value: rippledAmount.value
  };
}

function txFromRestAmount(restAmount) {
  if (restAmount.currency === 'XRP') {
    return xrpToDrops(restAmount.value);
  }
  return {
    currency: restAmount.currency,
    issuer: restAmount.counterparty,
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

module.exports = {
  dropsToXrp: dropsToXrp,
  xrpToDrops: xrpToDrops,
  parseLedger: parseLedger,
  parseCurrencyAmount: parseCurrencyAmount,
  parseCurrencyQuery: parseCurrencyQuery,
  txFromRestAmount: txFromRestAmount,
  compareTransactions: compareTransactions
};
