var paymentLib = require('../lib/payment'),
  errorHandler = require('./errorHandler');

// TODO validate all options

module.exports = function (opts) {

  var remote = opts.remote,
    OutgoingTx = opts.OutgoingTx;


  return {

    getPayment: function(req, res) {

      var src_address = req.param('address'), 
       tx_hash = req.param('tx_hash'),
       ledger_index = req.query.ledger_index || req.query.ledger || req.query.in_ledger;

      paymentLib.getPayment({
        remote: remote, 
        tx_hash: tx_hash,
        address: src_address,
        ledger_index: ledger_index
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
