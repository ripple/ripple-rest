var sequelize = require('sequelize');

module.exports = function(db) {

  var OutgoingTx = db.define('outgoing_transactions', {

    submitted_at_ledger: sequelize.INTEGER,
    source_address: sequelize.TEXT,
    source_transaction_id: sequelize.TEXT,
    tx_json: sequelize.TEXT,
    type: sequelize.TEXT,
    state: sequelize.TEXT,
    submitted_ids: sequelize.TEXT,
    submission_attempts: sequelize.TEXT,
    engine_result: sequelize.TEXT,
    engine_result_message: sequelize.TEXT,
    hash: sequelize.TEXT,
    reported: sequelize.BOOLEAN

  });

  return OutgoingTx;

};
