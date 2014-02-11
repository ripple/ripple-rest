var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('ripple_lib_queued_transactions', {

    /* Auto-generated */
    id: {type: 'int'},
    created_at: {type: 'timestamp'},
    updated_at: {type: 'timestamp'},

    /* Fields used by persistent ripple-lib */
    account_id: {type: 'string', primaryKey: true, unique: true},
    transactions: {type: 'text'}

  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('ripple_lib_queued_transactions');
};
