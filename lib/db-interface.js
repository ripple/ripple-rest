var async     = require('async');
var sequelize = require('sequelize');
var _         = require('lodash');


module.exports = function(opts) {

  var config = opts.config;
  var db = require('../db/db-connect')({
    config: config
  }).connect();

  /* Load models */
  var outgoing_transactions = require('../db/models/outgoing-transactions')(db);
  var client_resource_id_records = require('../db/models/client-resource-id-records')(db);

  return {

    saveTransaction: function(transaction_data, callback) {
      saveTransaction(outgoing_transactions, transaction_data, function(err){
        if (callback) {
          callback(err);
        }

        // If the transaction was validated, move all validated transactions from
        // outgoing_transactions table to client_resource_id_records table
        if (transaction_data.state === 'validated') {
          moveValidatedTransactionsToPermanentTable(outgoing_transactions, client_resource_id_records, function(err, num_moved){
            if (err) {
              console.log('Database Error. Error moving validated transactions from outgoing_transactions to client_resource_id_recordss table. ' + err);
              return;
            }

            if (num_moved > 0) {
              console.log(num_moved + ' transactions moved from outgoing_transactions to client_resource_id_recordss table.');
            }
          });
        }
      });
    },

    getPendingTransactions: function(callback) {
      getPendingTransactions(outgoing_transactions, callback);
    },

    deleteTransaction: function(identifiers, callback) {
      deleteTransaction(outgoing_transactions, identifiers, callback);
    },

    findTransaction: function(identifiers, callback) {
      findTransaction(outgoing_transactions, client_resource_id_records, identifiers, callback);
    },

    getOutgoingTransaction: function(identifiers, callback) {
      getOutgoingTransaction(outgoing_transactions, identifiers, callback);
    },

    getFailedTransactions: function(opts, callback) {
      getFailedTransactions(outgoing_transactions, opts, callback);
    },

    moveValidatedTransactionsToPermanentTable: function(callback) {
      moveValidatedTransactionsToPermanentTable(outgoing_transactions, client_resource_id_records, callback);
    }
    
  };

};


function saveTransaction(outgoing_transactions, transaction_data, callback){

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
    hash: transaction_data.submittedIDs[0],
    finalized: transaction_data.finalized,
    ledger: (transaction_data.result && transaction_data.result.ledger ? '' + transaction_data.result.ledger : '')
  };

  // console.log(db_entry);

  outgoing_transactions.find({
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
      outgoing_transactions.update(db_entry, {
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
      outgoing_transactions.create(db_entry).complete(function(err, res){
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

function getPendingTransactions(outgoing_transactions, callback){

  outgoing_transactions.findAll({
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
            engine_result_message: val.rippled_result_message,
            ledger: parseInt(val.ledger, 10)
          },
          finalized: val.finalized
        };

      results.push(result);
    });

    callback(null, results);
  });

}

function getFailedTransactions(opts, callback) {
  var query = {
    where: {
      state: 'failed'
    }
  };

  query.where.source_account = opts.account;

  if (opts.type) {
    query.where.type = opts.type;
  }

  if (opts.ledger_index_min) {
    if (!query.where.ledger) {
      query.where.ledger = {};
    }
    query.where.ledger.gte = opts.ledger_index_min;
  }

  if (opts.ledger_index_max) {
    if (!query.where.ledger) {
      query.where.ledger = {};
    }
    query.where.ledger.lte = opts.ledger_index_max;
  }

  if (opts.descending) {
    query.order = 'ledger DESC';
  } else {
    query.order = 'ledger ASC';
  }

  outgoing_transactions.findAll(query).complete(function(err, results){
    if (err) {
      callback(err);
      return;
    }

    var failed_transactions = [];

    if (results) {
      failed_transactions = _.map(results, outgoingTransactionEntryToTx);
    }

    callback(null, failed_transactions);
  });
}

function getOutgoingTransaction(outgoing_transactions, identifiers, callback) {
  outgoing_transactions.find({
    where: {
      source_account: identifiers.account || identifiers.source_account,
      client_resource_id: identifiers.client_resource_id,
      type: identifiers.type
    }
  }).complete(function(err, res){
    if (err) {
      callback(err);
      return;
    }

    if (res && res.values) {
      callback(null, outgoingTransactionEntryToTx(res.values));
    } else {
      callback(null, null);
    }
  });
}

/**
 *  Once outgoing_transactions have been validated they can be moved to the client_resource_id_recordss table
 *  and deleted from the outgoing_transactions table, because they have been written into the Ripple Ledger.
 *  The client_resource_id_recordss table merely maps the client_resource_id to the transaction hash for lookup later 
 */
function moveValidatedTransactionsToPermanentTable(outgoing_transactions, client_resource_id_records, callback) {

  outgoing_transactions.findAll({
    where: {
      state: 'validated',
      finalized: true
    }
  }).complete(function(err, results){
    if (err) {
      callback(new Error('Database Error. Cannot query database for validated transactions. ' + err));
      return;
    }

    // Use reduce instead of each to count number of entries moved
    async.reduce(results, 0, function(num_moved, outgoing_transactions_entry, async_callback){

      client_resource_id_records.findOrCreate({
        source_account:     outgoing_transactions_entry.values.source_account,
        type:               outgoing_transactions_entry.values.type,
        client_resource_id: outgoing_transactions_entry.values.client_resource_id,
        hash:               outgoing_transactions_entry.values.hash,
        ledger:             outgoing_transactions_entry.values.ledger,
        state:              outgoing_transactions_entry.values.state,
        result:             outgoing_transactions_entry.values.rippled_result
      }).complete(function(err, entry){
        if (err) {
          callback(new Error('Database Error. Cannot update client_resource_id_records. ' + err));
          return;
        }

        // Once the transaction has been saved to the client_resource_id_recordss table
        // it may be deleted from the outgoing_transactions table
        // if (entry.created) {
          outgoing_transactions_entry.destroy().complete(function(err){
            if (err) {
              async_callback(err);
              return;
            }
            async_callback(null, num_moved + 1);
          });
        // } else {
        //   console.log('Internal Error. Tried to add duplicate entry to client_resource_id_recordss. Entry: ' + entry.values);
        //   async_callback();
        // }

      });

    }, callback);
  });

}


/**
 *  Lookup a transaction in both the outgoing_transactions and client_resource_id_recordss tables
 *  based on the source_account, type, and client_resource_id
 */
function findTransaction(outgoing_transactions, client_resource_id_records, identifiers, callback) {

  var query = {
    where: {
      source_account:     identifiers.source_account || identifiers.account
    }
  };

  if (identifiers.client_resource_id) {
    query.where.client_resource_id = identifiers.client_resource_id;
  }

  if (identifiers.hash) {
    query.where.hash = identifiers.hash;
  }

  if (identifiers.type) {
    query.where.type = identifiers.type;
  }

  async.reduce([outgoing_transactions, client_resource_id_records], null, function(previous, db_table, async_callback){
    db_table.find(query).complete(function(err, res){
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

function deleteTransaction(outgoing_transactions, identifiers, callback) {

  outgoing_transactions.find({
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

function outgoingTransactionEntryToTx(db_entry) {
  var values = db_entry.values || db_entry;

  // Convert to format similar to getTx call
  var transaction = JSON.parse(values.tx_json);
  transaction.meta = transaction.meta || {};
  transaction.meta.TransactionResult = values.result;
  transaction.ledger_index = values.ledger;
  transaction.hash = values.hash;

  return transaction;
}

