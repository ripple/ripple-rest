var sequelize = require('sequelize');

module.exports = function(db) {

  var client_resource_id_record = db.define('client_resource_id_record', {

    source_address: sequelize.TEXT,
    type: sequelize.TEXT,
    client_resource_id: sequelize.TEXT,
    hash: sequelize.TEXT,
    ledger: sequelize.TEXT,
    state: sequelize.TEXT,
    result: sequelize.TEXT
    
  });

  return client_resource_id_record;

};