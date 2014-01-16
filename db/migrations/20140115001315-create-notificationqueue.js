var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('notificationqueue', {
    /* Auto-generated */
    id: {type: 'int', autoIncrement: true, primaryKey: true},

    /* rippled fields */
    txHash: {type: 'text'},
    txResult: {type: 'text'},
    inLedger: {type: 'int'},

    /* ripple-simple fields */
    notificationAddress: {type: 'text'},
    txType: {type: 'text'},
    txDirection: {type: 'text'},
    txState: {type: 'text'},
    
    /* For outgoing only */
    initialHash: {type: 'text'}

  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('notificationqueue', callback);
};
