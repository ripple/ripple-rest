var formatter = require('./formatter');
var serverlib = require('./server-lib');
var async     = require('async');

function submitPayment(remote, dbinterface, data, callback) {
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
      submitRippleLibTransaction(remote, dbinterface, data, async_callback);
    }

  ];

  async.waterfall(steps, callback);

}

function submitRippleLibTransaction(remote, dbinterface, data, callback) {

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
      transaction.clientID = data.client_resource_id;
      transaction.sourceID = data.client_resource_id;
      async_callback(null, transaction);
    },

    // Block duplicate payments
    function(transaction, async_callback) {

      if (transaction.tx_json.TransactionType !== 'Payment') {
        async_callback(null, transaction);
        return;
      }
      
      dbinterface.findTransaction({
        source_account: transaction.tx_json.Account,
        client_resource_id: transaction.clientID,
        type: 'payment'
      }, function(err, db_record){
        if (err) {
          async_callback(err);
          return;
        }

        if (db_record && db_record.state !== 'failed') {
          async_callback(new Error('Duplicate Payment. A record already exists in the database for a payment from this account with the same client_resource_id. Payments must be submitted with distince client_resource_id\'s to prevent accidental double-spending'));
          return;
        }

        async_callback(null, transaction);
      });
    },

    function(transaction, async_callback) {
      transaction.remote = remote;
      transaction.tx_json.LastLedgerSequence = parseInt(remote._ledger_current_index, 10) + 6;
      async_callback(null, transaction);
    },

    function(transaction, async_callback) {

      transaction.on('error', async_callback);
      process.on('uncaughtException', async_callback);

      transaction.once('proposed', function(){
        transaction.removeListener('error', async_callback);
        process.removeListener('uncaughtException', async_callback);

        async_callback(null, transaction.clientID);
      });

      transaction.submit();

      // transaction.on('success', function(result){
      //   console.log('Transaction validated');
      // });
    }

  ];

  async.waterfall(steps, function(err, client_resource_id){
    if (err) {
      callback(err);
      if (!err.message || err.message.indexOf('Duplicate Payment') === -1) {
        dbinterface.deleteTransaction({
          source_account: data.transaction.tx_json.Account,
          client_resource_id: data.client_resource_id,
          type: data.transaction.tx_json.TransactionType.toLowerCase()
        }, function(err, res){
          if (err) {
            console.log('Error deleting db entry after error was reported back to client. ' + err);
            return;
          }
        });
      }
      return;
    }

    callback(null, client_resource_id);

  });

}

module.exports.submitPayment = submitPayment;
