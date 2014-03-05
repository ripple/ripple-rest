var fs      = require('fs');
var config  = require('./lib/configLoader');
var pg      = require('pg');
var async   = require('async');
var dbCheck = require('./lib/dbCheck');
var exec    = require('child_process').exec;


module.exports = function(grunt) {

  // Temporary fix for a bug in grunt-pg
  grunt.utils = grunt.util;


  var jsfiles = ['*.js', 'lib/*.js', 'controllers/*.js', 'test/**/*.js'];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /* Database Migrations */
    migrate: {
      options: {
        migrationsDir: 'db/migrations', // Temporary fix for bug in grunt-db-migrate
        dir: 'db/migrations',
        env: {
          DATABASE_URL: config.get('DATABASE_URL')
        }
      }
    },

    /* Linting and testing */
    jshint: {
      all: jsfiles,
      jshintrc: '.jshintrc'
    },
    simplemocha: {
      options: {
          timeout: 3000,
          ignoreLeaks: false,
          ui: 'bdd',
          reporter: 'spec'
        },
      local: {
        src: ['test/**/*-test.js']
      }
    },

    /* Development */
    watch: {
      scripts: {
        files: jsfiles,
        tasks: ['jshint', 'simplemocha:local'],
        options: {
          interrupt: true
        }
      }
    },
    nodemon: {
      dev: {
        options: {
          file: 'app.js',
          ignoredFiles: ['node_modules/**'],
          watchedExtensions: ['js', 'json'],
          watchedFolders: ['./', 'lib/', 'controllers/', 'models/', 'db/'],
          legacyWatch: true,
          env: {
            PORT: '5900',
            NODE_ENV: 'development'
          },
          cwd: __dirname
        }
      }
    }
    
  });


  /* Load tasks */
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-db-migrate');


  /* Register tasks */
  grunt.registerTask('default', ['jshint', 'nodemon']);
  grunt.registerTask('dev', ['jshint', 'simplemocha:local', 'nodemon']);
  grunt.registerTask('test', ['jshint', 'simplemocha:local']);
  grunt.registerTask('dbsetup', ['dbcheckorcreate', 'migrate:up']);

  /* Check if user and database already exist, if not create them */ 
  grunt.registerTask('dbcheckorcreate', 'Create user and database if they do not already exist', function(){

    var done = this.async();

    var db_url = config.get('DATABASE_URL');

    if (!db_url) {
      grunt.fail.fatal(new Error('Must supply DATABASE_URL in the form: postgres://{user}:{password}@{host}:{port}/{database}'));
    }

    // Check user and database, create one or both if they do not already exist

    dbCheck.databaseExists(db_url, function(err, db_exists){
      if (err) {
        grunt.fail.fatal(err);
      }

      if (db_exists) {

        dbCheck.userExists(db_url, function(err, user_exists){
          if (err) {
            grunt.fail.fatal(err);
          }

          if (user_exists) {

            grunt.log.writeln('User and database already exist. Continuing');
            done();

          } else {

            // Create database
            grunt.log.writeln('Database exists but user does not');
            grunt.task.run('dbcreate');
            done();
          }
        });

      } else {

        grunt.log.writeln('Database does not yet exist');
        grunt.task.run('dbcreate');
        done();
      }
    });
  });

  grunt.registerTask('dbcreate', 'Create user and db', function(){

    var done = this.async();

    createDbAsUser('postgres', function(err){
      if (err) {
        grunt.log.writeln('Cannot setup database as user postgres, trying user running process');

        createDbAsUser(config.get('USER') || '$USER', function(err){
          if (err) {
            grunt.fail.fatal(err);
          } else {
            done();
          }
        });
      }
    });

    function createDbAsUser (user, callback) {
      var db_url = config.get('DATABASE_URL'),
      connection = dbCheck.parseUrl(db_url);

      async.series(
        [
          function(async_callback){
            exec('createdb -U ' + user + ' ' + connection.database, function(error, stdout, stderr){
              if (error) {
                if (error.message.indexOf('already exists') !== -1) {
                  async_callback();
                  return;
                }
                async_callback('Cannot create database ' + connection.database + ' as user "' + user + '". ' + error);
              } else {
                grunt.log.writeln('Created database: ' + connection.database + ' as user "' + user + '"');
                async_callback();
              }
            });
          },
          function(async_callback){
            exec('createuser -U ' + user + ' ' + connection.user, function(error, stdout, stderr){
              if (error) {
                if (error.message.indexOf('already exists') !== -1) {
                  async_callback();
                  return;
                }
                async_callback('Cannot create user ' + connection.user + ' as user "' + user + '". ' + error);
              } else {
                grunt.log.writeln('Created user: ' + connection.user + ' as user "' + user + '"');
                async_callback();
              }
            });
          }, function(async_callback){
            exec('psql -U ' + user + ' -c "ALTER ROLE ' + connection.user + ' WITH PASSWORD \'' + connection.password + '\'"', function(error, stdout, stderr){
              if (error) {
                if (error.message.indexOf('already exists') !== -1) {
                  async_callback();
                  return;
                }
                async_callback('Cannot set user password. ' + error);
              } else {
                grunt.log.writeln('Set user password');
                async_callback();
              }
            });
          }, function(async_callback){
            exec('psql -U ' + user + ' -c "ALTER DATABASE ' + connection.database + ' OWNER TO ' + connection.user + '"', function(error, stdout, stderr){
              if (error) {
                if (error.message.indexOf('already exists') !== -1) {
                  async_callback();
                  return;
                }
                async_callback('Cannot owner of database: ' + connection.database + ' to ' + connection.user + '. ' + error);
              } else {
                grunt.log.writeln('Changed owner of database: ' + connection.database + ' to ' + connection.user);
                async_callback();
              }
            });
          }
        ], function(err){
          if (err) {
            callback(err);
          } else {
            grunt.log.ok('PostgreSQL configured');
            callback();
          }
      });
    }
  });

  /* Clean database by running migrate:down and then up */
  grunt.registerTask('dbclean', 'Clean db and re-apply all migrations', function () {

    grunt.log.writeln('Running db-migrate down for all migrations');
    var files = fs.readdirSync('./db/migrations');
    for (var i = 0; i < files.length; i++) {
      grunt.task.run('migrate:down');
    }
    grunt.log.writeln('Running db-migrate up for all migrations');
    grunt.task.run('migrate:up');
  });
};

