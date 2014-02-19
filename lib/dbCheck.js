var pg    = require('pg');
var nconf = require('nconf');

function parseUrl (db_url) {
  var match = db_url.match(/postgres:\/\/([^:]+):?([^@]*)@([^:]+):(\d+)\/?(.*)/),
    connection = {
      host: match[3],
      port: match[4],
      user: match[1],
      password: match[2], // password can be omitted
      database: match[5], // database can be omitted
    };
  return connection;
}

function userExists (db_url, callback) {

  if (typeof db_url === 'function') {
    callback(new Error('Database URL missing. Must supply a url of the form: postgres://{user}:{password}@{host}:{port}/{database}'));
  }

  new pg.Client(db_url).connect(function(err){
    if (err) {
      // Try connecting without database

      var connection = parseUrl(db_url),
        user_only_url = 'postgres://' + connection.user + (connection.password ? ':' + connection.password : '') + '@' + connection.host + ':' + connection.port;
      new pg.Client(user_only_url).connect(function(err){
        if (err) {
          callback(null, false);
          return;
        }

        callback(null, true);
      });
      return;
    }

    callback(null, true);
  });

}

function databaseExists (db_url, callback) {

  if (typeof db_url === 'function') {
    callback(new Error('Database URL missing. Must supply a url of the form: postgres://{user}:{password}@{host}:{port}/{database}'));
  }

  new pg.Client(db_url).connect(function(err){
    if (err) {
      callback(null, false);  
      return;    
    }

    callback(null, true);
  });

}

module.exports.parseUrl       = parseUrl;
module.exports.userExists     = userExists;
module.exports.databaseExists = databaseExists;
