var ErrorController = require('./error-controller');
var transactionslib = require('../lib/transactions-lib');

module.exports = function(opts){

  var remote = opts.remote,
    dbinterface = opts.dbinterface;

  return {

    getTransaction: function(req, res) {

      var account = req.params.account,
        identifier = req.params.identifier;

      transactionslib.getTransaction(remote, dbinterface, {
        identifier: identifier,
        account: account
      }, function(err, tx){
        if (err) {
          ErrorController.reportError(err, res);
          return;
        }

        res.json({
          success: true,
          tx: tx
        });
      });
    }
  };
};