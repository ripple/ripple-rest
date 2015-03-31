/* eslint-disable max-len */
'use strict';
var assert = require('assert');
var async = require('async');
var dbinterface = require('../../server/api').db;
var fixtures = require('./fixtures').database;
var _ = require('lodash');

suite('unit - database', function() {
  setup(function(done) {
    dbinterface.clear().then(function() {
      dbinterface.init(done);
    });
  });

  test('saveTransaction() -- unsubmitted', function(done) {
    dbinterface.saveTransaction(fixtures.unsubmittedTransaction).then(function() {
      dbinterface.db(fixtures.tableName)
      .where({client_resource_id: fixtures.unsubmittedTransaction.clientID})
      .then(function(res) {
        assert.deepEqual(res, [{
          source_account: fixtures.unsubmittedTransaction.tx_json.Account,
          type: fixtures.unsubmittedTransaction.tx_json.TransactionType.toLowerCase(),
          client_resource_id: fixtures.unsubmittedTransaction.clientID,
          hash: fixtures.unsubmittedTransaction.submittedIDs[0],
          submitted_hashes: JSON.stringify(fixtures.unsubmittedTransaction.submittedIDs),
          ledger: fixtures.unsubmittedTransaction.submitIndex,
          state: fixtures.unsubmittedTransaction.state,
          finalized: Number(fixtures.unsubmittedTransaction.finalized),
          rippled_result: null
        }]);
        done();
      });
    });
  });
  test('saveTransaction() -- pending', function(done) {
    dbinterface.saveTransaction(fixtures.pendingTransaction).then(function() {
      dbinterface.db(fixtures.tableName)
      .where({client_resource_id: fixtures.pendingTransaction.clientID})
      .then(function(res) {
        assert.deepEqual(res, [{
          source_account: fixtures.pendingTransaction.tx_json.Account,
          type: fixtures.pendingTransaction.tx_json.TransactionType.toLowerCase(),
          client_resource_id: fixtures.pendingTransaction.clientID,
          hash: fixtures.pendingTransaction.submittedIDs[0],
          submitted_hashes: JSON.stringify(fixtures.pendingTransaction.submittedIDs),
          ledger: fixtures.pendingTransaction.submitIndex,
          state: fixtures.pendingTransaction.state,
          finalized: Number(fixtures.pendingTransaction.finalized),
          rippled_result: fixtures.pendingTransaction.result.engine_result
        }]);
        done();
      });
    });
  });
  test('saveTransaction() -- validated', function(done) {
    dbinterface.saveTransaction(fixtures.validatedTransaction).then(function() {
      dbinterface.db(fixtures.tableName)
      .where({client_resource_id: fixtures.validatedTransaction.clientID})
      .then(function(res) {
        assert.deepEqual(res, [{
          source_account: fixtures.validatedTransaction.tx_json.Account,
          type: fixtures.validatedTransaction.tx_json.TransactionType.toLowerCase(),
          client_resource_id: fixtures.validatedTransaction.clientID,
          hash: fixtures.validatedTransaction.submittedIDs[0],
          submitted_hashes: JSON.stringify(fixtures.validatedTransaction.submittedIDs),
          ledger: fixtures.validatedTransaction.result.ledger_index,
          state: fixtures.validatedTransaction.state,
          finalized: Number(fixtures.validatedTransaction.finalized),
          rippled_result: fixtures.validatedTransaction.result.engine_result
        }]);
        done();
      });
    });
  });
  test('saveTransaction() -- changing state', function(done) {
    function saveUnsubmitted(callback) {
      dbinterface.saveTransaction(fixtures.unsubmittedTransaction).then(function() {
        dbinterface.db(fixtures.tableName)
        .where({client_resource_id: fixtures.unsubmittedTransaction.clientID})
        .then(function(res) {
          assert.deepEqual(res, [{
            source_account: fixtures.unsubmittedTransaction.tx_json.Account,
            type: fixtures.unsubmittedTransaction.tx_json.TransactionType.toLowerCase(),
            client_resource_id: fixtures.unsubmittedTransaction.clientID,
            hash: fixtures.unsubmittedTransaction.submittedIDs[0],
            submitted_hashes: JSON.stringify(fixtures.unsubmittedTransaction.submittedIDs),
            ledger: fixtures.unsubmittedTransaction.submitIndex,
            state: fixtures.unsubmittedTransaction.state,
            finalized: Number(fixtures.unsubmittedTransaction.finalized),
            rippled_result: null
          }]);
          callback();
        });
      });
    }
    function savePending(callback) {
      dbinterface.saveTransaction(fixtures.pendingTransaction).then(function() {
        dbinterface.db(fixtures.tableName)
        .where({client_resource_id: fixtures.pendingTransaction.clientID})
        .then(function(res) {
          assert.deepEqual(res, [{
            source_account: fixtures.pendingTransaction.tx_json.Account,
            type: fixtures.pendingTransaction.tx_json.TransactionType.toLowerCase(),
            client_resource_id: fixtures.pendingTransaction.clientID,
            hash: fixtures.pendingTransaction.submittedIDs[0],
            submitted_hashes: JSON.stringify(fixtures.pendingTransaction.submittedIDs),
            ledger: fixtures.pendingTransaction.submitIndex,
            state: fixtures.pendingTransaction.state,
            finalized: Number(fixtures.pendingTransaction.finalized),
            rippled_result: fixtures.pendingTransaction.result.engine_result
          }]);
          callback();
        });
      });
    }
    async.series([saveUnsubmitted, savePending], done);
  });
  test('saveTransaction() -- missing transaction', function() {
    assert.throws(function() {
      dbinterface.saveTransaction();
    });
  });
  test('saveTransaction() -- missing transaction state', function() {
    var transaction = _.extend({ }, fixtures.unsubmittedTransaction);
    transaction.state = undefined;
    assert.throws(function() {
      dbinterface.saveTransaction(transaction);
    }, /Transaction missing property: state/);
  });
  test('saveTransaction() -- missing transaction tx_json', function() {
    var transaction = _.extend({ }, fixtures.unsubmittedTransaction);
    transaction.tx_json = undefined;
    assert.throws(function() {
      dbinterface.saveTransaction(transaction);
    }, /Transaction missing property: tx_json/);
  });
  test('saveTransaction() -- missing transaction TransactionType', function() {
    var transaction = _.extend({ }, fixtures.unsubmittedTransaction);
    transaction.tx_json = _.extend({ }, transaction.tx_json);
    transaction.tx_json.TransactionType = undefined;
    assert.throws(function() {
      dbinterface.saveTransaction(transaction);
    }, /Transaction missing property: tx_json\.TransactionType/);
  });
  test('saveTransaction() -- missing transaction Account', function() {
    var transaction = _.extend({ }, fixtures.unsubmittedTransaction);
    transaction.tx_json = _.extend({ }, transaction.tx_json);
    transaction.tx_json.Account = undefined;
    assert.throws(function() {
      dbinterface.saveTransaction(transaction);
    }, /Transaction missing property: tx_json\.Account/);
  });
  test('saveTransaction() -- missing transaction submitIndex', function() {
    var transaction = _.extend({ }, fixtures.unsubmittedTransaction);
    transaction.submitIndex = undefined;
    assert.throws(function() {
      dbinterface.saveTransaction(transaction);
    }, /Transaction missing property: submitIndex/);
  });
  test('saveTransaction() -- missing transaction submittedIDs', function() {
    var transaction = _.extend({ }, fixtures.unsubmittedTransaction);
    transaction.submittedIDs = undefined;
    assert.throws(function() {
      dbinterface.saveTransaction(transaction);
    }, /Transaction missing property: submittedIDs/);
  });
  test('getTransaction() -- by hash', function(done) {
    function saveUnsubmitted(callback) {
      dbinterface.saveTransaction(fixtures.unsubmittedTransaction, callback);
    }
    function getTransaction(callback) {
      dbinterface.getTransaction({
        hash: fixtures.unsubmittedTransaction.submittedIDs[0]
      }, function(err, res) {
        assert.ifError(err);
        assert.deepEqual(res, {
          source_account: fixtures.unsubmittedTransaction.tx_json.Account,
          type: fixtures.unsubmittedTransaction.tx_json.TransactionType.toLowerCase(),
          client_resource_id: fixtures.unsubmittedTransaction.clientID,
          hash: fixtures.unsubmittedTransaction.submittedIDs[0],
          submitted_hashes: JSON.stringify(fixtures.unsubmittedTransaction.submittedIDs),
          ledger: fixtures.unsubmittedTransaction.submitIndex,
          state: fixtures.unsubmittedTransaction.state,
          finalized: Number(fixtures.unsubmittedTransaction.finalized),
          rippled_result: null
        });
        callback();
      });
    }
    async.series([saveUnsubmitted, getTransaction], done);
  });
  test('getTransaction() -- by hash -- invalid hash', function() {
    assert.throws(function() {
      dbinterface.getTransaction({hash: ''});
    }, /Invalid or missing parameter: transaction hash/);
  });
  test('getTransaction() -- by client_resource_id', function(done) {
    function saveUnsubmitted(callback) {
      dbinterface.saveTransaction(fixtures.unsubmittedTransaction, callback);
    }
    function getTransaction(callback) {
      dbinterface.getTransaction({
        client_resource_id: fixtures.unsubmittedTransaction.clientID
      }, function(err, res) {
        assert.ifError(err);
        assert.deepEqual(res, {
          source_account: fixtures.unsubmittedTransaction.tx_json.Account,
          type: fixtures.unsubmittedTransaction.tx_json.TransactionType.toLowerCase(),
          client_resource_id: fixtures.unsubmittedTransaction.clientID,
          hash: fixtures.unsubmittedTransaction.submittedIDs[0],
          submitted_hashes: JSON.stringify(fixtures.unsubmittedTransaction.submittedIDs),
          ledger: fixtures.unsubmittedTransaction.submitIndex,
          state: fixtures.unsubmittedTransaction.state,
          finalized: Number(fixtures.unsubmittedTransaction.finalized),
          rippled_result: null
        });
        callback();
      });
    }
    async.series([saveUnsubmitted, getTransaction], done);
  });
  test('getTransaction() -- by client_resource_id -- invalid id', function() {
    assert.throws(function() {
      dbinterface.getTransaction({client_resource_id: ''});
    }, /Invalid or missing parameter: client_resource_id/);
  });
  test('getTransaction() -- by identifier -- hash', function(done) {
    function saveUnsubmitted(callback) {
      dbinterface.saveTransaction(fixtures.unsubmittedTransaction, callback);
    }
    function getTransaction(callback) {
      dbinterface.getTransaction({
        identifier: fixtures.unsubmittedTransaction.submittedIDs[0]
      }, function(err, res) {
        assert.ifError(err);
        assert.deepEqual(res, {
          source_account: fixtures.unsubmittedTransaction.tx_json.Account,
          type: fixtures.unsubmittedTransaction.tx_json.TransactionType.toLowerCase(),
          client_resource_id: fixtures.unsubmittedTransaction.clientID,
          hash: fixtures.unsubmittedTransaction.submittedIDs[0],
          submitted_hashes: JSON.stringify(fixtures.unsubmittedTransaction.submittedIDs),
          ledger: fixtures.unsubmittedTransaction.submitIndex,
          state: fixtures.unsubmittedTransaction.state,
          finalized: Number(fixtures.unsubmittedTransaction.finalized),
          rippled_result: null
        });
        callback();
      });
    }
    async.series([saveUnsubmitted, getTransaction], done);
  });
  test('getTransaction() -- by identifier -- client_resource_id', function(done) {
    function saveUnsubmitted(callback) {
      dbinterface.saveTransaction(fixtures.unsubmittedTransaction, callback);
    }
    function getTransaction(callback) {
      dbinterface.getTransaction({
        identifier: fixtures.unsubmittedTransaction.clientID
      }, function(err, res) {
        assert.ifError(err);
        assert.deepEqual(res, {
          source_account: fixtures.unsubmittedTransaction.tx_json.Account,
          type: fixtures.unsubmittedTransaction.tx_json.TransactionType.toLowerCase(),
          client_resource_id: fixtures.unsubmittedTransaction.clientID,
          hash: fixtures.unsubmittedTransaction.submittedIDs[0],
          submitted_hashes: JSON.stringify(fixtures.unsubmittedTransaction.submittedIDs),
          ledger: fixtures.unsubmittedTransaction.submitIndex,
          state: fixtures.unsubmittedTransaction.state,
          finalized: Number(fixtures.unsubmittedTransaction.finalized),
          rippled_result: null
        });
        callback();
      });
    }
    async.series([saveUnsubmitted, getTransaction], done);
  });
  test('getTransaction() -- by identifier -- invalid identifier', function() {
    assert.throws(function() {
      dbinterface.getTransaction({
        identifier: ''
      });
    }, /Invalid or missing parameter: transaction identifier/);
  });
});
