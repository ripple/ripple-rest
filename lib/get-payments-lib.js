var async     = require('async');
var validator = require('./schema-validator');
var formatter = require('./formatter');
var gettxlib  = require('./get-tx-lib');

function getPayment(remote, dbinterface, opts, callback) {

  var steps = [

    // Check input
    function(async_callback) {
      if (!opts.account) {
        async_callback(new Error('Missing parameter: account. Must provide account to get payment details'));
        return;
      }

      if (!opts.identifier) {
        async_callback(new Error('Missing parameter: identifier. Must provide transaction hash or client_resource_id to get payment details'));
        return;
      }

      if (validator.validate(opts.account, 'RippleAddress').length > 0) {
        async_callback(new Error('Invalid parameter: account. Must be a valid Ripple address'));
        return;
      }

      async_callback(null, opts);
    },

    // If opts.identifier is not a transaction hash, look for it in the local db
    function(opts, async_callback) {
      if(validator.validate(opts.identifier, 'Hash256').length > 0) {
        dbinterface.findTransaction({
          source_account: opts.account,
          client_resource_id: opts.identifier,
          type: 'payment'
        }, function(err, db_entry){
          if (err) {
            async_callback(err);
            return;
          }
          if (db_entry) {
            opts.hash = db_entry.hash;
            opts.found_in_db = true;
            async_callback(null, opts);
          } else {
            async_callback(new Error('Payment Not Found. The given client_resource_id does not correspond to a resource stored in this ripple-rest instance\'s local database. This may indicate that the transaction was never processed by this ripple-rest server or that its database has been deleted. For a more definitive lookup, please supply the transaction hash'));
          }
        });
      } else {
        opts.hash = opts.identifier;
        async_callback(null, opts);
      }

    },

    // Try getting transaction from outgoing_transactions in case it is still not validated
    function(opts, async_callback) {
      if (opts.found_in_db) {
        dbinterface.getOutgoingTransaction(opts, function(err, transaction){
          if (err) {
            async_callback(err);
            return;
          }

          if (transaction) {
            opts.transaction = transaction;
          }
          
          async_callback(null, opts);

        });
      } else {
        async_callback(null, opts);
      }
    },

    // If the transaction was not in the outgoing_transactions db, get it from rippled
    function(opts, async_callback) {
      if (opts.transaction) {
        async_callback(null, opts.account, opts.transaction);
      } else {
        gettxlib.getTx(remote, opts.hash, {account: opts.account}, function(err, transaction){
          async_callback(err, opts.account, transaction);
        });
      }
    },

    function(account, transaction, async_callback) {
      formatter.parsePaymentFromTx(transaction, {account: account}, async_callback);
    }

  ];

  async.waterfall(steps, callback);  
}


module.exports.getPayment = getPayment;
