'use strict';
var _ = require('lodash');
var InvalidRequestError = require('./errors.js').InvalidRequestError;
var validator = require('./schema-validator');
var ripple = require('ripple-lib');
var utils = require('./utils');

function isBoolean(value) {
  return (value === true || value === false);
}

function error(text) {
  return new InvalidRequestError(text);
}

function invalid(type, value) {
  return error('Not a valid ' + type + ': ' + JSON.stringify(value));
}

function missing(name) {
  return error('Parameter missing: ' + name);
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
  validateAddress(address);
  if (!secret) {
    throw missing('secret');
  }
  try {
    if (!ripple.Seed.from_json(secret).get_key(address)) {
      throw error('Invalid secret', secret);
    }
  } catch (exception) {
    throw error('Invalid secret', secret);
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

function validateSchema(object, schemaName) {
  var schemaErrors = validator.validate(object, schemaName).errors;
  if (!_.isEmpty(schemaErrors.fields)) {
    throw invalid(schemaName, schemaErrors.fields);
  }
}

function validateOrder(order) {
  if (!order) {
    throw error('Missing parameter: order. '
      + 'Submission must have order object in JSON form');
  } else if (!/^buy|sell$/.test(order.type)) {
    throw error('Parameter must be "buy" or "sell": type');
  } else if (!_.isUndefined(order.passive) && !_.isBoolean(order.passive)) {
    throw error('Parameter must be a boolean: passive');
  } else if (!_.isUndefined(order.immediate_or_cancel)
      && !_.isBoolean(order.immediate_or_cancel)) {
    throw error('Parameter must be a boolean: immediate_or_cancel');
  } else if (!_.isUndefined(order.fill_or_kill)
      && !_.isBoolean(order.fill_or_kill)) {
    throw error('Parameter must be a boolean: fill_or_kill');
  } else if (!order.taker_gets
      || (!validator.isValid(order.taker_gets, 'Amount'))
      || (!order.taker_gets.issuer && order.taker_gets.currency !== 'XRP')) {
    throw error('Parameter must be a valid Amount object: taker_gets');
  } else if (!order.taker_pays
      || (!validator.isValid(order.taker_pays, 'Amount'))
      || (!order.taker_pays.issuer && order.taker_pays.currency !== 'XRP')) {
    throw error('Parameter must be a valid Amount object: taker_pays');
  }
  // TODO: validateSchema(order, 'Order');
}

function validateTrustline(trustline) {
  validateSchema(trustline, 'Trustline');
}

function validateValidated(validated) {
  if (!isBoolean(validated)) {
    throw error('validated must be boolean, not: ' + validated);
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
  order: validateOrder,
  trustline: validateTrustline,
  validated: validateValidated
});
