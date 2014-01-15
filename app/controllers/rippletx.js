/* RippleTxCtrl */

var RippleInterface = require('../lib/rippleinterface'),
  config = require('../config');

rinterface = new RippleInterface(config.remoteOptions);


module.exports.getTx = function (req, res) {

  var address = req.param('address'),
    txHash = req.param('txHash');


  console.log('GET tx: ' + txHash + ' for address: ' + address);


  rinterface.getRippleTx(address, txHash, function(err, result){
    if (err) {
      console.log('err: ' + err.message);

      res.send(500, { err: err.message });
      return;
    }

    res.send(200, result);

  });

};



module.exports.submitTx = function (req, res) {

  var address = req.param('address'),
    secret = req.param('secret'),
    tx = req.body;


  console.log('POST address: ' + address, ' trying to submit tx: ' + JSON.stringify(tx));

  rinterface.submitRippleTx(tx, secret, function(err, result){
    if (err) {
      console.log('submitTx got err: ' + err);
      res.send(500, { error: err });
      return;
    }

    res.send(200, result);
  });

};
