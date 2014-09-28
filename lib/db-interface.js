var async = require('async');
var assert = require('assert');
var Promise = require('bluebird');
var knex = require('knex');
var ripple = require('ripple-lib');
var validator = require('./schema-validator');
var config = require('./config-loader.js');
var logger = require('./logger.js').logger;

/**
 * @constructor DatabaseInterface
 * @param {String} filePath
 */

function DatabaseInterface(filePath) {
  assert.strictEqual(typeof filePath, 'string');

  this.initialized = false;
  this.filePath = filePath;
  this.db = knex({
    dialect: 'sqlite3',
    connection: {
      filename: filePath
    }
  });

  this.init();
};

const DI = DatabaseInterface.prototype;

DI.__proto__ = process.EventEmitter.prototype;

/**
 * Initialize database tables
 *
 * @return {Promise}
 */

DI.init = function() {
  var self = this;

  if (this.initialized) {
    logger.info('Database Warning. Re-initializing');
  }

  function createClientResourceIDsTable() {
    // Create client_resource_ids table if it does not already exist
    var promise = self.db.schema
    .hasTable('client_resource_ids')
    .then(function(exists) {
      if (!exists) {
        return self.db.schema
        .createTable('client_resource_ids', function(table) {
          table.text('source_account').notNullable();
          table.text('type').notNullable();
          table.text('client_resource_id').primary().notNullable();
          table.text('hash').unique().notNullable();
          table.integer('ledger').unsigned().notNullable();
          table.text('state').notNullable();
          table.text('result').notNullable();
        });
      }
    });

    return promise;
  };

  function createOutgoingTransactionsTable() {
    // Drop outgoing_transactions table if it exists, create it
    var promise = self.db.schema
    .dropTableIfExists('outgoing_transactions')
    .then(function() {
      return self.db.schema
      .createTable('outgoing_transactions', function(table) {
        table.integer('ledger').nullable();
        table.text('source_account').notNullable();
        table.text('client_resource_id').primary().notNullable();
        table.text('tx_json').notNullable();
        table.text('type').notNullable();
        table.text('state').notNullable();
        table.text('submitted_ids').notNullable();
        table.integer('submission_attempts').notNullable();
        table.text('rippled_result').nullable();
        table.text('rippled_result_message').nullable();
        table.text('hash').unique();
        table.boolean('finalized').notNullable();
      });
    });

    return promise;
  };

  var promise = Promise.join(
    createClientResourceIDsTable(),
    createOutgoingTransactionsTable()
  )
  .then(function() {
    self.initialized = true;
    self.emit('ready');
    logger.info('Database initialized: ' + self.filePath);
  })
  .caught(function(err) {
    logger.info('Database Error. Failed to initialize database:' + err);
  });

  return promise;
};

/**
 * Save transaction to temporary table. If new validated transactions
 * are detected, move them to permanent table
 *
 * @param {Object} transaction
 * @param [Function] callback
 * @return {Promise}
 */

DI.saveTransaction = function(transaction, callback) {
  assert.strictEqual(typeof transaction, 'object');
  assert(transaction.state, 'Transaction missing property: state');
  assert(transaction.tx_json, 'Transaction missing property: tx_json');
  assert(transaction.tx_json.TransactionType,
         'Transaction missing property: tx_json.TransactionType');
  assert(transaction.tx_json.Account,
         'Transaction missing property: tx_json.Account');
  //assert(transaction.clientID, 'Transaction missing property: clientID');
  assert(transaction.submittedIDs,
         'Transaction missing property: submittedIDs');

  var self = this;

  if (!transaction.result) {
    transaction.result = { };
  }

  var txData = {
    state: transaction.state,
    tx_json: JSON.stringify(transaction.tx_json),
    type: transaction.tx_json.TransactionType.toLowerCase(),
    source_account: transaction.tx_json.Account,
    client_resource_id: transaction.clientID,
    submitted_ids: JSON.stringify(transaction.submittedIDs),
    submission_attempts: transaction.submissionAttempts || 0,
    rippled_result: transaction.result.engine_result,
    rippled_result_message: transaction.result.engine_result_message,
    hash: transaction.submittedIDs[0],
    finalized: transaction.finalized,
    ledger: transaction.result.ledger_index
  };

  var txQuery = {
    source_account: txData.source_account,
    type: txData.type,
    client_resource_id: txData.client_resource_id
  };

  var promise = this.db('outgoing_transactions')
  .where(txQuery)
  .then(function(res) {
    if (res.length) {
      return self.db('outgoing_transactions')
      .where(txQuery)
      .update(txData);
    } else {
      return self.db('outgoing_transactions')
      .insert(txData);
    }
  })
  .then(function(res) {
    (callback || new Function)(null, res);

    if (txData.finalized) {
      return self.moveValidatedTransactions();
    }

    return res;
  })
  .caught(function(err) {
    logger.info('Database Error. Cannot save transaction to database: ' + err);
    (callback || new Function)(err);
  });

  return promise;
};

/**
 * Move validated transactions from temporary table to permanent table
 *
 * @return {Promise}
 */

