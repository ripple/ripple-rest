var dbm   = require('db-migrate');
var type  = dbm.dataType;
var async = require('async');

exports.up = function(db, callback) {

  var steps = [

    function(async_callback) {
      db.removeColumn('outgoing_transactions', 'reported', async_callback);
    },

    function(async_callback) {
      db.renameColumn('outgoing_transactions', 'source_transaction_id', 'client_resource_id', async_callback);
    },

    function(async_callback) {
      db.renameColumn('outgoing_transactions', 'submitted_at_ledger', 'ledger', async_callback);
    },

    function(async_callback) {
      db.addColumn('outgoing_transactions', 'id', {
        type: 'int'
      }, async_callback);
    },

    function(async_callback) {
      db.renameColumn('outgoing_transactions', 'source_address', 'source_account', async_callback);
    },

    function(async_callback) {
      db.addColumn('outgoing_transactions', 'finalized', {type: 'boolean'}, async_callback);
    },

    function(async_callback) {
      db.changeColumn('outgoing_transactions', 'source_account', {type: 'text', primaryKey: true}, async_callback);
    },

    function(async_callback) {
      db.changeColumn('outgoing_transactions', 'client_resource_id', {type: 'text', primaryKey: true}, async_callback);
    },

    function(async_callback) {
      db.changeColumn('outgoing_transactions', 'type', {type: 'text', primaryKey: true}, async_callback);
    },

    function(async_callback) {
      db.runSql('ALTER TABLE outgoing_transactions ADD PRIMARY KEY(source_account, type, client_resource_id);', async_callback);
    }

  ];

  async.series(steps, callback);

};

exports.down = function(db, callback) {

  var steps = [

    function(async_callback) {
      db.changeColumn('outgoing_transactions', 'source_account', {type: 'text', primaryKey: false}, async_callback);
    },

    function(async_callback) {
      db.changeColumn('outgoing_transactions', 'client_resource_id', {type: 'text', primaryKey: false}, async_callback);
    },

    function(async_callback) {
      db.changeColumn('outgoing_transactions', 'type', {type: 'text', primaryKey: false}, async_callback);
    },

    function(async_callback) {
      db.addColumn('outgoing_transactions', 'reported', {
        type: 'boolean',
        defaultValue: false
      }, async_callback);
    },

    function(async_callback) {
      db.renameColumn('outgoing_transactions', 'client_resource_id', 'source_transaction_id', async_callback);
    },

    function(async_callback) {
      db.renameColumn('outgoing_transactions', 'ledger', 'submitted_at_ledger', async_callback);
    },

    function(async_callback) {
      db.removeColumn('outgoing_transactions', 'id', async_callback);
    },

    function(async_callback) {
      db.renameColumn('outgoing_transactions', 'source_account', 'source_address', async_callback);
    },

    function(async_callback) {
      db.removeColumn('outgoing_transactions', 'finalized', async_callback);
    }

  ];

  async.series(steps, callback);

};
