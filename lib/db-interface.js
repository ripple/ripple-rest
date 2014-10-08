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
  assert.strictEqual(typeof filePath, 'string', 'Invalid database path');

  this.initialized = false;
  this.filePath = filePath;

  this.db = knex({
    dialect: 'sqlite3',
    connection: {
      filename: filePath
    },
    pool: {
      refreshIdle: false
    }
  });

  /**
   * Dirty hack to make in-memory sqlite work
   * 10/07/2014
   * @geertweening
   *
   * problem: knex would lose its sqlite3 database connection after 30 secs
   * which would cause sqlite3 to remove the in-memory database and create
   * a new fresh one once a new connection was established
   *
   * reason: knex uses generic-pool-redux package as its pool manager
   * which has a default timeout of 30secs. It can keep a pool of 1 connection
   * and not refresh idles, but there's a bug in the option logic that won't
   * allow a pool with min and max set to 1
   *
   * solution: have generic-pool-redux fix this logic
   * for now we'll keep this dirty hack and pin the knex version
   *
   * knex: 0.7.3
   * generic-pool-redux: 0.1.0
   */
  this.db.client.pool.genericPool.min = 1;

  this.init();
};

const DI = DatabaseInterface.prototype;

DI.__proto__ = process.EventEmitter.prototype;

/**
 * Initialize database tables
 *
 * @param [Function] callback
 * @return {Promise}
 */

DI.init = function(callback) {
  var self = this;

  if (this.initialized) {
    logger.info('[DB] Warning: Re-initializing');
  }

  // Create transaction_history table if it does not already exist
  var promise = self.db.schema
  .hasTable('transaction_history')
  .then(function(exists) {
    if (!exists) {
      return self.db.schema
      .createTable('transaction_history', function(table) {
        table.text('source_account').notNullable();
        table.text('type').notNullable();
        table.text('client_resource_id').primary().notNullable();
        table.text('hash').unique().notNullable();
        table.text('submitted_hashes').notNullable();
        table.integer('ledger').notNullable();
        table.text('state').notNullable();
        table.boolean('finalized').notNullable();
        table.text('rippled_result').nullable();
      });
    }
  })
  .then(function(res) {
    self.initialized = true;
    self.emit('ready');

    logger.info('[DB] Initialized: ' + self.filePath);

    (callback || new Function)(null, res);

    return res;
  })
  .caught(function(err) {
    logger.info('[DB] Error. Failed to initialize database:' + err);

    (callback || new Function)(err);
  });

  return promise;
};

/**
 * Clear the database. For testing
 *
 * @param [Function] callback
 * @return {Promise}
 */

DI.clear = function(callback) {
  var self = this;

  var promise = self.db.schema
  .dropTableIfExists('transaction_history')
  .then(function(res) {
    (callback || new Function)(null, res);

    return res;
  })
  .caught(function(err) {
    (callback || new Function)(err);
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

  try {
    assert.strictEqual(typeof transaction, 'object');
    assert(transaction.state, 'Transaction missing property: state');
    assert(transaction.tx_json, 'Transaction missing property: tx_json');
    assert(transaction.tx_json.TransactionType,
      'Transaction missing property: tx_json.TransactionType');
    assert(transaction.tx_json.Account,
      'Transaction missing property: tx_json.Account');
    //assert(transaction.clientID, 'Transaction missing property: clientID');
    assert(transaction.submitIndex,
      'Transaction missing property: submitIndex');
    assert(transaction.submittedIDs,
      'Transaction missing property: submittedIDs');
  } catch(err) {
    return console.log('[DB] Save transaction error. ' + err);
  }

  var self = this;

  if (!transaction.result) {
    transaction.result = { };
  }

  var result = transaction.result || { };

  var txData = {
    state: transaction.state,
    type: transaction.tx_json.TransactionType.toLowerCase(),
    source_account: transaction.tx_json.Account,
    client_resource_id: transaction.clientID,
    submitted_hashes: JSON.stringify(transaction.submittedIDs),
    finalized: transaction.finalized,
  };

  txData.hash = result.transaction_hash !== void(0)
  ? result.transaction_hash
  : transaction.submittedIDs[0];

  txData.ledger = result.ledger_index !== void(0)
  ? result.ledger_index
  : transaction.submitIndex;

  if (result.engine_result) {
    txData.rippled_result = result.engine_result;
  }

  var txQuery = {
    source_account: txData.source_account,
    type: txData.type,
    client_resource_id: txData.client_resource_id
  };

  var promise = this.db('transaction_history')
  .where(txQuery)
  .then(function(res) {
    if (res.length) {
      return self.db('transaction_history')
      .where(txQuery)
      .update(txData);
    } else {
      return self.db('transaction_history')
      .insert(txData);
    }
  })
  .then(function(res) {
    (callback || new Function)(null, res);

    var info = txData.hash + ': ' + txData.rippled_result;

    if (txData.finalized) {
      logger.info('[DB] Saved transaction: finalized: ' + info);
    } else if (txData.state === 'submitted') {
      logger.info('[DB] Saved transaction: submitted: ' + info);
    }

    return res;
  })
  .caught(function(err) {
    logger.info('[DB] Error. Cannot save transaction to database: '
                + err);

    (callback || new Function)(err);
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
  // Do not attempt to resubmit persisted pending transactions
  return callback(null, [ ]);
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

  var promise = this.db('transaction_history')
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
    if (txEntry) {
      // Boolean is represented as 0 or 1 in sqlite
      txEntry.finalized = Boolean(txEntry.finalized);
    }
    return txEntry;
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
 * Get transaction from database
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

  var promise = this.db('transaction_history')
  .where(txQuery)
  .then(function(txEntry) {
    txEntry = txEntry[0];

    if (txEntry) {
      // Boolean is represented as 0 or 1 in sqlite
      txEntry.finalized = Boolean(txEntry.finalized);
    }

    (callback || new Function)(null, txEntry);

    return txEntry;
  })
  .caught(function(err) {
    (callback || new Function)(err);
  });

  return promise;
};

/**
 * DEPRECATED
 */

DI.convertOutgoingTransaction = function(txEntry) {
  // Convert to format similar to getTx call
  var transaction = JSON.parse(txEntry.tx_json);
  transaction.meta = transaction.meta || { };
  transaction.meta.TransactionResult = txEntry.rippled_result;
  transaction.ledger_index = txEntry.ledger;
  transaction.hash = txEntry.hash;
  transaction.finalized = Boolean(txEntry.finalized);
  //transaction.date = ripple.utils.fromTimestamp(new Date(txEntry.updated_at));
  transaction.client_resource_id = txEntry.client_resource_id;

  // Note that this value is used by notifications.js
  transaction.from_local_db = true;

  return transaction;
};

if (config.get('NODE_ENV') === 'test') {
  module.exports = new DatabaseInterface(':memory:');
} else {
  module.exports = new DatabaseInterface(config.get('db_path'));
}
