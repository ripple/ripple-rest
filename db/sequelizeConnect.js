var Sequelize = require('sequelize'),
  pg = require('pg').native;

module.exports = function(opts) {
  if (!opts.DATABASE_URL) {
    throw(new Error('Must specify DATABASE_URL in config.json or as environment variable'));
  }

  // TODO Support other databases

  var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/),
    db = new Sequelize(match[5], match[1], match[2], {
      dialect:  'postgres',
      protocol: 'postgres',
      port:     match[4],
      host:     match[3],
      logging:  false,
      native: true,
      define: {
        underscored: true
      }
    });

  db.authenticate()
    .error(function(err){
      throw(new Error('Cannot connect to postgres db: ' + err));
    })
    .success(function(){
      console.log('Connected to PostgreSQL db');
    });

  return db;
};
