var sequelize = require('sequelize'),
  config = require('../config'),
  db = require('../db/sequelizeConnect')(config.env || 'dev');

var OutboundTx = db.define('outbound_txs', {

  /* Added initially */
  initialHash: {type: sequelize.TEXT, primaryKey: true, notNull: true},
  submittedAtTime: sequelize.DATE,
  submittedAtLedger: sequelize.INTEGER,
  srcAddress: sequelize.TEXT,
  txType: sequelize.TEXT,
  txState: sequelize.TEXT, // Updated after submission

  /* Added after submission */
  txResult: sequelize.TEXT,
  txHash: sequelize.TEXT

}, {

});

module.exports = OutboundTx;