DI.moveValidatedTransactions = function() {
  var self = this;

  // Move validated transactions to permanent table
  var validatedQuery = {
    state: 'validated',
    finalized: true
  };

  var promise = this.db('outgoing_transactions')
  .select('*')
  .where(validatedQuery)
  .map(function(validatedEntry) {
    var resourceIDQuery = {
      source_account: validatedEntry.source_account,
      type: validatedEntry.type,
      client_resource_id: validatedEntry.client_resource_id,
      hash: validatedEntry.hash,
      ledger: validatedEntry.ledger,
      state: validatedEntry.state,
      result: validatedEntry.rippled_result
    };

    return self.db('client_resource_ids')
    .whereNotExists(resourceIDQuery)
    .insert(resourceIDQuery);
  })
  .then(function(res) {
    if (res.length) {
      return self.db('outgoing_transactions')
      .where(validatedQuery)
      .del();
    } else {
      return 0;
    }
  })
  .then(function(res) {
    if (res) {
      logger.info('Moved transactions from outgoing_transactions table to '
                  + 'client_resource_id_records table: ' + res);
    }
  })
  .caught(function(err) {
    logger.info('Database Error. Error moving validated transactions from '
                + 'outgoing_transactions to client_resource_id_records table: '
                + err);
  });

  return promise;
};

/**
 * Get pending transactions from temporary table
 *
 * @param [Function] callback
 * @return {Promise}
 */

DI.getPendingTransactions = function(callback) {
  var self = this;

  var promise = this.db('outgoing_transactions')
  .select('*')
  .where(function() {
    this.where('state', 'pending')
        .orWhere('state', 'unsubmitted');
  })
  .map(function(res) {
    return {
      tx_json: JSON.parse(res.tx_json),
      sourceID: res.client_resource_id,
      submittedIDs: JSON.parse(res.submitted_ids),
      submissionAttempts: res.submission_attempts,
      state: res.state,
      result: {
        engine_result: res.rippled_result,
        engine_result_message: res.rippled_result_message,
        ledger: Number(res.ledger)
      },
      finalized: Boolean(res.finalized)
    };
  })
  .then(function(res) {
    (callback || new Function)(null, res);
    return res;
  })
  .caught(function(err) {
    //console.log('Failed to get pending transactions', err);
    (callback || new Function)(err);
  });

  return promise;
};

/**
 * Get failed transactions from temporary table
 *
 * @param {Object} options
 * @param [Function] callback
 * @return {Promise}
 */

DI.getFailedTransactions = function(options, callback) {
  assert.strictEqual(typeof options, 'object');
  assert.strictEqual(typeof options.account, 'string');
  assert(ripple.UInt160.is_valid(options.account),
         'Specified account is invalid');

   var self = this;

  var promise = this.db('outgoing_transactions')
  .where(function() {
    var failedQuery = this.where('state', 'failed')
    .andWhere('finalized', true)
    .andWhere('source_account', options.account);

    if (options.type) {
      failedQuery.andWhere('type', options.type);
    }

    if (options.ledger_index_min && options.ledger_index_min !== -1) {
      failedQuery.andWhere('ledger', '>=', options.ledger_index_min);
    }
    if (options.ledger_index_max && options.ledger_index_max !== -1) {
      failedQuery.andWhere('ledger', '<=', options.ledger_index_max);
    }
  })
  .orderBy('ledger', options.earliest_first ? 'asc' : 'desc')
  .map(function(txEntry) {
    return self.convertOutgoingTransaction(txEntry);
  })
  .then(function(txEntries) {
    (callback || new Function)(null, txEntries);
    return txEntries;
  })
  .caught(function(err) {
    (callback || new Function)(err);
  });

  return promise;
};

/**
 * Get transaction from permanent or temporary table
 *
 * @param {Object} options
 * @param [Function] callback
 * @return {Promise}
 */

DI.getTransaction = function(options, callback) {
  assert.strictEqual(typeof options, 'object');

  var self = this;

  var identifier = options.identifier
  || options.client_resource_id
  || options.hash;

  assert(identifier, 'Missing parameter: transaction identifier');

  var txQuery = { };

  if (validator.isValid(identifier, 'Hash256')) {
    txQuery.hash = identifier;
  } else if (validator.isValid(identifier, 'ResourceId')) {
    txQuery.client_resource_id = identifier;
  }

  assert(txQuery.hash || txQuery.client_resource_id,
         'Invalid parameter: transaction identifier');

  var promise = this.db('client_resource_ids')
  .where(txQuery)
  .then(function(res) {
    if (res.length) {
      return res;
    } else {
      return self.db('outgoing_transactions')
      .where(txQuery);
    }
  })
  .then(function(txEntry) {
    txEntry = txEntry[0];

    if (txEntry && txEntry.tx_json) {
      txEntry.finalized = Boolean(txEntry.finalized);
      txEntry.transaction = self.convertOutgoingTransaction(txEntry);
      if (!txEntry.finalized) {
        txEntry.state = 'pending';
      }
    }

    return txEntry;
  })
  .then(function(txEntry) {
    (callback || new Function)(null, txEntry);
    return txEntry;
  })
  .caught(function(err) {
    (callback || new Function)(err);
  });

  return promise;
};

DI.convertOutgoingTransaction = function(txEntry) {
  // Convert to format similar to getTx call
  var transaction = JSON.parse(txEntry.tx_json);
  transaction.meta = transaction.meta || { };
  transaction.meta.TransactionResult = txEntry.rippled_result;
  transaction.ledger_index = txEntry.ledger;
  transaction.hash = txEntry.hash;
  transaction.finalized = Boolean(txEntry.finalized);
  transaction.date = ripple.utils.fromTimestamp(new Date(txEntry.updated_at));
  transaction.client_resource_id = txEntry.client_resource_id;

  // Note that this value is used by notifications.js
  transaction.from_local_db = true;

  return transaction;
};

if (config.get('NODE_ENV') === 'test') {
  module.exports = new DatabaseInterface(':memory:');
} else {
  module.exports = new DatabaseInterface(
    config.get('database')[config.get('database_enabled')]
  );
}
