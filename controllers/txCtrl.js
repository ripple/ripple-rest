var txLib = require('../lib/tx'),
  errorHandler = require('./errorHandler');

// TODO validate all options

function TxCtrl (remote) {
  
  return {

    getTx: function(req, res) {

      var address = req.param('address'),
        tx_hash = req.param('tx_hash');

      txLib.getTx(remote, tx_hash, function(err, tx){
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

    submitTx: function(req, res) {

      var src_address = req.param('address'),
        secret = req.body.secret,
        tx_json = req.body.tx || req.body.tx_json || req.body;

      // console.log('submitTx: ' + JSON.stringify(tx_json));

      txLib.submitTx(remote, {
        src_address: src_address,
        secret: secret,
        tx_json: tx_json
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
}


module.exports = TxCtrl;
