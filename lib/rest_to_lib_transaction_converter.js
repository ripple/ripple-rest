var ripple = require('ripple-lib');
var bignum = require('bignumber.js');
var utils = require(__dirname+'/utils');

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

function RestToLibTransactionConverter() {};

RestToLibTransactionConverter.prototype = {

  convert: function(payment, callback) {
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
      // invoice_id  Because transaction_data is a object,  transaction.payment function is ignored invoiceID
      if (payment.invoice_id) {
        transaction.invoiceID(payment.invoice_id);
      }
      transaction.payment(transaction_data);
      // Tags
      if (payment.source_tag) {
        transaction.sourceTag(parseInt(payment.source_tag, 10));
      }
      if (payment.destination_tag) {
        transaction.destinationTag(parseInt(payment.destination_tag, 10));
      }
      // SendMax
      if (payment.source_amount) {
        // Only set send max if source and destination currencies are different
        if (!(payment.source_amount.currency === payment.destination_amount.currency && payment.source_amount.issuer === payment.source_amount.issuer)) {
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
    } catch (exception) {
      return callback(exception);
    }
    callback(null, transaction);
  }
}

module.exports = RestToLibTransactionConverter;

