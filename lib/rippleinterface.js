var ripple = require('ripple-lib'),
  _ = require('underscore');

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
 *  getRippleTx gets a particular transaction involving a
 *  given account using the transaction's txHash
 *
 *  TODO: support other identifiers like address and seqNum
 *  TODO: replace looking through account_tx with simple txHash lookup or memoize result
 */
RippleInterface.prototype.getRippleTx = function (account, txHash, callback) {
  if (typeof account !== 'string' || !ripple.UInt160.is_valid(account) || typeof txHash !== 'string' || typeof callback !== 'function') {
    throw(new Error('must supply account address, txHash and callback'));
  }

  console.log('called getRippleTx for account: ' + account + ' txHash: ' + txHash);

  this.remote.request_account_tx({account: account, ledger_index_min: 32570}, function(err, res){
    if (err) {
      console.log(JSON.strinify(err));
      callback(err);
      return;
    }


    // Find matching txHash amongst account_tx results
    var txEntry = _.find(res.transactions, function(transaction) { return transaction.tx.hash === txHash; });

    if (txEntry) {

      var transaction = txEntry.tx;
      transaction.meta = txEntry.meta;
      callback(null, transaction);

    } else {

      callback(new Error('account ' + account + ' has no transaction with hash ' + txHash));

    }

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

  // Accept different field names
  txJson.from = txJson.from || txJson.src || txJson.source || txJson.Source || txJson.srcAddress || txJson.Account;
  txJson.to = txJson.to || txJson.dst || txJson.destination || txJson.Destination || txJson.dstAddress;
  txJson.amount = txJson.amount || txJson.Amount || txJson.amnt;


  this.remote.set_secret(txJson.from, secret);

  var transaction = this.remote.transaction(txJson);

  transaction.submit(callback);

};


module.exports = RippleInterface;
