var fs        = require('fs');
var pg        = require('pg');
// var sqlite3   = require('sqlite3').verbose();
var config    = require('./config/config-loader');
var dbconnect = require('./db/db-connect')({ config: config });


module.exports = function(grunt) {

  var watched_files = ['config/*', 'controllers/*', 'lib/*', '*.js', '*.json'];

  grunt.initConfig({

    jshint: {
      all: watched_files
    },

    simplemocha: {
      options: {
          timeout: 3000,
          ignoreLeaks: false,
          ui: 'bdd',
          reporter: 'spec'
        },
      local: {
        src: ['test/**/*.test.js']
      }
    },

    migrate: {
      options: {
        dir: 'db/migrations',
        env: {
          DATABASE_URL: config.get('DATABASE_URL')
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-db-migrate');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('default', ['migrate:up']);
  grunt.registerTask('dev', ['jshint', 'nodemon']);
  grunt.registerTask('test', ['jshint', 'simplemocha:local']);

  // grunt.registerTask('setupdb', 'Check if the database is running / exists', function(){

  //   var done = this.async();
  //   var db_url = config.get('DATABASE_URL');
  //   dbconnect.connect(function(err, db){
  //     if (err) {
  //       if (!db_url) {
  //         grunt.fail.fatal('No DATABASE_URL specified');
  //       } else if (db_url.indexOf('sqlite') !== -1) {
  //         grunt.fail.fatal('sqlite3 not yet supported');
  //         // grunt.task.run('createsqlite');
  //       } else {
  //         grunt.task.run('migrate:up');
  //       }
  //     }

  //     done();
  //   });
  // });

  // TODO add support for sqlite

  // grunt.registerTask('createsqlite', 'Create sqlite3 database', function(){

  //   var done = this.async();

  //   var db_url = config.get('DATABASE_URL'),
  //     match = db_url.match(/sqlite3:\/\/(.*\.sqlite)/),
  //     db_path;
  //   if (match) {
  //     db_path = match[1];
  //   } else {
  //     grunt.fail.fatal('Can only create sqlite3 database using this script');
  //   }

  //   var db = new sqlite3.Database(db_path, function(err){
  //     if (!err) {
  //       grunt.log.writeln('Created sqlite3 database at: ' + db_path);        
  //     }



  //     done(err);
  //   });
  // });
};
