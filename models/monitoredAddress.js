var sequelize = require('sequelize'),
  config = require('../config') || {},
  db = require('../db/sequelizeConnect')(config.env || 'dev');

var MonitoredAddress = db.define('MonitoredAddress', {

  /* Auto-generated */
  id: { 
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    notNull: true,
    unique: true,
  },

  notificationAddress: sequelize.TEXT,
  monitorIncoming: {type: sequelize.BOOLEAN, defaultValue: true},
  monitorOutgoing: {type: sequelize.BOOLEAN, defaultValue: true},

  singleTxHash: sequelize.TEXT


}, {

});

module.exports = MonitoredAddress;
