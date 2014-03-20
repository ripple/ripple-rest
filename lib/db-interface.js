var async     = require('async');
var sequelize = require('sequelize');
var _         = require('lodash');
var ripple    = require('ripple-lib');
var validator = require('./schema-validator');


function DatabaseInterface (database_url) {
  var self = this;

  self.db = require('../db/db-connect')(database_url);

  self.models = {};
  self.models.outgoing_transactions = require('../db/models/outgoing-transactions')(self.db);
  self.models.client_resource_id_records = require('../db/models/client-resource-id-records')(self.db);

  self.db.sync({ force: true }).complete(function(err){
    if (err) {
      throw new Error('Error syncing database models. ' + err);
    }
  });
}


DatabaseInterface.prototype.saveTransaction = function(transaction_data, callback) {
  var self = this;
  
  if (transaction_data.sourceID && transaction_data.sourceID.indexOf(transaction_data.tx_json.Account + ':') === 0) {
    transaction_data.sourceID = transaction_data.sourceID.slice((transaction_data.tx_json.Account + ':').length);
  }

  var db_values = {
    tx_json: JSON.stringify(transaction_data.tx_json),
    type: transaction_data.tx_json.TransactionType.toLowerCase(),
    source_account: transaction_data.tx_json.Account,
    client_resource_id: transaction_data.clientID,
    submitted_ids: JSON.stringify(transaction_data.submittedIDs),
    submission_attempts: transaction_data.submissionAttempts,
    state: transaction_data.state,
    rippled_result: (transaction_data.result ? transaction_data.result.engine_result : ''),
    rippled_result_message: (transaction_data.result ? transaction_data.result.engine_result_message : ''),
    hash: transaction_data.submittedIDs[0],
    finalized: transaction_data.finalized,
    ledger: (transaction_data.result && transaction_data.result.ledger ? '' + transaction_data.result.ledger : '')
  };

  var query = {
    where: {
      source_account: db_values.source_account,
      type: db_values.type,
      client_resource_id: db_values.client_resource_id
    }
  };

  var steps = [

    function(async_callback) {
      self.models.outgoing_transactions.find(query).complete(async_callback);
    },

    function(db_entry, async_callback) {
      if (db_entry) {
        db_entry.updateAttributes(db_values).complete(async_callback);
      } else {
        self.models.outgoing_transactions.create(db_values).complete(async_callback);
      }
    },

    function(db_entry, async_callback) {
      console.log(db_entry.values);
      if (db_entry.values && db_entry.values.finalized) {
        self.moveValidatedTransactionsToPermanentTable(function(err, num_moved){
          if (err) {
            console.log('Database Error. Error moving validated transactions from outgoing_transactions to client_resource_id_records table. ' + err);
            return;
          }

          console.log(num_moved + ' transactions moved from outgoing_transactions table to client_resource_id_records table.');
        });
      }
      async_callback(null, null);
    }

  ];

  async.waterfall(steps, function(err){
    if (err) {

      if (callback) {
        callback(new Error('Database Error. Cannot save transaction to database. ' + err));
      } else {
        console.log('Database Error. Cannot save transaction to database. ' + err);
      }

    }
  });

};

