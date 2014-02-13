var ripple = require('ripple-lib'),
  remoteConnect = require('./remoteConnect'),
  txLib = require('./tx'),
  statusLib = require('./status'),
  _ = require('lodash');

/*
 *  opts
 *    remote
 *    OutgoingTx // optional
 *    address: '...',
 *    prev_tx_hash: '...',
 */
module.exports.getNextNotification = function(opts, callback) {
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

      var notification = txToNotification({
          address: address, 
          tx: next_tx,
          prev_tx_hash: prev_tx_hash,
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



function getNextTx(remote, opts, callback) {

  var address = opts.address || opts.account,
    prev_tx_hash = opts.prev_tx_hash || opts.hash;

  // If no prev_tx_hash is given, look in the account root to find the last transaction
  if (!prev_tx_hash) {
    getLatestTx(remote, address, callback);
    return;
  }

  // Get the previous transaction to find what ledger it is in
  txLib.getTx({
    remote: remote,
    tx_hash: prev_tx_hash
  }, function(err, prev_tx){
    if (err) {
      callback(new Error('Cannot find previous transaction. This may be a result of being connected to a rippled with an incomplete historical database. Try calling querying for the next notification without providing a prev_tx_hash'));
      return;
    }

    // Check that that ledger is in the rippled's complete ledger set
    statusLib.remoteHasLedger(remote, prev_tx.ledger_index, function(err, isInSet){
      if (err) {
        callback(err);
        return;
      }

      if (!isInSet) {
        callback(new Error('Incomplete rippled history. The previous transaction belongs to a ledger that is not in the rippled\'s complete ledger set so it is impossible to deterministically find the next transaction on this account. Try calling querying for the next notification without providing a prev_tx_hash'));
        return;
      }

      // Check how many transactions that account had in that particular ledger
      remote.requestAccountTx({
        account: address,
        ledger_index_min: prev_tx.ledger_index,
        ledger_index_max: prev_tx.ledger_index,
      }, function(err, account_tx){
        if (err) {
          callback(err);
          return
        }

        var num_transactions = account_tx.transactions.length;

        // Get one more transaction to find the next one
        // (this is done to handle the case when the account has many transactions in a single ledger)
        remote.requestAccountTx({
          account: address,
          ledger_index_min: prev_tx.ledger_index,
          ledger_index_max: -1,
          limit: num_transactions + 1
        }, function(err, account_tx){
          if (err) {
            callback(err);
            return;
          }

          if (account_tx.transactions.length < 2) {
            callback(null, null);
            return;
          }

          var prev_tx_array_index = _.findIndex(account_tx.transactions, function(tx_entry){
            tx_entry.tx.hash === prev_tx_hash;
          });

          var next_tx_entry = account_tx.transactions[1 + prev_tx_array_index];

          var next_tx = next_tx_entry.tx;
          next_tx.meta = next_tx_entry.meta;

          callback(null, next_tx);
        });
      });
    });
  });
}

function getLatestTx (remote, address, callback) {

  remoteConnect.ensureConnected(remote, function(err, res){
    if (err) {
      callback(err);
      return;
    }

    remote.requestAccountTx({
      account: address,
      limit: 1,
      descending: true,
      ledger_index_min: -1,
      ledger_index_max: -1
    }, function(err, account_tx){
      if (err) {
        callback(new Error('Cannot get account transactions. This may result from having an incomplete rippled historical database or from the given address not existing in the Ripple ledger. Please ensure that this account is funded before querying for notifications on it.'));
        return;
      }

      if (account_tx && account_tx.transactions && account_tx.transactions.length > 0) {
        var next_tx_entry = account_tx.transactions[0];

        var next_tx = next_tx_entry.tx;
        next_tx.meta = next_tx_entry.meta;

        callback(null, next_tx);
      } else {
        callback(null, null);
      }

    });
  });
}


function txToNotification(opts){
  var address = opts.address, 
    tx, 
    meta, 
    prev_tx_hash;

  if (opts.tx_entry || opts.tx) {
    tx = (opts.tx_entry ? opts.tx_entry.tx : opts.tx_entry) || opts.tx;
    meta = (opts.tx_entry ? opts.tx_entry.meta : tx.meta);
  } else {
    prev_tx_hash = opts.prev_tx_hash;
  }

  var notification = {
    address: address || '',
    type: (tx && tx.TransactionType ? tx.TransactionType.toLowerCase() : ''),
    tx_direction: '',
    tx_state: '',
    tx_result: (meta ? meta.TransactionResult : ''),
    tx_ledger: (tx && tx.ledger_index ? tx.ledger_index : ''),
    tx_hash: (tx && tx.hash ? tx.hash : ''),
    tx_timestamp: (tx && tx.date ? ripple.utils.toTimestamp(tx.date) : ''),
    tx_url: '',
    next_notification_url: '',
    confirmation_token: ''
  };

  if (tx) {

    // Determine direction
    if (tx.Account) {
      if (address === tx.Account) {
        notification.tx_direction = 'outgoing';
      } else if (tx.TransactionType === 'Payment' && tx.Destination !== address) {
        notification.tx_direction = 'passthrough';
      } else {
        notification.tx_direction = 'incoming';
      }
    }

    // State
    if (meta) {
      if (meta.TransactionResult === 'tesSUCCESS') {
        notification.tx_state = 'confirmed';
      } else {
        notification.tx_state = 'failed';
      }
    }

    // Add URLs
    if (notification.tx_hash) {

      // Add next_notification URL
      notification.next_notification_url = '/addresses/' + notification.address + '/next_notification/' + (notification.tx_hash ? notification.tx_hash : '');

      if (notification.type) {
        // Add resource URL
        if (notification.type === 'payment') {
          notification.tx_url = '/addresses/' + notification.address + '/payments/' + notification.tx_hash;
        } else {
          notification.tx_url = '/addresses/' + notification.address + '/txs/' + notification.tx_hash;      
        }
      }
    }
  } else {
    notification.type = 'none';
    notification.tx_state = 'empty';

    // Add next_notification URL
    notification.next_notification_url = '/addresses/' + notification.address + '/next_notification/' + (prev_tx_hash ? prev_tx_hash : '');
  }

  return notification;
}

