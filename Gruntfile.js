module.exports = function(grunt) {

	var jsfiles = ['*.js', 'lib/*.js', 'test/*.js'];

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
				tasks: ['jshint', 'simplemocha:local'],
				options: {
					interrupt: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-simple-mocha');

	grunt.registerTask('default', ['jshint', 'simplemocha:local']);
	grunt.registerTask('test', ['jshint', 'simplemocha:local']);
  grunt.registerTask('realmoneytest', ['jshint', 'simplemocha:local', 'simplemocha:realmoney']);

};