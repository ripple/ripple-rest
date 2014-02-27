var dbm   = require('db-migrate');
var type  = dbm.dataType;
var async = require('async');

exports.up = function(db, callback) {

  var steps = [
    function(async_callback) {
      db.removeColumn('outgoing_transactions', 'initial_hash', async_callback);
    },
    function(async_callback) {
      db.renameColumn('outgoing_transactions', 'result', 'rippled_result', async_callback);
    },
    function(async_callback) {
      db.addColumn('outgoing_transactions', 'rippled_result_message', {type: 'text'}, async_callback);
    },
    function(async_callback) {
      db.addColumn('outgoing_transactions', 'submitted_ids', {type: 'text'}, async_callback);
    },
    function(async_callback) {
      db.addColumn('outgoing_transactions', 'submission_attempts', {type: 'int'}, async_callback);
    },
    function(async_callback) {
      db.addColumn('outgoing_transactions', 'source_transaction_id', {type: 'text'}, async_callback);
    },
    function(async_callback) {
      db.changeColumn('outgoing_transactions', 'source_transaction_id', {type: 'text', primaryKey: true}, async_callback);
    },
    function(async_callback) {
      db.changeColumn('outgoing_transactions', 'source_address', {type: 'text', primaryKey: true}, async_callback);
    },
    function(async_callback) {
      db.changeColumn('outgoing_transactions', 'type', {type: 'text', primaryKey: true}, async_callback);
    },
    function(async_callback) {
      db.addColumn('outgoing_transactions', 'tx_json', {type: 'text'}, async_callback);
    }
  ];

  async.series(steps, callback);
  
};

exports.down = function(db, callback) {
  
  var steps = [
    function(async_callback) {
      db.addColumn('outgoing_transactions', 'initial_hash', {type: 'text'}, async_callback);
    },
    function(async_callback) {
      db.renameColumn('outgoing_transactions', 'rippled_result', 'result', async_callback);
    },
    function(async_callback) {
      db.removeColumn('outgoing_transactions', 'rippled_result_message', async_callback);
    },
    function(async_callback) {
      db.removeColumn('outgoing_transactions', 'submitted_ids', async_callback);
    },
    function(async_callback) {
      db.removeColumn('outgoing_transactions', 'submission_attempts', async_callback);
    },
    function(async_callback) {
      db.changeColumn('outgoing_transactions', 'source_address', {type: 'text'}, async_callback);
    },
    function(async_callback) {
      db.removeColumn('outgoing_transactions', 'source_transaction_id', async_callback);
    },
    function(async_callback) {
      db.changeColumn('outgoing_transactions', 'type', {type: 'text'}, async_callback);
    },
    function(async_callback) {
      db.removeColumn('outgoing_transactions', 'tx_json', async_callback);
    }
  ];

  async.series(steps, callback);

};
