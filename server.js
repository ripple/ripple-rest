var fs      = require('fs');
var https   = require('https');
var path    = require('path');
var app = require(__dirname+'/lib/express_app.js');
var config = require(__dirname+'/lib/config-loader');

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

  https.createServer(sslOptions, app).listen(config.get('PORT'), config.get('HOST'), function() {
    console.log('ripple-rest server listening over HTTPS at port:', config.get('PORT'));
  });
} else {
  app.listen(config.get('PORT'), config.get('HOST'), function() {
    console.log('ripple-rest server listening over UNSECURED HTTP at port:', config.get('PORT'));
  });
}
