var async         = require('async');
var ripple        = require('ripple-lib'); 
var rpparser      = require('./rpparser');
var validator     = require('validator');
var remoteConnect = require('./remoteConnect');
var bignum        = require('bignumber.js');
var equal         = require('deep-equal');


function getPathFind(remote, params, callback) {

  var steps = [

    function(async_callback) {
      remoteConnect.ensureConnected(remote, async_callback);
    },

    function(connected, async_callback) {
      parseParams(params, async_callback);
    },

    function(pathfind_params, async_callback) {
      remote.requestRipplePathFind(pathfind_params, function(err, pathfind_res){
        if (err) {
          async_callback(err);
          return;
        }

        // Add values that are in the res from requestPathFind but not requestRipplePathFind
        pathfind_res.source_account = pathfind_params.source_account;
        pathfind_res.destination_amount = pathfind_params.destination_amount;

        async_callback(null, pathfind_res);
      });
    },

    function(pathfind_res, async_callback) {
      if (typeof pathfind_res.destination_amount === 'string') {
        addDirectXrpPath(remote, pathfind_res, async_callback);
      } else {
        async_callback(null, pathfind_res);
      }
    },

    function(pathfind_res, async_callback) {
      var payments = pathsetToPayments(pathfind_res);

      if (payments.length === 0) {

        // Check if destination_amount.currency is accepted by the destination_address
        if (pathfind_res.destination_currencies.indexOf(params.destination_amount.currency) === -1) {
          async_callback({
            error: 'No paths found',
            message: 'The destination_address does not accept ' + params.destination_amount.currency + ', they only accept: ' + pathfind_res.destination_currencies.join(', ')
          });
        } else {
          async_callback({
            error: 'No paths found', 
            message: 'Please ensure that the source_address has sufficient funds to exectue the payment. If it does there may be insufficient liquidity in the network to execute this payment right now'
          });
        }

      } else {
        async_callback(null, payments);
      }
    }

  ];

  async.waterfall(steps, callback);
}



function parseParams(params, callback) {

  if (!rpparser.isRippleAddress(params.source_address)) {
    callback(new TypeError('Invalid parameter: source_address. Must be a valid Ripple address'));
    return;
  }

  if (!rpparser.isRippleAddress(params.destination_address)) {
    callback(new TypeError('Invalid parameter: destination_address. Must be a valid Ripple address'));
    return;
  }

  if (!rpparser.isValidAmount(params.destination_amount)) {
    callback(new TypeError('Invalid parameter: destination_amount. Must be an object of the form { value: \'1\', currency: \'XRP\', issuer: \' }'));
    return;
  }

  var pathfindParams = {
    source_account: params.source_address,
    destination_account: params.destination_address,
    destination_amount: (params.destination_amount.currency === 'XRP' ?
      rpparser.xrpToDrops(params.destination_amount.value) :
      params.destination_amount)
  };

  if (typeof pathfindParams.destination_amount === 'object' && !pathfindParams.destination_amount.issuer) {
    pathfindParams.destination_amount.issuer = pathfindParams.destination_account;
  }

  callback(null, pathfindParams);

}

/**
 *  Since ripple_path_find does not return XRP to XRP paths,
 *  add the direct XRP "path", if applicable
 */
function addDirectXrpPath(remote, pathfind_res, callback) {

  // Check if destination_address accepts XRP
  if (pathfind_res.destination_currencies.indexOf('XRP') === -1) {
    callback(null, pathfind_res);
    return;
  }

  // Check source_address balance
  remote.requestAccountInfo(pathfind_res.source_account, function(err, res){
    if (err) {
      callback(new Error('Cannot get account info for source_address. ' + err));
      return;
    }

    if (!res || !res.account_data || !res.account_data.Balance) {
      callback(new Error('Internal Error. Malformed account info : ' + JSON.stringify(res)));
      return;
    }

    // Add XRP "path" only if the source_address has enough money to execute the payment
    if (bignum(res.account_data.Balance).greaterThan(pathfind_res.destination_amount)) {
      pathfind_res.alternatives.unshift({
        paths_canonical: [],
        paths_computed: [],
        source_amount: pathfind_res.destination_amount
      });
    }

    callback(null, pathfind_res);

  });
   
}


/**
 *  Since ripple_path_find does not return XRP to XRP paths,
 *  add the direct IOU "path", if applicable
 */
// function addDirectIouPath(remote, pathfind_res, callback) {

//   // Check that destination accepts currency
//   if (pathfind_res.destination_currencies.indexOf(pathfind_res.destination_amount.currency) === -1) {
//     callback(null, pathfind_res);
//     return;
//   }

//   // Check if there is a trustline between the sender and receiver for the destination currency
//   var account_request = remote.requestAccountLines({
//     account: pathfind_res.source_account, 
//     peer: pathfind_res.destination_account,
//     ledger: 'validated'
//   }, function(err, res){
//     if (err) {
//       callback(new Error('Cannot get account lines. ' + err));
//       return;
//     }

//     // Find account line that matches destination currency
//     var currency_line;
//     res.lines.forEach(function(account_line){
//       if (account_line.currency === pathfind_res.destination_amount.currency) {
//         currency_line = account_line;
//       }
//     });

//     // If there is a direct trustline with enough room, add direct IOU path
//     if (currency_line) {

//       var max_send_amount = bignum(currency_line.limit_peer).plus(currency_line.balance);

//       if (max_send_amount.greaterThanOrEqualTo(pathfind_res.destination_amount.value)) {
//         pathfind_res.alternatives.unshift({
//           paths_canonical: [],
//           paths_computed: [],
//           source_amount: pathfind_res.destination_amount
//         });
//       }

//     }

//     callback(null, pathfind_res);
//   });
// }



function pathsetToPayments(pathset) {
  var payments = [];

  pathset.alternatives.forEach(function(alternative){

    var payment = {
      source_address: pathset.source_account,
      source_tag: '',
      source_transaction_id: '',
      source_amount: (typeof alternative.source_amount === 'string' ?
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
      source_slippage: '0',
      destination_address: pathset.destination_account,
      destination_tag: '',
      destination_amount: (typeof pathset.destination_amount === 'string' ?
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
      destination_slippage: '0',
      invoice_id: '',
      paths: JSON.stringify(alternative.paths_computed),
      partial_payment: false,
      no_direct_ripple: false
    };

    // Set slippage if source_amount is the same as destination_amount
    if (equal(payment.source_amount, payment.destination_amount)) {
      payment.source_slippage = bignum(payment.source_amount.value).times(0.01).toString();
    }

    payments.push(payment);

  });

  return payments;
    
}

module.exports.getPathFind = getPathFind;
module.exports.parseParams = parseParams;
module.exports.pathsetToPayments = pathsetToPayments;
