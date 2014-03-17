var ripple = require('ripple-lib');

function parseNotificationFromTransaction(notification_details, opts, callback){
  if (typeof opts === 'function') {
    callback = opts;
    opts = transaction;
  }

  var transaction = notification_details.transaction || notification_details, 
    account = notification_details.account, 
    previous_transaction_identifier = notification_details.previous_transaction_identifier,
    next_transaction_identifier = notification_details.next_transaction_identifier,
    client_resource_id = notification_details.client_resource_id || opts.client_resource_id,
    types = opts.types;

  if (!transaction) {
    callback(null, null);
    return;
  }

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

  if (transaction.Account) {
    if (account === transaction.Account) {
      notification.direction = 'outgoing';
    } else if (transaction.TransactionType === 'Payment' && transaction.Destination !== account) {
      notification.direction = 'passthrough';
    } else {
      notification.direction = 'incoming';
    }
  }

  if (transaction.hash) {
    notification.hash = transaction.hash;
  }

  if (client_resource_id) {
    notification.client_resource_id = client_resource_id;
  }

  if (transaction.TransactionType) {
    notification.type = transaction.TransactionType.toLowerCase();

    if (notification.type === 'payment') {
      notification.transaction_url = '/v1/accounts/' + notification.account + '/payments/' + (transaction.from_local_db ? notification.client_resource_id : notification.hash);
    } else {
      // TODO add support for lookup by client_resource_id for transaction endpoint
      notification.transaction_url = '/v1/transaction/' + notification.hash;
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

  if (transaction.ledger_index) {
    notification.ledger = '' + transaction.ledger_index;
  }

  if (next_transaction_identifier) {
    notification.next_notification_url = '/v1/accounts/' + notification.account + '/notifications/' + next_transaction_identifier + (types ? '?types=' + types.join(',') : '');
  }

  if (previous_transaction_identifier) {
    notification.previous_notification_url = '/v1/accounts/' + notification.account + '/notifications/' + previous_transaction_identifier + (types ? '?types=' + types.join(',') : '');
  }

  // if (transaction.hash) {
  //   notification.hash = transaction.hash;
  //   notification.next_notification_url = '/accounts/' + notification.account + '/notifications/' + (notification.hash ? notification.hash : '');
  
  //   if (notification.type === 'payment') {
  //     notification.transaction_url = '/accounts/' + notification.account + '/payments/' + notification.hash;
  //   } else {
  //     notification.transaction_url = '/accounts/' + notification.account + '/transactions/' + notification.hash;      
  //   }
  // }

  if (transaction.date) {
    notification.timestamp = '' + new Date(ripple.utils.toTimestamp(transaction.date)).toISOString();
  }

  if (transaction.meta) {
    notification.result = transaction.meta.TransactionResult;
  }

  if (transaction.state) {
    notification.state = transaction.state;
  } else {
    if (notification.result === 'tesSUCCESS') {
      notification.state = 'validated';
    } else if (notification.result) {
      notification.state = 'failed';
    }
  }

  callback(null, notification);
}

module.exports.parseNotificationFromTransaction = parseNotificationFromTransaction;

