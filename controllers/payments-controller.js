var ErrorController = require('./error-controller');
var paymentslib     = require('../lib/payments-lib');

module.exports = function(opts){

  var remote = opts.remote,
    dbinterface = opts.dbinterface;

  return {

    getPayment: function(req, res) {

      var account  = req.params.account,
        identifier = req.params.identifier;

      paymentslib.getPayment(remote, dbinterface, {
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

    // getBulkPayments: function(req, res) {
    //   var account = req.params.account,
    //     exclue_failed_string = req.query.exclue_failed,
    //     exclude_incoming_string = req.query.exclude_incoming,
    //     exclude_outgoing_string = req.query.exclude_outgoing;
    // },

    getPathfind: function(req, res) {

      var source_account          = req.params.account,
        source_currencies_string  = req.param('source_currencies'),
        destination_account       = req.params.destination_account,
        destination_amount_string = req.params.destination_amount_string,
        destination_amount_array,
        destination_amount,
        source_currencies;

      if (typeof source_currencies_string === 'string' && source_currencies_string.length >= 3) {
        source_currencies = source_currencies_string.split(',');
      }

      if (typeof destination_amount_string !== 'string' || destination_amount_string.length === 0) {
        ErrorController.reportError(new Error('Invalid Parameter: destination_amount. Must supply a string in the form value+currency+issuer'), res);
        return;
      }

      destination_amount_array = destination_amount_string.split('+');
      destination_amount = {
        value: destination_amount_array[0],
        currency: destination_amount_array[1],
        issuer: (destination_amount_array.length >= 3 ? destination_amount_array[2] : '')
      };

      paymentslib.getPathfind(remote, {
        source_account: source_account,
        destination_account: destination_account,
        destination_amount: destination_amount,
        source_currencies: source_currencies
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