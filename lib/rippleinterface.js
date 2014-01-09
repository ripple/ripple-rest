var ripple = require('ripple-lib');

function RippleInterface (opts) {
  
  if (opts[0] && opts[0].host) {
    opts = {servers: opts};
  }

  if (opts.local_signing === null || opts.local_signing === undefined) {
    opts.local_signing = true;
  }

  this.remote = new ripple.Remote(opts);

  this.remote.connect();
}


RippleInterface.prototype.rippleGetTx = function (txHash, callback) {
  if (typeof txHash !== 'string' || typeof callback !== 'function') {
    throw(new Error('must supply txHash and a callback'));
  }

  this.remote.request_transaction_entry(txHash, function(err, res){
    if (err) {
      callback(err);
      return;
    }

    callback(null, res);
  });
};



RippleInterface.prototype.rippleSubmitTx = function (txDetails, callback) {
    
};


module.exports = RippleInterface;
