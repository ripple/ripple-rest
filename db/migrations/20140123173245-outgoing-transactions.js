var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('outgoing_transactions', {

    /* Auto-generated */
    created_at: {type: 'timestamp'},
    updated_at: {type: 'timestamp'},

    /* Added initially */
    initial_hash: {type: 'text', primaryKey: true},
    submitted_at_ledger: {type: 'int'},
    src_address: {type: 'text'},
    tx_type: {type: 'text'},
    tx_state: {type: 'text'}, // Updated after submission

    /* Added after submission */
    tx_result: {type: 'text'},
    tx_hash: {type: 'text'}

  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('outgoing_transactions', callback)
};