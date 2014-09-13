var fs = require('fs');
var pg = require('pg.js');
var sequelize = require('sequelize');
var config = require('../lib/config-loader');

module.exports = function(database_url, callback) {
  var db;

  // If database connection uses HTTPS, node-postgres module must be installed.
  // By default only the pg.js module is used, which does not require the
  // Postgres drivers to be installed. The line "require('pg').native" uses the
  // native drivers, which permit connecting to the database over HTTPS
  if (/^https/.test(database_url)) {
    pg = require('pg').native;
  }

  // Use postgres database if provided, otherwise use sqlite3
  if (typeof database_url === 'string' && database_url.indexOf('postgres') !== -1) {

    db = new sequelize(database_url, {
      logging:  false,
      native: true,
      define: {
        underscored: true
      }
    });

  } else {

    db = new sequelize('ripple_rest_db', 'ripple_rest_user', 'ripple_rest', {
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      sync: { force: true },
      define: { 
        underscored: true,
        syncOnAssociation: true
      }
    });

  }

  db.authenticate()
  .error(function(err){
    var error = new Error('Cannot connect to database: ' + database_url + '. ' + err);
    if (callback) {
      callback(error);
    } else {
      throw(error);
    }
  })
  .success(function(){
    if (callback) {
      callback(null, db);
    }

    if (config.get('NODE_ENV') !== 'test') {
      if (database_url) {
        console.log('Connected to database: ' + database_url);
      } else {
        console.log('Using sqlite3 in memory database. DO NOT USE THIS FOR A PRODUCTION SYSTEM');
      }
    }
  });

  if (!callback) {
    return db;
  }

};
