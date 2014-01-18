var ripple = require('ripple-lib');


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

   console.log('now remote is: ' + remote);

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

      // TODO Attach submissionToken
      notification.submissionToken = 'TODO';

      callback(null, notification);

    });
  });
};

/*
 *  opts
 *    secret: '...',
 *    txJson: {...}
 */
module.exports.submitTx = function(remote, callback) {

  // TODO
  callback(new Error('not implemented yet'));

};




function ensureRemoteConnected(remote, callback) {

  console.log('remote is: ' + remote);

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
        console.log(JSON.stringify(node));
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
    txHash: tx.hash
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
  notification.state = 'TODO';

  return notification;
}