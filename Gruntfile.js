module.exports = function(grunt) {

	var jsfiles = ['*.js', 'lib/*.js', 'test/*.js'];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			all: jsfiles,
			jshintrc: '.jshintrc'
		},
		simplemocha: {
      all: {
        src: ['test/*.js'],
        options: {
          globals: ['should'],
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
				tasks: ['jshint', 'simplemocha'],
				options: {
					interrupt: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-simple-mocha');

	grunt.registerTask('default', ['jshint']);
	grunt.registerTask('test', ['jshint', 'simplemocha']);

};