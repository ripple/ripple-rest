var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('monitorlist', {

    id: {type: 'int', autoIncrement: true, primaryKey: true},

    notificationAddress: {type: 'text'},
    monitorIncoming: {type: 'boolean', defaultValue: false},
    monitorOutgoing: {type: 'boolean', defaultValue: false},

    singleTxHash: {type: 'text'}

  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('monitorlist', callback);
};
