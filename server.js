/* Dependencies */
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

var fs               = require('fs');
var https            = require('https');
var nconf            = require('nconf');
var ripple           = require('ripple-lib');
var sequelizeConnect = require('./db/sequelizeConnect');
var express          = require('express');
var app              = express();


/* Process Configuration Options */
nconf
  .argv()
  .env()
  .file({ file: './config.json' })
  .defaults({
    PORT: 5990,
    NODE_ENV: 'development',
    rippled: {
      local_signing: true,
      servers: [{
        host: 's_west.ripple.com',
        port: 443,
        secure: true
      }]
    }
  });

if (!nconf.get('rippled')) {
  throw new Error('config.json must include "rippled" to connect to the Ripple Network');
}


/* Connect to db */
var db = sequelizeConnect({
  DATABASE_URL: nconf.get('DATABASE_URL')
});


/* Initialize models */
var OutgoingTx = require('./models/outgoingTx')(db);
var RippleLibQueuedTx = require('./models/rippleLibQueuedTx')(db);


/* Connect to ripple-lib */
var remoteOpts = nconf.get('rippled');

/* Setup ripple-lib persistence */
remoteOpts.storage = require('./lib/rippleLibStorage')({
  db: db,
  RippleLibQueuedTx: RippleLibQueuedTx
});


/* Connect to ripple-lib Remote */
var remote = new ripple.Remote(remoteOpts);

var connect_timeout = setTimeout(function(){
  throw(new Error('Cannot connect to the given rippled. Please ensure that the rippled is configured correctly and that the configuration points to the right port. rippled options: ' + JSON.stringify(nconf.get('rippled'))));
}, 20000);

remote.on('error', function(err) {
  console.error('ripple-lib Remote error: ', err);
});

remote.on('disconnect', function() {
  console.log('Disconnected from rippled');
});

remote.on('connect', function() {
  clearTimeout(connect_timeout);
  console.log('Waiting for confirmation of ripple connection...');
  remote.once('ledger_closed', function() {
    if (remote._getServer()) {
      console.log('Connected to rippled server at: ', remote._getServer()._opts.url);
      console.log('ripple-rest server ready');
    }
  });
});

console.log('Connecting to the Ripple Network...');
remote.connect();


/* Initialize controllers */
var TxCtrl = require('./controllers/txCtrl')({
  remote: remote,
  OutgoingTx: OutgoingTx
}),

NotificationCtrl = require('./controllers/notificationCtrl')({
  remote: remote,
  OutgoingTx: OutgoingTx,
  port: nconf.get('PORT'),
  environment: nconf.get('NODE_ENV')
}),

PaymentCtrl = require('./controllers/paymentCtrl')({
  remote: remote,
  OutgoingTx: OutgoingTx
}),

PathfindCtrl = require('./controllers/pathfindCtrl')({
  remote: remote
}),

StatusCtrl = require('./controllers/statusCtrl')({
  remote: remote
});

/* Express middleware */
app.configure(function() {
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(express.urlencoded());
});

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});


/* Routes */

/* Status */
app.get('/', StatusCtrl.getStatus);
app.get('/api/v1/status', StatusCtrl.getStatus);

/* Ripple Txs */
app.get('/api/v1/addresses/:address/txs/:tx_hash', TxCtrl.getTx);
app.post('/api/v1/addresses/:address/txs/', TxCtrl.submitTx);

/* Notifications */
app.get('/api/v1/addresses/:address/next_notification', NotificationCtrl.getNextNotification);
app.get('/api/v1/addresses/:address/next_notification/:prev_tx_hash', NotificationCtrl.getNextNotification);

/* Pathfinding */
app.get('/api/v1/addresses/:address/payments/options', PathfindCtrl.getPathFind);

/* Payments */
app.get('/api/v1/addresses/:address/payments/:tx_hash', PaymentCtrl.getPayment);
app.post('/api/v1/addresses/:address/payments', PaymentCtrl.submitPayment);


/* Configure SSL, if desired */
if (typeof nconf.get('ssl') === 'object') {
  var key_path  = nconf.get('ssl').key_path || './certs/server.key';
  var cert_path = nconf.get('ssl').cert_path || './certs/server.crt';

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

  https.createServer(sslOptions, app).listen(nconf.get('PORT'), function() {
    console.log('ripple-rest listening over HTTPS at port:' + nconf.get('PORT'));
  });
} else {
  app.listen(nconf.get('PORT'), function() {
    console.log('ripple-rest listening over unsecured HTTP at port:' + nconf.get('PORT'));
  });
}
