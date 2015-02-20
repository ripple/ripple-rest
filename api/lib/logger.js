var winston = require('winston');
var config = require('./config');

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      prettyPrint: true,
      colorize: true,
      timestamp: true,
      handleExceptions: true,
      logLevel: 'info',
      showLevel: true,
      silent: config.get('NODE_ENV') === 'test'
    })
  ],
  exitOnError: false
});

exports.logger = logger;
