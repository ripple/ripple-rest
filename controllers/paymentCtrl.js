var paymentLib   = require('../lib/payment');
var pathfindLib  = require('../lib/pathfind');
var rpparser     = require('../lib/rpparser');
var errorHandler = require('./errorHandler');


module.exports = function (opts) {

  var remote = opts.remote,
    OutgoingTx = opts.OutgoingTx;


  return {

    getPayment: function(req, res) {

      var source_address = req.param('address'), 
       hash = req.param('hash');

      // Check if it mistakenly got here when 
      if (rpparser.isRippleAddress(hash)) {
        errorHandler(res, new Error('Missing parameter: destination_amount. Must provide destination_amount to get payment options'));
        return;
      }

      if (!hash || !rpparser.isTxHash(hash)) {
        errorHandler(res, new Error('Invalid parameter: hash. Must provide a valid transaction hash to get payment details'));
        return;
      }

      paymentLib.getPayment({
        remote: remote, 
        hash: hash
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

      var source_address = req.param('address'),
        destination_address = req.param('destination_address'),
        destination_amount_param = req.param('destination_amount'),
        destination_amount;

      if (!rpparser.isRippleAddress(source_address)) {
        errorHandler(res, new Error('Invalid parameter: address. Must be a valid Ripple address'));
        return;
      }

      if (!rpparser.isRippleAddress(destination_address)) {
        errorHandler(res, new Error('Invalid parameter: destination_address. Must be a valid Ripple address'));
        return;
      }

      if (!/\d+(.\d)?\+[a-zA-Z0-9]+(\+[a-zA-Z0-9]+)?/.test(destination_amount_param)) {
        errorHandler(res, new Error('Invalid parameter: destination_amount. Must be a string in the form \'1+USD+r...\''));
        return;
      }

      if (typeof destination_amount_param === 'string') {

        var destination_amount_array = destination_amount_param.split('+');

        if (destination_amount_array.length === 2 || destination_amount_array.length === 3) {
          destination_amount = {
            value: destination_amount_array[0],
            currency: destination_amount_array[1],
            issuer: (destination_amount_array.length === 3 ?
              destination_amount_array[2] :
              '')
          };          
        } else {
          errorHandler(res, new Error('Invalid parameter: destination_amount. Must be a string in the form \'1+USD+r...\''));
          return;
        }

      } else {
        errorHandler(res, new Error('Invalid parameter: destination_amount. Must be a string in the form \'1+USD+r...\''));
        return;
      }

      pathfindLib.getPathFind(remote, {
        source_address: source_address,
        destination_address: destination_address,
        destination_amount: destination_amount
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

      var source_address = req.param('address'),
        payment = req.body.payment || req.body.payment_json || req.body,
        secret = req.body.secret;     

      if (payment.secret) {
        delete payment.secret;
      }

      paymentLib.submitPayment({
        remote: remote,
        OutgoingTx: OutgoingTx,
        source_address: source_address,
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
