var fs        = require('fs');
var sqlite3   = require('sqlite3');
var sequelize = require('sequelize');
var pg        = require('pg').native;

module.exports = function(opts) {

  var config = opts.config,
    db_url = config.get('DATABASE_URL'),
    db;

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



    // Check if db file exists
    var file_path = db_url.match(/sqlite:\/\/(.*\.sqlite)/)[1];
    console.log(fs.statSync(file_path));
    if (!fs.existsSync(file_path)) {
      console.log('Creating sqlite3 at: ' + file_path);

      console.log(fs.statsSync(file_path));

      new sqlite3.Database(file_path);
    }
    

    db = new sequelize(db_url, {
      logging:  false,
      dialect: 'sqlite',
      define: {
        underscored: true
      }
    });

  }

  db.authenticate()
  .error(function(err){
    throw(new Error('Cannot connect to database: ' + db_url + '. ' + err));
  })
  .success(function(){
    console.log('Connected to database: ' + db_url);
  });

  return db;

};