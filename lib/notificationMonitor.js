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
    this.lastCheckedLedger = startLedger - 1;
  } else {
    this.lastCheckedLedger = this.remote._ledger_current_index - 2;
  }

  if (opts.interval) {
    this.intervalLength = opts.interval;
  } else {
    this.intervalLength = 10000;
  }

  if (this.remote.state === 'online') {
    this.start();
  } else {
    var monitor = this;
    monitor.remote.connect(function(){
      monitor.start();
    });
    // monitor.remote.once('connect', monitor.start);
  }

}

NotificationMonitor.prototype.start = function() {

  var monitor = this;

  this.interval = setInterval(function(){

    var startLedger = monitor.lastCheckedLedger + 1,
      endLedger = monitor.remote._ledger_current_index - 1;
    monitor.lastCheckedLedger = endLedger;

    MonitoredAddress.findAll().success(function(monitoredAddresses){

      // TODO Replace with async.each or eachLimit if this is returning too many notifications
      async.map(monitoredAddresses, function(monitoredAddress, asyncCallback) {
        monitoredAddress.startLedger = startLedger;
        monitoredAddress.endLedger = endLedger;

        getAccountNotifications(monitor.remote, monitoredAddress, function(err, notifications){
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

        // TODO if there are too many notifications, call bulkCreate for each address
        Notification.bulkCreate(_.flatten(results, true));

      });

    });

  }, this.intervalLength);
    
};

NotificationMonitor.prototype.stop = function() {

  clearInterval(this.interval);

};

NotificationMonitor.prototype.monitorAddress = function(address, opts) {

};

NotificationMonitor.prototype.forgetAddress = function(address) {

};

NotificationMonitor.prototype.monitorTx = function(address, txHash) {

};





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
    account: opts.address
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

      if (JSON.stringify(res).indexOf(opts.address) !== -1) {
        notifications.push(formatTxToNotification(opts.address, res));
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

        if (txEntry.tx.Account === opts.address) {

          if (opts.monitorOutgoing && txEntry.validated === true) {
            notifications.push(formatTxToNotification(opts.address, txEntry));
          }

        } else {

          if (opts.monitorIncoming && txEntry.validated === true) {
            notifications.push(formatTxToNotification(opts.address, txEntry));
          }

        }

      });

      callback(null, notifications);

    });

  }

}

function formatTxToNotification(address, txEntry) {

  var tx = txEntry.tx || txEntry,
    meta = txEntry.meta,
    notification = {
      txHash: tx.hash,
      txResult: meta.TransactionResult,
      inLedger: tx.inLedger,
      notificationAddress: address,
      txState: 'confirmed',
    };

  notification.txType = txTypes[tx.TransactionType.toLowerCase()];

  if (address === tx.Account) {
    notification.txDirection = 'outgoing';
  } else if (tx.TransactionType === 'Payment' && tx.Destination !== address) {
    // Payment rippled through
    notification.txDirection = 'passthrough';
  } else {
    notification.txDirection = 'incoming';
  }

  return notification;

}

module.exports = NotificationMonitor;
