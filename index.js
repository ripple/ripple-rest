var fs      = require('fs');
var path    = require('path');
var URL     = require('url');
var https   = require('https');
var ripple  = require('ripple-lib');
var express = require('express');
var bodyParser = require('body-parser')
var router  = express.Router();
var config = require('./config/config-loader');

var remoteOpts = {
  servers: config.get('rippled_servers'),
  storage: dbinterface,
  ping: 15,
};

if (config.get('debug')) {
  remoteOpts.trace = true;
}


var remote = new ripple.Remote(remoteOpts);

console = require('rconsole');

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
var DatabaseInterface = require('./lib/db-interface');
var dbinterface = new DatabaseInterface(config.get('DATABASE_URL'));


/**** **** **** **** ****/



// If in debug mode, set server trace option to true

function connectRemote(callback) {
  remote.on('error', function(err) {
    //console.error('ripple-lib Remote error: ', err);
  });

  remote.on('disconnect', function() {
    //console.log('Disconnected from rippled');
  });

  remote.on('connect', function() {
    //console.log('Connected to rippled');
    //console.log('Waiting for confirmation of network activity...');

    remote.once('ledger_closed', function() {
      if (remote._getServer()) {
       // console.log('Connected to rippled server at:', remote._getServer()._opts.url);
       // console.log('ripple-rest server ready');
        if (typeof callback === 'function') {
          callback();
        }
      }
    });
  });

  //console.log('Attempting to connect to the Ripple Network...');

  remote.connect();

  return remote;
}


/**** **** **** **** ****/

router.use(bodyParser());

router.use(function(req, res, next){
  var match = req.path.match(/\/api\/(.*)/);
  if (match) {
    res.redirect(match[1]);
  } else {
    next();
  }
});

router.use(function(req, res, next){
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

router.param('account', rippleAddressParam('account'));
router.param('destination_account', rippleAddressParam('destination account'));

router.all('*', function(req, res, next) {
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
router.get('/', function(req, res) {
  res.redirect('/v1');
});

router.get('/v1', function(req, res) {
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
router.get('/v1/server', api.info.serverStatus);
router.get('/v1/server/connected', api.info.isConnected);

/* Payments */
router.post('/v1/payments', api.submission.submit);
router.post('/v1/accounts/:account/payments', api.submission.submit);

router.get('/v1/accounts/:account/payments', api.payments.getBulkPayments);
router.get('/v1/accounts/:account/payments/:identifier', api.payments.getPayment);
router.get('/v1/accounts/:account/payments/paths/:destination_account/:destination_amount_string', api.payments.getPathFind);

/* Notifications */
router.get('/v1/accounts/:account/notifications', api.notifications.getNotification);
router.get('/v1/accounts/:account/notifications/:identifier', api.notifications.getNotification);
router.get('/v1/accounts/:account/next_notification/:identifier', api.notifications.getNextNotification);

/* Balances */
router.get('/v1/accounts/:account/balances', api.balances.get);

/* Settings */
router.get('/v1/accounts/:account/settings', api.settings.get);
router.post('/v1/accounts/:account/settings', api.settings.change);

/* Standard Ripple Transactions */
router.get('/v1/tx/:identifier', api.transactions.get);
router.get('/v1/transaction/:identifier', api.transactions.get);
router.get('/v1/transactions/:identifier', api.transactions.get);

/* Trust lines */
router.get('/v1/accounts/:account/trustlines', api.trustlines.get);
router.post('/v1/accounts/:account/trustlines', api.trustlines.add);

/* Utils */
router.get('/v1/uuid', api.info.uuid);

/* Error handler */
router.use(require('./lib/error-handler'));

module.exports = {
  router: router,
  connectRemote: connectRemote
}

