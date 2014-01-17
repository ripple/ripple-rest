var ripple = require('ripple-lib'),
  async = require('async'),
  _ = require('underscore'),
  MonitoredAddress = require('../models/monitoredAddress'),
  Notification = require('../models/notification');

var txTypes = {
  accountset: 'address',
  trustset: 'trustline',
  offercreate: 'order',
  payment: 'payment'
};

function NotificationMonitor (opts) {

  console.log(JSON.stringify(opts));

  this.monitoring = false;

  if (opts.remote) {

    this.remote = opts.remote;

  } else if (opts.servers) {

    this.remote = new ripple.Remote(opts);
    
  } else {
    throw(new Error('NotificationMonitor requires a connected remote or a list of servers'));
  }


  if (opts.startLedger) {
    this.lastCheckedLedger = opts.startLedger - 1;
  }

  if (opts.interval) {
    this.intervalLength = opts.interval;
  } else {
    this.intervalLength = 20000;
  }



  /* Start monitoring as soon as remote is connected */
  if (this.remote.state === 'online') {

    if (!this.lastCheckedLedger) {
       this.lastCheckedLedger = this.remote._ledger_current_index - 2;
    }

    this.start();
  
  } else {

    var monitor = this;
    monitor.remote.connect();
    monitor.remote.once('connect', function(){
      if (!monitor.lastCheckedLedger) {
        monitor.lastCheckedLedger = monitor.remote._ledger_current_index - 2;
      }

      monitor.start();
    });
  }

}

NotificationMonitor.prototype.start = function() {

  var monitor = this;

  monitor.interval = setInterval(function(){

    monitor.lastCheckedLedger = getAllNotifications(monitor.remote, monitor.lastCheckedLedger);

  }, monitor.intervalLength);
    
};

NotificationMonitor.prototype.stop = function() {

  clearInterval(this.interval);

};

NotificationMonitor.prototype.monitorAddress = function(address, opts, callback) {

  if (!callback) {
    callback = function(err, res) {};
  }

  var dbEntry = {
    notificationAddress: address
  };

  if (opts.hasOwnProperty('monitorIncoming')) {
    dbEntry.monitorIncoming = opts.monitorIncoming;
  }

  if (opts.hasOwnProperty('monitorOutgoing')) {
    dbEntry.monitorOutgoing = opts.monitorOutgoing;
  }

  MonitoredAddress.findOrCreate(dbEntry).success(function(finalEntry, created){
    // If an entry was already there, just update fields
    if (!created) {
      finalEntry.updateAttributes(dbEntry).success(function(){
        callback(null, 'updated');
      }).error(function(err){
        callback(err);
      });;
    } else {
      callback(null, 'created');
    }
  }).error(function(err){
    callback(err);
  });

};

NotificationMonitor.prototype.forgetAddress = function(address, callback) {

  if (!callback) {
    callback = function(err, res) {};
  }

  MonitoredAddress.destroy({notificationAddress: address}).success(function(){
    callback(null, 'deleted');
  }).error(function(err){
    callback(err);
  });

};

NotificationMonitor.prototype.monitorTx = function(address, txHash, callback) {

  if (!callback) {
    callback = function(err, res) {};
  }

  MonitoredAddress.findOrCreate({
    notificationAddress: address, 
    singleTxHash: txHash, 
    monitorOutgoing: true, 
    monitorIncoming: false, 
  }).success(function(entry, created){
    if (created) {
      callback(null, 'created');
    } else {
      entry.updateAttributes({monitorOutgoing: true, monitorIncoming: false}).success(function(){
        callback(null, 'updated');
      }).error(function(err){
        callback(err);
      });
    }
  }).error(function(err){
    callback(err);
  });

};




function getAllNotifications(remote, lastCheckedLedger) {

  var startLedger = lastCheckedLedger + 1,
    endLedger = remote._ledger_current_index - 1;

  // console.log('startLedger: ' + startLedger + ' endLedger: ' + endLedger);

  if (startLedger >= endLedger) {
    return lastCheckedLedger;
  }

  MonitoredAddress.findAll().success(function(monitoredAddresses){

    // TODO Replace with async.each or eachLimit if this is returning too many notifications
    async.map(monitoredAddresses, function(monitoredAddress, asyncCallback) {
      var opts = monitoredAddress;
      opts.startLedger = startLedger;
      opts.endLedger = endLedger;

      getAccountNotifications(remote, opts, function(err, notifications){
        if (err) {
          asyncCallback(err);
          return;
        }

        asyncCallback(null, notifications);
      });

    }, function(err, results) {
      if (err) {
        console.log(err);
        return;
      }

      var dbEntries = _.flatten(results, true);

      if (dbEntries.length === 0) {
        return;
      }

      // TODO if there are too many notifications, call bulkCreate for each address
      Notification.bulkCreate(dbEntries).success(function(){
        if (dbEntries.length > 0) {
          console.log('added ' + dbEntries.length + ' notifications for ' + dbEntries[0].notificationAddress);
        }
      }).error(function(err){
        // Ignore errors if it tried to add a notification that already existed
        if (err.code !== '23505') {
          throw(err);
        }
      });

    });

  });

  return endLedger;
}


/*
  address: ...,
  monitorIncoming: ...,
  monitorOutgoing: ...,
  singleTxHash: ...,
  startLedger: ...,
  endLedger: ...
*/
function getAccountNotifications(remote, opts, callback) {

  var params = {
    account: opts.notificationAddress
  },
  notifications = [];

  if (opts.startLedger) {
    params.ledger_index_min = opts.startLedger;
  }

  if (opts.endLedger) {
    params.ledger_index_max = opts.endLedger;
  }

  if (opts.singleTxHash) {

    // Looking for specific transaction
    remote.requestTx(opts.singleTxHash, function(err, res){
      if (err) {
        callback(err);
        return;
      }

      if (JSON.stringify(res).indexOf(opts.notificationAddress) !== -1) {
        notifications.push(formatTxToNotification(opts.notificationAddress, res));
      }

      callback(null, notifications);

    });

  } else {

    // Looking for account_tx history
    remote.requestAccountTx(params, function(err, res){
      if (err) {
        callback(err);
        return;
      }

      // Find and format pertinent transactions
      res.transactions.forEach(function(txEntry){

        if (txEntry.tx.Account === opts.notificationAddress) {

          if (opts.monitorOutgoing && txEntry.validated === true) {
            notifications.push(formatTxToNotification(opts.notificationAddress, txEntry));
          }

        } else {

          if (opts.monitorIncoming && txEntry.validated === true) {
            notifications.push(formatTxToNotification(opts.notificationAddress, txEntry));
          }

        }

      });

      callback(null, notifications);

    });

  }

}

function formatTxToNotification(notificationAddress, txEntry) {

  var tx = txEntry.tx || txEntry,
    meta = txEntry.meta,
    notification = {
      txHash: tx.hash,
      txResult: meta.TransactionResult,
      inLedger: tx.inLedger,
      notificationAddress: notificationAddress,
      txState: 'confirmed',
    };

  notification.txType = txTypes[tx.TransactionType.toLowerCase()];

  if (notificationAddress === tx.Account) {
    notification.txDirection = 'outgoing';
  } else if (tx.TransactionType === 'Payment' && tx.Destination !== notificationAddress) {
    // Payment rippled through
    notification.txDirection = 'passthrough';
  } else {
    notification.txDirection = 'incoming';
  }

  return notification;

}

module.exports = NotificationMonitor;
