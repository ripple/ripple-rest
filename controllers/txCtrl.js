var txLib = require('../lib/tx'),
  errorHandler = require('./errorHandler');

// TODO validate all options

function TxCtrl (remote) {
  
  return {

    getTx: function(req, res) {

      var address = req.param('address'),
        txHash = req.param('txHash');

      txLib(remote, txHash, function(err, tx){
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

    getNextNotification: function(req, res) {

      var address = req.param('address'),
        prevTxHash = req.param('prevTxHash');

      txLib.getNextNotification(remote, {
        address: address, 
        prevTxHash: prevTxHash
      }, function(err, nextNotification){
        if (err) {
          errorHandler(res, err);
          return;
        }

        res.send({
          success: true,
          notification: nextNotification
        });

      });
    },

    submitTx: function(req, res) {

      var srcAddress = req.param('address'),
        secret = req.body.secret,
        txJson = req.body.tx || req.body.txJson || req.body;

      // console.log('submitTx: ' + JSON.stringify(txJson));

      txLib.submitTx(remote, {
        srcAddress: srcAddress,
        secret: secret,
        txJson: txJson
      }, function(err, initialHash){
        if (err) {
          errorHandler(res, err);
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


module.exports = TxCtrl;