DatabaseInterface.prototype.getPendingTransactions = function(callback) {
  var self = this;

  self.models.outgoing_transactions.findAll({
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
};

DatabaseInterface.prototype.deleteTransaction = function(identifiers, callback) {
  var self = this;

  outgoing_transactions.find({
    where: identifiers
  }).complete(function(err, res){
    if (err) {
      if (callback) {
        callback(err);
      }
      return;
    }

    if (res) {
      res.destroy().complete(callback);
    }
  });
};

DatabaseInterface.prototype.getTransaction = function(opts, callback) {
  var self = this;

  if (opts.identifier) {
    if (validator.validate(opts.identifier, 'Hash256').length === 0) {
      opts.hash = opts.identifier;
    } else if (validator.validate(opts.identifier, 'ResourceId').length === 0){
      opts.client_resource_id = opts.identifier;
    } else {
      callback(new Error('Invalid Parameter: hash or client_resource_id. Must provide a transaction hash or a client_resource_id to lookup a notification'));
    }
  }

  var query = {
    where: {
      source_account: opts.source_account || opts.account
    }
  };

  if (opts.client_resource_id) {
    query.where.client_resource_id = opts.client_resource_id;
  }

  if (opts.hash) {
    query.where.hash = opts.hash;
  }

  if (opts.type) {
    query.where.type = opts.type;
  }

  var steps = [

    function(async_callback) {
      self.models.client_resource_id_records.find(query).complete(async_callback);
    },

    function(db_entry, async_callback) {
      if (db_entry) {
        async_callback(null, db_entry);
      } else {
        self.models.outgoing_transactions.find(query).complete(async_callback);
      }
    },

    function(db_entry, async_callback) {
      if (db_entry) {
        async_callback(null, db_entry.values);
      } else {
        async_callback(null, null);
      }
    },

    function(db_values, async_callback) {
      if (db_values && db_values.tx_json) {

        if (db_values.finalized === false) {
          db_values.state = 'pending';
        }

        db_values.transaction = outgoingTransactionEntryToTransaction(db_values);
      }
      async_callback(null, db_values);
    }

  ];

  async.waterfall(steps, callback);

};

DatabaseInterface.prototype.getFailedTransactions = function(opts, callback) {
  var self = this;

  var query = {
    where: {
      state: 'failed',
      finalized: true
    }
  };

  query.where.source_account = opts.account;

  if (opts.type) {
    query.where.type = opts.type;
  }

  if (opts.ledger_index_min && opts.ledger_index_min !== -1) {
    if (!query.where.ledger) {
      query.where.ledger = {};
    }
    query.where.ledger.gte = '' + opts.ledger_index_min;
  }

  if (opts.ledger_index_max && opts.ledger_index_max !== -1) {
    if (!query.where.ledger) {
      query.where.ledger = {};
    }
    query.where.ledger.lte = '' + opts.ledger_index_max;
  }

  if (opts.descending) {
    query.order = 'ledger DESC';
  } else {
    query.order = 'ledger ASC';
  }

  self.models.outgoing_transactions.findAll(query).complete(function(err, results){
    if (err) {
      callback(err);
      return;
    }

    var failed_transactions = [];

    if (results) {
      failed_transactions = _.map(results, outgoingTransactionEntryToTransaction);
    }

    callback(null, failed_transactions);
  });
};

/**
 *  Once outgoing_transactions have been validated they can be moved to the client_resource_id_records table
 *  and deleted from the outgoing_transactions table, because they have been written into the Ripple Ledger.
 *  The client_resource_id_records table merely maps the client_resource_id to the transaction hash for lookup later 
 */
DatabaseInterface.prototype.moveValidatedTransactionsToPermanentTable = function(callback) {
  var self = this;

  self.models.outgoing_transactions.findAll({
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

      self.models.client_resource_id_records.findOrCreate({
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

        // Once the transaction has been saved to the client_resource_id_records table
        // it may be deleted from the outgoing_transactions table
        // if (entry.created) {
          outgoing_transactions_entry.destroy().complete(function(err){
            if (err) {
              async_callback(err);
              return;
            }
            async_callback(null, num_moved + 1);
          });

      });

    }, callback);
  });
};



function outgoingTransactionEntryToTransaction(db_entry) {
  var values = db_entry.values || db_entry;

  // Convert to format similar to getTx call
  var transaction = JSON.parse(values.tx_json);
  transaction.meta = transaction.meta || {};
  transaction.meta.TransactionResult = values.rippled_result;
  transaction.ledger_index = values.ledger;
  transaction.hash = values.hash;
  transaction.finalized = values.finalized;
  transaction.date = ripple.utils.fromTimestamp(new Date(values.updated_at || db_entry.updated_at));
  transaction.client_resource_id = values.client_resource_id;
  transaction.from_local_db = true;

  return transaction;
}


module.exports = DatabaseInterface;

