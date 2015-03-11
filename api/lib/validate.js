'use strict';
var _ = require('lodash');
var errors = require('./errors.js');
var validator = require('./schema-validator');
var ripple = require('ripple-lib');
var utils = require('./utils');

function addOptionalOption(validatorFunction) {
  return function(parameter, optional) {
    if (optional && parameter === undefined) {
      return null;
    }
    return validatorFunction(parameter);
  };
}

function validateAccount(account) {
  if (!ripple.UInt160.is_valid(account)) {
    return new errors.InvalidRequestError(
      'Parameter is not a valid Ripple address: account');
  }
  return null;
}

function validateCurrency(currency) {
  if (!validator.isValid(currency, 'Currency')) {
    return new errors.InvalidRequestError(
      'Parameter is not a valid currency: currency');
  }
  return null;
}

function validateCounterparty(counterparty) {
  if (!ripple.UInt160.is_valid(counterparty)) {
    return new errors.InvalidRequestError(
      'Parameter is not a valid Ripple address: counterparty');
  }
  return null;
}

function validateIssue(issue) {
  return _.find([
    validateCurrency(issue.currency),
    validateCounterparty(issue.counterparty)
  ]) || null;
}


function validateLedger(ledger) {
  if (!(utils.isValidLedgerSequence(ledger)
        || utils.isValidLedgerHash(ledger)
        || utils.isValidLedgerWord(ledger)))
  {
    return new errors.InvalidRequestError(
      'Invalid or Missing Parameter: ledger');
  }

  return null;
}

function validatePaging(options) {
  if (options.marker) {
    if (!options.ledger ||
        !(utils.isValidLedgerSequence(options.ledger
          || utils.isValidLedgerHash(options.ledger))))
      {
      return new errors.InvalidRequestError(
        'Invalid or Missing Parameter: ledger');
    }
  }
  return null;
}

function validateLimit(limit) {
  if (!(limit === 'all' || !_.isNaN(Number(limit)))) {
    return new errors.InvalidRequestError(
      'Invalid or Missing Parameter: limit');
  }
  return null;
}


function fail(results, callback) {
  var error = _.find(results);
  if (error) {
    callback(error);
    return true;
  }
  return false;
}

module.exports = {
  account: addOptionalOption(validateAccount),
  currency: addOptionalOption(validateCurrency),
  counterparty: addOptionalOption(validateCounterparty),
  issue: addOptionalOption(validateIssue),
  ledger: addOptionalOption(validateLedger),
  limit: addOptionalOption(validateLimit),
  paging: addOptionalOption(validatePaging),
  fail: fail
};
