var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('client_resource_id_records', {

    /* Auto-generated */
    id: {type: 'int'},
    created_at: {type: 'timestamp'},
    updated_at: {type: 'timestamp'},

    source_account: {type: 'text', primaryKey: true},
    type: {type: 'text', primaryKey: true},
    client_resource_id: {type: 'text', primaryKey: true},
    hash: {type: 'text'},
    ledger: {type: 'text'},
    state: {type: 'text'},
    result: {type: 'text'}

  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('client_resource_id_records');
};
