var ripple           = require('ripple-lib');
var bignum           = require('bignumber.js');
var _                = require('lodash');
var validator        = require('../schema-validator');
var utils            = require('../utils');

function parsePaymentFromTx(tx, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  if (!opts.account) {
    callback(new Error('Internal Error. must supply opts.account'));
    return;
  }

  if (tx.TransactionType !== 'Payment') {
    callback(new Error('Not a payment. The transaction corresponding to the given identifier is not a payment.'));
    return;
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
      (typeof tx.Amount === 'string' ?
        {
          value: utils.dropsToXrp(tx.Amount),
          currency: 'XRP',
          issuer: ''
        } :
        tx.Amount)),
    source_slippage: '0',

    destination_account: tx.Destination,
    destination_tag: (tx.DestinationTag ? '' + tx.DestinationTag : ''),
    destination_amount: (typeof tx.Amount === 'object' ?
      tx.Amount :
      {
        value: utils.dropsToXrp(tx.Amount),
        currency: 'XRP',
        issuer: ''
      }),

    // Advanced options
    invoice_id: tx.InvoiceID || '',
    paths: JSON.stringify(tx.Paths || []),
    no_direct_ripple: (tx.Flags & 0x00010000 ? true : false),
    partial_payment: (tx.Flags & 0x00020000 ? true : false),

    // Generated after validation
    direction: (opts.account ?
      (opts.account === tx.Account ?
        'outgoing' :
        (opts.account === tx.Destination ?
          'incoming' :
          'passthrough')) :
      ''),
    state: tx.state || (tx.meta.TransactionResult === 'tesSUCCESS' ? 'validated' : 'failed'),
    result: tx.meta.TransactionResult || '',
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

  callback(null, payment);
};

function paymentIsValid(payment, callback) {
  // Ripple addresses
  if (!validator.isValid(payment.source_account, 'RippleAddress')) {
    callback(new TypeError('Invalid parameter: source_account. Must be a valid Ripple address'));
    return;
  }
  if (!validator.isValid(payment.destination_account, 'RippleAddress')) {
    callback(new TypeError('Invalid parameter: destination_account. Must be a valid Ripple address'));
    return;
  }

  // Tags
  if (payment.source_tag && (!validator.isValid(payment.source_tag, 'UINT32'))) {
    callback(new TypeError('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer'));
    return;
  }
  if (payment.destination_tag && (!validator.isValid(payment.destination_tag, 'UINT32'))) {
    callback(new TypeError('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer'));
    return;
  }

  // Amounts
  // destination_amount is required, source_amount is optional
  if (!payment.destination_amount || (!validator.isValid(payment.destination_amount, 'Amount'))) {
    callback(new TypeError('Invalid parameter: destination_amount. Must be a valid Amount object'));
    return;
  }
  if (payment.source_amount && (!validator.isValid(payment.source_amount, 'Amount'))) {
    callback(new TypeError('Invalid parameter: source_amount. Must be a valid Amount object'));
    return;
  }

  // No issuer for XRP
  if (payment.destination_amount && payment.destination_amount.currency.toUpperCase() === 'XRP' && payment.destination_amount.issuer) {
    callback(new TypeError('Invalid parameter: destination_amount. XRP cannot have issuer'));
    return;
  }
  if (payment.source_amount && payment.source_amount.currency.toUpperCase() === 'XRP' && payment.source_amount.issuer) {
    callback(new TypeError('Invalid parameter: source_amount. XRP cannot have issuer'));
    return;
  }


  // Slippage
  if (payment.source_slippage && !validator.isValid(payment.source_slippage, 'FloatString')) {
    callback(new TypeError('Invalid parameter: source_slippage. Must be a valid FloatString'));
    return;
  }


  // Advanced options
  if (payment.invoice_id && !validator.isValid(payment.invoice_id, 'Hash256')) {
    callback(new TypeError('Invalid parameter: invoice_id. Must be a valid Hash256'));
    return;
  }
  if (payment.paths) {
    if (typeof payment.paths === 'string') {
      try {
        JSON.parse(payment.paths);
      } catch (e) {
        callback(new TypeError('Invalid parameter: paths. Must be a valid JSON string or object'));
        return;
      }
    } else if (typeof payment.paths === 'object') {
      try {
        JSON.parse(JSON.stringify(payment.paths));
      } catch (e) {
        callback(new TypeError('Invalid parameter: paths. Must be a valid JSON string or object'));
        return;
      }
    }
  }
  if (payment.hasOwnProperty('partial_payment') && typeof payment.partial_payment !== 'boolean') {
    callback(new TypeError('Invalid parameter: partial_payment. Must be a boolean'));
    return;
  }
  if (payment.hasOwnProperty('no_direct_ripple') && typeof payment.no_direct_ripple !== 'boolean') {
    callback(new TypeError('Invalid parameter: no_direct_ripple. Must be a boolean'));
    return;
  }

  callback(null, true);
};

