
module.exports = function(grunt) {

	var jsfiles = ['*.js', 'lib/*.js', 'controllers/*.js', 'test/local/*.js'];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			all: jsfiles,
			jshintrc: '.jshintrc'
		},
		simplemocha: {
      local: {
        src: ['test/local/*.js'],
        options: {
          timeout: 3000,
          ignoreLeaks: false,
          ui: 'bdd',
          reporter: 'spec'
        }
      },
      realmoney: {
        src: ['test/realmoney/*.js'],
        options: {
          timeout: 3000,
          ignoreLeaks: false,
          ui: 'bdd',
          reporter: 'spec'
        }
      }
		},
		watch: {
			scripts: {
				files: jsfiles,
				tasks: ['jshint', 'simplemocha:local', 'express:app:stop', 'express:app'],
				options: {
					interrupt: true
				}
			}
		},
    express: {
      options: {
        port: 5990,
        // spawn: false,
        background: false
      },
      app: {
        options: {
          script: 'app.js'        
        }
      }
    }
	});



  /* Load tasks */
	grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-simple-mocha');


  /* Register tasks */
	grunt.registerTask('default', ['watch']);
	grunt.registerTask('test', ['jshint', 'simplemocha:local']);
  grunt.registerTask('realmoneytest', ['jshint', 'simplemocha:local', 'simplemocha:realmoney']);

};

