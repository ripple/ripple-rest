var txLib = require('./tx'),
  ripple = require('ripple-lib'),
  bignum = require('bignum'),
  validator = require('validator');

/**
 * // User supplied
 * src_address
 * src_tag
 * src_amount
 * src_slippage
 * 
 * dst_address
 * dst_tag
 * dst_amount
 * dst_slippage // NOT YET SUPPORTED
 * 
 * // Advanced options
 * invoice_id
 * paths // NOT YET SUPPORTED
 * flag_partial_payment (true/false)
 * flag_no_direct_ripple (true/false)
 * 
 * // Generated after validation
 * tx_direction
 * tx_state
 * tx_result
 * tx_ledger
 * tx_hash
 * tx_timestamp
 * tx_fee
 * tx_src_debit
 * tx_dst_credit
 * tx_conversion
 */
module.exports.getPayment = function(remote, opts, callback) {

  var hash,
    address;

  if (typeof opts === 'object') {
    hash = opts.hash || opts.tx_hash || opts.paymentHash;
    address = opts.address || opts.src_address;
  } else if (typeof opts === 'string') {
    hash = opts;
  }


  txLib.getTx(remote, hash, function(err, tx){
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
};


/**
 *  src_address: '...',
 *  payment: { Simplified Payment Object },
 *  secret: '...'
 */
module.exports.submitPayment = function(remote, opts, callback) {

  var secret = opts.secret,
    payment_json = opts.payment || opts.json || opts.payment_json || opts,
    src_address = opts.src_address,
    tx;

  if (src_address !== payment_json.src_address) {
    callback(new Error('Invalid parameter: src_address. URL parameter must match JSON parameter'));
    return;
  }

  if (!secret) {
    callback(new Error('Invalid parameter: secret. Must provide valid Ripple account secret to sign payment'));
    return;
  }

  try {
    tx = paymentToTx(payment_json, { remote: remote });
  } catch (err) {
    callback(err);
    return;
  }

  txLib.submitTx(remote, {
    src_address: src_address,
    tx: tx,
    secret: secret
  }, function(err, initialHash){
    if (err) {
      console.log('txLib.submitTx err: ', err);
      callback(err);
      return;
    }

    callback(null, initialHash);
  });

};

/*
 * opts:
 *   address: '...'
 */
function txToPayment(tx, opts) {
  if (tx.TransactionType !== 'Payment') {
    throw(new Error('tx.TransactionType must be "Payment"'));
  }

  var payment = {

    // User supplied
    src_address: tx.Account,
    src_tag: tx.SourceTag || '',
    src_amount: (tx.SendMax ? 
      tx.SendMax :
      (typeof tx.Amount === 'string' ? 
        {
          value: dropsToXrp(tx.Amount),
          currency: 'XRP',
          issuer: ''
        } :
        null)),
    src_slippage: '0',

    dst_address: tx.Desination,
    dst_tag: tx.DestinationTag || '',
    dst_amount: (typeof tx.Amount === 'object' ? 
      tx.Amount : 
      {
        value: dropsToXrp(tx.Amount),
        currency: 'XRP',
        issuer: ''
      }),
    dst_slippage: '0',

    // Advanced options
    invoice_id: tx.InvoiceID,
    paths: tx.paths || '',
    flag_partial_payment: (tx.Flags & 0x00010000 ? true : false),
    flag_no_direct_ripple: (tx.Flags & 0x00020000 ? true : false),

    // Generated after validation
    tx_direction: (opts.address === payment.src_address ? 
      'outgoing' : 
      (opts.address === payment.dst_address ? 
        'incoming' : 
        'passthrough')),
    tx_state: (tx.meta.TransactionResult === 'tesSUCCESS' ? 'confirmed' : 'failed'),
    tx_result: tx.meta.TransactionResult || '',
    tx_ledger: tx.inLedger || tx.ledger_index || '',
    tx_hash: tx.hash || '',
    tx_timestamp: tx.close_time_unix || ripple.utils.toTimestamp(tx.date) || '',
    tx_fee: dropsToXrp(tx.Fee) || '',
    tx_src_debit: 'TODO',
    tx_dst_credit: 'TODO',
    tx_conversion: 'TODO'

  };

  return payment;
}


/*
 *  opts:
 *    remote: { ripple-lib Remote }
 *  payment:
 *    // User supplied
 *    src_address
 *    src_tag
 *    src_amount
 *    src_slippage
 *    
 *    dst_address
 *    dst_tag
 *    dst_amount
 *    dst_slippage // NOT YET SUPPORTED
 *    
 *    // Advanced options
 *    invoice_id
 *    paths
 *    flag_partial_payment (true/false)
 *    flag_no_direct_ripple (true/false)
 */
function paymentToTx(payment, opts) {
  
  /* Validate Parameters */
  validateNewPayment(payment);


  /* Construct payment */
  var tx = (opts.remote ? opts.remote.transaction() : ripple.Transaction());
  
  tx.payment({
    from: payment.src_address,
    to: payment.dst_address,
    amount: (payment.dst_amount.currency === 'XRP' ?
      xrpToDrops(payment.dst_amount.value) :
      payment.dst_amount),
    invoiceID: payment.invoice_id
  });

  // Tags
  if (payment.src_tag) {
    tx.sourceTag(payment.src_tag);
  }
  if (payment.dst_tag) {
    tx.destinationTag(payment.dst_tag);
  }

  // SendMax
  if (payment.src_amount && payment.src_amount.currency !== 'XRP') {
    var max = payment.src_amount;
    if (payment.src_slippage && payment.src_slippage !== '0') {
      max.value = bignum(max.value).add(payment.src_slippage);
    }
    if (max.currency === 'XRP') {
      max = xrpToDrops(max.value);
    }
    tx.sendMax(max);
  }

  // Paths
  if (payment.paths && payment.paths.length > 0) {
    tx.paths(payment.paths);
  }

  // Flags
  var flags = [];
  if (payment.flag_partial_payment) {
    flags.push('PartialPayment');
  }
  if (payment.flag_no_direct_ripple) {
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

  // Ripple addresses
  if (!ripple.UInt160.is_valid(payment.src_address)) {
    throw(new TypeError('Invalid parameter: src_address. Must be a valid Ripple address'));
  }
  if (!ripple.UInt160.is_valid(payment.dst_address)) {
    throw(new TypeError('Invalid parameter: dst_address. Must be a valid Ripple address'));
  }

  // Tags
  if (payment.src_tag && 
    (!validator.isInt(payment.src_tag) || 
      parseInt(payment.src_tag, 10) < 0 || 
      parseInt(payment.src_tag, 10) > Math.pow(2, 32) - 1)) {
    throw(new TypeError('Invalid parameter: src_tag. Must be a string representation of an unsiged 32-bit integer'));
  }
  if (payment.dst_tag && 
    (!validator.isInt(payment.dst_tag) || 
      parseInt(payment.dst_tag, 10) < 0 || 
      parseInt(payment.dst_tag, 10) > Math.pow(2, 32) - 1)) {
    throw(new TypeError('Invalid parameter: dst_tag. Must be a string representation of an unsiged 32-bit integer'));
  }

  // Amounts
  // dst_amount is required, src_amount is optional
  if (!isValidAmount(payment.dst_amount)) {
    throw(new TypeError('Invalid parameter: dst_amount. Must be an object of the form { value: "1", currency: "XRP", issuer: "" }'));
  }
  if (payment.src_amount && !isValidAmount(payment.src_amount)) {
    throw(new TypeError('Invalid parameter: src_amount. Must be an object of the form { value: "1", currency: "XRP", issuer: "" }'));
  }

  // Slippage
  if (payment.src_slippage && !validator.isFloat(payment.src_slippage)) {
    throw(new TypeError('Invalid parameter: src_slippage. Must be a string representation of a floating point number amount (not %)'));
  }
  if (payment.dst_slippage && !validator.isFloat(payment.dst_slippage)) {
    throw(new TypeError('Invalid parameter: dst_slippage. Must be a string representation of a floating point number amount (not %)'));
  }

  // Advanced options
  if (payment.invoice_id && !validator.isAlphanumeric(payment.invoice_id)) {
    throw(new TypeError('Invalid parameter: invoice_id. Must be alphanumeric string'));
  }
  if (payment.paths && typeof payment.paths !== 'object') {
    throw(new TypeError('Invalid parameter: paths. Must be path object'));
  }
  if (payment.hasOwnProperty('flag_partial_payment') && typeof payment.flag_partial_payment !== 'boolean') {
    throw(new TypeError('Invalid parameter: flag_partial_payment. Must be a boolean'));
  }
  if (payment.hasOwnProperty('flag_no_direct_ripple') && typeof payment.flag_no_direct_ripple !== 'boolean') {
    throw(new TypeError('Invalid parameter: flag_no_direct_ripple. Must be a boolean'));
  }
  
  return true;

}

/**
 *  returns true if valid, false otherwise
 */
function isValidAmount(amount) {

  if (!amount || typeof amount !== 'object') {
    return false;
  }
  
  if (!validator.isFloat(amount.value)) {
    return false;
  }

  if (!validator.isAlphanumeric(amount.currency) ||
      (amount.currency === 'XRP' && amount.issuer)) {
    return false;
  }

  if (amount.issuer && !ripple.UInt160.is_valid(amount.issuer)) {
    return false;
  }

  return true;
}


function dropsToXrp (drops) {
  return bignum(drops).div(1000000).toString();
}

function xrpToDrops (xrp) {
  return bignum(xrp).mul(1000000).toString();
}