function paymentToTransaction(payment, callback) {
  // Validate Input
  paymentIsValid(payment, function(err, valid){
    if (err) {
      return callback(err);
    }

    try {
      // Convert blank issuer to sender's address (Ripple convention for 'any issuer')
      if (payment.source_amount && payment.source_amount.currency !== 'XRP' && payment.source_amount.issuer === '') {
        payment.source_amount.issuer = payment.source_account;
      }
      if (payment.destination_amount && payment.destination_amount.currency !== 'XRP' && payment.destination_amount.issuer === '') {
        payment.destination_amount.issuer = payment.destination_account;
      }

      // Uppercase currency codes
      if (payment.source_amount) {
        payment.source_amount.currency = payment.source_amount.currency.toUpperCase();
      }
      if (payment.destination_amount) {
        payment.destination_amount.currency = payment.destination_amount.currency.toUpperCase();
      }

      /* Construct payment */
      var transaction = new ripple.Transaction(),
      transaction_data = {
        from: payment.source_account,
        to: payment.destination_account
      };

      if (payment.destination_amount.currency === 'XRP') {
        transaction_data.amount = utils.xrpToDrops(payment.destination_amount.value);
      } else {
        transaction_data.amount = payment.destination_amount;
      }

      if (payment.invoice_id) {
        transaction_data.invoiceID = payment.invoice_id;
      }

      transaction.payment(transaction_data);

      // Tags
      if (payment.source_tag) {
        transaction.sourceTag(parseInt(payment.source_tag, 10));
      }
      if (payment.destination_tag) {
        transaction.destinationTag(parseInt(payment.destination_tag, 10));
      }

      // invoice_id  Because transaction_data is a object,  transaction.payment function is ignored invoiceID
      if (payment.invoice_id) {
        transaction.invoiceID(payment.invoice_id);
      }

      // SendMax
      if (payment.source_amount) {

        var max_value = bignum(payment.source_amount.value).plus(payment.source_slippage || 0);

        // Set the SendMax if the source_amount (plus the slippage) 
        // is different than the destination_amount.
        if (!max_value.equals(payment.destination_amount.value) ||
          payment.source_amount.currency !== payment.destination_amount.currency ||
          payment.source_amount.issuer !== payment.source_amount.issuer) {

          // SendMax is set differently based on whether the source_amount is XRP
          if (payment.source_amount.currency === 'XRP') {
            transaction.sendMax(utils.xrpToDrops(max_value));
          } else {
            transaction.sendMax({
              value: max_value.toString(),
              currency: payment.source_amount.currency,
              issuer: payment.source_amount.issuer
            });
          }
        }
      }

      // Paths
      if (typeof payment.paths === 'string') {
        transaction.paths(JSON.parse(payment.paths));
      } else if (typeof payment.paths === 'object') {
        transaction.paths(payment.paths);
      }

      // Flags
      var flags = [];
      if (payment.partial_payment) {
        flags.push('PartialPayment');
      }
      if (payment.no_direct_ripple) {
        flags.push('NoRippleDirect');
      }
      if (flags.length > 0) {
        transaction.setFlags(flags);
      }

    } catch (e) {
      return callback(e);
    }

    callback(null, transaction);
  });
};

function parsePaymentsFromPathfind(pathfind_results, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  if (opts && opts.destination_amount) {
    pathfind_results.destination_amount = opts.destination_amount;
  }

  if (opts && opts.source_account) {
    pathfind_results.source_account = opts.source_account;
  }

  var payments = [];

  pathfind_results.alternatives.forEach(function(alternative){

    var payment = {
      source_account: pathfind_results.source_account,
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
        issuer: (alternative.source_amount.issuer === pathfind_results.source_account ? 
          '' : 
          alternative.source_amount.issuer)
      }),
      source_slippage: '0',
      destination_account: pathfind_results.destination_account,
      destination_tag: '',
      destination_amount: (typeof pathfind_results.destination_amount === 'string' ?
        {
          value: utils.dropsToXrp(pathfind_results.destination_amount),
          currency: 'XRP',
          issuer: ''
        } :
        {
          value: pathfind_results.destination_amount.value,
          currency: pathfind_results.destination_amount.currency,
          issuer: (pathfind_results.destination_amount.issuer === pathfind_results.destination_account ?
            '' :
            pathfind_results.destination_amount.issuer)
        }),
      invoice_id: '',
      paths: JSON.stringify(alternative.paths_computed),
      partial_payment: false,
      no_direct_ripple: false
    };

    payments.push(payment);

  });

  if (callback) {
    callback(null, payments);
  } else {
    return payments;
  }
};

module.exports.parsePaymentFromTx            = parsePaymentFromTx;
module.exports.paymentToTransaction = paymentToTransaction;
module.exports.paymentIsValid                = paymentIsValid;
module.exports.parsePaymentsFromPathfind     = parsePaymentsFromPathfind;

module.exports.keys = [
  'source_account',
  'source_tag',
  'source_amount',
  'source_slippage',
  'destination_account',
  'destination_tag',
  'destination_amount',
  'invoice_id',
  'paths',
  'partial_payment',
  'no_direct_ripple',
  'direction',
  'state',
  'result',
  'ledger',
  'hash',
  'timestamp',
  'fee',
  'source_balance_changes',
  'destination_balance_changes'
];

module.exports.submission_keys = [
  'source_account',
  'source_tag',
  'source_amount',
  'source_slippage',
  'destination_account',
  'destination_tag',
  'destination_amount',
  'invoice_id',
  'paths',
  'partial_payment',
  'no_direct_ripple'
];
