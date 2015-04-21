/* eslint-disable valid-jsdoc */
'use strict';
var winston = require('winston');
var config = require('./config');
var morgan = require('morgan');
var version = require('./version');

var logger = exports.logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      prettyPrint: true,
      colorize: true,
      handleExceptions: true,
      level: config.get('NODE_ENV') === 'test' ? 'error' : 'info',
      showLevel: true,
      timestamp: true
    })
  ],
  exitOnError: true
});

/**
 * Setup server logging middleware
 *
 * Production logs conform to Extended Log File Format:
 * http://www.w3.org/TR/WD-logfile
 */

/**
 *  Returns the a date-time in ELF format (e.g, 2015-02-20 00:02:08)
 */
function elfDate() {
  return new Date().toISOString().replace('T', ' ').substr(0, 19);
}

// ELF Headers
var elfHeaders =
  '\n#Version: 1.0\n' +
  '#Date: ' + elfDate() + '\n' +
  '#Software: ' + version.getPackageVersion() + '\n' +
  '#Fields: c-ip date time cs-method cs-uri cs(Version) sc-status time-taken '
  + 'cs(User-Agent)';

// Logging in ELF format (http://www.w3.org/TR/WD-logfile)
var morganFormat = ':remote-addr :datetime :method :url :http-version :status '
                 + ':response-time :user-agent';

// Both morgan and winston append a newline
var stream = {
  write: function(data) {
    logger.info(data.slice(0, -1));
  }
};

// Define the datetime token in ELF format
morgan.token('datetime', elfDate);

// Define the user-agent token in ELF format
morgan.token('user-agent', function(req) {
  if (req.get('User-Agent')) {
    return req.get('User-Agent').split(' ').join('+');
  }
  return '';
});

exports.morgan = function(app) {
  if (config.get('NODE_ENV') === 'production') {
    app.use(morgan(morganFormat));

    logger.timestamp = false;
    logger.prettyPrint = false;
    logger.colorize = false;
    logger.showLevel = false;

    logger.info(elfHeaders);
  } else {
    app.use(morgan('dev', {stream: stream}));
  }
};
