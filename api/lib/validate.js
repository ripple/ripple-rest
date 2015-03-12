'use strict';
var _ = require('lodash');
var errors = require('./errors.js');
var validator = require('./schema-validator');
var ripple = require('ripple-lib');

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

function fail(results, callback) {
  var error = _.find(results);
  if (error) {
    callback(error);
    return true;
  }
  return false;
}

module.exports.account = addOptionalOption(validateAccount);
module.exports.currency = addOptionalOption(validateCurrency);
module.exports.counterparty = addOptionalOption(validateCounterparty);
module.exports.issue = addOptionalOption(validateIssue);
module.exports.fail = fail;
