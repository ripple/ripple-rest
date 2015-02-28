var _         = require('lodash');
var bignum    = require('bignumber.js');
var config    = require('./config.js');
var pJson     = require('../../package.json');
var validator = require('./schema-validator.js');

module.exports = {
  dropsToXrp: dropsToXrp,
  xrpToDrops: xrpToDrops,
  getPackageVersion: getPackageVersion,
  getApiVersion: getApiVersion,
  getUrlBase: getUrlBase,
  parseLedger: parseLedger,
  parseCurrencyAmount: parseCurrencyAmount,
  parseCurrencyQuery: parseCurrencyQuery,
  txFromRestAmount: txFromRestAmount,
  compareTransactions: compareTransactions
};

function dropsToXrp(drops) {
  return bignum(drops).dividedBy(1000000.0).toString();
}

function xrpToDrops(xrp) {
  return bignum(xrp).times(1000000.0).floor().toString();
}

function getPackageVersion() {
  return pJson.version;
}

function getApiVersion() {
  var pattern = /([0-9])(?:\.)/g;
  return pattern.exec(getPackageVersion())[1];
}

function getUrlBase(request) {
  if (config.get('url_base')) {
    return config.get('url_base');
  }
  return request.protocol + '://' + request.hostname + (config && config.get('port') ? ':' + config.get('port') : '');
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

/**
 *  Order two rippled transactions based on their ledger_index.
 *  If two transactions took place in the same ledger, sort
 *  them based on TransactionIndex
 *  See: https://ripple.com/build/transactions/
 *
 *  @param {Object} first
 *  @param {Object} second
 *  @returns {Number} [-1, 1]
 */
function compareTransactions(first, second) {
  if (first.ledger_index === second.ledger_index) {
    return first.meta.TransactionIndex < second.meta.TransactionIndex ? -1 : 1;
  } else {
    return first.ledger_index < second.ledger_index ? -1 : 1;
  }
}

