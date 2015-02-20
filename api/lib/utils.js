var bignum    = require('bignumber.js');
var validator = require('./schema-validator.js');

module.exports = {
  dropsToXrp: dropsToXrp,
  xrpToDrops: xrpToDrops,
  parseLedger: parseLedger,
  parseCurrencyAmount: parseCurrencyAmount,
  parseCurrencyQuery: parseCurrencyQuery,
  txFromRestAmount: txFromRestAmount
};

function dropsToXrp(drops) {
  return bignum(drops).dividedBy(1000000.0).toString();
}

function xrpToDrops(xrp) {
  return bignum(xrp).times(1000000.0).floor().toString();
}

function isValidHash256(hash) {
  return validator.isValid(hash,'Hash256');
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
  } else {
    return {
      currency: rippledAmount.currency,
      counterparty: rippledAmount.issuer,
      value: rippledAmount.value
    };
  }
}

function txFromRestAmount(restAmount) {
  if (restAmount.currency === 'XRP') {
    return xrpToDrops(restAmount.value);
  } else {
    return {
      currency: restAmount.currency,
      issuer: restAmount.counterparty,
      value: restAmount.value
    };
  }
}

function parseCurrencyQuery(query) {
  var params = query.split('+');

  if (!isNaN(params[0])) {
    return {
      value:        (params.length >= 1 ? params[0] : ''),
      currency:     (params.length >= 2 ? params[1] : ''),
      counterparty: (params.length >= 3 ? params[2] : '')
    };
  } else {
    return {
      currency:     (params.length >= 1 ? params[0] : ''),
      counterparty: (params.length >= 2 ? params[1] : '')
    };
  }
}
