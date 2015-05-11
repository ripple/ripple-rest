/* eslint-disable valid-jsdoc */
'use strict';
var ripple = require('ripple-lib');
var utils = require('./utils');
var _ = require('lodash');
var constants = require('./constants');
var parseBalanceChanges = require('ripple-lib-transactionparser')
                          .parseBalanceChanges;
var parseOrderBookChanges = require('ripple-lib-transactionparser')
                            .parseOrderBookChanges;

// This is just to support the legacy naming of "counterparty", this
// function should be removed when "issuer" is eliminated
function renameCounterpartyToIssuerInOrderChanges(orderChanges) {
  return _.mapValues(orderChanges, function(changes) {
    return _.map(changes, function(change) {
      return utils.renameCounterpartyToIssuerInOrder(change);
    });
  });
}

function renameCounterpartyToIssuerInBalanceChanges(balanceChanges) {
  return _.mapValues(balanceChanges, function(changes) {
    return _.map(changes, function(change) {
      return utils.renameCounterpartyToIssuer(change);
    });
  });
}

/**
 *  Helper that parses bit flags from ripple response
 *
 *  @param {Number} responseFlags - Integer flag on the ripple response
 *  @param {Object} flags - Object with parameter name and bit flag value pairs
 *
 *  @returns {Object} parsedFlags - Object with parameter name and boolean
 *                                  flags depending on response flag
 */
function parseFlagsFromResponse(responseFlags, flags) {
  var parsedFlags = {};

  for (var flagName in flags) {
    var flag = flags[flagName];
    parsedFlags[flag.name] = Boolean(responseFlags & flag.value);
  }

  return parsedFlags;
}

/**
 *  Convert a transaction in rippled tx format
 *  to a ripple-rest payment
 *
 *  @param {transaction} tx
 *  @param {Function} callback
 *  @param {Object} options
 *
 *  @callback
 *  @param {Error} error
 *  @param {Object} payment
 */

function isPartialPayment(tx) {
  return (tx.Flags & ripple.Transaction.flags.Payment.PartialPayment) !== 0;
}

function isNoDirectRipple(tx) {
  return (tx.Flags & ripple.Transaction.flags.Payment.NoRippleDirect) !== 0;
}

function convertAmount(amount) {
  if (typeof amount === 'string') {
    return {
      value: utils.dropsToXrp(amount),
      currency: 'XRP',
      issuer: ''
    };
  }
  return amount;
}

function parsePaymentMeta(account, tx, meta) {
  if (_.isUndefined(meta) || _.isEmpty(meta)) {
    return {};
  }
  if (meta.TransactionResult === 'tejSecretInvalid') {
    throw new Error('Invalid secret provided.');
  }

  var balanceChanges = renameCounterpartyToIssuerInBalanceChanges(
    parseBalanceChanges(meta));

  var order_changes = renameCounterpartyToIssuerInOrderChanges(
    parseOrderBookChanges(meta))[account];

  var partialPayment = (isPartialPayment(tx) && meta.DeliveredAmount) ? {
      destination_amount_submitted: convertAmount(tx.Amount),
      source_amount_submitted: convertAmount(tx.SendMax || tx.Amount)
    } : {};

  return _.assign({
    result: meta.TransactionResult,
    balance_changes: balanceChanges[account] || [],
    source_balance_changes: balanceChanges[tx.Account] || [],
    destination_balance_changes: balanceChanges[tx.Destination] || [],
    order_changes: order_changes || []
  }, partialPayment);
}

