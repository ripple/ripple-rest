var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('monitored_addresses', {

    // id: {type: 'int', autoIncrement: true},
    createdAt: {type: 'timestamp'},
    updatedAt: {type: 'timestamp'},

    '"notificationAddress"': {type: 'string', primaryKey: true, notNull: true},
    monitorIncoming: {type: 'boolean', defaultValue: false},
    monitorOutgoing: {type: 'boolean', defaultValue: false},

    '"singleTxHash"': {type: 'string', primaryKey: true, defaultValue: ''}

  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('monitored_addresses', callback);
};
