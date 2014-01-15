var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('txqueue', {
    id: {type: 'int', autoIncrement: true, primaryKey: true},
    initialHash: {type: 'string'},
    submittedAtTime: {type: 'timestamp'},
    submittedAtLedger: {type: 'int'},
    srcAddress: {type: 'string'},
    txState: {type: 'string'},
    txResult: {type: 'string'},
    txFinalHash: {type: 'string'}
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('txqueue', callback)
};
