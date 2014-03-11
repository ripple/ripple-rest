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

  grunt.registerTask('default', ['dbsetup']);
  grunt.registerTask('dev', ['jshint', 'nodemon']);
  grunt.registerTask('test', ['jshint', 'simplemocha:local']);

  grunt.registerTask('dbsetup', 'Check if the database is running / exists', function(){

    var done = this.async();
    var db_url = config.get('DATABASE_URL');

    if (db_url) {
      dbconnect.connect(function(err, db){
        if (err) {
          grunt.fail.fatal(err);
        }

        grunt.task.run('migrate:up');

        done();
      });
    } else {
      grunt.log.writeln('No DATABASE_URL specified, defaulting to sqlite3 in memory. DO NOT USE THIS FOR A PRODUCTION SYSTEM');
    }
  });
};
