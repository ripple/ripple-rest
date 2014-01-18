var txLib = require('../lib/tx'),
  errorHandler = require('./errorHandler');

function TxCtrl (remote) {
  this.remote = remote;
}

// TODO validate all options

TxCtrl.prototype.getTx = function(req, res) {
  var address = req.param('address'),
    txHash = req.param('txHash');

  txLib(this.remote, txHash, function(err, tx){
    if (err) {
      errorHandler(res, err);
      return;
    }

    res.send({
      success: true,
      tx: tx
    });

  });
};

TxCtrl.prototype.getNextNotification = function(req, res) {
  var address = req.param('address'),
    prevTxHash = req.param('prevTxHash');

  txLib.getNextNotification(this.remote, {
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
};

TxCtrl.prototype.submitTx = function(req, res) {
  errorHandler(res, 'Sorry, this route is not implemented yet');
};

module.exports = TxCtrl;