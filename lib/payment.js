var txLib = require('./tx'),
  rpparser = require('./rpparser'),
  ripple = require('ripple-lib'),
  bignum = require('bignumber.js'),
  validator = require('validator');

/**
 * // User supplied
 * source_address
 * source_tag
 * source_transaction_id
 * source_amount
 * source_slippage
 * 
 * destination_address
 * destination_tag
 * destination_payment_id // NOT YET SUPPORTED
 * destination_amount
 * destination_slippage // NOT YET SUPPORTED
 * 
 * // Advanced options
 * invoice_id
 * paths 
 * partial_payment (true/false)
 * no_direct_ripple (true/false)
 * 
 * // Generated after validation
 * direction
 * state
 * result
 * ledger
 * hash
 * timestamp
 * timestamp_human
 * fee
 * source_balance_changes
 * destination_balance_changes
 */
function getPayment(opts, callback) {

  if (typeof opts !== 'object') {
    callback(new Error('getPayment(opts, callback) must be called with opts {remote: { ripple-lib Remote }, hash: \'...\', address: \'...\'}'));
    return;
  }

  var remote = opts.remote, 
    hash = opts.hash || opts.hash || opts.paymentHash,
    address = opts.address || opts.source_address;

  if (!remote) {
    callback(new Error('Invalid parameter: remote. getPayment() must be called with opts including a ripple-lib Remote'));
    return;
  }

  if (!hash || !/[0-9a-fA-F]/.test(hash)) {
    callback(new Error('Invalid parameter: hash. getPayment() must be called with opts including a payment hash'));
    return;
  }

  txLib.getTx({
    remote: remote, 
    hash: hash
  }, function(err, tx){
    if (err) {
      callback(err);
      return;
    }

    if (tx && tx.TransactionType && tx.TransactionType === 'Payment') {
      var payment = txToPayment(tx, { address: address });
      callback(null, payment);
    } else {
      callback(null, null);
    }

  });
}


/**
 *  remote
 *  OutgoingTx
 *  source_address: '...',
 *  payment: { Simplified Payment Object },
 *  secret: '...'
 */
function submitPayment(opts, callback) {

  var remote = opts.remote, 
    OutgoingTx = opts.OutgoingTx,
    secret = opts.secret,
    payment = opts.payment || opts.json || opts.payment_json || opts,
    source_address = payment.source_address,
    tx;

  if (!payment) {
    callback(new Error('Invalid parameter: payment. Must provide a payment object to submit'));
    return;
  }

  if (source_address !== payment.source_address) {
    callback(new Error('Invalid parameter: source_address. URL parameter address must match JSON parameter source_address'));
    return;
  }

  if (!secret) {
    callback(new Error('Invalid parameter: secret. Must provide valid Ripple account secret to sign payment'));
    return;
  }
  
  // Convert payment to Ripple tx
  try {
    tx = paymentToTx(payment, { remote: remote });
  } catch (err) {
    callback(err);
    return;
  }

  txLib.submitTx({
    remote: remote,
    OutgoingTx: OutgoingTx,
    source_address: source_address,
    tx: tx,
    secret: secret
  }, function(err, source_transaction_id){
    if (err) {
      callback(err);
      return;
    }

    callback(null, source_transaction_id);
  });

}

/*
 * opts:
 *   address: '...'
 */
