var async            = require('async');
var ripple           = require('ripple-lib');
var Amount           = require('ripple-lib').Amount;
var paymentFormatter = require('../lib/formatters/payment-formatter');
var serverLib        = require('../lib/server-lib');
var validator        = require('../lib/schema-validator');

var last_ledger_sequence_buffer = 6;

exports.submit = submitPayment;

function submitPayment($, req, res, next) {
  var remote = $.remote;
  var dbinterface = $.dbinterface;
  var config = $.config;

  var params = {
    payment: req.body.payment,
    secret: req.body.secret,
    client_resource_id: req.body.client_resource_id,
    url_base: req.protocol + '://' + req.host + ({ 80: ':80', 443:':443' }[config.get('PORT')] || '/')
  }

  if (!params.payment) {
    params.payment = { };
  }

  if (!params.payment.source_account) {
    params.payment.source_account = req.params.account
    || req.body.source_account
    || req.body.source
    || params.payment.source;
  }

  if (!params.payment.destination_account) {
    params.payment.destination_account = req.body.destination_account
    || req.body.destination
    || params.payment.destination;
  }

  if (!params.payment.destination_amount) {
    params.payment.destination_amount = req.body.destination_amount
    || req.body.amount
    || params.payment.amount;
  }

  function validateOptions(callback) {
    if (!params.payment) {
      return res.json(400, {
        success: false,
        message: 'Missing parameter: payment. Submission must have payment object in JSON form'
      });
    }

    if (!params.secret) {
      return res.json(400, {
        success: false,
        message: 'Missing parameter: secret. Submission must have account secret to sign and submit payment'
      });
    }

    if (!params.client_resource_id) {
      return res.json(400, {
        success: false,
        message: 'Missing parameter: client_resource_id. All payments must be submitted with a client_resource_id to prevent duplicate payments'
      });
    }

    if (!validator.isValid(params.client_resource_id, 'ResourceId')) {
      return res.json(400, {
        success: false,
        message: 'Invalid parameter: client_resource_id. Must be a string of ASCII-printable characters. Note that 256-bit hex strings are disallowed because of the potential confusion with transaction hashes.'
      });
    }

    callback();
  };

  function ensureConnected(callback) {
    serverLib.ensureConnected(remote, function(err, connected) {
      if (connected) {
        callback();
      } else {
        res.json(500, { success: false, message: 'No connection to rippled' });
      }
    });
  };

  function formatPayment(callback) {
    paymentFormatter.paymentToTransaction(params.payment, function(err, transaction) {
      if (err) {
        res.json(400, { success: false, message: err.message });
      } else {
        callback(null, transaction);
      }
    });
  };

  function submitTransaction(transaction, callback) {
    params.transaction = transaction;
    submitRippleLibTransaction(remote, dbinterface, params, callback);
  };

  var steps = [
    validateOptions,
    ensureConnected,
    formatPayment,
    submitTransaction
  ]

  async.waterfall(steps, function(err, client_resource_id) {
    if (err) {
      next(err);
    } else {
      res.json(200, {
        success: true,
        client_resource_id: client_resource_id,
        status_url: '/v1/accounts/' + params.payment.source_account + '/payments/' + client_resource_id
      });
    }
  });
};

function submitRippleLibTransaction(remote, dbinterface, data, callback) {

  function prepareTransaction(callback) {
    // Secret is stored in transaction object, not in ripple-lib Remote
    // Note that transactions submitted with incorrect secrets will be passed
    // to rippled, which will respond with a 'temBAD_AUTH_MASTER' error
    // TODO: locally verify that the secret corresponds to the given account
    data.transaction.secret(data.secret);
    data.transaction.clientID(data.client_resource_id);

    callback(null, data.transaction);
  };

  function blockDuplicates(transaction, callback) {
    // Block duplicate payments
    if (transaction.tx_json.TransactionType !== 'Payment') {
      return callback(null, transaction);
    }

    dbinterface.getTransaction({
      source_account: transaction.tx_json.Account,
      client_resource_id: data.client_resource_id,
      type: 'payment'
    }, function(err, db_record) {
        if (err) {
          return callback(err);
        }

        if (db_record && db_record.state !== 'failed') {
          callback(new Error('Duplicate Payment. A record already exists in the database for a payment from this account with the same client_resource_id. Payments must be submitted with distince client_resource_id\'s to prevent accidental double-spending'));
        } else {
          callback(null, transaction);
        }
    });
  };

  function submitTransaction(transaction, callback) {
    transaction.remote = remote;
    transaction.lastLedger(Number(remote._ledger_current_index) + last_ledger_sequence_buffer);

    transaction.once('error', callback);

    // The 'proposed' event is fired when ripple-lib receives an initial tesSUCCESS response from
    // rippled. This does not guarantee that the transaction will be validated but it is at this
    // point that we want to respond to the user that the transaction has been submitted
    transaction.once('proposed', function() {
      callback(null, transaction._clientID);
    });

    // Note that ripple-lib saves the transaction to the db throughout the submission process
    // using the persistence functions passed to the ripple-lib Remote instance
    transaction.submit();
  };

  var steps = [
    prepareTransaction,
    blockDuplicates,
    submitTransaction
  ];

  async.waterfall(steps, callback);
};
