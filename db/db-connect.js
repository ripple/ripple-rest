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
      if (db_url.indexOf('postgres') !== -1) {

        // var match = db_url.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/),
        db = new sequelize(db_url, {
          logging:  false,
          native: true,
          define: {
            underscored: true
          }
        });

      } else if (db_url.indexOf('sqlite') !== -1) {

        if (fs.existsSync(db_url)) {
          db = new sequelize(db_url, {
            logging:  false,
            define: {
              underscored: true
            }
          });
        } else {
          var error = new Error('SQLite3 database does not yet exist. Run grunt to create it');
          if (callback) {
            callback(error);
            return;
          } else {
            throw(error);
          }
        }

      } else {
        var error = new Error('Must specify PostgreSQL or SQLite3 DATABASE_URL');
          if (callback) {
            callback(error);
            return;
          } else {
            throw(error);
          }
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
        } else {
          console.log('Connected to database: ' + db_url);
        }
      });

      if (!callback) {
        return db;
      }

    }

  };

};