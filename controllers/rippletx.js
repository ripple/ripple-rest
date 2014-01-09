/* RippleTxCtrl */

var RippleInterface = require('../lib/rippleinterface'),
  config = require('../config');

rinterface = new RippleInterface(config.remoteOptions);


exports.getTx = function (req, res) {

  var address = req.param('address'),
    txHash = req.param('txHash');


  // console.log('GET tx: ' + txHash + ' for address: ' + address);


  rinterface.getRippleTx(txHash, function(err, result){
    if (err) {
      res.send(500, { error: err });
      return;
    }

    res.send(200, result);
  });

};



exports.submitTx = function (req, res) {

  var address = req.param('address'),
    secret = req.param('secret'),
    tx = req.body;


  // console.log('address: ' + address, ' trying to submit tx: ' + JSON.stringify(tx));

  rinterface.submitRippleTx(tx, secret, function(err, result){
    if (err) {
      res.send(500, { error: err });
      return;
    }

    res.send(200, result);
  });

};
