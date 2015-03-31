'use strict';
var _ = require('lodash');
var InvalidRequestError = require('./errors.js').InvalidRequestError;
var validator = require('./schema-validator');
var ripple = require('ripple-lib');
var utils = require('./utils');

function isValidBoolString(boolString) {
  return (boolString === 'true' || boolString === false);
}

function error(text) {
  return new InvalidRequestError(text);
}

function invalid(type, value) {
  return error('Not a valid ' + type + ': ' + value.toString());
}

function missing(name) {
  return error('Missing parameter: ' + name);
}

function validateAddress(address) {
  if (!ripple.UInt160.is_valid(address)) {
    throw error('Parameter is not a valid Ripple address: account');
    // TODO: thow invalid('Ripple address', address);
  }
}

function validateAddressAndSecret(obj) {
  var address = obj.address;
  var secret = obj.secret;
  if (!address) {
    throw missing('address');
  }
  if (!secret) {
    throw missing('secret');
  }
  if (secret[0] !== 's' || !ripple.UInt160.is_valid('r' + secret.slice(1))) {
    throw invalid('Ripple secret', secret);
  }
  if (!ripple.Seed.from_json(secret).get_key(address)) {
    throw error('Secret does not match specified address', secret);
  }
}

function validateCurrency(currency) {
  if (!validator.isValid(currency, 'Currency')) {
    throw error('Parameter is not a valid currency: currency');
    // TODO: throw invalid('currency', currency);
  }
}

function validateCounterparty(counterparty) {
  if (!ripple.UInt160.is_valid(counterparty)) {
    throw error('Parameter is not a valid Ripple address: counterparty');
    // TODO: throw invalid('counterparty', counterparty);
  }
}

function validateIssue(issue) {
  validateCurrency(issue.currency);
  validateCounterparty(issue.counterparty);
}

function validateLedger(ledger) {
  if (!(utils.isValidLedgerSequence(ledger)
        || utils.isValidLedgerHash(ledger)
        || utils.isValidLedgerWord(ledger))) {
    throw error('Invalid or Missing Parameter: ledger');
    // TODO: throw invalid('ledger', ledger);
  }
}

function validatePaging(options) {
  if (options.marker) {
    if (!options.ledger) {
      throw error('Invalid or Missing Parameter: ledger');
      // TODO: throw missing('ledger');
    }
    if (!(utils.isValidLedgerSequence(options.ledger)
          || utils.isValidLedgerHash(options.ledger))) {
      throw error('Invalid or Missing Parameter: ledger');
      // TODO: throw invalid('ledger', options.ledger);
    }
  }
}

function validateLimit(limit) {
  if (!(limit === 'all' || !_.isNaN(Number(limit)))) {
    throw error('Invalid or Missing Parameter: limit');
    // TODO: throw invalid('limit', limit);
  }
}

function validateTrustline(trustline) {
  var errs = validator.validate(trustline, 'Trustline').err;
  if (errs.length > 0) {
    throw invalid('trustline', errs[0]);
  }
}

function validateValidated(validated) {
  if (!isValidBoolString(validated)) {
    throw error('validated must be "true" or "false", not', validated);
  }
}

function createValidators(validatorMap) {
  var result = {};
  _.forEach(validatorMap, function(validateFunction, key) {
    result[key] = function(value, optional) {
      if (value === undefined || value === null) {
        if (!optional) {
          throw missing(key);
        }
      } else {
        validateFunction(value);
      }
    };
  });
  return result;
}

module.exports = createValidators({
  address: validateAddress,
  addressAndSecret: validateAddressAndSecret,
  currency: validateCurrency,
  counterparty: validateCounterparty,
  issue: validateIssue,
  ledger: validateLedger,
  limit: validateLimit,
  paging: validatePaging,
  trustline: validateTrustline,
  validated: validateValidated
});
