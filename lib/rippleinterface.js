var ripple = require('ripple-lib');

/**
 *  RippleInterface is a wrapper for ripple-lib that processes
 *  commands using the standard transaction format
 */
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


/**
 *  getRippleTx gets a particular transaction using its txHash
 *  TODO: support other identifiers like address and seqNum
 */
RippleInterface.prototype.getRippleTx = function (txHash, callback) {
  if (typeof txHash !== 'string' || typeof callback !== 'function') {
    throw(new Error('must supply txHash and callback'));
  }

  this.remote.request_transaction_entry(txHash, function(err, res){
    if (err) {
      callback(err);
      return;
    }

    callback(null, res);
  });
};


/**
 *  submitRippleTx takes a JSON transaction, an account secret, and
 *  a callback then signs and submits the transaction using ripple-lib
 */

RippleInterface.prototype.submitRippleTx = function (txJson, secret, callback) {

  if (typeof txJson !== 'object' || typeof secret !== 'string' || typeof callback !== 'function') {
    throw(new Error('must supply txJson, account secret, and a callback'));
  }

  var transaction = this.remote.transaction(txJson.TransactionType || txJson.txType || txJson.transaction_type, txJson);

  this.remote.set_secret(txJson.srcAddress || txJson.srcAccount || txJson.Account || txJson.account, secret);

  transaction.submit(callback);

};


module.exports = RippleInterface;
