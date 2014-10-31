var fs        = require('fs');
var https     = require('https');
var constants = require('constants')
var app       = require('./lib/express_app.js');
var config    = require('./lib/config-loader');
var logger    = require('./lib/logger.js').logger;
var utils     = require('./lib/utils.js');

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
    cert: fs.readFileSync(certPath),

    //
    // Protecting against POODLE in node.js
    // source: https://gist.github.com/3rd-Eden/715522f6950044da45d8
    //

    //
    // This is the default secureProtocol used by Node.js, but it might be
    // sane to specify this by default as it's required if you want to
    // remove supported protocols from the list. This protocol supports:
    //
    // - SSLv2, SSLv3, TLSv1, TLSv1.1 and TLSv1.2
    //
    secureProtocol: 'SSLv23_method',

    //
    // Supply `SSL_OP_NO_SSLv3` constant as secureOption to disable SSLv3
    // from the list of supported protocols that SSLv23_method supports.
    secureOptions: constants.SSL_OP_NO_SSLv3
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
