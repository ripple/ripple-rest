var fs    = require('fs');
var nconf = require('nconf');

/* Load Configuration */
nconf
  .argv()
  .env()
  .file({ file: './config.json' });

module.exports = function(grunt) {

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
  grunt.registerTask('dbclean', 'Clean db and re-apply all migrations', function () {
    grunt.log.writeln('Running db-migrate down for all migrations');
    var files = fs.readdirSync('db/migrations');
    for (var i = 0; i < files.length; i++) {
      grunt.task.run('migrate:down');
    }
    grunt.log.writeln('Running db-migrate up for all migrations');
    grunt.task.run('migrate:up');
  });

  /* Task to parse database options and save them to grunt config */
  grunt.registerTask('dbparseopts', 'Parse database options', function(){

    var done = this.async();

    var db_url = nconf.get('DATABASE_URL'),
      postgres = nconf.get('postgres'),
      host,
      port,
      user,
      password,
      database,
      postgres;

    if (db_url && db_url.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)) {

      grunt.log.writeln('Using DATABASE_URL: ' + db_url);
      
      var match = db_url.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      host = match[3];
      port = match[4];
      user = match[1];
      password = match[2];
      database = match[5];

    } else if (postgres) {

      grunt.log.writeln('Using postgres options: ' + JSON.stringify(postgres));
      host = postgres.host;
      port = postgres.port;
      user = postgres.user;
      password = postgres.password;
      database = postgres.database;

      if (!(host && port && user && password && database)) {
        throw(new Error('postgres must contain "host", "port", "user", "password", "database"'));
      }

    } else {
      grunt.fail.fatal(new Error('Must supply either "DATABASE_URL" or "postgres" options to run dbsetup'));
    }

    db_opts = {
      host: host,
      port: port,
      user: user,
      password: password,
      database: database
    };

    // Make options globally available
    grunt.config.set('db_opts', db_opts);

    if (db_url) {
      done();
    } else {
      var postgres_url = 'postgres://' + user + ':' + password + '@' + host + ':' + port + '/' + database;
      nconf.set('DATABASE_URL', postgres_url);
      nconf.save(function(err){
        if (err) {
          grunt.fail.warn(new Error('Cannot save DATABASE_URL to config.json, please run "export DATABASE_URL=' + postgres_url + '"'));
        }
        var config = fs.readFileSync('config.json', {encoding: 'utf8'});
        console.log(JSON.parse(config));

        grunt.log.writeln('Removed postgres from config.json');
        grunt.log.writeln('Saved DATABASE_URL to config.json');

        // Set migration options
        var migrate_opts = grunt.config.get('migrate');
        if (!migrate_opts.options) {
          migrate_opts.options = {};
        }
        if (!migrate_opts.options.env) {
          migrate_opts.options.env = {};
        }
        if (!migrate_opts.options.env.DATABASE_URL) {
          migrate_opts.options.env.DATABASE_URL = nconf.get('DATABASE_URL');
        }

        done();
      });
    }
  });

  grunt.registerTask('pgconfig', 'Setup PostgreSQL database', function(){
    
    var done = this.async();

    if (nconf.get('postgres').created) {
      grunt.log.writeln('Database already exists, skipping user and database creation');
      done();
    } else {

      var db_opts = grunt.config.get('db_opts');

      var createuser_opts = {};
      createuser_opts[db_opts.user] = {
        user: db_opts.user + ' CREATEDB PASSWORD \'' + db_opts.password + '\'' ,
        connection: {
          host: db_opts.host,
          port: db_opts.port,
          user: 'postgres'
        }
      };

      grunt.config.set('pgcreateuser', createuser_opts);

      var createdb_opts = {};
      createdb_opts[db_opts.database] = {
        name: db_opts.database,
        owner: db_opts.user,
        connection: {
          host: db_opts.host,
          port: db_opts.port,
          user: db_opts.user,
          password: db_opts.password
        }
      };

      grunt.config.set('pgcreatedb', createdb_opts);

      grunt.task.run('pgcreateuser:' + db_opts.user, 'pgcreatedb:' + db_opts.database);
      nconf.set('postgres:created', true);
      nconf.save();
      done();
    }
  });
  
  grunt.registerTask('dbsetup', ['dbparseopts', 'pgconfig', 'dbclean']);
};

