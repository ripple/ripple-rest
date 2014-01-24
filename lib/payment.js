var txLib = require('./tx'),
  ripple = require('ripple-lib'),
  BigInteger = require('../node_modules/ripple-lib/src/js/jsbn/jsbn').BigInteger,
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

  console.log('remote: ', remote);

  var secret = opts.secret,
    payment_json = opts.payment || opts.json || opts.payment_json || opts,
    src_address = opts.src_address || payment_json.src_address,
    tx;

  try {
    tx = paymentToTx(payment_json, { remote: remote });
  } catch (err) {
    console.log('paymentToTx error: ', err);
    callback(err);
    return;
  }

  txLib.submitTx(remote, {
    src_address: src_address,
    tx: tx,
    secret: secret
  }, function(err, initialHash){
    if (err) {
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
          value: (new BigInteger(tx.Amount, 10)).divide((new BigInteger(1000000))).toString(),
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
        value: (new BigInteger(tx.Amount, 10)).divide((new BigInteger(1000000))).toString(),
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
    tx_fee: (new BigInteger(tx.Fee, 10)).divide((new BigInteger(1000000))).toString() || '',
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

  console.log('paymentToTx: ', payment);
  
  /* Validate Parameters */

  validateNewPayment(payment);

  console.log('made it past validation');
  

  var tx = (opts.remote ? opts.remote.transaction() : ripple.Transaction());

  // console.log('BigInteger: ', BigInteger);

  /* Construct payment */
  tx.payment({
    from: payment.src_address,
    to: payment.dst_address,
    amount: (payment.dst_amount.currency === 'XRP' ?
      (new BigInteger(payment.dst_amount.value, 10)).multiply((new BigInteger(1000000))).toString() : // convert XRP to drops
      payment.dst_amount),
    invoiceID: payment.invoice_id
  });

  console.log('after tx.payment: ', tx);

  // Tags
  if (payment.src_tag) {
    tx.sourceTag(payment.src_tag);
  }
  if (payment.dst_tag) {
    tx.destinationTag(payment.dst_tag);
  }

  console.log('after tags: ', tx);

  // SendMax
  if (payment.src_amount) {
    var max = payment.src_amount;
    if (payment.src_slippage) {
      max.value = (new BigInteger(max.value, 10)).add((new BigInteger(payment.src_slippage, 10)));
    }
    if (max.currency === 'XRP') {
      max = (new BigInteger(max.value, 10)).multiply((new BigInteger(1000000))).toString(); // convert XRP to drops
    }
    tx.sendMax(max);
  }

  console.log('after tx.sendMax: ', tx);

  // Paths
  if (payment.paths) {
    tx.paths(payment.paths);
  }

  console.log('after tx.paths: ', tx);

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

  console.log('tx.tx_json: ', tx.tx_json);

  return tx;
}

/**
 *  throws error if invalid
 */
function validateNewPayment(payment) {

  // Ripple addresses
  if (!ripple.UInt160.is_valid(payment.src_address)) {
    throw(new TypeError('Invalid parameter: src_address'));
  }
  if (!ripple.UInt160.is_valid(payment.dst_address)) {
    throw(new TypeError('Invalid parameter: dst_address'));
  }

  // Tags
  if (payment.src_tag && 
    (!validator.isInt(payment.src_tag) || 
      parseInt(payment.src_tag, 10) < 0 || 
      parseInt(payment.src_tag, 10) > Math.pow(2, 32) - 1)) {
    throw(new TypeError('Invalid parameter: src_tag'));
  }
  if (payment.dst_tag && 
    (!validator.isInt(payment.dst_tag) || 
      parseInt(payment.dst_tag, 10) < 0 || 
      parseInt(payment.dst_tag, 10) > Math.pow(2, 32) - 1)) {
    throw(new TypeError('Invalid parameter: dst_tag'));
  }

  // Amounts
  // dst_amount is required, src_amount is optional
  if (!isValidAmount(payment.dst_amount)) {
    throw(new TypeError('Invalid parameter: dst_amount'));
  }
  if (payment.src_amount && !isValidAmount(payment.src_amount)) {
    throw(new TypeError('Invalid parameter: src_amount'));
  }

  // Slippage
  if (payment.src_slippage && !validator.isFloat(payment.src_slippage)) {
    throw(new TypeError('Invalid parameter: src_slippage'));
  }
  if (payment.dst_slippage && !validator.isFloat(payment.dst_slippage)) {
    throw(new TypeError('Invalid parameter: dst_slippage'));
  }

  // Advanced options
  if (payment.invoice_id && !validator.isAlphanumeric(payment.invoice_id)) {
    throw(new TypeError('Invalid parameter: invoice_id'));
  }
  if (payment.paths && typeof payment.paths !== 'object') {
    throw(new TypeError('Invalid parameter: paths'));
  }
  if (payment.hasOwnProperty('flag_partial_payment') && typeof payment.flag_partial_payment !== 'boolean') {
    throw(new TypeError('Invalid parameter: flag_partial_payment'));
  }
  if (payment.hasOwnProperty('flag_no_direct_ripple') && typeof payment.flag_no_direct_ripple !== 'boolean') {
    throw(new TypeError('Invalid parameter: flag_no_direct_ripple'));
  }
  
  console.log('validated payment');
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



