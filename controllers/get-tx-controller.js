var ErrorController = require('./error-controller');
var txlib           = require('../lib/tx-lib');

module.exports = function(opts){

  var remote = opts.remote,
    dbinterface = opts.dbinterface;

  return {

    getTx: function(req, res) {

      var account = req.params.account,
        hash = req.params.hash;

      txlib.getTx(remote, hash, {
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