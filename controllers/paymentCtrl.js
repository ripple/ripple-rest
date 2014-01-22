var paymentLib = require('../lib/payment'),
  errorHandler = require('./errorHandler');

// TODO validate all options

function PaymentCtrl (remote) {

  return {

    getPayment: function(req, res) {

      var srcAddress = req.param('address'), 
       txHash = req.param('txHash');

      paymentLib.getPayment(remote, txHash, function(err, payment){
        if (err) {
          errorHandler(err);
          return;
        }

        res.send({
          success: true,
          payment: payment
        });

      });
    },

    submitPayment: function(req, res) {

      var srcAddress = req.param('address'),
        paymentJson = req.body.payment || req.body.paymentJson || req.body,
        secret = req.body.secret;

      if (paymentJson.secret) {
        delete paymentJson.secret;
      }

      paymentLib.submitPayment(remote, {
        srcAddress: srcAddress,
        paymentJson: paymentJson,
        secret: secret
      }, function(err, initialHash){
        if (err) {
          errorHandler(err);
          return;
        }

        res.send({
          success: true,
          submissionToken: initialHash
        });

      });
    }

  };

}

module.exports = PaymentCtrl;
