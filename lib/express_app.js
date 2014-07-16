var URL     = require('url');
var ripple  = require('ripple-lib');
var express = require('express');
var config = require(__dirname+'/config-loader');
var app     = express();
var remote;

/**** **** **** **** ****/

/* Connect to db */
var DatabaseInterface = require(__dirname+'/db-interface');
var dbinterface = new DatabaseInterface(config.get('DATABASE_URL'));

/**** **** **** **** ****/


/* Connect to ripple-lib Remote */
var remote_opts = {
  servers: config.get('rippled_servers'),
  storage: dbinterface,
  ping: 15,
};

// If in debug mode, set server trace option to true
if (config.get('debug')) {
  remote_opts.trace = true;
}

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

app.remote = remote;


/**** **** **** **** ****/


app.configure(function() {
  app.disable('x-powered-by');

  if (config.get('NODE_ENV') !== 'production' || config.get('debug')) {
    app.set('json spaces', 2);
    app.use(express.logger(':method :url (:response-time ms)'));
  }

  app.use(express.json());
  app.use(express.urlencoded());
});

app.use(ensureConnectionMiddleware);

function ensureConnectionMiddleware(request, response, next) {
  if (remote._connected) {
    next();
  } else {
    response.send(502, {
      error: "RippledConnectionError",
      success: false
    });
  }
}

app.use(function(req, res, next){
  var match = req.path.match(/\/api\/(.*)/);
  if (match) {
    res.redirect(match[1]);
  } else {
    next();
  }
});

function rippleAddressParam(param) {
  return function(req, res, next, address) {
    if (ripple.UInt160.is_valid(address)) {
      next();
    } else {
      res.send(400, {
        success: false,
        message: 'Specified address is invalid: ' + param
      });
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

var api = require(__dirname+'/../api')(controller_opts);


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
      account_notifications:  url_base + '/accounts/{address}/notifications/{hash,client_resource_id}',
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
app.post('/v1/payments', api.payments.submit);
app.post('/v1/accounts/:account/payments', api.payments.submit);

app.get('/v1/accounts/:account/payments', api.payments.getAccountPayments);
app.get('/v1/accounts/:account/payments/:identifier', api.payments.get);
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
app.use(require(__dirname+'/error-handler'));

module.exports = app;


