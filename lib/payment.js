var txLib = require('./tx'),
  rpparser = require('./rpparser'),
  ripple = require('ripple-lib'),
  bignum = require('bignumber.js'),
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
 * paths 
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
 * tx_timestamp_human
 * tx_fee
 * tx_src_bals_dec
 * tx_dst_bals_inc
 */
function getPayment(opts, callback) {

  if (typeof opts !== 'object') {
    callback(new Error('getPayment(opts, callback) must be called with opts {remote: { ripple-lib Remote }, hash: \'...\', address: \'...\'}'));
    return;
  }

  var remote = opts.remote, 
    hash = opts.hash || opts.tx_hash || opts.paymentHash,
    address = opts.address || opts.src_address;

  if (!remote) {
    callback(new Error('Invalid parameter: remote. getPayment() must be called with opts including a ripple-lib Remote'));
    return;
  }

  if (!hash) {
    callback(new Error('Invalid parameter: hash. getPayment() must be called with opts including a payment tx_hash'));
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
 *  OutgoinTx
 *  src_address: '...',
 *  payment: { Simplified Payment Object },
 *  secret: '...'
 */
function submitPayment(opts, callback) {

  var remote = opts.remote, 
    OutgoingTx = opts.OutgoingTx,
    secret = opts.secret,
    payment = opts.payment || opts.json || opts.payment_json || opts,
    src_address = payment.src_address,
    tx;

  if (!payment) {
    callback(new Error('Invalid parameter: payment. Must provide a payment object to submit'));
    return;
  }

  if (src_address !== payment.src_address) {
    callback(new Error('Invalid parameter: src_address. URL parameter address must match JSON parameter src_address'));
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
    src_address: tx.Account,
    src_tag: tx.SourceTag || '',
    src_amount: (tx.SendMax ?
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
    src_slippage: '0',

    dst_address: tx.Destination,
    dst_tag: tx.DestinationTag || '',
    dst_amount: (typeof tx.Amount === 'object' ? 
      tx.Amount : 
      {
        value: rpparser.dropsToXrp(tx.Amount),
        currency: 'XRP',
        issuer: ''
      }),
    dst_slippage: '0',

    // Advanced options
    invoice_id: tx.InvoiceID || '',
    paths: JSON.stringify(tx.Paths || []),
    flag_no_direct_ripple: (tx.Flags & 0x00010000 ? true : false),
    flag_partial_payment: (tx.Flags & 0x00020000 ? true : false),

    // Generated after validation
    tx_direction: (opts.address === tx.Account ? 
      'outgoing' : 
      (opts.address === tx.Destination ? 
        'incoming' : 
        'passthrough')),
    tx_state: (tx.meta.TransactionResult === 'tesSUCCESS' ? 'confirmed' : 'failed'),
    tx_result: tx.meta.TransactionResult || '',
    tx_ledger: tx.inLedger || tx.ledger_index || '',
    tx_hash: tx.hash || '',
    tx_timestamp: ripple.utils.toTimestamp(tx.date) || '',
    tx_timestamp_human: new Date(ripple.utils.toTimestamp(tx.date)).toUTCString() || '',
    tx_fee: rpparser.dropsToXrp(tx.Fee) || '',
    tx_src_bals_dec: [],
    tx_dst_bals_inc: []

  };

  // Add tx_src_bals_dec
  rpparser.parseBalanceChanges(tx, tx.Account).forEach(function(amount){
    if (amount.value < 0) {
      payment.tx_src_bals_dec.push(amount);
    }
  });

  // Add tx_dst_bals_inc
  rpparser.parseBalanceChanges(tx, tx.Destination).forEach(function(amount){
    if (amount.value > 0) {
      payment.tx_dst_bals_inc.push(amount);
    }
  });

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


  // Convert blank issuer to sender's address (Ripple convention for 'any issuer')
  if (payment.src_amount && payment.src_amount.currency !== 'XRP' && payment.src_amount.issuer === '') {
    payment.src_amount.issuer = payment.src_address;
  }
  if (payment.dst_amount && payment.dst_amount.currency !== 'XRP' && payment.dst_amount.issuer === '') {
    payment.dst_amount.issuer = payment.dst_address;
  }


  /* Construct payment */
  var tx = (opts.remote ? opts.remote.transaction() : ripple.Transaction());
  
  tx.payment({
    from: payment.src_address,
    to: payment.dst_address,
    amount: (payment.dst_amount.currency === 'XRP' ? 
      rpparser.xrpToDrops(payment.dst_amount.value) :
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
  if (payment.src_amount && 
    (payment.src_amount.currency !== 'XRP' || payment.dst_amount.currency !== 'XRP') &&
    !(bignum(payment.src_amount.value).equals(payment.dst_amount.value) &&
      payment.src_amount.currency === payment.dst_amount.currency &&
      payment.src_amount.issuer === payment.dst_amount.issuer)) {

    var max = payment.src_amount;
    if (payment.src_slippage && payment.src_slippage !== '0') {
      max.value = bignum(max.value).plus(payment.src_slippage).toString();
    }
    if (payment.src_amount.currency === 'XRP') {
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

  if (!payment) {
    throw(new Error('payment is undefined'));
  }

  // Ripple addresses
  if (!rpparser.isRippleAddress(payment.src_address)) {
    throw(new TypeError('Invalid parameter: src_address. Must be a valid Ripple address'));
  }
  if (!rpparser.isRippleAddress(payment.dst_address)) {
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
  if (!rpparser.isValidAmount(payment.dst_amount)) {
    throw(new TypeError('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }'));
  }
  if (payment.src_amount && !rpparser.isValidAmount(payment.src_amount)) {
    throw(new TypeError('Invalid parameter: src_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }'));
  }

  // Slippage
  if (payment.src_slippage && !validator.isFloat(payment.src_slippage)) {
    throw(new TypeError('Invalid parameter: src_slippage. Must be a string representation of a floating point number amount (not %)'));
  }
  // if (payment.dst_slippage && !validator.isFloat(payment.dst_slippage)) {
  //   throw(new TypeError('Invalid parameter: dst_slippage. Must be a string representation of a floating point number amount (not %)'));
  // }
  if (payment.dst_slippage && payment.dst_slippage !== '0') {
    throw(new Error('Feature not yet supported: dst_slippage'));
  }


  // Advanced options
  if (payment.invoice_id && !validator.isAlphanumeric(payment.invoice_id)) {
    throw(new TypeError('Invalid parameter: invoice_id. Must be alphanumeric string'));
  }
  if (typeof payment.paths === 'string') {
    try {
      var parsed = JSON.parse(payment.paths);
      if (typeof parsed !== 'object') {
        throw(new Error('Invalid JSON'));
      }
    } catch (e) {
      throw(new TypeError('Invalid parameter: paths. Must be a valid JSON string or object'));      
    }
  } else if (typeof payment.paths === 'object') {
    try {
      var parsed = JSON.parse(JSON.stringify(payment.paths));
      if (typeof parsed !== 'object') {
        throw(new Error('Invalid JSON'));
      }
    } catch (e) {
      throw(new TypeError('Invalid parameter: paths. Must be a valid JSON string or object'));      
    }
  }
  if (payment.hasOwnProperty('flag_partial_payment') && typeof payment.flag_partial_payment !== 'boolean') {
    throw(new TypeError('Invalid parameter: flag_partial_payment. Must be a boolean'));
  }
  if (payment.hasOwnProperty('flag_no_direct_ripple') && typeof payment.flag_no_direct_ripple !== 'boolean') {
    throw(new TypeError('Invalid parameter: flag_no_direct_ripple. Must be a boolean'));
  }
  
  return true;

}



module.exports.getPayment = getPayment;
module.exports.submitPayment = submitPayment;
module.exports.validateNewPayment = validateNewPayment;
module.exports.txToPayment = txToPayment;
module.exports.paymentToTx = paymentToTx;
