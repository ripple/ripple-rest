const ripple    = require('ripple-lib');
const express   = require('express');
const uuid      = require('node-uuid');
const api       = require('./../api');
const remote    = require('./remote.js');
const serverLib = require('./server-lib.js');
const respond   = require('./response-handler.js');
const errors    = require('./errors.js');

var router = new express.Router();

router.remote = remote;

/* validate the correctness of ripple address params */
router.param('account', function(req, res, next, address) {
  if (ripple.UInt160.is_valid(address)) {
    next();
  } else {
    next(new errors.InvalidRequestError('Parameter is not a valid Ripple address: account'));
  }
});

router.param('destination_account', function(req, res, next, address) {
  if (ripple.UInt160.is_valid(address)) {
    next();
  } else {
    next(new errors.InvalidRequestError('Parameter is not a valid Ripple address: destination_account'));
  }
});

router.get('/', function(req, res) {
  var url_base = '/v1';

  res.json({
    success: true,
    name: 'ripple-rest',
    version: '1',
    documentation: 'https://github.com/ripple/ripple-rest',
    endpoints: {
      submit_payment:         url_base + '/payments',
      account_new:            url_base + '/accounts/new',
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

/* uuid util */
router.get('/uuid', api.info.uuid);

/**
 * For all the routes below, we need a connected rippled
 * insert the validateRemoteConnected middleware here
 */

/* make sure the remote is connected to a rippled */
router.all('*', function(req, res, next) {
  serverLib.ensureConnected(remote, function(error, connected) {
    if (connected) {
      next();
    } else {
      next(new errors.RippledNetworkError(error ? error.message : void(0)));
    }
  });
});

/* Connected - if we hit this route, it means the server is connected */
router.get('/server/connected', api.info.isConnected);

/* Server */
router.get('/server', api.info.serverStatus);

/* Accounts */
router.get('/accounts/new', api.accounts.generate);

/* Payments */
router.post('/payments', api.payments.submit);
router.post('/accounts/:account/payments', api.payments.submit);

router.get('/accounts/:account/payments', api.payments.getAccountPayments);
router.get('/accounts/:account/payments/:identifier', api.payments.get);
router.get('/accounts/:account/payments/paths/:destination_account/:destination_amount_string', api.payments.getPathFind);

/* Notifications */
router.get('/accounts/:account/notifications', api.notifications.getNotification);
router.get('/accounts/:account/notifications/:identifier', api.notifications.getNotification);

/* Balances */
router.get('/accounts/:account/balances', api.balances.get);

/* Settings */
router.get('/accounts/:account/settings', api.settings.get);

router.post('/accounts/:account/settings', api.settings.change);

/* Standard Ripple Transactions */
router.get('/tx/:identifier', api.transactions.get);
router.get('/transaction/:identifier', api.transactions.get);
router.get('/transactions/:identifier', api.transactions.get);

/* Trust lines */
router.get('/accounts/:account/trustlines', api.trustlines.get);
router.post('/accounts/:account/trustlines', api.trustlines.add);

module.exports = router;
