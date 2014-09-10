var _         = require('lodash');
var async     = require('async');
var ripple    = require('ripple-lib');
var sequelize = require('sequelize');
var validator = require('./schema-validator');
var config = require(__dirname+'/config-loader.js');

function DatabaseInterface(database_url) {
  var self = this;

  this.db = require('../db/db-connect')(database_url);

  this.models = { };
  this.models.outgoing_transactions = require('../db/models/outgoing-transactions')(this.db);
  this.models.client_resource_id_records = require('../db/models/client-resource-id-records')(this.db);

  function handleDbSync(err) {
    if (err) {
      throw new Error('Error syncing database models. ' + err);
    }
  };

  this.db.sync({ force: true }).complete(handleDbSync);
};

DatabaseInterface.prototype.saveTransaction = function(transaction_data, callback) {
  var self = this;
  var account = transaction_data.tx_json.Account + ':';
  var hasSourceId = transaction_data.sourceID && transaction_data.sourceID.indexOf(account) === 0;

  if (hasSourceId) {
    transaction_data.sourceID = transaction_data.sourceID.substring(account.length);
  }

  var db_values = {
    state: transaction_data.state,
    tx_json: JSON.stringify(transaction_data.tx_json),
    type: transaction_data.tx_json.TransactionType.toLowerCase(),
    source_account: transaction_data.tx_json.Account,
    client_resource_id: transaction_data.clientID,
    submitted_ids: JSON.stringify(transaction_data.submittedIDs),
    submission_attempts: transaction_data.submissionAttempts,
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

  function findTransaction(callback) {
    self.models.outgoing_transactions.find(query).complete(callback);
  };

  function updateTransaction(db_entry, callback) {
    if (db_entry) {
      db_entry.updateAttributes(db_values).complete(callback);
    } else {
      self.models.outgoing_transactions.create(db_values).complete(callback);
    }
  };

  function makePermanent(db_entry, callback) {
    if (db_entry.values && db_entry.values.finalized) {
      self.moveValidatedTransactionsToPermanentTable(function(err, num_moved) {
        if (err) {
          console.log('Database Error. Error moving validated transactions from outgoing_transactions to client_resource_id_records table. ' + err);
          return;
        }

        console.log(num_moved + ' transactions moved from outgoing_transactions table to client_resource_id_records table.');
      });
    }
    callback(null, null);
  };

  var steps = [
    findTransaction,
    updateTransaction,
    makePermanent
  ];

  async.waterfall(steps, function(err) {
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

  function handlePendingTransactions(err, res) {
    if (err) {
      callback(new Error('Database Error. Cannot query database for pending transactions'));
      return;
    }

    // Reformat for data format expected by ripple-lib
    var results = res.map(function(db_entry) {
      var val = db_entry.values;

      return {
        tx_json: JSON.parse(val.tx_json),
        sourceID: val.client_resource_id,
        submittedIDs: JSON.parse(val.submitted_ids),
        submissionAttempts: val.submission_attempts,
        state: val.state,
        result: {
          engine_result: val.rippled_result,
          engine_result_message: val.rippled_result_message,
          ledger: Number(val.ledger)
        },
        finalized: val.finalized
      };
    });

    callback(null, results);
  };

  this.models.outgoing_transactions.findAll({
    where: sequelize.or(
      { state: 'pending' },
      { state: 'unsubmitted' }
    )
  }).complete(handlePendingTransactions);
};

DatabaseInterface.prototype.deleteTransaction = function(identifiers, callback) {
  var self = this;

  function handleTransactionDelete(err, res) {
    if (err) {
      callback(err);
    } else if (res) {
      res.destroy().complete(callback);
    }
  };

  this.models.outgoing_transactions.find({
    where: identifiers
  }).complete(handleTransactionDelete);
};

DatabaseInterface.prototype.getTransaction = function(opts, callback) {
  var self = this;

  if (opts.identifier) {
    if (validator.isValid(opts.identifier, 'Hash256')) {
      opts.hash = opts.identifier;
    } else if (validator.isValid(opts.identifier, 'ResourceId')) {
      opts.client_resource_id = opts.identifier;
    } else {
      callback(new Error('Invalid Parameter: hash or client_resource_id. Must provide a transaction hash or a client_resource_id to lookup a notification'));
      return;
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

  function findResourceId(callback) {
    self.models.client_resource_id_records.find(query).complete(callback);
  };

  function findOutgoingTransaction(db_entry, callback) {
    if (db_entry) {
      callback(null, db_entry);
    } else {
      self.models.outgoing_transactions.find(query).complete(callback);
    }
  };

  function convertTransaction(db_entry, callback) {
    if (!db_entry) {
      return callback(null);
    }

    var values = db_entry.values;

    if (values && values.tx_json) {
      if (!values.finalized) {
        values.state = 'pending';
      }
      values.transaction = outgoingTransactionEntryToTransaction(values);
    }

    callback(null, values);
  };

  var steps = [
    findResourceId,
    findOutgoingTransaction,
    convertTransaction
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
      query.where.ledger = { };
    }
    query.where.ledger.gte = String(opts.ledger_index_min);
  }

  if (opts.ledger_index_max && opts.ledger_index_max !== -1) {
    if (!query.where.ledger) {
      query.where.ledger = { };
    }
    query.where.ledger.lte = String(opts.ledger_index_max);
  }

  if (opts.earliest_first) {
    query.order = 'ledger ASC';
  } else {
    query.order = 'ledger DESC';
  }

  function handleFailedTransactions(err, results) {
    if (err) {
      return callback(err);
    }

    var failed_transactions = [ ];

    if (results) {
      failed_transactions = _.map(results, outgoingTransactionEntryToTransaction);
    }

    callback(null, failed_transactions);
  };

  this.models.outgoing_transactions.findAll(query).complete(handleFailedTransactions);
};

/**
 *  Once outgoing_transactions have been validated they can be moved to the client_resource_id_records table
 *  and deleted from the outgoing_transactions table, because they have been written into the Ripple Ledger.
 *  The client_resource_id_records table merely maps the client_resource_id to the transaction hash for lookup later 
 */

DatabaseInterface.prototype.moveValidatedTransactionsToPermanentTable = function(callback) {
  var self = this;

  function findOrCreate(num_moved, entry, async_callback) {
    self.models.client_resource_id_records.findOrCreate({
      source_account:     entry.values.source_account,
      type:               entry.values.type,
      client_resource_id: entry.values.client_resource_id,
      hash:               entry.values.hash,
      ledger:             entry.values.ledger,
      state:              entry.values.state,
      result:             entry.values.rippled_result
    }).complete(function(err, entry) {
      if (err) {
        callback(new Error('Database Error. Cannot update client_resource_id_records. ' + err));
        return;
      }

      // Once the transaction has been saved to the client_resource_id_records table
      // it may be deleted from the outgoing_transactions table
      // if (entry.created) {
      entry.destroy().complete(function(err) {
        if (err) {
          async_callback(err);
        } else {
          async_callback(null, num_moved + 1);
        }
    });
    });
  };

  function handleTransactions(err, outgoingTransactions) {
    if (err) {
      callback(new Error('Database Error. Cannot query database for validated transactions. ' + err));
    } else {
      // Use reduce instead of each to count number of entries moved
      async.reduce(outgoingTransactions, 0, findOrCreate, callback);
    }
  };

  this.models.outgoing_transactions.findAll({
    where: {
      state: 'validated',
      finalized: true
    }
  }).complete(handleTransactions);
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

  // Note that this value is used by notifications.js
  transaction.from_local_db = true;

  return transaction;
};

module.exports = new DatabaseInterface(config.get('DATABASE_URL'));

