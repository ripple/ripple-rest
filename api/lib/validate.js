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

/* TODO:
function invalid(type, value) {
  return error('Not a valid ' + type + ': ' + JSON.stringify(value));
}
*/

function missing(name) {
  return error('Parameter missing: ' + name);
}

function isValidAddress(address) {
  return address ? ripple.UInt160.is_valid(address) : false;
}

function validateAddress(address) {
  if (!isValidAddress(address)) {
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
  if (!isValidAddress(counterparty)) {
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

function validateIdentifier(identifier) {
  if (!validator.isValid(identifier, 'Hash256')) {
    throw error('Parameter is not a valid transaction hash: identifier');
  }
}

function validatePaymentIdentifier(identifier) {
  if (!validator.isValid(identifier, 'Hash256') &&
      !validator.isValid(identifier, 'ResourceId')) {
    throw error('Parameter is not a valid transaction hash '
      + 'or client_resource_id: identifier');
  }
}

function validateSequence(sequence) {
  if (!(Number(sequence) >= 0)) {
    throw error(
      'Invalid parameter: sequence. Sequence must be a positive number');
  }
}

/* TODO:
function validateSchema(object, schemaName) {
  var schemaErrors = validator.validate(object, schemaName).errors;
  if (!_.isEmpty(schemaErrors.fields)) {
    throw invalid(schemaName, schemaErrors.fields);
  }
}
*/

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

function isValidAmount(amount) {
  return (amount.currency && validator.isValid(amount.currency, 'Currency')
      && (amount.currency === 'XRP' || isValidAddress(amount.counterparty)));
}

function validateOrderbook(orderbook) {
  if (!isValidAmount(orderbook.base)) {
    throw error('Invalid parameter: base. '
      + 'Must be a currency string in the form currency+counterparty');
  }
  if (!isValidAmount(orderbook.counter)) {
    throw error('Invalid parameter: counter. '
      + 'Must be a currency string in the form currency+counterparty');
  }
  if (orderbook.counter.currency === 'XRP'
      && orderbook.counter.counterparty) {
    throw error('Invalid parameter: counter. XRP cannot have counterparty');
  }
  if (orderbook.base.currency === 'XRP' && orderbook.base.counterparty) {
    throw error('Invalid parameter: base. XRP cannot have counterparty');
  }
}

function validateClientResourceID(clientResourceID) {
  if (!validator.isValid(clientResourceID, 'ResourceId')) {
    throw error('Invalid parameter: '
      + 'client_resource_id. Must be a string of ASCII-printable characters. '
      + 'Note that 256-bit hex strings are disallowed because of the '
      + 'potential confusion with transaction hashes.');
  }
}

function validateLastLedgerSequence(lastLedgerSequence) {
  if (!utils.isValidLedgerSequence(lastLedgerSequence)) {
    throw error('Invalid parameter: last_ledger_sequence');
  }
}

function validatePaymentMemos(memos) {
  if (!Array.isArray(memos)) {
    throw error(
      'Invalid parameter: memos. Must be an array with memo objects');
  }

  if (memos.length === 0) {
    throw error('Invalid parameter: memos. '
      + 'Must contain at least one Memo object, '
      + 'otherwise omit the memos property');
  }

  for (var m = 0; m < memos.length; m++) {
    var memo = memos[m];
    if (memo.MemoType && !/(undefined|string)/.test(typeof memo.MemoType)) {
      throw error(
        'Invalid parameter: MemoType. MemoType must be a string');
    }
    if (!/(undefined|string)/.test(typeof memo.MemoData)) {
      throw error(
        'Invalid parameter: MemoData. MemoData must be a string');
    }
    if (!memo.MemoData && !memo.MemoType) {
      throw error('Missing parameter: '
        + 'MemoData or MemoType. For a memo object MemoType or MemoData '
        + 'are both optional, as long as one of them is present');
    }
  }
}

function validatePayment(payment) {
  if (!isValidAddress(payment.source_account)) {
    throw error('Invalid parameter: source_account. '
      + 'Must be a valid Ripple address');
  }

  if (!isValidAddress(payment.destination_account)) {
    throw error('Invalid parameter: '
      + 'destination_account. Must be a valid Ripple address');
  }

  if (payment.source_tag &&
      (!validator.isValid(payment.source_tag, 'UINT32'))) {
    throw error('Invalid parameter: source_tag. '
      + 'Must be a string representation of an unsiged 32-bit integer');
  }

  if (payment.destination_tag
      && (!validator.isValid(payment.destination_tag, 'UINT32'))) {
    throw error('Invalid parameter: '
      + 'destination_tag. Must be a string representation of an unsiged '
      + '32-bit integer');
  }

  if (!payment.destination_amount
      || (!validator.isValid(payment.destination_amount, 'Amount'))) {
    throw error('Invalid parameter: '
      + 'destination_amount. Must be a valid Amount object');
  }

  if (payment.source_amount   // source_amount is optional
      && (!validator.isValid(payment.source_amount, 'Amount'))) {
    throw error(
      'Invalid parameter: source_amount. Must be a valid Amount object');
  }

  if (payment.destination_amount
      && payment.destination_amount.currency.toUpperCase() === 'XRP'
      && payment.destination_amount.issuer) {
    throw error(
      'Invalid parameter: destination_amount. XRP cannot have issuer');
  }
  if (payment.source_amount
      && payment.source_amount.currency.toUpperCase() === 'XRP'
      && payment.source_amount.issuer) {
    throw error(
      'Invalid parameter: source_amount. XRP cannot have issuer');
  }

  if (payment.source_slippage
      && !validator.isValid(payment.source_slippage, 'FloatString')) {
    throw error(
      'Invalid parameter: source_slippage. Must be a valid FloatString');
  }

  if (payment.invoice_id
      && !validator.isValid(payment.invoice_id, 'Hash256')) {
    throw error(
      'Invalid parameter: invoice_id. Must be a valid Hash256');
  }

  if (payment.paths) {
    if (typeof payment.paths === 'string') {
      try {
        JSON.parse(payment.paths);
      } catch (exception) {
        throw error(
          'Invalid parameter: paths. Must be a valid JSON string or object');
      }
    } else if (typeof payment.paths === 'object') {
      try {
        JSON.parse(JSON.stringify(payment.paths));
      } catch (exception) {
        throw error(
          'Invalid parameter: paths. Must be a valid JSON string or object');
      }
    }
  }

  if (payment.hasOwnProperty('partial_payment')
      && typeof payment.partial_payment !== 'boolean') {
    throw error(
      'Invalid parameter: partial_payment. Must be a boolean');
  }

  if (payment.hasOwnProperty('no_direct_ripple')
      && typeof payment.no_direct_ripple !== 'boolean') {
    throw error(
      'Invalid parameter: no_direct_ripple. Must be a boolean');
  }

  if (payment.hasOwnProperty('memos')) {
    validatePaymentMemos(payment.memos);
  }
}

function validatePathFind(pathfind) {
  if (!pathfind.source_account) {
    throw error(
      'Missing parameter: source_account. Must be a valid Ripple address');
  }

  if (!pathfind.destination_account) {
    throw error('Missing parameter: destination_account. '
      + 'Must be a valid Ripple address');
  }

  if (!isValidAddress(pathfind.source_account)) {
    throw error('Parameter is not a valid Ripple address: account');
  }

  if (!isValidAddress(pathfind.destination_account)) {
    throw error('Parameter is not a valid Ripple address: destination_account');
  }

  if (!pathfind.destination_amount) {
    throw error('Missing parameter: destination_amount. '
      + 'Must be an amount string in the form value+currency+issuer');
  }

  if (!validator.isValid(pathfind.destination_amount, 'Amount')) {
    throw error('Invalid parameter: destination_amount. '
      + 'Must be an amount string in the form value+currency+issuer');
  }
}

function validateSettings(settings) {
  if (typeof settings !== 'object') {
    throw error('Invalid parameter: settings');
  }
  if (!/(undefined|string)/.test(typeof settings.domain)) {
    throw error('Parameter must be a string: domain');
  }
  if (!/(undefined|string)/.test(typeof settings.wallet_locator)) {
    throw error('Parameter must be a string: wallet_locator');
  }
  if (!/(undefined|string)/.test(typeof settings.email_hash)) {
    throw error('Parameter must be a string: email_hash');
  }
  if (!/(undefined|string)/.test(typeof settings.message_key)) {
    throw error('Parameter must be a string: message_key');
  }
  if (!/(undefined|number)/.test(typeof settings.transfer_rate)) {
    if (settings.transfer_rate !== '') {
      throw error('Parameter must be a number: transfer_rate');
    }
  }
  if (!/(undefined|number)/.test(typeof settings.wallet_size)) {
    if (settings.wallet_size !== '') {
      throw error('Parameter must be a number: wallet_size');
    }
  }
  if (!/(undefined|boolean)/.test(typeof settings.no_freeze)) {
    throw error('Parameter must be a boolean: no_freeze');
  }
  if (!/(undefined|boolean)/.test(typeof settings.global_freeze)) {
    throw error('Parameter must be a boolean: global_freeze');
  }
  if (!/(undefined|boolean)/.test(typeof settings.password_spent)) {
    throw error('Parameter must be a boolean: password_spent');
  }
  if (!/(undefined|boolean)/.test(typeof settings.disable_master)) {
    throw error('Parameter must be a boolean: disable_master');
  }
  if (!/(undefined|boolean)/.test(typeof settings.require_destination_tag)) {
    throw error('Parameter must be a boolean: require_destination_tag');
  }
  if (!/(undefined|boolean)/.test(typeof settings.require_authorization)) {
    throw error('Parameter must be a boolean: require_authorization');
  }
  if (!/(undefined|boolean)/.test(typeof settings.disallow_xrp)) {
    throw error('Parameter must be a boolean: disallow_xrp');
  }

  var setCollision = (typeof settings.no_freeze === 'boolean')
    && (typeof settings.global_freeze === 'boolean')
    && settings.no_freeze === settings.global_freeze;

  if (setCollision) {
    throw error('Unable to set/clear no_freeze and global_freeze');
  }
}

function validateTrustline(trustline) {
  if (typeof trustline !== 'object') {
    throw error('Invalid parameter: trustline');
  }
  if (_.isUndefined(trustline.limit)) {
    throw error('Parameter missing: trustline.limit');
  }
  if (isNaN(trustline.limit)) {
    throw error('Parameter is not a number: trustline.limit');
  }
  if (!trustline.currency) {
    throw error('Parameter missing: trustline.currency');
  }
  if (!validator.isValid(trustline.currency, 'Currency')) {
    throw error('Parameter is not a valid currency: trustline.currency');
  }
  if (!trustline.counterparty) {
    throw error('Parameter missing: trustline.counterparty');
  }
  if (!isValidAddress(trustline.counterparty)) {
    throw error('Parameter is not a Ripple address: trustline.counterparty');
  }
  if (!/^(undefined|number)$/.test(typeof trustline.quality_in)) {
    throw error('Parameter must be a number: trustline.quality_in');
  }
  if (!/^(undefined|number)$/.test(typeof trustline.quality_out)) {
    throw error('Parameter must be a number: trustline.quality_out');
  }
  if (!/^(undefined|boolean)$/.test(typeof trustline.account_allows_rippling)) {
    throw error('Parameter must be a boolean: trustline.allow_rippling');
  }
  // TODO: validateSchema(trustline, 'Trustline');
}

function validateValidated(validated) {
  if (!isBoolean(validated)) {
    throw error('validated must be boolean, not: ' + validated);
  }
}

function validateTxJSON(txJSON) {
  if (typeof txJSON !== 'object') {
    throw error('tx_json must be an object, not: ' + typeof txJSON);
  }
  if (!isValidAddress(txJSON.Account)) {
    throw error('tx_json.Account must be a valid Ripple address, got: '
                + txJSON.Account);
  }
}

function validateBlob(blob) {
  if (typeof blob !== 'string') {
    throw error('tx_blob must be a string, not: ' + typeof blob);
  }
  if (blob.length === 0) {
    throw error('tx_blob must not be empty');
  }
  if (!blob.match(/[0-9A-F]+/g)) {
    throw error('tx_blob must be an uppercase hex string, got: ' + blob);
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
  identifier: validateIdentifier,
  paymentIdentifier: validatePaymentIdentifier,
  sequence: validateSequence,
  order: validateOrder,
  orderbook: validateOrderbook,
  client_resource_id: validateClientResourceID,
  last_ledger_sequence: validateLastLedgerSequence,
  payment: validatePayment,
  pathfind: validatePathFind,
  settings: validateSettings,
  trustline: validateTrustline,
  validated: validateValidated,
  txJSON: validateTxJSON,
  blob: validateBlob
});