function parsePaymentFromTx(account, message, meta) {
  if (!account) {
    throw new Error('Internal Error. must supply options.account');
  }

  var tx = message.tx_json;
  if (tx.TransactionType !== 'Payment') {
    throw new Error('Not a payment. The transaction corresponding to '
                    + 'the given identifier is not a payment.');
  }

  var amount;
  // if there is a DeliveredAmount we should use it over Amount there should
  // always be a DeliveredAmount if the partial payment flag is set. also
  // there shouldn't be a DeliveredAmount if there's no partial payment flag
  if (isPartialPayment(tx) && meta && meta.DeliveredAmount) {
    amount = meta.DeliveredAmount;
  } else {
    amount = tx.Amount;
  }

  var source_amount = utils.parseCurrencyAmount(tx.SendMax || amount, true);
  var destination_amount = utils.parseCurrencyAmount(amount, true);

  var payment = {
    // User supplied
    source_account: tx.Account,
    source_tag: (tx.SourceTag ? '' + tx.SourceTag : ''),
    source_amount: source_amount,
    source_slippage: '0',     // TODO: why is this hard-coded?
    destination_account: tx.Destination,
    destination_tag: (tx.DestinationTag ? '' + tx.DestinationTag : ''),
    destination_amount: destination_amount,
    // Advanced options
    invoice_id: tx.InvoiceID || '',
    paths: JSON.stringify(tx.Paths || []),
    no_direct_ripple: isNoDirectRipple(tx),
    partial_payment: isPartialPayment(tx),
    // TODO: Update to use `unaffected` when perspective account in URI
    // is not affected
    direction: (account === tx.Account ? 'outgoing' :
        (account === tx.Destination ? 'incoming' : 'passthrough')),
    timestamp: (tx.date
      ? new Date(ripple.utils.toTimestamp(tx.date)).toISOString() : ''),
    fee: utils.dropsToXrp(tx.Fee) || ''
  };

  if (Array.isArray(tx.Memos) && tx.Memos.length > 0) {
    payment.memos = [];
    for (var m = 0; m < tx.Memos.length; m++) {
      payment.memos.push(tx.Memos[m].Memo);
    }
  }

  var fullPayment = _.assign(payment, parsePaymentMeta(account, tx, meta));
  return _.assign({payment: fullPayment}, meta);
}

/**
 *  Convert an OfferCreate or OfferCancel transaction in rippled tx format
 *  to a ripple-rest order_change
 *
 *  @param {Object} tx
 *  @param {Object} options
 *  @param {String} options.account - The account to use as perspective when
 *                                    parsing the transaction.
 *
 *  @returns {Promise.<Object,Error>} - resolves to a parsed OrderChange
 *                                      transaction or an Error
 */

function parseOrderFromTx(tx, options) {
  if (!options.account) {
    throw new Error('Internal Error. must supply options.account');
  }
  if (tx.TransactionType !== 'OfferCreate'
      && tx.TransactionType !== 'OfferCancel') {
    throw new Error('Invalid parameter: identifier. The transaction '
      + 'corresponding to the given identifier is not an order');
  }
  if (tx.meta !== undefined && tx.meta.TransactionResult !== undefined) {
    if (tx.meta.TransactionResult === 'tejSecretInvalid') {
      throw new Error('Invalid secret provided.');
    }
  }

  var order;
  var flags = parseFlagsFromResponse(tx.flags, constants.OfferCreateFlags);
  var action = tx.TransactionType === 'OfferCreate'
    ? 'order_create' : 'order_cancel';
  var balance_changes = tx.meta
    ? parseBalanceChanges(tx.meta)[options.account] || [] : [];
  var timestamp = tx.date
    ? new Date(ripple.utils.toTimestamp(tx.date)).toISOString() : '';
  var order_changes = tx.meta ?
    parseOrderBookChanges(tx.meta)[options.account] : [];

  var direction;
  if (options.account === tx.Account) {
    direction = 'outgoing';
  } else if (balance_changes.length && order_changes.length) {
    direction = 'incoming';
  } else {
    direction = 'passthrough';
  }

  if (action === 'order_create') {
    order = {
      account: tx.Account,
      taker_pays: utils.parseCurrencyAmount(tx.TakerPays),
      taker_gets: utils.parseCurrencyAmount(tx.TakerGets),
      passive: flags.passive,
      immediate_or_cancel: flags.immediate_or_cancel,
      fill_or_kill: flags.fill_or_kill,
      type: flags.sell ? 'sell' : 'buy',
      sequence: tx.Sequence
    };
  } else {
    order = {
      account: tx.Account,
      type: 'cancel',
      sequence: tx.Sequence,
      cancel_sequence: tx.OfferSequence
    };
  }

  return {
    hash: tx.hash,
    ledger: tx.ledger_index,
    validated: tx.validated,
    timestamp: timestamp,
    fee: utils.dropsToXrp(tx.Fee),
    action: action,
    direction: direction,
    order: order,
    balance_changes: balance_changes,
    order_changes: order_changes || []
  };
}

