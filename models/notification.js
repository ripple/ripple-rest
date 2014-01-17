var sequelize = require('sequelize'),
  config = require('../config') || {},
  db = require('../db/sequelizeConnect')(config.env || 'dev');

var Notification = db.define('notifications', {

  /* rippled fields */
  txHash: {type: sequelize.TEXT, primaryKey: true, notNull: true},
  txResult: sequelize.TEXT,
  inLedger: sequelize.INTEGER,

  /* ripple-simple fields */
  notificationAddress: {type: sequelize.TEXT, primaryKey: true, notNull: true},
  txType: sequelize.TEXT,
  txDirection: sequelize.TEXT,
  txState: sequelize.TEXT,
  
  /* For outgoing only */
  initialHash: sequelize.TEXT

}, {

});

module.exports = Notification;
