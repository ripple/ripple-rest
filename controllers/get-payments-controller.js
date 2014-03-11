var ErrorController = require('./error-controller');
var getpaymentslib = require('../lib/get-payments-lib');

module.exports = function(opts){

  var remote = opts.remote,
    dbinterface = opts.dbinterface;

  return {

    getPayment: function(req, res) {

      var account  = req.params.account,
        identifier = req.params.identifier;

      getpaymentslib.getPayment(remote, dbinterface, {
        account: account,
        identifier: identifier
      }, function(err, payment){
        if (err) {
          ErrorController.reportError(err, res);
          return;
        }

        res.json({
          success: true,
          payment: payment
        });
      });
    },

    getPathfind: function(req, res) {

      var source_account          = req.params.account,
        destination_account       = req.params.destination_account,
        destination_amount_string = req.params.destination_amount_string,
        destination_amount_array,
        destination_amount;

      if (typeof destination_amount_string !== 'string' || destination_amount_string.length === 0) {
        ErrorController.reportError(new Error(''), res);
      } 

      getpaymentslib.getPathfind(remote, {
        source_account: source_account,
        destination_account: destination_account,
      }, function(err, payments){
        if (err) {
          ErrorController.reportError(err, res);
          return;
        }

        res.json({
          success: true,
          payments: payments
        });

      });

    }
  };
};