var sequelize = require('sequelize');

module.exports = function(db) {

  var RippleLibQueuedTx = db.define('ripple_lib_queued_transactions', {

    account_id: sequelize.TEXT,
    tx: sequelize.TEXT

  });

  return RippleLibQueuedTx;

};