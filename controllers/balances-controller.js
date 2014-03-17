var ErrorController = require('./error-controller');
var balancesLib = require('../lib/balances-lib');

module.exports = function(opts) {
  var remote = opts.remote;

  function getBalances(req, res) {
    var params = req.params;
    params.issuer = req.query.issuer;
    params.currency = req.query.currency;

    balancesLib.getBalances(remote, params, function(err, balances) {
      if (err) {
        ErrorController.reportError(err, res);
      } else {
        res.json({ success: true, balances: balances });
      }
    });
  };

  return {
    getBalances: getBalances
  }
};
