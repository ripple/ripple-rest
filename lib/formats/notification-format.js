var ripple = require('ripple-lib');

function parseNotificationFromTx(tx, opts, callback){
  if (typeof opts === 'function') {
    callback = opts;
    opts = tx;
    tx = opts.tx;
  }

  var account = opts.account, 
    previous_tx_identifier = opts.previous_tx_identifier,
    client_resource_id = opts.client_resource_id,
    next_tx_identifier = opts.next_tx_identifier;

  var notification = {
    account: '',
    type: '',
    direction: '',
    state: '',
    result: '',
    ledger: '',
    hash: '',
    timestamp: '',
    transaction_url: '',
    previous_notification_url: '',
    next_notification_url: '',
    client_resource_id: ''
  };

  notification.account = account;

  if (tx.Account) {
    if (account === tx.Account) {
      notification.direction = 'outgoing';
    } else if (tx.TransactionType === 'Payment' && tx.Destination !== account) {
      notification.direction = 'passthrough';
    } else {
      notification.direction = 'incoming';
    }
  }

  if (tx.hash) {
    notification.hash = tx.hash;
  }

  if (client_resource_id) {
    notification.client_resource_id = client_resource_id;
  }

  if (tx.TransactionType) {
    notification.type = tx.TransactionType.toLowerCase();

    if (notification.type === 'payment') {
      notification.transaction_url = '/v1/accounts/' + notification.account + '/payments/' + (notification.hash || notification.client_resource_id);
    }

  //   if (notification.type === 'offercreate' || notification.type === 'offercancel') {
  //     notification.type = 'order';
  //   }

  //   if (notification.type === 'trustset') {
  //     notification.type = 'trustline';
  //   }

  //   if (notification.type === 'accountset') {
  //     notification.type = 'account';
  //   }
  }

  if (tx.ledger_index) {
    notification.ledger = '' + tx.ledger_index;
  }



  if (next_tx_identifier) {
    notification.next_notification_url = '/v1/accounts/' + notification.account + '/notifications/' + next_tx_identifier;
  }

  if (previous_tx_identifier) {
    notification.previous_notification_url = '/v1/accounts/' + notification.account + '/notifications/' + previous_tx_identifier;
  }

  // if (tx.hash) {
  //   notification.hash = tx.hash;
  //   notification.next_notification_url = '/accounts/' + notification.account + '/notifications/' + (notification.hash ? notification.hash : '');
  
  //   if (notification.type === 'payment') {
  //     notification.transaction_url = '/accounts/' + notification.account + '/payments/' + notification.hash;
  //   } else {
  //     notification.transaction_url = '/accounts/' + notification.account + '/txs/' + notification.hash;      
  //   }
  // }

  if (tx.date) {
    notification.timestamp = '' + new Date(ripple.utils.toTimestamp(tx.date)).toISOString();
  }

  if (tx.meta) {
    notification.result = tx.meta.TransactionResult;
  }

  if (tx.state) {
    notification.state = tx.state;
  } else {
    if (notification.result === 'tesSUCCESS') {
      notification.state = 'validated';
    } else {
      notification.state = 'failed';
    }
  }

  callback(null, notification);
}

module.exports.parseNotificationFromTx = parseNotificationFromTx;

