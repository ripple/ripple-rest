var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('outbound_txs', {

    /* Auto-generated */
    createdAt: {type: 'timestamp'},
    updatedAt: {type: 'timestamp'},

    /* Added initially */
    initialHash: {type: 'text', primaryKey: true},
    submittedAtTime: {type: 'datetime'},
    submittedAtLedger: {type: 'int'},
    srcAddress: {type: 'text'},
    txType: {type: 'text'},
    txState: {type: 'text'}, // Updated after submission

    /* Added after submission */
    txResult: {type: 'text'},
    txHash: {type: 'text'}

  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('outbound_txs', callback)
};
