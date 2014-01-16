var sequelize = require('sequelize'),
  config = require('../config'),
  db = require('../db/sequelizeConnect')(config.env || 'dev');

var OutboundTx = db.define('OutboundTx', {

  /* Auto-generated */
  id: { 
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    notNull: true,
    unique: true,
  },

  /* Added initially */
  initialHash: sequelize.TEXT,
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



