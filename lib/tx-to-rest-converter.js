var ripple    = require('ripple-lib');
var utils     = require(__dirname+'/utils');
var _         = require('lodash');
var settings  = require('./../api/settings.js');

function TxToRestConverter() {};

// Paths

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

TxToRestConverter.prototype.parsePaymentFromTx = function(tx, options, callback) {

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (!options.account) {
    if (callback !== void(0)) {
      callback(new Error('Internal Error. must supply options.account'));
    }
    return;
  }

  if (tx.TransactionType !== 'Payment') {
    if (callback !== void(0)) {
      callback(new Error('Not a payment. The transaction corresponding to the given identifier is not a payment.'));
    }
    return;
  }

  if (tx.meta !== void(0) && tx.meta.TransactionResult !== void(0)) {
    if (tx.meta.TransactionResult === 'tejSecretInvalid') {
      if (callback !== void(0)) {
        callback(new Error('Invalid secret provided.'));
      }
      return;
    }
  }

  var Amount;
  var isPartialPayment = tx.Flags & 0x00020000 ? true : false;

  // if there is a DeliveredAmount we should use it over Amount
  // there should always be a DeliveredAmount if the partial payment flag is set
  // also there shouldn't be a DeliveredAmount if there's no partial payment flag
  if(isPartialPayment && tx.meta && tx.meta.DeliveredAmount) {
    Amount = tx.meta.DeliveredAmount;
  } else {
    Amount = tx.Amount;
  }

  var payment = {
    // User supplied
    source_account: tx.Account,
    source_tag: (tx.SourceTag ? '' + tx.SourceTag : ''),
    source_amount: (tx.SendMax ?
      (typeof tx.SendMax === 'object' ?
        tx.SendMax :
      {
        value: utils.dropsToXrp(tx.SendMax),
        currency: 'XRP',
        issuer: ''
      }) :
      (typeof Amount === 'string' ?
      {
        value: utils.dropsToXrp(tx.Amount),
        currency: 'XRP',
        issuer: ''
      } :
        Amount)),
    source_slippage: '0',
    destination_account: tx.Destination,
    destination_tag: (tx.DestinationTag ? '' + tx.DestinationTag : ''),
    destination_amount: (typeof Amount === 'object' ?
      Amount :
    {
      value: utils.dropsToXrp(Amount),
      currency: 'XRP',
      issuer: ''
    }),
    // Advanced options
    invoice_id: tx.InvoiceID || '',
    paths: JSON.stringify(tx.Paths || []),
    no_direct_ripple: (tx.Flags & 0x00010000 ? true : false),
    partial_payment: isPartialPayment,
    // Generated after validation
    direction: (options.account ?
      (options.account === tx.Account ?
        'outgoing' :
        (options.account === tx.Destination ?
          'incoming' :
          'passthrough')) :
      ''),
    state: tx.state || tx.meta ? (tx.meta.TransactionResult === 'tesSUCCESS' ? 'validated' : 'failed') : '',
    result: tx.meta ? tx.meta.TransactionResult : '',
    ledger: '' + (tx.inLedger || tx.ledger_index),
    hash: tx.hash || '',
    timestamp: (tx.date ? new Date(ripple.utils.toTimestamp(tx.date)).toISOString() : ''),
    fee: utils.dropsToXrp(tx.Fee) || '',
    source_balance_changes: [],
    destination_balance_changes: []
  };
  // Add source_balance_changes
  utils.parseBalanceChanges(tx, tx.Account).forEach(function(amount){
    if (amount.value < 0) {
      payment.source_balance_changes.push(amount);
    }
  });
  // Add destination_balance_changes
  utils.parseBalanceChanges(tx, tx.Destination).forEach(function(amount){
    if (amount.value > 0) {
      payment.destination_balance_changes.push(amount);
    }
  });
  if (Array.isArray(tx.Memos) && tx.Memos.length > 0) {
    payment.memos = [];
    for(var m=0; m<tx.Memos.length; m++) {
      payment.memos.push(tx.Memos[m].Memo);
    }
  }
  if (isPartialPayment && tx.meta && tx.meta.DeliveredAmount) {
    payment.destination_amount_submitted = (typeof tx.Amount === 'object' ?
      tx.Amount :
    {
      value: utils.dropsToXrp(tx.Amount),
      currency: 'XRP',
      issuer: ''
    });
    payment.source_amount_submitted = (tx.SendMax ?
      (typeof tx.SendMax === 'object' ?
        tx.SendMax :
      {
        value: utils.dropsToXrp(tx.SendMax),
        currency: 'XRP',
        issuer: ''
      }) :
      (typeof tx.Amount === 'string' ?
      {
        value: utils.dropsToXrp(tx.Amount),
        currency: 'XRP',
        issuer: ''
      } :
        tx.Amount));
  }

  callback(null, payment);
};

// Paths

/**
 *  Convert the pathfind results returned from rippled into an
 *  array of payments in the ripple-rest format. The client should be
 *  able to submit any of the payments in the array back to ripple-rest.
 *
 *  @param {rippled Pathfind results} pathfindResults
 *  @param {Amount} options.destination_amount Since this is not returned by rippled in the pathfind results it can either be added to the results or included in the options here
 *  @param {RippleAddress} options.source_account Since this is not returned by rippled in the pathfind results it can either be added to the results or included in the options here
 *
 *  @returns {Array of Payments} payments
 */
