
module.exports = function(grunt) {

  var watched_files = ['config/*', 'controllers/*', 'lib/*', '*.js', '*.json'];

  grunt.initConfig({

    jshint: {
      all: watched_files
    },

    nodemon: {
      script: 'server.js',
      options: {
        ignore: ['node_modules/**'],
        watch: watched_files,
        delay: 1
      }
    }
  });



  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('dev', ['jshint', 'nodemon']);

};