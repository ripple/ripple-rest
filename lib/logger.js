var winston = require('winston');

// Put winston into CLI mode (prettier)
winston.cli();
winston.default.transports.console.level = 'debug';

var winstonStream = {write: function (data) {
  winston.info(data.replace(/\n$/, ''));
}};

exports.winston = winston;
exports.winstonStream = winstonStream;

