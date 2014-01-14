var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('txqueue', {
    initialHash: {type: 'string', primaryKey: true, notNull: true, unique: true},
    submittedAtTime: {type: 'timestamp'},
    submittedAtLedger: {type: 'int'},
    srcAddress: {type: 'string'},
    txStatus: {type: 'string'},
    txResult: {type: 'string'},
    txFinalHash: {type: 'string'}
  });
};

exports.down = function(db, callback) {

};
