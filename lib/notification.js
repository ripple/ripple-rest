var ripple        = require('ripple-lib');
var remoteConnect = require('./remoteConnect');
var txLib         = require('./tx');
var statusLib     = require('./status');
var _             = require('lodash');
var async         = require('async');
var rpparser      = require('./rpparser');


function getNextNotification(opts, callback) {
  var remote = opts.remote,
    OutgoingTx = opts.OutgoingTx,
    address = opts.address,
    prev_tx_hash = opts.prev_tx_hash,
    limit = opts.limit || 10;

  var steps = [

    // Ensure remote is connected
    function(async_callback) {
      remoteConnect.ensureConnected(remote, async_callback);
    },

    // Check required fields
    function(async_callback) {
      if (!rpparser.isRippleAddress(address)){
        async_callback(new Error('Invalid parameter: address. Must provide a valid Ripple address'));
        return;
      }

      if (prev_tx_hash && !rpparser.isTxHash(prev_tx_hash)) {
        async_callback(new Error('Invalid parameter: prev_tx_hash. Must provide a valid transaction hash'));
        return;
      }

      async_callback(null);
    },

    // Get next transaction for this address
    // If no prev_tx_hash is supplied, get the first tx for that account
    function(async_callback) {
      if (prev_tx_hash) {

        getNextTx(remote, {
          address: address,
          prev_tx_hash: prev_tx_hash,
          limit: limit
        }, async_callback);

      } else {

        getEarliestTx(remote, address, async_callback);

      }
    },

    // Convert next_tx to notification
    // Note that next_tx can be null, but txToNotification 
    // will turn that into an "empty" notification
    function(next_tx, async_callback) {
      var notification = txToNotification({
        address: address,
        tx: next_tx,
        prev_tx_hash: prev_tx_hash
      });

      async_callback(null, notification);
    },

    // Either attach the source_transaction_id to the notification from the db
    // Or query the db for transactions that failed off-network to create a notification from one of them
    function(notification, async_callback) {
      if (notification && notification.hash) {

        attachSourceTransactionIdToNotification(OutgoingTx, notification, async_callback);

      } else {

        getUnreportedFailedNotification(OutgoingTx, notification, async_callback);

      }
    }

  ];

  async.waterfall(steps, callback);

}


function getNextTx(remote, opts, callback) {

  var address = opts.address || opts.account,
    prev_tx_hash = opts.prev_tx_hash || opts.hash;

  var steps = [

    // Get the previous transaction to find what ledger it is in
    function(async_callback) {
      txLib.getTx({
        remote: remote,
        hash: prev_tx_hash
      }, async_callback);
    },

    // Check that that ledger is in the rippled's complete ledger set
    // (It may be in the database but we should return an error if there are
    // gaps in the rippled history, rather than reporting suspect data)
    function(prev_tx, async_callback) {
      statusLib.remoteHasLedger(remote, prev_tx.ledger_index, function(err, has_ledger) {
        if (err) {
          async_callback(err);
          return;
        }

        if (!has_ledger) {
          async_callback(new Error('Incomplete rippled history. The previous transaction belongs to a ledger that is not in the rippled\'s complete ledger set so it is impossible to deterministically find the next transaction on this account. Please ensure that your rippled is functioning properly and is connected to the Ripple network'));
          return;
        }

        async_callback(null, prev_tx);

      });
    },

    // Check how many transactions that account had in this particular ledger
    function(prev_tx, async_callback) {
      remote.requestAccountTx({
        account: address,
        ledger_index_min: prev_tx.ledger_index,
        ledger_index_max: prev_tx.ledger_index,
        binary: true,
        limit: 100000
      }, async_callback);
    },

    // Query rippled for one more transaction than were in this ledger
    // to ensure that the transaction following the prev_tx_hash is in this set
    function(account_tx, async_callback) {
      remote.requestAccountTx({
        account: address,
        ledger_index_min: account_tx.ledger_index_min,
        ledger_index_max: -1,
        limit: account_tx.transactions.length + 1,
        descending: false
      }, async_callback);
    },

    // Find the prev_tx_hash among the results to get the next transaction
    function(account_tx, async_callback) {

      var next_tx;
      if (account_tx && account_tx.transactions && account_tx.transactions.length >= 2) {
        
        var next_tx_index = 1 + _.findIndex(account_tx.transactions, function(tx_entry){
          return tx_entry.tx.hash === prev_tx_hash;
        });

        // Check that that transaction is validated
        if (account_tx.transactions[next_tx_index] && account_tx.transactions[next_tx_index].validated === true) {

          next_tx = account_tx.transactions[next_tx_index].tx;
          next_tx.meta = account_tx.transactions[next_tx_index].meta;

        }

      }

      async_callback(null, next_tx);
    }
  ];


  async.waterfall(steps, callback);
}


