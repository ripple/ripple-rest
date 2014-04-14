var async            = require('async');
var domain           = require('domain');
var ripple           = require('ripple-lib');
var paymentformatter = require('../lib/formatters/payment-formatter');
var serverlib        = require('../lib/server-lib');
var validator        = require('../lib/schema-validator');

var last_ledger_sequence_buffer = 6;

exports.submit = submitPayment;

function submitPayment($, req, res, next) {
  var remote = $.remote;
  var dbinterface = $.dbinterface;
  var config = $.config;

  var data = {
    payment: req.body.payment,
    secret: req.body.secret,
    client_resource_id: req.body.client_resource_id,
    url_base: req.protocol + '://' + req.host + ({80: ':80', 443:':443'}[config.get('PORT')] || '')
  }

  function validateOptions(callback) {
    if (!req.body || !req.body.payment) {
      return callback(new Error('Invalid JSON. Could not parse request body as JSON. Please ensure that the header type is set to application/json and try again'));
    }

    if (!data.payment) {
      callback(new Error('Missing parameter: payment. Submission must have payment object in JSON form'));
      return;
    }

    if (!data.secret) {
      callback(new Error('Missing parameter: secret. Submission must have account secret to sign and submit payment'));
      return;
    }

    if (!data.client_resource_id) {
      callback(new Error('Missing parameter: client_resource_id. All payments must be submitted with a client_resource_id to prevent duplicate payments'));
      return;
    }

    if (!validator.isValid(data.client_resource_id, 'ResourceId')) {
      callback(new Error('Invalid parameter: client_resource_id. Must be a string of ASCII-printable characters. Note that 256-bit hex strings are disallowed because of the potential confusion with transaction hashes.'));
      return;
    }

    callback();
  };

  function ensureConnected(callback) {
    serverlib.ensureConnected(remote, callback);
  };

  function formatPayment(connected, callback) {
    if (!connected) {
      return res.json(500, { success: false, message: 'No connection to rippled' });
    }

    paymentformatter.paymentToTransaction(data.payment, callback);
  };

  function submitTransaction(transaction, callback) {
    data.transaction = transaction;
    submitRippleLibTransaction(remote, dbinterface, data, callback);
  };

  var steps = [
    validateOptions,
    ensureConnected,
    formatPayment,
    submitTransaction
  ];

  async.waterfall(steps, function(err, client_resource_id) {
    if (err) {
      next(err);
    } else {
      res.json(200, {
        success: true,
        client_resource_id: client_resource_id,
        status_url: url_base + '/v1/accounts/' + data.payment.source_account + '/payments/' + client_resource_id
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

  function setLastLedger(transaction, callback) {
    async_callback(null, transaction);
  };

  function submitTransaction(transaction, callback) {
    transaction.remote = remote;
    transaction.lastLedger(Number(remote._ledger_current_index) + last_ledger_sequence_buffer);

    // node.js domain is used to catch errors thrown during the submission process
    var submission_domain = domain.create();

    transaction.once('error', callback);
    submission_domain.once('error', callback);

    // The 'proposed' event is fired when ripple-lib receives an initial tesSUCCESS response from
    // rippled. This does not guarantee that the transaction will be validated but it is at this
    // point that we want to respond to the user that the transaction has been submitted
    transaction.once('proposed', function() {
      transaction.removeListener('error', callback);
      submission_domain.removeListener('error', callback);
      callback(null, transaction._clientID);
    });

    // The ripple-lib transaction submission is run in the context of the node.js domain
    // so that any errors thrown during the submission process will be picked up by that error handler.
    // Note that ripple-lib saves the transaction to the db throughout the submission process
    // using the persistence functions passed to the ripple-lib Remote instance
    submission_domain.run(function() {
      transaction.submit();
    });

    // transaction.on('success', function(result){
    //   console.log('Transaction validated');
    // });
  };

  var steps = [
    prepareTransaction,
    blockDuplicates,
    submitTransaction
  ];

  async.waterfall(steps, callback);
};
