var fs = require('fs');
var path = require('path');
var config = require('./lib/config-loader');

require('rconsole');

console.set({
  facility: 'local7',
  title: 'ripple-rest-server',
  stdout: false,
  stderr: true,
  syslog: true,
  syslogHashtags: false,
  showTime: true,
  showLine: true,
  showFile: true,
  showTags: false
});

var app = require('./lib/express_app.js');
var port = config.get('port');
var host = config.get('host');

function loadSSLConfig() {
  var keyPath  = config.get('ssl').key_path
  || path.join(__dirname, '/certs/server.key');

  var certPath = config.get('ssl').cert_path
  || path.join(__dirname, '/certs/server.crt');

  if (!fs.existsSync(keyPath)) {
    console.error('Must specify key_path in order to use SSL');
    process.exit(1);
  }

  if (!fs.existsSync(certPath)) {
    console.error('Must specify cert_path in order to use SSL');
    process.exit(1);
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
};

if (config.get('ssl_enabled')) {
  require('https').createServer(loadSSLConfig(), app).listen(port, host, function() {
    console.log('ripple-rest server listening over HTTPS at port:', port);
  });
} else {
  app.listen(port, host, function() {
    console.log('ripple-rest server listening over UNSECURED HTTP at port:', port);
  });
}

// Connect to Ripple
app.remote.connect();
