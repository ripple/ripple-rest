var winston = require('winston');
var config = require('../api/lib/config');

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      prettyPrint: true,
      colorize: true,
      timestamp: true,
      handleExceptions: true
    })
  ]
});

var loggerStream = {write: function (data) {
  logger.info(data.replace(/\n$/, ''));
}};

var logInfo = logger.info;

logger.info = function() {
  if (config.get('NODE_ENV') !== 'test') {
    logInfo.apply(logger, arguments);
  }
};

var logError = logger.error;

logger.error = function() {
  if (config.get('NODE_ENV') !== 'test') {
    logError.apply(logger, arguments);
  }
};

exports.logger = logger;
exports.loggerStream = loggerStream;
