var fs      = require('fs');
var path    = require('path');
var https   = require('https');
var config = require('./config/config-loader');
var rippleRest  = require(__dirname+'/index.js');
var app = require(__dirname+'/app.js');

require('rconsole');

console.set({
  facility:        'local7',
  title:           'ripple-rest-server',
  stdout:          false,
  stderr:          true,
  syslog:          true,
  syslogHashtags:  false,
  showTime:        true,
  showLine:        false,
  showFile:        true,
  showTags:        true
});

rippleRest.connectRemote();

/* Configure SSL, if desired */
if (typeof config.get('ssl') === 'object') {
  var key_path  = config.get('ssl').key_path || path.join(__dirname, '/certs/server.key');
  var cert_path = config.get('ssl').cert_path || path.join(__dirname, '/certs/server.crt');

  if (!fs.existsSync(key_path)) {
    throw new Error('Must provide key file and a key_path in the config.json in order to use SSL');
  }

  if (!fs.existsSync(cert_path)) {
    throw new Error('Must provide certificate file and a cert_path in the config.json in order to use SSL');
  }

  var sslOptions = {
    key:   fs.readFileSync(key_path),
    cert:  fs.readFileSync(cert_path)
  };

  https.createServer(sslOptions, app).listen(config.get('PORT'), function() {
    console.log('ripple-rest server listening over HTTPS at port:', config.get('PORT'));
  });
} else {
  app.listen(config.get('PORT'), function() {
    console.log('ripple-rest server listening over UNSECURED HTTP at port:', config.get('PORT'));
  });
}