TxToRestConverter.prototype.parsePaymentsFromPathFind = function(pathfindResults, callback) {
  var payments = [];

  pathfindResults.alternatives.forEach(function(alternative) {
    var payment = {
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
        issuer: (typeof alternative.source_amount.issuer !== 'string' || alternative.source_amount.issuer === pathfindResults.source_account ?
          '' :
          alternative.source_amount.issuer)
      }),
      source_slippage: '0',
      destination_account: pathfindResults.destination_account,
      destination_tag: '',
      destination_amount: (typeof pathfindResults.destination_amount === 'string' ?
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

    payments.push(payment);
  });

  callback(null, payments);
};

// Orders

TxToRestConverter.prototype.parseCancelOrderFromTx = function(message, meta, callback) {
  var result = {};
  _.extend(meta, {
    account: message.tx_json.Account,
    fee: utils.dropsToXrp(message.tx_json.Fee),
    offer_sequence: message.tx_json.OfferSequence,
    sequence: message.tx_json.Sequence
  });

  result.order = meta;

  callback(null, result);
};

TxToRestConverter.prototype.parseSubmitOrderFromTx = function(message, meta, callback) {
  var result = {};
  _.extend(meta, {
    account: message.tx_json.Account,
    taker_gets: message.tx_json.TakerGets,
    taker_pays: message.tx_json.TakerPays,
    fee: utils.dropsToXrp(message.tx_json.Fee),
    type: (message.tx_json.Flags & ripple.Transaction.flags.OfferCreate.Sell) > 0 ? 'sell' : 'buy',
    sequence: message.tx_json.Sequence
  });

  if (_.isString(meta.taker_gets)) {
    meta.taker_gets = {
      currency: 'XRP',
      value: utils.dropsToXrp(meta.taker_gets),
      issuer: ''
    }
  }

  if (_.isString(meta.taker_pays)) {
    meta.taker_pays = {
      currency: 'XRP',
      value: utils.dropsToXrp(meta.taker_pays),
      issuer: ''
    }
  }

  result.order = meta;

  callback(null, result);
};

// Trustlines

const TrustSetResponseFlags = {
  NoRipple:      { name: 'prevent_rippling', value: ripple.Transaction.flags.TrustSet.NoRipple },
  SetFreeze:     { name: 'account_trustline_frozen', value: ripple.Transaction.flags.TrustSet.SetFreeze },
  SetAuth:       { name: 'authorized', value: ripple.Transaction.flags.TrustSet.SetAuth }
};

TxToRestConverter.prototype.parseTrustResponseFromTx = function(message, meta, callback) {
  var result = {};
  var line = message.tx_json.LimitAmount;
  var parsedFlags = TxToRestConverter.prototype.parseFlagsFromResponse(message.tx_json.Flags, TrustSetResponseFlags);

  _.extend(meta, {
    account: message.tx_json.Account,
    limit: line.value,
    currency: line.currency,
    counterparty: line.issuer,
    account_allows_rippling: !parsedFlags.prevent_rippling,
    account_trustline_frozen: parsedFlags.account_trustline_frozen,
    authorized: parsedFlags.authorized ? parsedFlags.authorized : void(0)
  });

  result.trustline = meta;

  callback(null, result);
};

// Settings

const AccountSetResponseFlags = {
  RequireDestTag: { name:   'require_destination_tag', value: ripple.Transaction.flags.AccountSet.RequireDestTag },
  RequireAuth:    { name:   'require_authorization', value: ripple.Transaction.flags.AccountSet.RequireAuth },
  DisallowXRP:    { name:   'disallow_xrp', value: ripple.Transaction.flags.AccountSet.DisallowXRP }
};

TxToRestConverter.prototype.parseSettingResponseFromTx = function(params, message, meta, callback) {
  var result = {
    settings: {}
  };

  // lazy loading to avoid circular dependency
  var settings = require('./../api/settings.js');

  for (var flagName in settings.AccountSetIntFlags) {
    var flag = settings.AccountSetIntFlags[flagName];

    result.settings[flag.name] = params.settings[flag.name];
  }

  for (var fieldName in settings.AccountRootFields) {
    var field = settings.AccountRootFields[fieldName];

    result.settings[field.name] = params.settings[field.name];
  }

  _.extend(meta, TxToRestConverter.prototype.parseFlagsFromResponse(message.tx_json.Flags, AccountSetResponseFlags));
  _.extend(result.settings, meta);

  callback(null, result);
};

// Utilities

/**
 *  Helper that parses bit flags from ripple response
 *
 *  @param {Number} responseFlags - Integer flag on the ripple response
 *  @param {Object} flags         - Object with parameter name and bit flag value pairs
 *
 *  @returns {Object} parsedFlags - Object with parameter name and boolean flags depending on response flag
 */
TxToRestConverter.prototype.parseFlagsFromResponse = function(responseFlags, flags) {
  var parsedFlags = {};

  for (var flagName in flags) {
    var flag = flags[flagName];
    parsedFlags[flag.name] = Boolean(responseFlags & flag.value);
  }

  return parsedFlags;
};

module.exports = new TxToRestConverter();