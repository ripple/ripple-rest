var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('notifications', {
    /* Auto-generated */
    createdAt: {type: 'timestamp'},
    updatedAt: {type: 'timestamp'},

    /* rippled fields */
    '"txHash"': {type: 'text', primaryKey: true},
    txResult: {type: 'text'},
    inLedger: {type: 'int'},

    /* ripple-simple fields */
    '"notificationAddress"': {type: 'text', primaryKey: true},
    txType: {type: 'text'},
    txDirection: {type: 'text'},
    txState: {type: 'text'},
    
    /* For outgoing only */
    initialHash: {type: 'text'}

  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('notifications', callback);
};
