var rpparser = require('./rpparser'),
  validator = require('validator');

function validateParams(params) {

  if (!rpparser.isRippleAddress(params.src_address)) {
    throw(new TypeError('Invalid parameter: src_address. Must be a valid Ripple address'));
  }

  if (!rpparser.isRippleAddress(params.dst_address)) {
    throw(new TypeError('Invalid parameter: dst_address. Must be a valid Ripple address'));
  }

  if (!rpparser.isValidAmount(params.dst_amount)) {
    throw(new TypeError('Invalid parameter: dst_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }'));
  }

  return true;

}

function pathsetToPayments(pathset) {
  var payments = [];

  pathset.alternatives.forEach(function(alternative){

    payments.push({
      src_address: pathset.source_account,
      src_tag: '',
      src_amount: (typeof alternative.source_amount === 'string' ?
      {
        value: rpparser.dropsToXrp(alternative.source_amount),
        currency: 'XRP',
        issuer: ''
      } :
      {
        value: alternative.source_amount.value,
        currency: alternative.source_amount.currency,
        issuer: (alternative.source_amount.issuer === pathset.source_account ? 
          '' : 
          alternative.source_amount.issuer)
      }),
      src_slippage: '0',
      dst_address: pathset.destination_account,
      dst_tag: '',
      dst_amount: (typeof pathset.destination_amount === 'string' ?
        {
          value: rpparser.dropsToXrp(pathset.destination_amount),
          currency: 'XRP',
          issuer: ''
        } :
        {
          value: pathset.destination_amount.value,
          currency: pathset.destination_amount.currency,
          issuer: (pathset.destination_amount.issuer === pathset.destination_account ?
            '' :
            pathset.destination_amount.issuer)
        }),
      dst_slippage: '0',
      invoice_id: '',
      paths: alternative.paths_computed,
      flag_partial_payment: false,
      flag_no_direct_ripple: false
    });

  });

  return payments;
    
}

module.exports.validateParams = validateParams;
module.exports.pathsetToPayments = pathsetToPayments;
