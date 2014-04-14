var ripple = require('ripple-lib');
var async = require('async');
var _ = require('lodash');

var transactionslib = require('./transactions');
var validator = require('../lib/schema-validator');
var serverlib = require('../lib/server-lib');
var notificationformatter = require('../lib/formatters/notification-formatter');

function _getNotification($, req, res, callback) {
  var opts = $.opts;
  var remote = $.remote;
  var config = $.config;
  var dbinterface = $.dbinterface;

  function validateOptions(callback) {
    if (!validator.isValid(opts.account, 'RippleAddress')) {
      return res.json(400, { success: false, message: 'Parameter is not a valid Ripple address: account' });
    }

    var hasIdentifier = validator.isValid(opts.identifier, 'Hash256') || validator.isValid(opts.identifier, 'ResourceId');

    if (hasIdentifier) return callback();

    res.json(400, { success: false, message: 'Invalid Parameter: hash or client_resource_id. Must provide a transaction hash or a client_resource_id to lookup a notification'
    });
  };

  function ensureConnected(callback) {
    serverlib.ensureConnected(remote, callback);
  };

  function getTransaction(connected, callback) {
    transactionslib.getTransaction(remote, dbinterface, opts, callback);
  };

  function checkLedger(base_transaction, callback) {
    serverlib.remoteHasLedger(remote, base_transaction.ledger_index, function(err, remote_has_ledger) {
      if (err) {
        return callback(err);
      }

      if (remote_has_ledger) {
        callback(null, base_transaction);
      } else {
        res.json(404, { succes: false, message: 'Cannot Get Notification. This transaction is not in the ripple\'s complete ledger set. Because there is a gap in the rippled\'s historical database it is not possible to determine the transactions that precede this one' });
      }
    });
  };

  function prepareResponse(base_transaction, callback) {
    var notification_details = {
      account:         opts.account,
      identifier:      opts.identifier,
      transaction:     base_transaction,
      types:           opts.types,
      exclude_failed:  opts.exclude_failed
    };

    callback(null, notification_details);
  };

  function attachSurroundingIdentifiers(notification_details, callback) {
    attachPreviousAndNextTransactionIdentifiers(remote, dbinterface, notification_details, callback);
  };

  function parseNotification(notification_details, callback) {
    notificationformatter.parseNotificationFromTransaction(notification_details, opts, callback);
  };

  var steps = [
    validateOptions,
    ensureConnected,
    getTransaction,
    checkLedger,
    prepareResponse,
    attachSurroundingIdentifiers,
    parseNotification
  ]

  async.waterfall(steps, callback);
};

exports.getNotification = getNotification;

function getNotification($, req, res, next) {
  var remote = $.remote;
  var config = $.config;
  var dbinterface = $.dbinterface;

  var opts = {
    account: req.params.account,
    identifier: req.params.identifier,
    type_string: req.query.types,
    exclude_failed_string: req.query.exclude_failed,
    types: [ ],
    new_url: req.originalUrl,
    exclude_failed: (exclude_failed_string === 'true')
  }

  var account = opts.account;
  var identifier = opts.identifier;

  if (type_string && type_string.length > 0) {
    types = _.map(type_string.split(','), function(type) {
      return type.replace(' ', '').toLowerCase();
    });
  } else {
    var possible_types = [
      'payment',
      'offercreate',
      'offercancel',
      'trustset',
      'accountset'
    ];

    new_url += (req.originalUrl.indexOf('?') === -1 ? '?' : '&') + 'types=' + possible_types.join(',');
  }

  if (!exclude_failed_string) {
    new_url += '&exclude_failed=false';
  }

  if (new_url !== req.originalUrl) {
    return res.redirect(new_url);
  }

  $.opts = opts;

  _getNotification($, req, res, function(err, notification) {
    if (err) {
      return next(err);
    }

    if (!notification) {
      return res.json(404, { success: false, message: 'Transaction Not Found. Could not get the notification corresponding to this transaction identifier. This may be because the transaction was never validated and written into the Ripple ledger or because it was not submitted through this ripple-rest instance. This error may also be seen if the databases of either ripple-rest or rippled were recently created or deleted.' });
    }

    var url_base = req.protocol + '://' + req.host
    + ({80: ':80', 443: ':443' }[config.get('PORT')] || '')

    var client_resource_id = notification.client_resource_id;

    delete notification.client_resource_id;

    Object.keys(notification).forEach(function(key) {
      if (~key.indexOf('url') && notification[key]) {
        notification[key] = url_base + notification[key];
      }
    });

    // If the base transaction this notification is built upon does not meet the specified
    // criteria, redirect to the previous_notification_url, which will meet the criteria
    if (types.length > 0 && types.length < 5) {
      if (types.indexOf(notification.type) === -1) {
        return res.redirect(notification.previous_notification_url);
      }
    }

    if (exclude_failed && notification.state !== 'validated') {
      return res.redirect(notification.previous_notification_url);
    }

    res.json({
      success: true,
      client_resource_id: client_resource_id,
      notification: notification
    });
  });
};

