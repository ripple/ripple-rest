'use strict';
var version = require('./version');
var respond = require('./response-handler');

function generateIndexPage(request, response, next) {
  var url_base = '/v' + version.getApiVersion();

  respond.success(response, {
    success: true,
    name: 'ripple-rest',
    package_version: version.getPackageVersion(),
    version: version.getApiVersion(),
    documentation: 'https://github.com/ripple/ripple-rest',
    endpoints: {
      wallet_new: url_base + '/wallet/new',
      payment_paths: url_base + '/accounts/{address}/payments/paths/'
        + '{destination_account}/{destination_amount as value+currency '
        + 'or value+currency+issuer}',
      payment_submit: url_base + '/accounts/{address}/payments',
      account_payments: url_base + '/accounts/{address}/payments/'
        + '{hash,client_resource_id}{?direction,exclude_failed}',
      account_notifications: url_base + '/accounts/{address}/notifications/'
        + '{hash,client_resource_id}',
      account_balances: url_base + '/accounts/{address}/balances',
      account_settings: url_base + '/accounts/{address}/settings',
      account_trustlines: url_base + '/accounts/{address}/trustlines',
      account_orders_place: url_base + '/accounts/{address}/orders',
      account_orders_cancel: url_base + '/accounts/{address}/orders/{sequence}',
      account_orders: url_base + '/accounts/{address}/orders/',
      account_order_transaction: url_base + '/accounts/{address}/orders/{hash}',
      account_order_book: url_base + '/accounts/{address}/order_book/'
        + '{base as currency+issuer}/{counter as currency+issuer}',
      ripple_transactions: url_base + '/transactions/{hash}',
      server_status: url_base + '/server',
      server_connected: url_base + '/server/connected',
      transaction_fee: url_base + '/transaction-fee',
      uuid_generator: url_base + '/uuid'
    }
  });
  next();
}

module.exports = generateIndexPage;
