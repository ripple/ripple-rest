var sequelize = require('sequelize');

module.exports = function(db) {

  var OutgoingTx = db.define('outgoing_transactions', {

    /* Added initially */
    initial_hash: {type: sequelize.TEXT, primaryKey: true, notNull: true},
    submitted_at_ledger: sequelize.INTEGER,
    src_address: sequelize.TEXT,
    type: sequelize.TEXT,
    state: sequelize.TEXT, // Updated after submission

    /* Added after submission */
    result: sequelize.TEXT,
    hash: sequelize.TEXT

  });

  return OutgoingTx;

};
