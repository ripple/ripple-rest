var sequelize = require('sequelize'),
  config = require('../config') || {},
  db = require('../db/sequelizeConnect')(config.env || 'dev');

var Notification = db.define('Notification', {

  /* Auto-generated */
  id: { 
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    notNull: true,
    unique: true,
  },

  /* rippled fields */
  txHash: sequelize.TEXT,
  txResult: sequelize.TEXT,
  inLedger: sequelize.INTEGER,

  /* ripple-simple fields */
  notificationAddress: sequelize.TEXT,
  txType: sequelize.TEXT,
  txDirection: sequelize.TEXT,
  txState: sequelize.TEXT,
  
  /* For outgoing only */
  initialHash: sequelize.TEXT

}, {

});

module.exports = Notification;