function txToPayment(tx, opts) {
  if (tx.TransactionType !== 'Payment') {
    throw(new Error('tx.TransactionType must be \'Payment\''));
  }

  var payment = {

    // User supplied
    source_address: tx.Account,
    source_tag: '' + tx.SourceTag,
    source_transaction_id: '',
    source_amount: (tx.SendMax ?
      (typeof tx.SendMax === 'object' ?
        tx.SendMax :
        {
          value: rpparser.dropsToXrp(tx.SendMax),
          currency: 'XRP',
          issuer: ''
        }) :
      (typeof tx.Amount === 'string' ? 
        {
          value: rpparser.dropsToXrp(tx.Amount),
          currency: 'XRP',
          issuer: ''
        } :
        null)),
    source_slippage: '0',

    destination_address: tx.Destination,
    destination_tag: '' + tx.DestinationTag,
    destination_amount: (typeof tx.Amount === 'object' ? 
      tx.Amount : 
      {
        value: rpparser.dropsToXrp(tx.Amount),
        currency: 'XRP',
        issuer: ''
      }),
    destination_slippage: '0',

    // Advanced options
    invoice_id: tx.InvoiceID || '',
    paths: JSON.stringify(tx.Paths || []),
    no_direct_ripple: (tx.Flags & 0x00010000 ? true : false),
    partial_payment: (tx.Flags & 0x00020000 ? true : false),

    // Generated after validation
    direction: (opts.address === tx.Account ? 
      'outgoing' : 
      (opts.address === tx.Destination ? 
        'incoming' : 
        'passthrough')),
    state: (tx.meta.TransactionResult === 'tesSUCCESS' ? 'confirmed' : 'failed'),
    result: tx.meta.TransactionResult || '',
    ledger: '' + (tx.inLedger || tx.ledger_index),
    hash: tx.hash || '',
    timestamp: '' + ripple.utils.toTimestamp(tx.date),
    timestamp_human: new Date(ripple.utils.toTimestamp(tx.date)).toUTCString() || '',
    fee: rpparser.dropsToXrp(tx.Fee) || '',
    source_balance_changes: [],
    destination_balance_changes: []

  };

  // Add source_balance_changes
  rpparser.parseBalanceChanges(tx, tx.Account).forEach(function(amount){
    if (amount.value < 0) {
      payment.source_balance_changes.push(amount);
    }
  });

  // Add destination_balance_changes
  rpparser.parseBalanceChanges(tx, tx.Destination).forEach(function(amount){
    if (amount.value > 0) {
      payment.destination_balance_changes.push(amount);
    }
  });

  return payment;
}


/*
 *  opts:
 *    remote: { ripple-lib Remote }
 *  payment:
 *    // User supplied
 *    source_address
 *    source_tag
 *    source_amount
 *    source_slippage
 *    
 *    destination_address
 *    destination_tag
 *    destination_amount
 *    destination_slippage // NOT YET SUPPORTED
 *    
 *    // Advanced options
 *    invoice_id
 *    paths
 *    partial_payment (true/false)
 *    no_direct_ripple (true/false)
 */
function paymentToTx(payment, opts) {
  
  /* Validate Parameters */
  validateNewPayment(payment);


  // Convert blank issuer to sender's address (Ripple convention for 'any issuer')
  if (payment.source_amount && payment.source_amount.currency !== 'XRP' && payment.source_amount.issuer === '') {
    payment.source_amount.issuer = payment.source_address;
  }
  if (payment.destination_amount && payment.destination_amount.currency !== 'XRP' && payment.destination_amount.issuer === '') {
    payment.destination_amount.issuer = payment.destination_address;
  }


  /* Construct payment */
  var tx = (opts.remote ? opts.remote.transaction() : ripple.Transaction());
  
  tx.payment({
    from: payment.source_address,
    to: payment.destination_address,
    amount: (payment.destination_amount.currency === 'XRP' ? 
      rpparser.xrpToDrops(payment.destination_amount.value) :
      payment.destination_amount),
    invoiceID: payment.invoice_id
  });

  // Tags
  if (payment.source_tag) {
    tx.sourceTag(payment.source_tag);
  }
  if (payment.destination_tag) {
    tx.destinationTag(payment.destination_tag);
  }

  // SendMax
  if (payment.source_amount && 
    (payment.source_amount.currency !== 'XRP' || payment.destination_amount.currency !== 'XRP') &&
    !(bignum(payment.source_amount.value).equals(payment.destination_amount.value) &&
      payment.source_amount.currency === payment.destination_amount.currency &&
      payment.source_amount.issuer === payment.destination_amount.issuer)) {

    var max = payment.source_amount;
    if (payment.source_slippage && payment.source_slippage !== '0') {
      max.value = bignum(max.value).plus(payment.source_slippage).toString();
    }
    if (payment.source_amount.currency === 'XRP') {
      max = rpparser.xrpToDrops(max.value);
    }

    tx.sendMax(max);
  }

  // Paths
  if (typeof payment.paths === 'string') {
    tx.paths(JSON.parse(payment.paths));
  } else if (typeof payment.paths === 'object') {
    tx.paths(payment.paths);
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
    tx.setFlags(flags);
  }

  return tx;
}

