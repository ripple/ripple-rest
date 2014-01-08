module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		mocha: {
			test: {
				src: ['test/**/*.js'],
				options: {
					run: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha');

	grunt.registerTask('default', ['jshint']);
	grunt.registerTask('test', ['jshint', 'mocha:test']);

};