/**
 *  Convert the pathfind results returned from rippled into an
 *  array of payments in the ripple-rest format. The client should be
 *  able to submit any of the payments in the array back to ripple-rest.
 *
 *  @param {rippled Pathfind results} pathfindResults
 *  @param {Amount} options.destination_amount Since this is not returned by
 *                  rippled in the pathfind results it can either be added
 *                  to the results or included in the options here
 *  @param {RippleAddress} options.source_account Since this is not returned
 *                  by rippled in the pathfind results it can either be added
 *                  to the results or included in the options here
 *
 *  @returns {Array of Payments} payments
 */
function parsePaymentsFromPathFind(pathfindResults) {
  return pathfindResults.alternatives.map(function(alternative) {
    return {
      source_account: pathfindResults.source_account,
      source_tag: '',
      source_amount: (typeof alternative.source_amount === 'string' ?
      {
        value: utils.dropsToXrp(alternative.source_amount),
        currency: 'XRP',
        issuer: ''
      } :
      {
        value: alternative.source_amount.value,
        currency: alternative.source_amount.currency,
        issuer: (typeof alternative.source_amount.issuer !== 'string'
          || alternative.source_amount.issuer === pathfindResults.source_account
          ? '' : alternative.source_amount.issuer)
      }),
      source_slippage: '0',
      destination_account: pathfindResults.destination_account,
      destination_tag: '',
      destination_amount: (
        typeof pathfindResults.destination_amount === 'string' ?
      {
        value: utils.dropsToXrp(pathfindResults.destination_amount),
        currency: 'XRP',
        issuer: ''
      } :
      {
        value: pathfindResults.destination_amount.value,
        currency: pathfindResults.destination_amount.currency,
        issuer: pathfindResults.destination_amount.issuer
      }),
      invoice_id: '',
      paths: JSON.stringify(alternative.paths_computed),
      partial_payment: false,
      no_direct_ripple: false
    };
  });
}

function parseOrderCancellationResponse(message, meta) {
  var order = {
    account: message.tx_json.Account,
    fee: utils.dropsToXrp(message.tx_json.Fee),
    offer_sequence: message.tx_json.OfferSequence,
    sequence: message.tx_json.Sequence
  };
  return _.assign({order: order}, meta);
}

function parseOrderResponse(message, meta) {
  var order = {
    account: message.tx_json.Account,
    taker_gets: utils.parseCurrencyAmount(message.tx_json.TakerGets),
    taker_pays: utils.parseCurrencyAmount(message.tx_json.TakerPays),
    fee: utils.dropsToXrp(message.tx_json.Fee),
    type: (message.tx_json.Flags & ripple.Transaction.flags.OfferCreate.Sell)
      > 0 ? 'sell' : 'buy',
    sequence: message.tx_json.Sequence
  };
  return _.assign({order: order}, meta);
}

function parseTrustLineResponse(message, meta) {
  var limit = message.tx_json.LimitAmount;
  var parsedFlags = parseFlagsFromResponse(message.tx_json.Flags,
    constants.TrustSetResponseFlags);
  var trustline = {
    account: message.tx_json.Account,
    limit: limit.value,
    currency: limit.currency,
    counterparty: limit.issuer,
    account_allows_rippling: !parsedFlags.prevent_rippling,
    account_trustline_frozen: parsedFlags.account_trustline_frozen,
    authorized: parsedFlags.authorized ? parsedFlags.authorized : undefined
  };
  return _.assign({trustline: trustline}, meta);
}

function parseSettingsResponse(settings, message, meta) {
  var _settings = {};
  for (var flagName in constants.AccountSetIntFlags) {
    var flag = constants.AccountSetIntFlags[flagName];
    _settings[flag.name] = settings[flag.name];
  }

  for (var fieldName in constants.AccountRootFields) {
    var field = constants.AccountRootFields[fieldName];
    _settings[field.name] = settings[field.name];
  }

  _.assign(_settings, parseFlagsFromResponse(message.tx_json.Flags,
    constants.AccountSetResponseFlags));
  return _.assign({settings: _settings}, meta);
}

module.exports = {
  parsePaymentFromTx: parsePaymentFromTx,
  parsePaymentsFromPathFind: parsePaymentsFromPathFind,
  parseOrderFromTx: parseOrderFromTx,
  parseCancelOrderFromTx: parseOrderCancellationResponse,
  parseSubmitOrderFromTx: parseOrderResponse,
  parseTrustResponseFromTx: parseTrustLineResponse,
  parseSettingsResponseFromTx: parseSettingsResponse,
  parseFlagsFromResponse: parseFlagsFromResponse
};
