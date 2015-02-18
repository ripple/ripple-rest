const _         = require('lodash');
const ripple    = require('ripple-lib');
const express   = require('express');
const api       = require('../api');
const errors    = require('../api').errors;
const respond   = require('./response-handler.js');
const version   = require('./version.js');

const ROUTE_MAP = {
  GET: {
    '/uuid': api.info.uuid,
    '/server/connected': api.info.isConnected,
    '/transaction-fee': api.info.fee,
    '/server': api.info.serverStatus,
    '/wallet/new': api.wallet.generate,
    '/accounts/:account/payments': api.payments.getAccountPayments,
    '/accounts/:account/payments/:identifier': api.payments.get,
    '/accounts/:account/payments/paths/:destination_account/:destination_amount_string': api.payments.getPathFind,
    '/accounts/:account/orders': api.orders.getOrders,
    '/accounts/:account/order_book/:base/:counter': api.orders.getOrderBook,
    '/accounts/:account/orders/:identifier': api.orders.getOrder,
    '/accounts/:account/notifications': api.notifications.getNotification,
    '/accounts/:account/notifications/:identifier':
      api.notifications.getNotification,
    '/accounts/:account/balances': api.balances.get,
    '/accounts/:account/settings': api.settings.get,
    '/transactions/:identifier': api.transactions.get,
    '/accounts/:account/trustlines': api.trustlines.get
  },
  POST: {
    '/accounts/:account/payments': api.payments.submit,
    '/accounts/:account/orders': api.orders.placeOrder,
    '/accounts/:account/settings': api.settings.change,
    '/accounts/:account/trustlines': api.trustlines.add
  },
  DELETE: {
    '/accounts/:account/orders/:sequence': api.orders.cancelOrder
  }
};

var router = new express.Router();
router.get('/', generateIndexPage);

function generateIndexPage(req, res) {
  var url_base = '/v' + version.getApiVersion();

  res.json({
    success: true,
    name: 'ripple-rest',
    package_version: version.getPackageVersion(),
    version: version.getApiVersion(),
    documentation: 'https://github.com/ripple/ripple-rest',
    endpoints: {
      wallet_new: url_base + '/wallet/new',
      payment_paths: url_base + '/accounts/{address}/payments/paths/{destination_account}/{destination_amount as value+currency or value+currency+issuer}',
      payment_submit: url_base + '/accounts/{address}/payments',
      account_payments: url_base + '/accounts/{address}/payments/{hash,client_resource_id}{?direction,exclude_failed}',
      account_notifications: url_base + '/accounts/{address}/notifications/{hash,client_resource_id}',
      account_balances: url_base + '/accounts/{address}/balances',
      account_settings: url_base + '/accounts/{address}/settings',
      account_trustlines: url_base + '/accounts/{address}/trustlines',
      account_orders_place: url_base + '/accounts/{address}/orders',
      account_orders_cancel: url_base + '/accounts/{address}/orders/{sequence}',
      account_orders: url_base + '/accounts/{address}/orders/',
      account_order_transaction: url_base + '/accounts/{address}/orders/{hash}',
      account_order_book: url_base + '/accounts/{address}/order_book/{base as currency+issuer}/{counter as currency+issuer}',
      ripple_transactions: url_base + '/transactions/{hash}',
      server_status: url_base + '/server',
      server_connected: url_base + '/server/connected',
      transaction_fee: url_base + '/transaction-fee',
      uuid_generator: url_base + '/uuid'
    }
  });
};

/**
 * For all the routes, we need a connected rippled
 * insert the validateRemoteConnected middleware here
 */

/* make sure the api is connected to a rippled */
router.all('*', function(req, res, next) {
  if (api.isConnected()) {
    next();
  } else {
    next(new errors.RippledNetworkError(void(0)));
  }
});

function wrapper(handler, method, url) {
  return function(request, response, next) {
    handler(request, function(error, data) {
      if (error !== null) {
        next(error);
      } else {
        if (method === 'POST' && url === '/accounts/:account/trustlines') {
          respond.created(response, data);
        } else {
          respond.success(response, data);
        }
      }
    });
  };
}

function connectRoutes(routeMap) {
  var methods = {
    'GET': router.get,
    'POST': router.post,
    'DELETE': router.delete,
    'PUT': router.put
  };
  _.forIn(methods, function(connector, method) {
    const routes = routeMap[method] || {};
    _.forIn(routes, function(callback, url) {
      connector.call(router, url, wrapper(callback, method, url));
    });
  });
}

connectRoutes(ROUTE_MAP);

module.exports = router;
