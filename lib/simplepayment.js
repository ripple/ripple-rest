var check = require('../lib/ripplevalidator').check,
  sanitize = require('../lib/ripplevalidator').sanitize,
  ripple = require('ripple-lib');



function SimplePayment(opts) {

  /* Addresses */
  this.srcAddress: '';
  this.dstAddress: '';

  /* Source Amount */
  this.srcValue: '';
  this.srcCurrency: '';
  this.srcIssuer: '';
  this.srcSlippage: '';
  this.srcTxID: '';
  this.srcTag: '';

  /* Destination Amount */
  this.dstValue: '';
  this.dstCurrency: '';
  this.dstIssuer: '';
  this.dstSlippage: '';
  this.dstTxID: '';
  this.dstTag: '';

  /* Other Values */
  this.txPaths: '';
  this.srcBalances: ''

  this.valid = true;
  this.error = '';

  try {

    if (!opts) {
      throw(new Error('SimplePayment cannot be created without parameters'));
    }

    // check(opts.srcAddress).isRippleAddress();
    // this.srcAddress = opts.srcAddress;

    // check(opts.dstAddress).isRippleAddress();
    // this.dstAddress = opts.dstAddress;

    // if (opts.srcValue && opts.srcCurrency) {

    // }

    // if (opts.dstValue && opts.dstCurrency) {

    // }

  } catch (err) {
    this.valid = false;
    this.error = err;
  }

}

SimplePayment.prototype.isValid = function() {
  return this.valid;
};

SimplePayment.prototype.invalidAt = function() {
  return this.error;
};

SimplePayment.prototype.fromRippleTx = function(rippleTx) {

};

SimplePayment.prototype.toRippleTx = function() {

};


module.exports = SimplePayment;
