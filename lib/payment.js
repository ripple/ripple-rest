var txLib = require('./tx'),
  ripple = require('ripple-lib'),
  BigInteger = require('../node_modules/ripple-lib/src/js/jsbn/jsbn');

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
 *
 * state: 'confirmed',
 * 
 */
module.exports.getPayment = function(remote, opts, callback) {

  var hash,
    address;

  if (typeof opts === 'object') {
    hash = opts.hash || opts.txHash || opts.paymentHash;
    address = opts.address || opts.srcAddress;
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
    txJson = paymentToTx(paymentJson, { remote: remote });
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

// // can use callback or it will return the result
// module.exports.txToPayment = function(tx, callback) {
//   var payment;
//   try {
//     payment = txToPayment(tx);
//   } catch (err) {
//     if (callback) {
//       callback(err);
//     } else {
//       throw(err);
//     }
//   }

//   if (callback) {
//     callback(null, payment);
//   } else {
//     return payment;
//   }
  
// };

// // can use callback or it will return the result
// module.exports.paymentToTx = function(payment, callback) {
//   var tx;
//   try {
//     tx = paymentToTx(payment);
//   } catch (err) {
//     if (callback) {
//       callback(err);
//     } else {
//       throw (err);
//     }
//   }

//   if (callback) {
//     callback(null, tx);
//   } else {
//     return tx;
//   }

// };


/*
 * address: '...'
 */
function txToPayment(tx, opts) {
  if (tx.TransactionType !== 'Payment') {
    throw(new Error('tx.TransactionType must be "Payment"'));
  }

  var payment = {
    srcAddress: tx.Account,
    dstAddress: tx.Desination,
    srcTag: tx.SourceTag || '',
    dstTag: tx.DestinationTag || '',
    srcSlippage: '0',
    dstSlippage: '0',
    paths: tx.paths || '',
    invoiceId: tx.InvoiceID || '',
    txSequenceNum: tx.Sequence,
    txFee: BigInteger(tx.Fee).divide(1000000).toString(),
    txHash: tx.hash || '',
    txLedger: tx.inLedger || tx.ledger_index,
    txResult: tx.meta.TransactionResult
  };

  // Reformat XRP
  if (typeof tx.Amount === 'string') {
    payment.dstAmount = {
      value: BigInteger(tx.Amount).divide(1000000).toString(), // parseInt(tx.Amount, 10) / 1000000.0,
      currency: 'XRP',
      issuer: ''
    }
  } else {
    payment.dstAmount = tx.Amount;
  }

  // State
  if (tx.meta.TransactionResult === 'tesSUCCESS') {
    payment.state = 'confirmed';
  } else {
    payment.state = 'failed';
  }

  // Direction
  if (opts.address) {
    if (opts.address === payment.srcAddress) {
      payment.txDirection = 'outgoing';
    } else if (opts.address === payment.dstAddress) {
      payment.txDirection = 'incoming';
    } else {
      payment.txDirection = 'passthrough';
    }
  }

  // TODO srcDebit, dstCredit

  return payment;
}


/*
 *  remote: { ripple-lib Remote }
 */
function paymentToTx(payment, opts) {
  var tx = {
    from: payment.srcAddress,
    to: payment.dstAddress,
    amount: payment.dstAmount
  };

  // srcSlippage


  // TODO support other fields

  return tx;
}
