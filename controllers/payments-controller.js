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

    getBulkPayments: function(req, res) {
      var account = req.params.account,
        source_account = req.query.source_account,
        destination_account = req.query.destination_account,
        exclude_failed = (req.query.exclude_failed === 'true'),
        start_ledger = req.query.start_ledger,
        end_ledger = req.query.end_ledger,
        earliest_first = (req.query.earliest_first === 'true'),
        results_per_page = req.query.results_per_page,
        page = req.query.page;

      paymentslib.getBulkPayments(remote, dbinterface, {
        account: account,
        source_account: source_account,
        destination_account: destination_account,
        exclude_failed: exclude_failed,
        start_ledger: start_ledger,
        end_ledger: end_ledger,
        earliest_first: earliest_first,
        results_per_page: results_per_page,
        page: page
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
    },

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