/**
 *  throws error if invalid
 */
function validateNewPayment(payment) {

  if (!payment) {
    throw(new Error('payment is undefined'));
  }

  // Ripple addresses
  if (!rpparser.isRippleAddress(payment.source_address)) {
    throw(new TypeError('Invalid parameter: source_address. Must be a valid Ripple address'));
  }
  if (!rpparser.isRippleAddress(payment.destination_address)) {
    throw(new TypeError('Invalid parameter: destination_address. Must be a valid Ripple address'));
  }

  // Tags
  if (payment.source_tag && 
    (!validator.isInt(payment.source_tag) || 
      parseInt(payment.source_tag, 10) < 0 || 
      parseInt(payment.source_tag, 10) > Math.pow(2, 32) - 1)) {
    throw(new TypeError('Invalid parameter: source_tag. Must be a string representation of an unsiged 32-bit integer'));
  }
  if (payment.destination_tag && 
    (!validator.isInt(payment.destination_tag) || 
      parseInt(payment.destination_tag, 10) < 0 || 
      parseInt(payment.destination_tag, 10) > Math.pow(2, 32) - 1)) {
    throw(new TypeError('Invalid parameter: destination_tag. Must be a string representation of an unsiged 32-bit integer'));
  }

  // Payment IDs
  if (!payment.source_transaction_id || !/[ -~]{1,255}/.test(payment.source_transaction_id)) {
    throw(new TypeError('Invalid parameter: source_transaction_id. Must provide a string of ASCII-printable characters to identify the payment'));
  }

  // Amounts
  // destination_amount is required, source_amount is optional
  if (!rpparser.isValidAmount(payment.destination_amount)) {
    throw(new TypeError('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }'));
  }
  if (payment.source_amount && !rpparser.isValidAmount(payment.source_amount)) {
    throw(new TypeError('Invalid parameter: source_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }'));
  }

  // Slippage
  if (payment.source_slippage && !validator.isFloat(payment.source_slippage)) {
    throw(new TypeError('Invalid parameter: source_slippage. Must be a string representation of a floating point number amount (not %)'));
  }
  // if (payment.destination_slippage && !validator.isFloat(payment.destination_slippage)) {
  //   throw(new TypeError('Invalid parameter: destination_slippage. Must be a string representation of a floating point number amount (not %)'));
  // }
  if (payment.destination_slippage && payment.destination_slippage !== '0') {
    throw(new Error('Feature not yet supported: destination_slippage'));
  }


  // Advanced options
  if (payment.invoice_id && !validator.isAlphanumeric(payment.invoice_id)) {
    throw(new TypeError('Invalid parameter: invoice_id. Must be alphanumeric string'));
  }
  if (payment.paths) {
    if (typeof payment.paths === 'string') {
      try {
        var parsed_from_str = JSON.parse(payment.paths);
        if (typeof parsed_from_str !== 'object') {
          throw(new Error('Invalid JSON'));
        }
      } catch (e) {
        throw(new TypeError('Invalid parameter: paths. Must be a valid JSON string or object'));      
      }
    } else if (typeof payment.paths === 'object') {
      try {
        var parsed_from_obj = JSON.parse(JSON.stringify(payment.paths));
        if (typeof parsed_from_obj !== 'object') {
          throw(new Error('Invalid JSON'));
        }
      } catch (e) {
        throw(new TypeError('Invalid parameter: paths. Must be a valid JSON string or object'));      
      }
    }
  }
  if (payment.hasOwnProperty('partial_payment') && typeof payment.partial_payment !== 'boolean') {
    throw(new TypeError('Invalid parameter: partial_payment. Must be a boolean'));
  }
  if (payment.hasOwnProperty('no_direct_ripple') && typeof payment.no_direct_ripple !== 'boolean') {
    throw(new TypeError('Invalid parameter: no_direct_ripple. Must be a boolean'));
  }
  
  return true;

}



module.exports.getPayment = getPayment;
module.exports.submitPayment = submitPayment;
module.exports.validateNewPayment = validateNewPayment;
module.exports.txToPayment = txToPayment;
module.exports.paymentToTx = paymentToTx;
