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
      logging:  console.log,
      native: true,
      define: {
        underscored: true
      }
    })
    
  } else {
    throw(new Error('Must set node environment variable DATABASE_URL to connect to PostgreSQL'));
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
