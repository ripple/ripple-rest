var check = require('./ripplevalidator').check,
  sanitize = require('./ripplevalidator').sanitize,
  ripple = require('ripple-lib');

// TODO 

/**
 *  SimplePayment is a flattened Ripple payment transaction
 *  that can be instantiated with the following fields
 *  or with a standard Ripple payment transaction in JSON form
 *  to convert it to the flattened format.
 *
 *  Required fields:
 */
function SimplePayment(fields) {

  /* User-supplied Values */

  /* Addresses */
  this.srcAddress = '';
  this.dstAddress = '';

  /* Source Amount */
  this.srcValue = '';
  this.srcCurrency = '';
  this.srcIssuer = '';
  this.srcSlippage = '';
  this.srcTxID = '';
  this.srcTag = '';

  /* Destination Amount */
  this.dstValue = '';
  this.dstCurrency = '';
  this.dstIssuer = '';
  this.dstSlippage = '';
  this.dstTxID = '';
  this.dstTag = '';

  /* Other Values */
  this.txPaths = '';
  this.srcBalances = '';

  /* End of User-supplied Values */


  /* Generated Values */
  this.txType = '';
  this.txStatus = '';
  this.txHash = '';
  this.txPrevHash = '';
  this.txFee = '';
  this.txSequence = '';

  /* Values Parsed from Ledger Entry */
  this.txValidated = '';
  this.txLedgerSeq = '';
  this.xLedgerHash = '';
  this.txTimestamp = '';
  this.txResult = '';
  this.srcSent = '';
  this.dstReceived = '';


  if (!fields) {
    throw(new Error('SimplePayment cannot be created without parameters'));
  }

  // check(fields.srcAddress).isRippleAddress();
  // this.srcAddress = fields.srcAddress;

  // check(fields.dstAddress).isRippleAddress();
  // this.dstAddress = fields.dstAddress;

  // if (fields.srcValue && fields.srcCurrency) {

  // }

  // if (fields.dstValue && fields.dstCurrency) {

  // }


}


SimplePayment.prototype.toRippleTx = function() {

};

SimplePayment.prototype.toJSON = function() {

};


module.exports = SimplePayment;
