var express = require('express'); 
var api = require(__dirname+'/../api');
var remote = require(__dirname+'/remote.js');

var router = new express.Router();
router.remote = remote;

router.get('/', function(req, res) {
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
router.get('/server', api.info.serverStatus);

router.get('/server/connected', api.info.isConnected);

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

/* Utils */
router.get('/uuid', api.info.uuid);

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

router.use(ensureConnectionMiddleware);

module.exports = router;

