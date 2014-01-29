var Sequelize = require('sequelize'),
  dbConfig = require('./database.json'),
  pg = require('pg').native;

function createDb (env) {
  if (!env) {
    env = 'dev';
  }
  
  if (process.env.DATABASE_URL) {
    var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

    var db = new Sequelize(match[5], match[1], match[2], {
      dialect:  'postgres',
      protocol: 'postgres',
      port:     match[4],
      host:     match[3],
      logging:  true,
      native: true
    })
    
  } else {

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
  
  }

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
