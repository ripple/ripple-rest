var ripple = require('ripple-lib'),
  remoteConnect = require('./remoteConnect'),
  txLib = require('./tx');

/*
 *  opts
 *    remote
 *    OutgoingTx // optional
 *    address: '...',
 *    prev_tx_hash: '...',
 */
module.exports.getNextNotification = function(opts, callback) {
  // TODO Validate options
  var remote = opts.remote,
    OutgoingTx = opts.OutgoingTx,
    address = opts.address,
    prev_tx_hash = opts.prev_tx_hash,
    limit = opts.limit || 10;

  remoteConnect.ensureConnected(remote, function(err, connected){
    if (err) {
      callback(err);
      return;
    }

    getNextTx(remote, {
      address: address,
      prev_tx_hash: prev_tx_hash,
      limit: limit
    }, function(err, next_tx){
      if (err) {
        callback(err);
        return;
      }

      var notification;

      // If there is no next_tx, check the db to determine what result to send back
      if (!next_tx) {

        notification = {
          address: address,
          type: 'none',
          tx_direction: '',
          tx_state: 'empty',
          tx_result: '',
          tx_ledger: '',
          tx_hash: '',
          tx_timestamp: '',
          confirmation_token: ''
        };

        if (OutgoingTx) {

          OutgoingTx.findAndCountAll({where: {src_address: address, tx_state: 'submitted'}})
            .error(callback)
            .success(function(res){

              if (res.count > 0) {
                notification.tx_state = 'pending';
              }

              callback(null, notification);
            });
          
        } else {
          callback(null, notification);
        }

        return;
      }

      notification = txToNotification(address, next_tx);

      // Attach confirmation_token to outgoing transactions
      if (notification.tx_direction !== 'outgoing' || !OutgoingTx) {

        callback(null, notification);
      
      } else {

        OutgoingTx.find({where: {tx_hash: notification.tx_hash}})
          .error(callback)
          .success(function(tx){
            if (tx) {

              notification.confirmation_token = tx.initial_hash;
              callback(null, notification);
              
            } else {
              
              OutgoingTx.find({where: {initial_hash: notification.tx_hash}})
                .error(callback)
                .success(function(tx){
                  if (!tx) {
                    notification.tx_state = 'unexpected';
                  } else {
                    notification.confirmation_token = tx.initial_hash;
                  }
                  callback(null, notification);
                });
            }
          });
      }

    });
  });
};


function getNextTx(remote, opts, callback) {
  // Validate options
  var address = opts.address,
    prev_tx_hash = opts.prev_tx_hash,
    limit = opts.limit || 10;


  // If no prev_tx_hash given get the most recent tx
  if (!prev_tx_hash) {
    getLatestTx(remote, address, callback);
    return;
  }

  // Find what ledger that tx belongs to
  remote.requestTx(prev_tx_hash, function(err, prev_tx_entry){
    if (err) {
      callback(err);
      return;
    }

    // Get the next couple of transactions for that account
    remote.requestAccountTx({
      account: address,
      ledger_index_min: prev_tx_entry.ledger_index,
      limit: limit,
      descending: false
    }, function(err, account_tx){
      if (err) {
        callback(err);
        return;
      }

      // Find previous tx in result
      var next_tx;
      for (var t = 0; t < account_tx.transactions.length - 1; t++) {
        if (account_tx.transactions[t].tx.hash === prev_tx_hash) {
          next_tx = account_tx.transactions[t + 1];
          break;
        }
      }

      // Try getting more transactions in case that account
      // had submitted so many in a single ledger that prevTx we're
      // looking for was the 10th in that particular ledger
      if (!next_tx) {

        if (prev_tx_entry.ledger_index + opts.limit < remote._ledger_current_index - 1) {
          
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

      // // Check that next tx points back to the previous one
      // var prev_tx_id_matches = false;
      // for (var n = 0; n < next_tx.meta.AffectedNodes.length; n++) {
      //   var aff_node = next_tx.meta.AffectedNodes[n],
      //     node = aff_node.CreatedNode || aff_node.ModifiedNode || aff_node.DeletedNode;
      //   if (node.PreviousTxnID === prev_tx_hash) {
      //     prev_tx_id_matches = true;
      //     break;
      //   }
      // }

      // // This is a very serious error
      // if (!prev_tx_id_matches) {
      //   callback(new Error('incomplete rippled history'));
      //   return;
      // }

      callback(null, next_tx);

    });
  });
}

function getLatestTx (remote, address, callback) {

  remoteConnect.ensureConnected(remote, function(err, res){
    if (err) {
      callback(err);
      return;
    }

    // Get account_info to find PreviousTxnID
    remote.requestAccountInfo(address, function(err, account_info){
      if (err) {
        callback(err);
        return;
      }

      if (account_info && account_info.account_data && account_info.account_data.PreviousTxnID) {

        txLib.getTx({
          remote: remote,
          tx_hash: account_info.account_data.PreviousTxnID,
          ledger_index: account_info.account_data.PreviousTxnLgrSeq
        }, callback);

      } else {
        callback(new Error('Cannot get account_info for: ' + address));
        return;
      }
      
    });
  });
}

function txToNotification(address, tx_entry) {
  var tx = tx_entry.tx || tx_entry,
    meta = tx_entry.meta;

  var notification = {
    address: tx.Account,
    type: tx.TransactionType.toLowerCase(),
    tx_direction: '',
    tx_state: '',
    tx_result: meta.TransactionResult,
    tx_ledger: tx.ledger_index,
    tx_hash: tx.hash,
    tx_timestamp: ripple.utils.toTimestamp(tx.date),
    tx_url: '',
    confirmation_token: ''
  };

  // Determine direction
  if (address === tx.Account) {
    notification.tx_direction = 'outgoing';
  } else if (tx.TransactionType === 'Payment' && tx.Destination !== address) {
    notification.tx_direction = 'passthrough';
  } else {
    notification.tx_direction = 'incoming';
  }

  // State
  if (meta.TransactionResult === 'tesSUCCESS') {
    notification.tx_state = 'confirmed';
  } else {
    notification.tx_state = 'failed';
  }

  // Add URL
  if (notification.tx_hash) {
    if (notification.type === 'payment') {
      notification.tx_url = '/addresses/' + notification.address + '/payments/' + notification.tx_hash + '?in_ledger=' + notification.tx_ledger;
    } else {
      notification.tx_url = '/addresses/' + notification.address + '/txs/' + notification.tx_hash + '?in_ledger=' + notification.tx_ledger;      
    }
  }

  return notification;
}

