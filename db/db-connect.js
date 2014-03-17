var fs        = require('fs');
var sequelize = require('sequelize');
var pg        = require('pg').native;

module.exports = function(database_url, callback) {

  var db;

  // Use postgres database if provided, otherwise use sqlite3
  if (database_url && database_url.indexOf('postgres') !== -1) {

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

    if (database_url) {
      console.log('Connected to database: ' + database_url);
    } else {
      console.log('Using sqlite3 in memory database. DO NOT USE THIS FOR A PRODUCTION SYSTEM');
    }
  });

  if (!callback) {
    return db;
  }

};