exports.getNextNotification = getNextNotification;

function getNextNotification($, req, res, next) {
  var remote = $.remote;
  var config = $.config;
  var dbinterface = $.dbinterface;

  $.opts = {
    account: req.params.account,
    identifier: req.params.identifier
  }

  _getNotification($, req, res, function(err, notification) {
    if (err) {
      next(err);
    } else {
      res.redirect(notification.next_notification_url);
    }
  });
};

/**
 *  Find all of the possible previous and next transactions, both from the rippled
 *  and from the local failures saved in the outgoing_transactions table. Once
 *  those have been arranged, find the base transaction amongst them and attach
 *  the hash or client_resource_ids of the previous and next ones
 */

function attachPreviousAndNextTransactionIdentifiers(remote, dbinterface, notification_details, callback) {

  function countTransactions(callback) {
    transactionslib.countAccountTransactionsInLedger(remote, dbinterface, {
      account: notification_details.account,
      ledger_index: notification_details.transaction.ledger_index
    }, callback);
  };

  function getNextTransactions(num_transactions_in_ledger, callback) {
    var steps = [
      {
        descending: true,
        num_transactions_in_ledger: num_transactions_in_ledger,
      },

      {
        descending: false,
        num_transactions_in_ledger: num_transactions_in_ledger
      }
    ]

    async.concat(steps, function(opts, concat_callback) {
      getPossibleNextTransactions(remote, dbinterface, notification_details, opts, concat_callback);
    }, callback);
  };

  function sortTransactions(all_possible_transactions, callback) {
    all_possible_transactions.push(notification_details.transaction);

    var possibilities = _.uniq(all_possible_transactions, function(tx) {
      return tx.hash;
    });

    possibilities.sort(function(a, b) {
      if (a.ledger_index === b.ledger_index) {
        return a.date <= b.date ? -1 : 1;
      } else {
        return a.ledger_index < b.ledger_index ? -1 : 1;
      }
    });

    callback(null, possibilities);
  };

  function prepareNotification(possibilities, callback) {
    var base_transaction_index = _.findIndex(possibilities, function(possibility) {
      if (notification_details.transaction.hash && possibility.hash === notification_details.transaction.hash) {
        return true;
      }

      if (notification_details.transaction.client_resource_id && possibility.client_resource_id === notification_details.transaction.client_resource_id) {
        return true;
      }

      return false;
    });

    if (base_transaction_index > 0) {
      var previous_transaction = possibilities[base_transaction_index - 1];
      notification_details.previous_transaction_identifier = (previous_transaction.from_local_db ? previous_transaction.client_resource_id : previous_transaction.hash);
    }

    if (base_transaction_index + 1 < possibilities.length) {
      var next_transaction = possibilities[base_transaction_index + 1];
      notification_details.next_transaction_identifier = (next_transaction.from_local_db ? next_transaction.client_resource_id : next_transaction.hash);
    }

    callback(null, notification_details);
  };

  var steps = [
    countTransactions,
    getNextTransactions,
    sortTransactions,
    prepareNotification
  ];

  async.waterfall(steps, callback);
};

/**
 *  Determine how many transactions the same account had in this one ledger
 *  then get one more than that number of transactions with either the
 *  ledger_index_min or ledger_index_max set to this ledger index
 */

function getPossibleNextTransactions(remote, dbinterface, notification_details, opts, callback) {
  var params = {
    account: notification_details.account,
    max: opts.num_transactions_in_ledger + 1,
    min: opts.num_transactions_in_ledger + 1,
    types: notification_details.types || opts.types,
    exclude_failed:  notification_details.exclude_failed
  };

  if (opts.descending) {
    params.descending = true;
    params.ledger_index_max = notification_details.transaction.ledger_index;
    params.ledger_index_min = -1;
  } else {
    params.descending = false;
    params.ledger_index_max = -1;
    params.ledger_index_min = notification_details.transaction.ledger_index;
  }

  transactionslib.getAccountTransactions(remote, dbinterface, params, callback);
};
