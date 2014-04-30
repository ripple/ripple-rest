var fs      = require('fs');
var path    = require('path');
var URL     = require('url');
var https   = require('https');
var ripple  = require('ripple-lib');
var express = require('express');
var app     = express();
var remote;

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


/**** **** **** **** ****/


/* Connect to db */
var config = require('./config/config-loader');
var DatabaseInterface = require('./lib/db-interface');
var dbinterface = new DatabaseInterface(config.get('DATABASE_URL'));


/**** **** **** **** ****/


/* Connect to ripple-lib Remote */
var remote_opts = {
  servers: config.get('rippled_servers'),
  storage: dbinterface,
  ping: 15
};

var remote = (function(opts) {
  var remote = new ripple.Remote(opts);

  remote.on('error', function(err) {
    console.error('ripple-lib Remote error: ', err);
  });

  remote.on('disconnect', function() {
    console.log('Disconnected from rippled');
  });

  remote.on('connect', function() {
    console.log('Connected to rippled');
    console.log('Waiting for confirmation of network activity...');

    remote.once('ledger_closed', function() {
      if (remote._getServer()) {
        console.log('Connected to rippled server at:', remote._getServer()._opts.url);
        console.log('ripple-rest server ready');
      }
    });
  });

  console.log('Attempting to connect to the Ripple Network...');

  remote.connect();

  return remote;
})(remote_opts);


/**** **** **** **** ****/


app.configure(function() {
  app.disable('x-powered-by');

  if (config.get('NODE_ENV') !== 'production') {
    app.set('json spaces', 2);
    app.use(express.logger(':method :url (:response-time ms)'));
  }

  app.use(express.json());
  app.use(express.urlencoded());
});

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

function rippleAddressParam(param) {
  return function(req, res, next, address) {
    if (ripple.UInt160.is_valid(address)) {
      next();
    } else {
      res.send({ success: false, message: 'Specified address is invalid: ' + param });
    }
  };
};

app.param('account', rippleAddressParam('account'));
app.param('destination_account', rippleAddressParam('destination account'));

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

/* Initialize controllers */
var controller_opts = {
  remote:       remote,
  dbinterface:  dbinterface,
  config:       config
};

var api = require('./api')(controller_opts);


/**** **** **** **** ****/


/* Endpoints */
app.get('/', function(req, res) {
  res.redirect('/v1');
});

app.get('/v1', function(req, res) {
  var url_base = '/v1';

  res.json({
    success: true,
    name: 'ripple-rest',
    version: '1',
    documentation: 'https://github.com/ripple/ripple-rest',
    endpoints: {
      submit_payment:         url_base + '/payments',
      payment_paths:          url_base + '/accounts/{address}/payments/paths/{destination_account}/{destination_amount as value+currency or value+currency+issuer}',
      account_payments:       url_base + '/accounts/{address}/payments/{hash,client_resource_id}{?direction,exclude_failed}',
      account_notifications:  url_base + '/accounts/{address}/notifications{/hash,client_resource_id}{?types,exclude_failed}',
      account_balances:       url_base + '/accounts/{address}/balances',
      account_settings:       url_base + '/accounts/{address}/settings',
      account_trustlines:     url_base + '/accounts/{address}/trustlines',
      ripple_transactions:    url_base + '/transactions/{hash}',
      server_status:          url_base + '/server',
      server_connected:       url_base + '/server/connected',
      uuid_generator:         url_base + '/uuid'
    }
  });
});

/* Server */
app.get('/v1/server', api.info.serverStatus);
app.get('/v1/server/connected', api.info.isConnected);

/* Payments */
app.post('/v1/payments', api.submission.submit);
app.post('/v1/accounts/:account/payments', api.submission.submit);

app.get('/v1/accounts/:account/payments', api.payments.getBulkPayments);
app.get('/v1/accounts/:account/payments/:identifier', api.payments.getPayment);
app.get('/v1/accounts/:account/payments/paths/:destination_account/:destination_amount_string', api.payments.getPathFind);

/* Notifications */
app.get('/v1/accounts/:account/notifications', api.notifications.getNotification);
app.get('/v1/accounts/:account/notifications/:identifier', api.notifications.getNotification);
app.get('/v1/accounts/:account/next_notification/:identifier', api.notifications.getNextNotification);

/* Balances */
app.get('/v1/accounts/:account/balances', api.balances.get);

/* Settings */
app.get('/v1/accounts/:account/settings', api.settings.get);
app.post('/v1/accounts/:account/settings', api.settings.change);

/* Standard Ripple Transactions */
app.get('/v1/tx/:identifier', api.transactions.get);
app.get('/v1/transaction/:identifier', api.transactions.get);
app.get('/v1/transactions/:identifier', api.transactions.get);

/* Trust lines */
app.get('/v1/accounts/:account/trustlines', api.trustlines.get);
app.post('/v1/accounts/:account/trustlines', api.trustlines.add);

/* Utils */
app.get('/v1/uuid', api.info.uuid);

/* Error handler */
app.use(require('./lib/error-handler'));

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
