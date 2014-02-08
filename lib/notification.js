var ripple = require('ripple-lib'),
  remoteConnect = require('./remoteConnect'),
  txLib = require('./tx'),
  _ = require('lodash');

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
    ledger_index = opts.ledger || opts.ledger_index,
    limit = opts.limit || 10;

  remoteConnect.ensureConnected(remote, function(err, connected){
    if (err) {
      callback(err);
      return;
    }

    getNextTx(remote, {
      address: address,
      prev_tx_hash: prev_tx_hash,
      ledger_index: ledger_index,
      limit: limit
    }, function(err, next_tx){
      if (err) {
        callback(err);
        return;
      }

      var notification = txToNotification({
          address: address, 
          tx: next_tx,
          prev_tx_hash: prev_tx_hash,
          prev_tx_ledger_index: ledger_index
        });

      // If there is no next_tx, check the db to determine what result to send back
      if (next_tx) {
        
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
      } else {

        if (OutgoingTx) {

          OutgoingTx.findAndCountAll({where: {src_address: address, tx_state: 'submitted'}})
            .error(callback)
            .success(function(res){

              // TODO figure out if these have gone through

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
    });
  });
};


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
        }, function(err, tx){
          if (!err && tx) {
            callback(null, tx);
            return;
          } else {
            callback(null, {
              hash: account_info.account_data.PreviousTxnID
            });
          }
        });

      } else {
        callback(new Error('Cannot get account_info for: ' + address));
        return;
      }
      
    });
  });
}


function getNextTx(remote, opts, callback) {

  var address = opts.address || opts.account,
    prev_tx_hash = opts.prev_tx_hash || opts.hash,
    ledger_index = opts.ledger || opts.in_ledger || opts.ledger_index,
    limit = opts.limit || 20,
    marker = opts.marker;

  // If no prev_tx_hash is given, look in the account root to find the last transaction
  if (!prev_tx_hash) {
    getLatestTx(remote, address, callback);
    return;
  }

  var params = {
    account: address,
    limit: limit,
    ledger_index_max: -1,
    ledger_index_min: -1
  };

  if (marker) {
    params.marker = marker;
  }

  if (ledger_index) {
    params.ledger_index_min = ledger_index;
  }

  remote.requestAccountTx(params, function(err, account_tx){
    if (err) {
      callback('Cannot get account transactions. Error: ' + err);
      return;
    }

    var transactions = account_tx.transactions;

    if (!transactions || transactions.length === 0) {

      callback(new Error('Cannot find previous transaction. This may be the result of an incomplete rippled historical database'));
      return;

    } else {

      // Find the previous transaction in the account_tx
      var prev_tx_index = _.findIndex(transactions, function(transaction){
        return transaction.tx.hash === prev_tx_hash;
      });

      if (prev_tx_index === -1) {

        // Cannot find prev_tx_hash in account_tx
        callback(new Error('Cannot find previous transaction. This may be the result of an incomplete rippled historical database'));
        return;

      } else if (prev_tx_index === 0){

        // No new transactions
        callback(null, null);

      } else {

        var next_tx_entry = transactions[prev_tx_index - 1],
          next_tx = next_tx_entry.tx;
        next_tx.meta = next_tx_entry.meta;

        callback(null, next_tx);

      }
    }
  });
}


function txToNotification(opts){ //address, tx_entry, prev_tx_hash) {
  var address = opts.address, 
    tx, 
    meta, 
    prev_tx_hash, 
    prev_tx_ledger_index;

  if (opts.tx_entry || opts.tx) {
    tx = (opts.tx_entry ? opts.tx_entry.tx : opts.tx_entry) || opts.tx;
    meta = (opts.tx_entry ? opts.tx_entry.meta : tx.meta);
  } else {
    prev_tx_hash = opts.prev_tx_hash;
    prev_tx_ledger_index = opts.prev_tx_ledger_index;
  }

  var notification = {
    address: address || '',
    type: (tx ? tx.TransactionType.toLowerCase() : ''),
    tx_direction: '',
    tx_state: '',
    tx_result: (meta ? meta.TransactionResult : ''),
    tx_ledger: (tx ? tx.ledger_index : ''),
    tx_hash: (tx ? tx.hash : ''),
    tx_timestamp: (tx ? ripple.utils.toTimestamp(tx.date) : ''),
    tx_url: '',
    next_notification_url: '',
    confirmation_token: ''
  };

  if (tx) {

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

    // Add URLs
    if (notification.tx_hash) {

      // Add resource URL
      if (notification.type === 'payment') {
        notification.tx_url = '/addresses/' + notification.address + '/payments/' + notification.tx_hash + '?in_ledger=' + notification.tx_ledger;
      } else {
        notification.tx_url = '/addresses/' + notification.address + '/txs/' + notification.tx_hash + '?in_ledger=' + notification.tx_ledger;      
      }

      // Add next_notification URL
      notification.next_notification_url = '/addresses/' + notification.address + '/next_notification/' + notification.tx_hash + '?ledger=' + notification.tx_ledger;

    }
  } else {
    notification.type = 'none';
    notification.tx_state = 'empty';

    // Add next_notification URL
    notification.next_notification_url = '/addresses/' + notification.address + '/next_notification/' + prev_tx_hash + '?ledger=' + prev_tx_ledger_index;
  }

  return notification;
}

