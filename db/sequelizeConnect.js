var Sequelize = require('sequelize'),
  dbConfig = require('./database.json'),
  pg = require('pg').native;

function createDb (env) {
  if (!env) {
    env = 'dev';
  }

  var db = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    dialect: "postgres",
    host: dbConfig.host,
    port: 5432,
    omitNull: true,
    native: true,
    protocol: 'postgres'
  });

  return db;
}


module.exports = createDb;