var fs      = require('fs');
var https   = require('https');
var app     = require('./lib/express_app.js');
var config  = require('./lib/config-loader');
var remote  = require('./lib/remote.js');
var logger  = require('./lib/logger.js').logger;
var utils   = require('./lib/utils.js');

var port = config.get('port') || 5990;
var host = config.get('host');

logger.info('ripple-rest (v' + utils.getPackageVersion() + ')');

function loadSSLConfig() {
  var keyPath  = config.get('ssl').key_path || './certs/server.key';
  var certPath = config.get('ssl').cert_path || './certs/server.crt';

  if (!fs.existsSync(keyPath)) {
    logger.error('Must specify key_path in order to use SSL');
    process.exit(1);
  }

  if (!fs.existsSync(certPath)) {
    logger.error('Must specify cert_path in order to use SSL');
    process.exit(1);
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
};

if (config.get('ssl_enabled')) {
  require('https').createServer(loadSSLConfig(), app).listen(port, host, function() {
    logger.info('server listening over HTTPS at port ' + port);
  });
} else {
  app.listen(port, host, function() {
    logger.info('server listening over UNSECURED HTTP at port ' + port);
  });
}
