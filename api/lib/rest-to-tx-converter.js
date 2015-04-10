/* eslint-disable valid-jsdoc */
'use strict';
var _ = require('lodash');
var ripple = require('ripple-lib');
var bignum = require('bignumber.js');
var utils = require('./utils');

function RestToTxConverter() {}

/**
 *  Convert a payment in the ripple-rest format
 *  to a ripple-lib transaction.
 *
 *  @param {Payment} payment
 *  @param {Function} callback
 *
 *  @callback
 *  @param {Error} error
 *  @param {ripple-lib Transaction} transaction
 */
RestToTxConverter.prototype.convert = function(payment, callback) {
  try {
    // Convert blank issuer to sender's address
    //   (Ripple convention for 'any issuer')
    // https://ripple.com/build/transactions/
    //    #special-issuer-values-for-sendmax-and-amount
    // https://ripple.com/build/ripple-rest/#counterparties-in-payments
    if (payment.source_amount && payment.source_amount.currency !== 'XRP'
        && payment.source_amount.issuer === '') {
      payment.source_amount.issuer = payment.source_account;
    }

    // Convert blank issuer to destinations's address
    //   (Ripple convention for 'any issuer')
    // https://ripple.com/build/transactions/
    //    #special-issuer-values-for-sendmax-and-amount
    // https://ripple.com/build/ripple-rest/#counterparties-in-payments
    if (payment.destination_amount
        && payment.destination_amount.currency !== 'XRP'
        && payment.destination_amount.issuer === '') {
      payment.destination_amount.issuer = payment.destination_account;
    }
    // Uppercase currency codes
    if (payment.source_amount) {
      payment.source_amount.currency =
        payment.source_amount.currency.toUpperCase();
    }
    if (payment.destination_amount) {
      payment.destination_amount.currency =
        payment.destination_amount.currency.toUpperCase();
    }
    /* Construct payment */
    var transaction = new ripple.Transaction();
    var transactionData = {
      from: payment.source_account,
      to: payment.destination_account,
      amount: utils.txFromRestAmount(payment.destination_amount)
    };

    // invoice_id  Because transactionData is a object, transaction.payment
    //  function is ignored invoiceID
    if (payment.invoice_id) {
      transaction.invoiceID(payment.invoice_id);
    }
    transaction.payment(transactionData);
    // Tags
    if (payment.source_tag) {
      transaction.sourceTag(parseInt(payment.source_tag, 10));
    }
    if (payment.destination_tag) {
      transaction.destinationTag(parseInt(payment.destination_tag, 10));
    }

    function sendMaxRequired() {
      var src = payment.source_account;
      var dst = payment.destination_account;

      var srcAmt = payment.source_amount;
      var dstAmt = payment.destination_amount;

      if (!srcAmt || srcAmt.currency === 'XRP' && dstAmt.currency === 'XRP') {
        return false;
      }

      // Only set send max when:
      // - Source and destination currencies are same and source issuer is not source account
      // - Source amount and destination issuers are different
      //
      if (srcAmt.currency === dstAmt.currency) {
        if (srcAmt.issuer !== src) {
          return true;
        }
      } else if (srcAmt.issuer !== dstAmt.issuer) {
        return true;
      } else {
        return false;
      }
    }

    // SendMax
    if (sendMaxRequired()) {
      var max_value = bignum(payment.source_amount.value).plus(payment.source_slippage).toString();
      if (payment.source_amount.currency === 'XRP') {
        transaction.sendMax(utils.xrpToDrops(max_value));
      } else {
        transaction.sendMax({
          value: max_value,
          currency: payment.source_amount.currency,
          issuer: payment.source_amount.issuer
        });
      }
    }

    // Paths
    if (typeof payment.paths === 'string') {
      transaction.paths(JSON.parse(payment.paths));
    } else if (typeof payment.paths === 'object') {
      transaction.paths(payment.paths);
    }

    // Memos
    if (payment.memos && Array.isArray(payment.memos)) {
      for (var m = 0; m < payment.memos.length; m++) {
        var memo = payment.memos[m];
        transaction.addMemo(memo.MemoType, memo.MemoData);
      }
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
    callback(null, transaction);
  } catch (exception) {
    return callback(exception);
  }
};

/**
 *  Convert a numerical transfer rate in ripple-rest format to ripple-lib
 *
 *  Note: A fee of 1% requires 101% of the destination to be sent for the
 *        destination to receive 100%.
 *  The transfer rate is specified as the input amount as fraction of 1.
 *  To specify the default rate of 0%, a 100% input amount, specify 1.
 *  To specify a rate of 1%, a 101% input amount, specify 1.01
 *
 *  @param {Number|String} transferRate
 *
 *  @returns {Number|String} numbers will be converted while strings
 *                           are returned
 */
RestToTxConverter.prototype.convertTransferRate = function(transferRate) {
  if (_.isNumber(transferRate)) {
    return transferRate * Math.pow(10, 9);
  }

  return transferRate;
};

module.exports = new RestToTxConverter();
