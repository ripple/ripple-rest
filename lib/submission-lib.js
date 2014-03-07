var formatter = require('./formatter');
var serverlib = require('./server-lib');
var async     = require('async');

function submitPayment(remote, data, callback) {
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

  var steps = [

    function(async_callback) {
      serverlib.ensureConnected(remote, async_callback);
    },

    function(connected, async_callback) {
      formatter.paymentToTransaction(data.payment, async_callback);
    },

    function(transaction, async_callback) {
      data.transaction = transaction;
      submitRippleLibTransaction(remote, data, async_callback);
    }

  ];

  async.waterfall(steps, callback);

}

function submitRippleLibTransaction(remote, data, callback) {

  var steps = [

    function(async_callback) {
      try {
        // transaction._secret = data.secret;
        remote.set_secret(data.transaction.tx_json.Account, data.secret);
      } catch(signing_error) {
        setTimeout(function(){
          async_callback(new Error('Invalid parameter: secret. Secret does not match specified account'));
        }, 1000);
      }
      async_callback(null, data.transaction);
    },

    function(transaction, async_callback) {
      // Check if redundant
      transaction.clientID = data.client_resource_id;
      async_callback(null, transaction);      
    },

    function(transaction, async_callback) {
      transaction.remote = remote;
      transaction.tx_json.LastLedgerSequence = parseInt(remote._ledger_current_index, 10) + 6;
      async_callback(null, transaction);
    },

    function(transaction, async_callback) {
      transaction.on('error', callback);
      process.on('uncaughtException', callback);

      transaction.once('proposed', function(){
        transaction.removeListener('error', callback);
        process.removeListener('uncaughtException', callback);

        callback(null, transaction.clientID);
      });

      transaction.submit();

      transaction.on('success', function(result){
        console.log('transaction confirmed ', result);
      });
    }

  ];

  async.waterfall(steps, callback);

}

module.exports.submitPayment = submitPayment;
