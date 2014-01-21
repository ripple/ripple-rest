
module.exports = function(grunt) {

	var jsfiles = ['*.js', 'lib/*.js', 'controllers/*.js', 'test/**/*.js'];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
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
      },
      realmoney: {
        src: ['test/**/*-test-realmoney.js']
      }
		},
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
        // args: ['dev'],
        // nodeArgs: ['--debug'],
        ignoredFiles: ['node_modules/**'],
        watchedExtensions: ['js', 'json'],
        watchedFolders: ['./', 'lib/', 'controllers/', 'models/', 'db/'],
        legacyWatch: true,
        env: {
          PORT: '5900'
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


  /* Register tasks */
	grunt.registerTask('default', ['jshint', 'nodemon']);
  grunt.registerTask('dev', ['jshint', 'simplemocha:local', 'nodemon']);
	grunt.registerTask('test', ['jshint', 'simplemocha:local']);

};

