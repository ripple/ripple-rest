var ripple = require('ripple-lib'),
  OutgoingTx = require('../models/outgoingTx');


module.exports.getTx = function(remote, txHash, callback) {

  ensureRemoteConnected(remote, function(err, connected){
    if (err) {
      callback(err);
      return;
    }

    remote.requestTx(txHash, function(err, tx){
      if (err) {
        callback(err);
        return;
      }

      callback(null, tx);
    });

  });

};

/*
 *  opts
 *    address: '...',
 *    prevTxHash: '...',
 */
module.exports.getNextNotification = function(remote, opts, callback) {
  // Validate options
  var address = opts.address,
    prevTxHash = opts.prevTxHash,
    limit = opts.limit || 10;

  ensureRemoteConnected(remote, function(err, connected){
    if (err) {
      callback(err);
      return;
    }

    getNextTx(remote, {
      address: address,
      prevTxHash: prevTxHash,
      limit: limit
    }, function(err, nextTx){
      if (err) {
        callback(err);
        return;
      }

      // Check if no nextTx
      if (!nextTx) {
        callback(null, null);
        return;
      }

      var notification = txToNotification(address, nextTx);

      // Attach submissionToken to outgoing transactions
      if (notification.direction !== 'outgoing') {

        callback(null, notification);
      
      } else {

        OutgoingTx
          .find({where: {txHash: notification.txHash}})
          .error(callback)
          .success(function(tx){
            if (tx) {

              notification.submissionToken = tx.initialHash;
              callback(null, notification);
              
            } else {
              
              OutgoingTx.find({where: {initialHash: notification.txHash}})
              .error(callback)
              .success(function(tx){
                if (!tx) {
                  notification.state = 'unexpected';
                  callback(null, notification);
                } else {
                  notification.submissionToken = tx.initialHash;
                  callback(null, notification);
                }
              });

            }
          });

      }

    });
  });
};

/*
 *  opts
 *    srcAddress: '...',
 *    secret: '...',
 *    txJson: {...}
 */
module.exports.submitTx = function(remote, opts, callback) {

  var srcAddress = opts.srcAddress, 
    secret = opts.secret,
    txJson = opts.txJson,
    initialHash;

  ensureRemoteConnected(remote, function(err, connected){
    if (err) {
      callback(err);
      return;
    }

    // Set secret
    try {
      remote.set_secret(srcAddress, secret);
    } catch (e) {
      callback(e);
      return;
    }

    // Create transaction
    var tx;
    try {
      tx = remote.transaction(opts.txJson);
    } catch (e) {
      callback(e);
      return;
    }
    

    tx.once('error', callback);

    // Once tx has been submitted to rippled, send the initial hash
    // back to the user and save the entry into the db
    tx.once('proposed', function(proposedTx) {

      initialHash = proposedTx.tx_json.hash;

      // console.log('proposed: ' + JSON.stringify(proposedTx));

      tx.removeListener('error', callback);

      // save to db
      OutgoingTx
        .create({
          initialHash: initialHash,
          submittedAtLedger: remote._ledger_current_index - 1,
          srcAddress: srcAddress,
          txType: txJson.type,
          txState: 'submitted' 
        })
        .error(callback)
        .success(function(entry){
          // console.log('saved entry to db: ' + JSON.stringify(entry));

          // Send initial hash back to user
          callback(null, initialHash);
        });

      });      

    // Once the tx has been confirmed in the ledger, update the db entry
    // to associate the initialHash with the final txHash
    tx.once('success', function(confirmedTx) {

      // console.log('success: ' + JSON.stringify(confirmedTx));

      // Update db entry with txHash and txResult
      OutgoingTx
        .update({
          // UPDATE
          txHash: confirmedTx.transaction.hash, 
          txResult: confirmedTx.meta.TransactionResult
        }, {
          // WHERE
          initialHash: initialHash
        })
        .error(callback)
        .success(function(){
          // console.log('update db entry for initialHash: ' + initialHash + ' with txHash: ' + confirmedTx.transaction.hash);
        });

    });

    tx.submit();

  });
    
};


/* HELPER FUNCTIONS */


function ensureRemoteConnected(remote, callback) {

  if (!remote || typeof remote !== 'object') {
    callback(new Error('invalidRemote'));
    return;
  }

  if (remote._connected === true) {
    callback(null, true);
  } else {
    remote.connect();
    remote.once('ledger_closed', function(){
      callback(null, true);
    });
  }

}

function getNextTx(remote, opts, callback) {
  // Validate options
  var address = opts.address,
    prevTxHash = opts.prevTxHash,
    limit = opts.limit || 10;


  // If no prevTxHash given get the most recent tx
  if (!prevTxHash) {
    remote.requestAccountTx({
        account: address,
        ledger_index_min: -1,
        ledger_index_max: -1,
        limit: limit,
        descending: true
      }, function(err, accountTx){
        if (err) {
          callback(err);
          return;
        }

        if (accountTx.transactions.length > 0) {
          callback(null, accountTx.transactions[0]);
        } else {
          callback(null, null);
        }        

      });
    return;
  }

  // Find what ledger that tx belongs to
  remote.requestTx(prevTxHash, function(err, prevTxLedger){
    if (err) {
      callback(err);
      return;
    }

    // Get the next couple of transactions for that account
    remote.requestAccountTx({
      account: address,
      ledger_index_min: prevTxLedger.ledger_index,
      limit: limit,
      descending: false
    }, function(err, accountTx){
      if (err) {
        callback(err);
        return;
      }

      // Find previous tx in result
      var nextTx;
      for (var t = 0; t < accountTx.transactions.length - 1; t++) {
        if (accountTx.transactions[t].tx.hash === prevTxHash) {
          nextTx = accountTx.transactions[t + 1];
          break;
        }
      }

      // Try getting more transactions in case that account
      // had submitted so many in a single ledger that prevTx we're
      // looking for was the 10th in that particular ledger
      if (!nextTx) {

        if (prevTxLedger.ledger_index + opts.limit < remote._ledger_current_index - 1) {
          
          setImmediate(function(){
            opts.limit = opts.limit * 2;
            getNextTx(remote, opts, callback);
          });

        } else {

          // No next tx
          callback(null, null);

        }
        return;
      }

      // Check that next tx points back to the previous one
      var prevTxIdMatches = false;
      for (var n = 0; n < nextTx.meta.AffectedNodes.length; n++) {
        var affNode = nextTx.meta.AffectedNodes[n],
          node = affNode.CreatedNode || affNode.ModifiedNode || affNode.DeletedNode;
        if (node.PreviousTxnID === prevTxHash) {
          prevTxIdMatches = true;
          break;
        }
      }

      // This is a very serious error
      if (!prevTxIdMatches) {
        callback(new Error('incomplete rippled history'));
        return;
      }

      callback(null, nextTx);

    });
  });
}

function txToNotification(notificationAddress, txEntry) {
  var tx = txEntry.tx || txEntry,
    meta = txEntry.meta;

  var notification = {
    address: tx.Account,
    type: tx.TransactionType.toLowerCase(),
    rippledResult: meta.TransactionResult,
    inLedger: tx.ledger_index,
    txHash: tx.hash,
    submissionToken: ''
  };

  // Determine direction
  if (notificationAddress === tx.Account) {
    notification.direction = 'outgoing';
  } else if (tx.TransactionType === 'Payment' && tx.Destination !== notificationAddress) {
    notification.direction = 'passthrough';
  } else {
    notification.direction = 'incoming';
  }

  // TODO Determine state
  notification.state = 'confirmed';

  return notification;
}