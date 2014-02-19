var paymentLib   = require('../lib/payment');
var pathfindLib  = require('../lib/pathfind');
var rpparser     = require('../lib/rpparser');
var errorHandler = require('./errorHandler');


module.exports = function (opts) {

  var remote = opts.remote,
    OutgoingTx = opts.OutgoingTx;


  return {

    getPayment: function(req, res) {

      var src_address = req.param('address'), 
       tx_hash = req.param('tx_hash');

      // Check if it mistakenly got here when 
      if (rpparser.isRippleAddress(tx_hash)) {
        errorHandler(res, new Error('Missing parameter: dst_amount. Must provide dst_amount to get payment options'));
        return;
      }

      if (!tx_hash || !rpparser.isTxHash(tx_hash)) {
        errorHandler(res, new Error('Invalid parameter: tx_hash. Must provide a valid transaction hash to get payment details'));
        return;
      }

      paymentLib.getPayment({
        remote: remote, 
        tx_hash: tx_hash
      }, function(err, payment){
        if (err) {
          errorHandler(res, err);
          return;
        }

        res.send({
          success: true,
          payment: payment
        });

      });
    },

    getPathFind: function(req, res) {

      var src_address = req.param('address'),
        dst_address = req.param('dst_address'),
        dst_amount_param = req.param('dst_amount'),
        dst_amount;

        console.log(dst_amount_param);

      if (!rpparser.isRippleAddress(src_address)) {
        errorHandler(res, new Error('Invalid parameter: address. Must be a valid Ripple address'));
        return;
      }

      if (!rpparser.isRippleAddress(dst_address)) {
        errorHandler(res, new Error('Invalid parameter: dst_address. Must be a valid Ripple address'));
        return;
      }

      if (!/\d+(.\d)?\+[a-zA-Z0-9]+(\+[a-zA-Z0-9]+)?/.test(dst_amount_param)) {
        errorHandler(res, new Error('Invalid parameter: dst_amount. Must be a string in the form \'1+USD+r...\''));
        return;
      }

      if (typeof dst_amount_param === 'string') {

        var dst_amount_array = dst_amount_param.split('+');

        if (dst_amount_array.length === 2 || dst_amount_array.length === 3) {
          dst_amount = {
            value: dst_amount_array[0],
            currency: dst_amount_array[1],
            issuer: (dst_amount_array.length === 3 ?
              dst_amount_array[2] :
              '')
          };          
        } else {
          errorHandler(res, new Error('Invalid parameter: dst_amount. Must be a string in the form \'1+USD+r...\''));
          return;
        }

      } else {
        errorHandler(res, new Error('Invalid parameter: dst_amount. Must be a string in the form \'1+USD+r...\''));
        return;
      }

      pathfindLib.getPathFind(remote, {
        src_address: src_address,
        dst_address: dst_address,
        dst_amount: dst_amount
      }, function(err, payments){
        if (err) {
          errorHandler(res, err);
          return;
        }

        res.send({
          success: true,
          payments: payments
        });

      });

    },

    submitPayment: function(req, res) {

      var src_address = req.param('address'),
        payment = req.body.payment || req.body.payment_json || req.body,
        secret = req.body.secret;     

      if (payment.secret) {
        delete payment.secret;
      }

      paymentLib.submitPayment({
        remote: remote,
        OutgoingTx: OutgoingTx,
        src_address: src_address,
        payment: payment,
        secret: secret
      }, function(err, initial_hash){
        if (err) {
          errorHandler(res, err);
          return;
        }

        res.send({
          success: true,
          confirmation_token: initial_hash
        });

      });
    }

  };

};
