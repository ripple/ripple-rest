var sequelize = require('sequelize'),
  config = require('../config') || {},
  db = require('../db/sequelizeConnect')(config.env || 'dev');

var MonitoredAddress = db.define('monitored_addresses', {

  notificationAddress: {type: sequelize.TEXT, primaryKey: true, notNull: true},
  monitorIncoming: {type: sequelize.BOOLEAN, defaultValue: true},
  monitorOutgoing: {type: sequelize.BOOLEAN, defaultValue: true},

  singleTxHash: {type: sequelize.TEXT, primaryKey: true, defaultValue: ''}


}, {

});

module.exports = MonitoredAddress;
