var sequelize = require('sequelize'),
  config = require('../config'),
  db = require('../db/sequelizeConnect')(config.env || 'dev');

var OutgoingTx = db.define('outgoing_transactions', {

  /* Added initially */
  initial_hash: {type: sequelize.TEXT, primaryKey: true, notNull: true},
  submitted_at_ledger: sequelize.INTEGER,
  src_address: sequelize.TEXT,
  tx_type: sequelize.TEXT,
  tx_state: sequelize.TEXT, // Updated after submission

  /* Added after submission */
  tx_result: sequelize.TEXT,
  tx_hash: sequelize.TEXT

}, {

});

module.exports = OutgoingTx;



