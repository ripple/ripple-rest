var ripple = require('ripple-lib'), 
  rpparser = require('./rpparser'),
  validator = require('validator');

function getPathFind(remote, params, callback) {

  /* Validate Params */
  try {
    validateParams(params);
  } catch (err) {
    callback(err);
  }

  /* Parse Params */
  var pathfindParams = parseParams(params);

  /* Call pathFind */
  remote.requestRipplePathFind(pathfindParams, function(err, res){
    if (err) {
      callback(err);
      return;
    }

    // Add values that are in the res from requestPathFind but not requestRipplePathFind
    res.source_account = pathfindParams.src_account;
    res.destination_amount = pathfindParams.dst_amount;

    var payments = pathsetToPayments(res);

    if (payments.length === 0) {

      // Check if dst_amount.currency is accepted by the dst_address
      if (res.destination_currencies.indexOf(params.dst_amount.currency) === -1) {
        callback({
          error: 'No paths found.',
          message: 'The dst_address does not accept ' + params.dst_amount.currency + ', they only accept: ' + res.destination_currencies.join(', ')
        });
      } else {
        callback({
          error: 'No paths found.', 
          message: 'Please ensure that the src_address has sufficient funds to exectue the payment. If it does there may be insufficient liquidity in the network to execute this payment right now'
        });
      }

    } else {
      callback(null, payments);
    }

  });

}

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

function parseParams(params) {

  var pathfindParams = {
    src_account: params.src_address,
    dst_account: params.dst_address,
    dst_amount: (params.dst_amount.currency === 'XRP' ?
      rpparser.xrpToDrops(params.dst_amount.value) :
      params.dst_amount)
  };

  if (typeof pathfindParams.dst_amount === 'object' && pathfindParams.dst_amount.issuer === '') {
    pathfindParams.dst_amount.issuer = pathfindParams.dst_account;
  }

  return pathfindParams;

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

module.exports.getPathFind = getPathFind;
module.exports.validateParams = validateParams;
module.exports.parseParams = parseParams;
module.exports.pathsetToPayments = pathsetToPayments;
