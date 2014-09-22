var winston = require('winston');

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

exports.logger = logger;
exports.loggerStream = loggerStream;
