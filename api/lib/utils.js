/* eslint-disable valid-jsdoc */
'use strict';
var bignum = require('bignumber.js');
var validator = require('./schema-validator.js');
var ripple = require('ripple-lib');
var _ = require('lodash');
var async = require('async');

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
    return signum(
      Number(first.meta.TransactionIndex) -
      Number(second.meta.TransactionIndex));
  }
  return Number(first.ledger_index) < Number(second.ledger_index) ? -1 : 1;
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

function attachDate(api, baseTransactions, callback) {
  var groupedTx = _.groupBy(baseTransactions, function(tx) {
    return tx.ledger_index;
  });

  function attachDateToTransactions(_groupedTx, ledger, _callback) {
    api.remote.requestLedger({ledger_index: Number(ledger)},
      function(err, data) {
        if (err) {
          return _callback(err);
        }

        _.each(_groupedTx[ledger], function(tx) {
          tx.date = data.ledger.close_time;
        });

        _callback(null, _groupedTx[ledger]);
      }
    );
  }

  // TODO: Decorate _.flatten and make it an async function
  async.map(_.keys(groupedTx),
    _.partial(attachDateToTransactions, groupedTx),
    function(err, results) {
      if (err) {
        return callback(err);
      }
      callback(null, _.flatten(results));
    });
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
  attachDate: attachDate
};

