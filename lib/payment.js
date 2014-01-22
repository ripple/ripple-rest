var txLib = require('./tx');

/**
 * Simplified Payment Fields
 *
 * srcAddress: '...',
 * srcAmount: {value: '...', currency: '...', issuer: '...'}, // NOT YET SUPPORTED
 * srcSlippage: '0.50', // NOT YET SUPPORTED
 * srcTag: '...', // NOT YET SUPPORTED
 *
 * dstAddress: '...',
 * dstAmount: {value: '...', currency: '...', issuer: '...'},
 * dstSlippage: '0.50', // NOT YET SUPPORTED
 * dstTag: '...', // NOT YET SUPPORTED
 * dstTxId: '...' // NOT YET SUPPORTED
 */
module.exports.getPayment = function(remote, hash, callback) {

  txLib.getTx(remote, hash, function(err, tx){
    if (err) {
      callback(err);
      return;
    }

    if (tx && tx.TransactionType && tx.TransactionType === 'Payment') {
      var payment = txToPayment(tx);
      callback(null, payment);
    } else {
      callback(null, null);
    }

  });
};


/**
 *  srcAddress: '...',
 *  payment: { Simplified Payment Object },
 *  secret: '...'
 */
module.exports.submitPayment = function(remote, opts, callback) {

  var secret = opts.secret,
    paymentJson = opts.payment || opts.json || opts.paymentJson || opts,
    srcAddress = opts.srcAddress || paymentJson.srcAddress,
    txJson;

  try {
    txJson = paymentToTx(paymentJson);
    txJson.type = 'payment';
  } catch (err) {
    callback(err);
    return;
  }

  txLib.submitTx(remote, {
    srcAddress: srcAddress,
    txJson: txJson,
    secret: secret
  }, function(err, initialHash){
    if (err) {
      callback(err);
      return;
    }

    callback(null, initialHash);
  });

};

// can use callback or it will return the result
module.exports.txToPayment = function(tx, callback) {
  var payment;
  try {
    payment = txToPayment(tx);
  } catch (err) {
    if (callback) {
      callback(err);
    } else {
      throw(err);
    }
  }

  if (callback) {
    callback(null, payment);
  } else {
    return payment;
  }
  
};

// can use callback or it will return the result
module.exports.paymentToTx = function(payment, callback) {
  var tx;
  try {
    tx = paymentToTx(payment);
  } catch (err) {
    if (callback) {
      callback(err);
    } else {
      throw (err);
    }
  }

  if (callback) {
    callback(null, tx);
  } else {
    return tx;
  }

};


// TODO require address to determine direction
function txToPayment(tx) {
  if (tx.TransactionType !== 'Payment') {
    throw(new Error('tx.TransactionType must be "Payment"'));
  }

  var payment = {
    srcAddress: tx.Account,
    dstAddress: tx.Desination,
  };

  // Reformat XRP
  if (typeof tx.Amount === 'string') {
    payment.dstAmount = {
      value: parseInt(tx.Amount, 10) / 1000000.0,
      currency: 'XRP',
      issuer: ''
    }
  } else {
    payment.dstAmount = tx.Amount;
  }

  return payment;
}

function paymentToTx(payment) {
  var tx = {
    from: payment.srcAddress,
    to: payment.dstAddress,
    amount: payment.dstAmount
  };

  // TODO support other fields

  return tx;
}