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

    /* PostgreSQL Setup */
    pgcreatedb: {
      // Options set by pgconfig task
    }, 
    pgcreateuser: {
      // Options set by pgconfig task
    },

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
  grunt.loadNpmTasks('grunt-pg');


  /* Register tasks */
	grunt.registerTask('default', ['jshint', 'nodemon']);
  grunt.registerTask('dev', ['jshint', 'simplemocha:local', 'nodemon']);
	grunt.registerTask('test', ['jshint', 'simplemocha:local']);
  grunt.registerTask('dbsetup', ['pgconfig', 'dbcheckorcreate', 'migrate:up']);

  /* Setup grunt-pg options */
  grunt.registerTask('pgconfig', 'Setup PostgreSQL database', function(){
    
    var db_url = nconf.get('DATABASE_URL');

    if (!db_url) {
      grunt.fail.fatal(new Error('Must supply DATABASE_URL in the form: postgres://{user}:{password}@{host}:{port}/{database}'));
    }

    var connection = dbCheck.parseUrl(db_url);

    var createuser_opts = {};
    createuser_opts[connection.user] = {
      user: connection.user + ' CREATEDB PASSWORD \'' + connection.password + '\'' ,
      connection: {
        host: connection.host,
        port: connection.port,
        user: nconf.get('USER') || 'postgres'
      }
    };

    grunt.config.set('pgcreateuser', createuser_opts);

    var createdb_opts = {};
    createdb_opts[connection.database] = {
      name: connection.database,
      owner: connection.user,
      connection: {
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password
      }
    };

    grunt.config.set('pgcreatedb', createdb_opts);
    
  });

  /* Check if user and database already exist, if not create them */ 
  grunt.registerTask('dbcheckorcreate', 'Create user and database if they do not already exist', function(){

    var done = this.async();

    var db_url = nconf.get('DATABASE_URL');

    if (!db_url) {
      grunt.fail.fatal(new Error('Must supply DATABASE_URL in the form: postgres://{user}:{password}@{host}:{port}/{database}'));
    }

    // Check user and database, create one or both if they do not already exist

    dbCheck.userExists(db_url, function(err, exists){
      if (err) {
        grunt.fail.fatal(err);
      }

      if (exists) {

        dbCheck.databaseExists(db_url, function(err, exists){
          if (err) {
            grunt.fail.fatal(err);
          }

          if (exists) {

            grunt.log.writeln('User and database already exist. Continuing');
            done();

          } else {

            // Create database
            grunt.log.writeln('User exists but database does not. Creating database');
            grunt.task.run('pgcreatedb');
            done();
          }
        });

      } else {

        // Try connecting as postgres user

        var connection = dbCheck.parseUrl(db_url),
          modified_connection = 'postgres://' + (nconf.get('USER') || 'postgres') + '@' + connection.host + ':' + connection.port;

        dbCheck.userExists(db_url, function(err, exists){
          if (err) {
            grunt.fail.fatal(err);
          }

          if (exists) {

            grunt.log.writeln('User and database do not yet exist. Creating both with default user postgres');
            grunt.task.run('pgcreateuser', 'pgcreatedb');
            done();

          } else {

            grunt.log.writeln('Cannot connect to PostgreSQL as user ' + connection.user + ' or default user postgres. Now attempting to create user');
            exec('createdb $USER', function(error, stdout, stderr){
              if (error) {
                grunt.fail.fatal('Cannot create PostgreSQL user, please check your PostgreSQL installation or create a user manually. ' + error);
              }

              grunt.log.writeln('Created default database and user postgres. Now creating ripple-rest user and database');
              grunt.task.run('pgcreateuser', 'pgcreatedb');
              done();
            });
          }
        });
      }
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

