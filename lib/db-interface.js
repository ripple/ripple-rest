var async     = require('async');
var sequelize = require('sequelize');


module.exports = function(opts) {

  var config = opts.config;
  var db = require('../db/db-connect')({
    config: config
  });

  /* Load models */
  var outgoing_transaction = require('../db/models/outgoing-transactions')(db);
  var client_resource_id_record = require('../db/models/client-resource-id-record')(db);

  return {

    saveTransaction: function(transaction_data, callback) {
      saveTransaction(outgoing_transaction, transaction_data, callback);
    },

    getPendingTransactions: function(callback) {
      getPendingTransactions(outgoing_transaction, callback);
    },

    deleteTransaction: function(identifiers, callback) {
      deleteTransaction(outgoing_transaction, identifiers, callback);
    },

    findTransaction: function(identifiers, callback) {
      findTransaction(outgoing_transaction, client_resource_id_record, identifiers, callback);
    }
    
  };

};


function saveTransaction(outgoing_transaction, transaction_data, callback){

  if (transaction_data.sourceID && transaction_data.sourceID.indexOf(transaction_data.tx_json.Account + ':') === 0) {
    transaction_data.sourceID = transaction_data.sourceID.slice((transaction_data.tx_json.Account + ':').length);
  }


  var db_entry = {
    tx_json: JSON.stringify(transaction_data.tx_json),
    type: transaction_data.tx_json.TransactionType.toLowerCase(),
    source_account: transaction_data.tx_json.Account,
    client_resource_id: transaction_data.sourceID,
    submitted_ids: JSON.stringify(transaction_data.submittedIDs),
    submission_attempts: transaction_data.submissionAttempts,
    state: transaction_data.state,
    rippled_result: transaction_data.result.engine_result,
    rippled_result_message: transaction_data.result.engine_result_message,
    finalized: transaction_data.finalized,
    ledger: transaction_data.ledger
  };

  // console.log(db_entry);

  outgoing_transaction.find({
    where: {
      source_account: db_entry.source_account,
      type: db_entry.type,
      client_resource_id: db_entry.client_resource_id
    }
  }).complete(function(err, res){
    if (err) {
      console.log('Database Error. Cannot save transaction to database. ' + err);
      if (callback) {
        callback(new Error('Database Error. Cannot save transaction to database. ' + err));
      }
      return;
    }

    // Update record if it exists, create it if not
    if (res) {
      outgoing_transaction.update(db_entry, {
        source_account: db_entry.source_account,
        type: db_entry.type,
        client_resource_id: db_entry.client_resource_id
      }).complete(function(err, res){
        if (err) {
          console.log('Database Error. Cannot save transaction to database. ' + err);
          if (callback) {
            callback(new Error('Database Error. Cannot save transaction to database. ' + err));
          }
          return;
        }

        if (callback) {
          callback();
        }
      });
    } else {
      outgoing_transaction.create(db_entry).complete(function(err, res){
        if (err) {
          console.log('Database Error. Cannot save transaction to database. ' + err);
          if (callback) {
            callback(new Error('Database Error. Cannot save transaction to database. ' + err));
          }
          return;
        }
      });
    }

  });

}

function getPendingTransactions(outgoing_transaction, callback){

  outgoing_transaction.findAll({
    where: sequelize.or(
      { state: 'pending' },
      { state: 'unsubmitted' }
    )
  }).complete(function(err, res){
    if (err) {
      callback(new Error('Database Error. Cannot query database for pending transactions'));
      return;
    }

    // Reformat for data format expected by ripple-lib
    var results = [];
    res.forEach(function(db_entry){

      var val = db_entry.values,
        result = {
          tx_json: JSON.parse(val.tx_json),
          sourceID: val.client_resource_id,
          submittedIDs: JSON.parse(val.submitted_ids),
          submissionAttempts: val.submission_attempts,
          state: val.state,
          result: {
            engine_result: val.rippled_result,
            engine_result_message: val.rippled_result_message
          },
          finalized: val.finalized
        };

      results.push(result);
    });

    callback(null, results);
  });

}

// function moveValidatedTransactionsToPermanentTable(outgoing_transaction, client_resource_ids, callback) {

//   outgoing_transaction.findAll({
//     where: {
//       state: 'validated'
//     }
//   }).complete(function(err, res){
//     if (err) {
//       callback(new Error('Database Error. Cannot query database for validated transactions'));
//       return;
//     }

//     console.log(res);
//   });

// }

function findTransaction(outgoing_transaction, client_resource_id_record, identifiers, callback) {

  async.reduce([outgoing_transaction, client_resource_id_record], null, function(previous, db, async_callback){
    outgoing_transaction.find({
        where: identifiers
      }).complete(function(err, res){
        if (err) {
          async_callback(err);
          return;
        }

        if (res) {
          async_callback(null, res.values);
        } else {
          async_callback(null, previous);
        }
      });
  }, callback);

}

function deleteTransaction(outgoing_transaction, identifiers, callback) {

  outgoing_transaction.find({
    where: identifiers
  }).complete(function(err, res){
    if (err) {
      console.log(err);
      if (callback) {
        callback(err);
      }
      return;
    }

    if (res) {
      res.destroy().complete(callback);
    }
  });

}



