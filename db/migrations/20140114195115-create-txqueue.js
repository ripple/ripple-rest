var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('txqueue', {

    /* Auto-generated */
    id: {type: 'int', autoIncrement: true, primaryKey: true},

    /* Added initially */
    initialHash: {type: 'text'},
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
  db.dropTable('txqueue', callback)
};