function getEarliestTx(remote, address, callback) {
  remote.requestAccountTx({
    account: address,
    limit: 1,
    descending: false,
    ledger_index_min: -1,
    ledger_index_max: -1
  }, function(err, account_tx){
    if (err) {
      callback(err);
      return;
    }

    var earliest_tx;
    if (account_tx && account_tx.transactions && account_tx.transactions.length > 0) {
      var earliest_tx = account_tx.transactions[0].tx;
      earliest_tx.meta = account_tx.transactions[0].meta;
    }

    callback(null, earliest_tx);
  });
}


function txToNotification(opts){
  var address = opts.address, 
    tx = opts.tx, 
    prev_tx_hash = opts.prev_tx_hash;

  var notification = {
    address: '',
    type: '',
    direction: '',
    state: '',
    result: '',
    ledger: '',
    hash: '',
    timestamp: '',
    timestamp_human: '',
    transaction_url: '',
    next_notification_url: '',
    source_transaction_id: ''
  };

  notification.address = address;

  if (tx) {

    if (tx.Account) {
      if (address === tx.Account) {
        notification.direction = 'outgoing';
      } else if (tx.TransactionType === 'Payment' && tx.Destination !== address) {
        notification.direction = 'passthrough';
      } else {
        notification.direction = 'incoming';
      }
    }

    if (tx.TransactionType) {
      notification.type = tx.TransactionType.toLowerCase();

      if (notification.type === 'offercreate' || notification.type === 'offercancel') {
        notification.type = 'order';
      }

      if (notification.type === 'trustset') {
        notification.type = 'trustline';
      }

      if (notification.type === 'accountset') {
        notification.type = 'address';
      }
    }

    if (tx.ledger_index) {
      notification.ledger = '' + tx.ledger_index;
    }

    if (tx.hash) {
      notification.hash = tx.hash;
      notification.next_notification_url = '/addresses/' + notification.address + '/next_notification/' + (notification.hash ? notification.hash : '')
    
      if (notification.type === 'payment') {
        notification.transaction_url = '/addresses/' + notification.address + '/payments/' + notification.hash;
      } else {
        notification.transaction_url = '/addresses/' + notification.address + '/txs/' + notification.hash;      
      }
    }

    if (tx.date) {
      notification.timestamp = '' + ripple.utils.toTimestamp(tx.date);
      notification.timestamp_human = new Date(ripple.utils.toTimestamp(tx.date)).toISOString();
    }

    if (tx.meta) {
      notification.result = tx.meta.TransactionResult;
      if (notification.result === 'tesSUCCESS') {
        notification.state = 'validated';
      } else {
        notification.state = 'failed';
      }
    }

  } else {

    notification.type = 'none';
    notification.state = 'empty';

    notification.next_notification_url = '/addresses/' + notification.address + '/next_notification/' + (prev_tx_hash ? prev_tx_hash : '');
  }

  return notification;
}


function attachSourceTransactionIdToNotification(OutgoingTx, notification, callback) {

  OutgoingTx.find({
    where: {
      source_address: notification.address,
      hash: notification.hash
    }
  }).complete(function(err, res){
    if (err) {
      console.log('Cannot get source_transaction_id from database: ' + err);
    }

    if (res && res.values) {
      notification.source_transaction_id = res.values.source_transaction_id;
    }

    callback(null, notification);

    // Mark db entry as reported
    OutgoingTx.update({
      reported: true
    }, {
      source_address: notification.address,
      hash: notification.hash
    }).complete(function(err, res){
      if (err) {
        console.log('Cannot update database to mark successful entry as reported: ' + err);
        return;
      }
    });
  });

}


function getUnreportedFailedNotification(OutgoingTx, notification, callback) {

  OutgoingTx.find({
    where: {
      source_address: notification.address,
      state: 'failed_offline',
      reported: false
    }
  }).complete(function(err, res){
    if (err) {
      callback(new Error('Cannot get failed notifications from database: ' + err));
      return;
    }

    if (!res || !res.values) {
      callback(null, null);
      return;
    }

    var failed_notification_entry = res.values;

    notification.type = failed_notification_entry.type;
    notification.direction = 'outgoing';
    notification.state = 'failed';
    notification.result = failed_notification_entry.engine_result + '. ' + failed_notification_entry.engine_result_message;
    notification.source_transaction_id = failed_notification_entry.source_transaction_id;

    callback(null, notification);

    // Mark db entry as reported
    OutgoingTx.update({
      reported: true
    }, {
      source_address: failed_notification_entry.source_address,
      source_transaction_id: failed_notification_entry.source_transaction_id,
      type: failed_notification_entry.type
    }).complete(function(err, res){
      if (err) {
        console.log('Cannot update database to mark failed entry as reported: ' + err);
        return;
      }
    });
  });

}


module.exports.getNextNotification = getNextNotification;
