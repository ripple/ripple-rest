var async     = require('async');
var validator = require('./schema-validator');
var formatter = require('./formatter');
var gettxlib  = require('./get-tx-lib');

function getPayment(remote, dbinterface, identifiers, callback) {

  var steps = [

    function(async_callback) {
      if (!identifiers.account) {
        async_callback(new Error('Missing parameter: account. Must provide account to get payment details'));
        return;
      }

      if (!identifiers.identifier) {
        async_callback(new Error('Missing parameter: identifier. Must provide transaction hash or client_resource_id to get payment details'));
        return;
      }

      if (validator.validate(identifiers.account, 'RippleAddress').length > 0) {
        async_callback(new Error('Invalid parameter: account. Must be a valid Ripple address'));
        return;
      }

      async_callback(null, identifiers);
    },

    function(identifiers, async_callback) {

      if(validator.validate(identifiers.identifier, 'Hash256').length > 0) {
        dbinterface.findTransaction({
          source_account: identifiers.account,
          client_resource_id: identifiers.identifier,
          type: 'payment'
        }, function(err, db_entry){
          if (err) {
            async_callback(err);
            return;
          }
          if (db_entry) {
            async_callback(null, identifiers.account, db_entry.hash);
          } else {
            async_callback(new Error('Payment Not Found. The given client_resource_id does not correspond to a resource stored in this ripple-rest instance\'s local database. This may indicate that the transaction was never processed by this ripple-rest server or that its database has been deleted. For a more definitive lookup, please supply the transaction hash'));
          }
        });
      } else {
        async_callback(null, identifiers.account, identifiers.hash);
      }

    },

    function(account, transaction_hash, async_callback) {
      gettxlib.getTx(remote, transaction_hash, {account: account}, function(err, payment){
        async_callback(err, account, payment);
      });
    },

    function(account, payment, async_callback) {
      formatter.parsePaymentFromTx(payment, {account: account}, async_callback);
    }

  ];

  async.waterfall(steps, callback);  
}


module.exports.getPayment = getPayment;
