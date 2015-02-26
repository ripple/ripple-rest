var ripple = require('ripple-lib');

/**
 * Convert a Ripple transaction in the JSON format,
 * along with some additional pieces of information,
 * into a Notification object.
 *
 * @param {Ripple Transaction in JSON Format} notification_details.transaction
 * @param {RippleAddress} notification_details.account
 * @param {Hex-encoded String|ResourceId} notification_details.previous_transaction_identifier
 * @param {Hex-encoded String|ResourceId} notification_details.next_transaction_identifier
 *
 * @returns {Notification}
 */
function NotificationParser() {};

NotificationParser.prototype.parse = function(notification_details) {
  var transaction = notification_details.transaction;
  var account = notification_details.account;
  var previous_transaction_identifier = notification_details.previous_transaction_identifier;
  var next_transaction_identifier = notification_details.next_transaction_identifier;

  var metadata = transaction.meta || { };

  var notification = {
    account: account,
    type: transaction.TransactionType.toLowerCase(),
    direction: '', // set below
    state: (metadata.TransactionResult === 'tesSUCCESS' ? 'validated' : 'failed'),
    result: metadata.TransactionResult || '',
    ledger: '' + transaction.ledger_index,
    hash: transaction.hash,
    timestamp: '',// set below
    transaction_url: '', // set below
    previous_hash: notification_details.previous_hash,
    previous_notification_url: '', // set below
    next_hash: notification_details.next_hash,
    next_notification_url: '', // set below
    client_resource_id: notification_details.client_resource_id
  };

  notification.timestamp = transaction.date ?
    new Date(ripple.utils.time.fromRipple(transaction.date)).toISOString() : '';

  if (account === transaction.Account) {
    notification.direction = 'outgoing';
  } else if (transaction.TransactionType === 'Payment' && transaction.Destination !== account) {
    notification.direction = 'passthrough';
  } else {
    notification.direction = 'incoming';
  }
  if (notification.type === 'payment') {
    notification.transaction_url = '/v1/accounts/' + notification.account + '/payments/' + (transaction.from_local_db ? notification.client_resource_id : notification.hash);
  } else {
    notification.transaction_url = '/v1/transactions/' + notification.hash;
  }
  if (notification.type === 'offercreate' || notification.type === 'offercancel') {
    notification.type = 'order';
    notification.transaction_url = '/v1/accounts/' + notification.account + '/orders/' + notification.hash;
  } else if (notification.type === 'trustset') {
    notification.type = 'trustline';
  } else if (notification.type === 'accountset') {
    notification.type = 'settings';
  }
  if (next_transaction_identifier) {
    notification.next_notification_url = '/v1/accounts/' +
      notification.account +
      '/notifications/' +
      next_transaction_identifier;
  }
  if (previous_transaction_identifier) {
    notification.previous_notification_url = '/v1/accounts/' +
      notification.account +
      '/notifications/' +
      previous_transaction_identifier;
  }

  return notification;
};

module.exports = new NotificationParser();

