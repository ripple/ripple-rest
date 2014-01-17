var ripple = require('ripple-lib'),
  OutboundTx = require('../models/outboundTx');

/**
 *  RippleInterface is a wrapper for ripple-lib that processes
 *  commands using the standard transaction format
 */
function RippleInterface (opts) {

  if (opts.remote) {

    this.remote = opts.remote;
    this.remote.connect();

  } else if (opts.servers) {

    if (opts.local_signing === null || opts.local_signing === undefined) {
      opts.local_signing = true;
    }

    this.remote = new ripple.Remote(opts);
    this.remote.connect();
    
  } else {
    throw(new Error('RippleInterface requires a connected remote or a list of servers');
  }
}


/**
 *  getRippleTx gets a particular transaction involving a
 *  given account using the transaction's txHash
 */
RippleInterface.prototype.getRippleTx = function (txHash, callback) {
  if (typeof account !== 'string' || !ripple.UInt160.is_valid(account) || typeof txHash !== 'string' || typeof callback !== 'function') {
    throw(new Error('must supply account address, txHash and callback'));
  }

  /*
  
  {
      Address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'
      notificationID: 'Opaque ID'   // returned on POST, getNextNotification

      Type: 'payment',        // enumeration
      Direction: 'outgoing',      // enumeration
      State: 'confirmed',     // enumeration
      Result: 'tesSuccess',     // rippled TransactionResult
      Ledger: '3637888',      // ledger index

      Hash: '61DE29B67CD4E2EAB171D4E5982B34511DB0E95C05A97F4',  // GET next_notification
      Resource: {See resource section for details},   // GET resource
      ResourceList: [             // GET resources
    {See resource for details},
    {See resource for details},
       ],
      Error: {See error object for details},      // on HTTP errors only
  }

  */

  this.remote.request_tx(txHash, callback);

};


/**
 *  submitRippleTx takes a JSON transaction, an account secret, and
 *  a callback then signs and submits the transaction using ripple-lib
 */
RippleInterface.prototype.submitRippleTx = function (txJson, secret, callback) {

  if (typeof txJson !== 'object' || typeof secret !== 'string' || typeof callback !== 'function') {
    throw(new Error('must supply txJson, account secret, and a callback'));
  }

  // TODO check that we are connected to ripple-lib

  // Accept different field names
  txJson.from = txJson.from || txJson.src || txJson.source || txJson.Source || txJson.srcAddress || txJson.Account;
  txJson.to = txJson.to || txJson.dst || txJson.destination || txJson.Destination || txJson.dstAddress;
  txJson.amount = txJson.amount || txJson.Amount || txJson.amnt;


  this.remote.set_secret(txJson.from, secret);

  var transaction = this.remote.transaction(txJson);

  // Send errors generated while signing back to user
  transaction.on('error', callback);

  // Get inital hash from ripple-lob signing and send it back to client
  transaction.once('signed', function(initialHash){
    transaction.removeListener('error', callback);

    callback(null, initialHash);

    // TODO save into db
  });


  // Submit transaction and save results to db
  transaction.submit(function(err, res){
    if (err) {

      // TODO update db

      return;
    }

    var initialHash = transaction.submittedIDs[transaction.submittedIDs.length - 1],
      finalHash = transaction.submittedIDs[0];

    // TODO update db with final results
  });

  



};


module.exports = RippleInterface;
