var Sequelize = require('sequelize'),
  dbConfig = require('./database.json'),
  pg = require('pg').native;

function createDb (env) {
  if (!env) {
    env = 'dev';
  }

  var db = new Sequelize(dbConfig[env].database, dbConfig[env].user, dbConfig[env].password, {
    dialect: "postgres",
    host: dbConfig[env].host,
    port: 5432,
    omitNull: true,
    native: true,
    protocol: 'postgres',
    define: {
      underscored: true
    }
  });

  db.authenticate()
    .error(function(err){
      throw(new Error('Cannot connect to postgres db: ' + err));
    })
    .success(function(){
      console.log('Connected to postgres db');
    });

  return db;
}


module.exports = createDb;