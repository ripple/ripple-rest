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

var fs                = require('fs');
var https             = require('https');
var ripple            = require('ripple-lib');
var express           = require('express');
var connect           = require('connect');
var app               = express();
var config            = require('./config/config-loader');
var DatabaseInterface = require('./lib/db-interface');


/* Express Connect middleware */
if (config.get('NODE_ENV') !== 'production') {
  app.set('json spaces', 2);
  app.use(connect.logger(':method :url (:response-time ms)'));
}
app.disable('x-powered-by');
app.use(connect.json());
app.use(connect.urlencoded());
app.use(function(req, res, next){
  var match = req.path.match(/\/api\/(.*)/);
  if (match) {
    res.redirect(match[1]);
  } else {
    next();
  }
});
app.use(function(req, res, next){
  var new_path = req.path.replace('addresses', 'accounts').replace('address', 'account');
  if (new_path !== req.path) {
    res.redirect(new_path);
  } else {
    next();
  }
});
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

var remote;

/* Connect to db */
var dbinterface = new DatabaseInterface(config.get('DATABASE_URL'));

/* Connect to ripple-lib Remote */
var remote_opts = {
  servers: config.get('rippled_servers'),
  storage: dbinterface
};

var remote = new ripple.Remote(remote_opts);

remote.on('error', function(err) {
  console.error('ripple-lib Remote error: ', err);
});

remote.on('disconnect', function() {
  console.log('Disconnected from rippled');
});

remote.on('connect', function() {
  console.log('Waiting for confirmation of ripple connection...');
  remote.once('ledger_closed', function() {
    if (remote._getServer()) {
      console.log('Connected to rippled server at: ', remote._getServer()._opts.url);
      console.log('ripple-rest server ready');
    }
  });
});

console.log('Attempting to connect to the Ripple Network...');

remote.connect();

/**** **** **** **** ****/

var app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded());

if (config.get('NODE_ENV') !== 'production') {
  app.set('json spaces', 2);
}

app.use(function(req, res, next){
  var match = req.path.match(/\/api\/(.*)/);
  if (match) {
    res.redirect(match[1]);
  } else {
    next();
  }
});

app.use(function(req, res, next) {
  var new_path = req.path.replace('addresses', 'accounts').replace('address', 'account');

  if (new_path !== req.path) {
    res.redirect(new_path);
  } else {
    next();
  }
});

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

app.param('account', function(req, res, next, account) {
  if (ripple.UInt160.is_valid(account)) {
    next();
  } else {
    res.send({
      success: false,
      error: 'Invalid account',
      message: 'Specified account is invalid:' + account
    });
  }
});

/**** **** **** **** ****/

/* Initialize controllers */
var controller_opts = {
  remote:       remote,
  dbinterface:  dbinterface,
  config:       config
};

var ServerController        = require('./controllers/server-controller')(controller_opts);
var SubmissionController    = require('./controllers/submission-controller')(controller_opts);
var PaymentsController      = require('./controllers/payments-controller')(controller_opts);
var TransactionsController  = require('./controllers/transactions-controller')(controller_opts);
var NotificationsController = require('./controllers/notifications-controller')(controller_opts);
var BalancesController      = require('./controllers/balances-controller')(controller_opts);
var SettingsController      = require('./controllers/settings-controller')(controller_opts);
var UtilsController         = require('./controllers/utils-controller')(controller_opts);

/**** **** **** **** ****/

/* Endpoints */
app.get('/', function(req, res) {
  res.redirect('/v1');
});

app.get('/v1', function(req, res) {
  var url_base = req.protocol + '://' + req.host + (config.get('NODE_ENV') === 'development' && config.get('PORT') ? ':' + config.get('PORT') : '');

  res.json({
    ripple_rest_api: 'v1',
    documentation: 'https://github.com/ripple/ripple-rest',
    endpoints: {
      submit_payment:          url_base + '/v1/payments',
      payment_paths:           url_base + '/v1/accounts/{account}/payments/paths/{destination_account}/{destination_amount as value+currency or value+currency+issuer}',
      account_payments:        url_base + '/v1/accounts/{account}/payments/{hash,client_resource_id}{?direction,exclue_failed}', 
      account_notifications:   url_base + '/v1/accounts/{account}/notifications{/hash,client_resource_id}{?types,exclue_failed}',
      account_balances:        url_base + '/v1/accounts/{account}/balances', 
      account_settings:        url_base + '/v1/accounts/{account}/settings', 
      ripple_transactions:     url_base + '/v1/transactions/{hash}',
      server_status:           url_base + '/v1/server',
      server_connected:        url_base + '/v1/server/connected',
      uuid_generator:          url_base + '/v1/uuid'
    }
  });
});

/* Server */
app.get('/v1/server', ServerController.getStatus);
app.get('/v1/server/connected', ServerController.isConnected);

/* Payments */
app.post('/v1/payments', SubmissionController.submitPayment);
app.post('/v1/accounts/:account/payments', SubmissionController.submitPayment);
app.get('/v1/accounts/:account/payments', PaymentsController.getPayment);
app.get('/v1/accounts/:account/payments/:identifier', PaymentsController.getPayment);
app.get('/v1/accounts/:account/payments/paths/:destination_account/:destination_amount_string', PaymentsController.getPathfind);

/* Notifications */
app.get('/v1/accounts/:account/notifications', NotificationsController.getNotification);
app.get('/v1/accounts/:account/notifications/:identifier', NotificationsController.getNotification);
app.get('/v1/accounts/:account/next_notification/:identifier', NotificationsController.getNextNotification);

/* Balances */
app.get('/v1/accounts/:account/balances', BalancesController.getBalances);

/* Settings */
app.get('/v1/accounts/:account/settings', SettingsController.getSettings);
app.post('/v1/accounts/:account/settings', SettingsController.changeSettings);

/* Standard Ripple Transactions */
app.get('/v1/tx/:identifier', TransactionsController.getTransaction);
app.get('/v1/transaction/:identifier', TransactionsController.getTransaction);
app.get('/v1/transactions/:identifier', TransactionsController.getTransaction);

/* Utils */
app.get('/v1/uuid', UtilsController.getUuid);

/* Configure SSL, if desired */
if (typeof config.get('ssl') === 'object') {
  var key_path  = config.get('ssl').key_path || './certs/server.key';
  var cert_path = config.get('ssl').cert_path || './certs/server.crt';

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
    console.log('ripple-rest listening over HTTPS at port: ' + config.get('PORT'));
  });
} else {
  app.listen(config.get('PORT'), function() {
    console.log('ripple-rest listening over UNSECURED HTTP at port: ' + config.get('PORT'));
  });
}
