var sequelize = require('sequelize');

module.exports = function(db) {

  var outgoing_transaction = db.define('outgoing_transaction', {

    ledger: sequelize.TEXT,
    source_account: { type: sequelize.TEXT, primaryKey: true },
    client_resource_id: { type: sequelize.TEXT, primaryKey: true },
    tx_json: sequelize.TEXT,
    type: { type: sequelize.TEXT, primaryKey: true },
    state: sequelize.TEXT,
    submitted_ids: sequelize.TEXT,
    submission_attempts: sequelize.TEXT,
    rippled_result: sequelize.TEXT,
    rippled_result_message: sequelize.TEXT,
    hash: sequelize.TEXT,
    finalized: sequelize.BOOLEAN

  });

  return outgoing_transaction;

};
