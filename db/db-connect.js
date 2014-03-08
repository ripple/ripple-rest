var fs        = require('fs');
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

  } else {
    throw(new Error('Must specify postgres DATABASE_URL'));
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