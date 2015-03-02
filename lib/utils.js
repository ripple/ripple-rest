var _         = require('lodash');
var bignum    = require('bignumber.js');
var config    = require('./config.js');
var pJson     = require('./../package.json');
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

function parseCurrencyAmount(currencyAmount) {
  if (typeof currencyAmount === 'string') {
    return {
      currency: 'XRP',
      counterparty: '',
      value: dropsToXrp(currencyAmount)
    };
  } else {
    return {
      currency: currencyAmount.currency,
      counterparty: currencyAmount.issuer,
      value: currencyAmount.value
    };
  }
}

function parseCurrencyQuery(query) {
  var params = query.split('+');

  if (!isNaN(params[0])) {
    return {
      value:    (params.length >= 1 ? params[0] : ''),
      currency: (params.length >= 2 ? params[1] : ''),
      issuer:   (params.length >= 3 ? params[2] : '')
    };
  } else {
    return {
      currency: (params.length >= 1 ? params[0] : ''),
      issuer:   (params.length >= 2 ? params[1] : '')
    };
  }
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
  } else {
    return first.ledger_index < second.ledger_index ? -1 : 1;
  }
}

