var fs        = require('fs');
var sequelize = require('sequelize');
var pg        = require('pg').native;

module.exports = function(opts) {

  var config = opts.config,
    db_url = config.get('DATABASE_URL'),
    db;

  return {

    connect: function(callback) {

      // Use postgres database if provided, otherwise use sqlite3
      if (db_url && db_url.indexOf('postgres') !== -1) {

        db = new sequelize(db_url, {
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
        var error = new Error('Cannot connect to database: ' + db_url + '. ' + err);
        if (callback) {
          callback(error);
        } else {
          throw(error);
        }
      })
      .success(function(){
        if (callback) {
          callback();
        } else if (db_url) {
          console.log('Connected to database: ' + db_url);
        } else {
          console.log('Using sqlite3 in memory database. DO NOT USE THIS FOR A PRODUCTION SYSTEM');
        }
      });

      if (!callback) {
        return db;
      }

    }

  };

};