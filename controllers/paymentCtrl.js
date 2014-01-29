var paymentLib = require('../lib/payment'),
  errorHandler = require('./errorHandler');

// TODO validate all options

module.exports = function (opts) {

  var remote = opts.remote,
    OutgoingTx = opts.OutgoingTx;


  return {

    getPayment: function(req, res) {

      var src_address = req.param('address'), 
       tx_hash = req.param('tx_hash');

      paymentLib.getPayment({
        remote: remote, 
        hash: tx_hash,
        address: src_address
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

    submitPayment: function(req, res) {

      var src_address = req.param('address'),
        payment_json = req.body.payment || req.body.payment_json || req.body,
        secret = req.body.secret;

      if (payment_json.secret) {
        delete payment_json.secret;
      }

      console.log('paymentCtrl.submitPayment got: ', src_address, payment_json);

      paymentLib.submitPayment({
        remote: remote,
        OutgoingTx: OutgoingTx,
        src_address: src_address,
        payment_json: payment_json,
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
