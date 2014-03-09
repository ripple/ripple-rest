var paymentformat                   = require('./formats/payment-format');

module.exports.paymentToTransaction = paymentformat.paymentToRippleLibTransaction;
module.exports.parsePaymentFromTx   = paymentformat.parsePaymentFromTx;
