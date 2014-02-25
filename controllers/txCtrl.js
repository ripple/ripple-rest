var txLib = require('../lib/tx'),
  errorHandler = require('./errorHandler');

// TODO validate all options

module.exports = function (opts) {

  var remote = opts.remote,
    OutgoingTx = opts.OutgoingTx;
  
  return {

    getTx: function(req, res) {

      var address = req.param('address'),
        hash = req.param('hash');

      if (!hash || !rpparser.isTxHash(hash)) {
        errorHandler(res, new Error('Invalid parameter: hash. Must provide a valid transaction hash to get transaction details'));
        return;
      }

      txLib.getTx({
        remote: remote, 
        address: address,
        hash: hash
      }, function(err, tx){
        if (err) {
          errorHandler(res, err);
          return;
        }

        res.send({
          success: true,
          tx: tx
        });

      });
    },

    // submitTx: function(req, res) {

    //   var source_address = req.param('address'),
    //     secret = req.body.secret,
    //     json = req.body.tx || req.body.json || req.body;

    //   txLib.submitTx({
    //     remote: remote,
    //     OutgoingTx: OutgoingTx,
    //     source_address: source_address,
    //     secret: secret,
    //     json: json
    //   }, function(err, initial_hash){
    //     if (err) {
    //       errorHandler(res, err);
    //       return;
    //     }

    //     res.send({
    //       success: true,
    //       confirmation_token: initial_hash
    //     });

    //   });
    // }

  };
};
