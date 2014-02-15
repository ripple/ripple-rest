var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('outgoing_transactions', 'reported', {type: 'boolean', defaultValue: false}, callback);
};

exports.down = function(db, callback) {
  db.dropTable('outgoing_transactions', {ifExists: true}, callback)
};
