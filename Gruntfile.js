var fs      = require('fs');
var nconf   = require('nconf');
var pg      = require('pg');
var async   = require('async');
var dbCheck = require('./lib/dbCheck');
var exec    = require('child_process').exec;


/* Load Configuration */
nconf
  .argv()
  .env()
  .file({ file: './config.json' })
  .file({ file: './config-example.json' });

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
          DATABASE_URL: nconf.get('DATABASE_URL')
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
  grunt.registerTask('heroku', ['dbsetup']);


  /* Check if user and database already exist, if not create them */ 
  grunt.registerTask('dbcheckorcreate', 'Create user and database if they do not already exist', function(){

    var done = this.async();

    var db_url = nconf.get('DATABASE_URL');

    if (!db_url) {
      grunt.fail.fatal(new Error('Must supply DATABASE_URL in the form: postgres://{user}:{password}@{host}:{port}/{database}'));
    }

    // Check user and database, create one or both if they do not already exist

    dbCheck.databaseExists(db_url, function(err, exists){
      if (err) {
        grunt.fail.fatal(err);
      }

      if (exists) {

        dbCheck.userExists(db_url, function(err, exists){
          if (err) {
            grunt.fail.fatal(err);
          }

          if (exists) {

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

    var db_url = nconf.get('DATABASE_URL'),
      connection = dbCheck.parseUrl(db_url);

    async.series(
      [
        function(async_callback){
          exec('createdb -U postgres ' + connection.database, function(error, stdout, stderr){
            if (error) {
              grunt.fail.warn('Cannot create database ' + connection.database + ' as user "postgres". ' + error);
            } else {
              grunt.log.writeln('Created database: ' + connection.database);
            }
            async_callback();
          });
        },
        function(async_callback){
          exec('createuser -U postgres ' + connection.user, function(error, stdout, stderr){
            if (error) {
              grunt.fail.warn('Cannot create user ' + connection.user + ' as user "postgres". ' + error);
            } else {
              grunt.log.writeln('Created user: ' + connection.user);
            }
            async_callback();
          });
        }, function(async_callback){
          exec('psql -U postgres -c "ALTER ROLE ' + connection.user + ' WITH PASSWORD \'' + connection.password + '\'"', function(error, stdout, stderr){
            if (error) {
              grunt.fail.warn('Cannot set user password. ' + error);
            } else {
              grunt.log.writeln('Set user password');
            }
            async_callback();
          });
        }
      ], function(err){
        if (err) {
          grunt.fail.fatal(err);
        }
        grunt.log.ok('PostgreSQL configured');
        done();
    });
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

