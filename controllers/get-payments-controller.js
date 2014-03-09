var ErrorController = require('./error-controller');
var getpaymentslib = require('../lib/get-payments-lib');

module.exports = function(opts){

  var remote = opts.remote,
    dbinterface = opts.dbinterface;

  return {

    getPayment: function(req, res) {

      var account = req.params.account,
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
    }
  };
};