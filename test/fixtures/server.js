var utils   = require('./../../api/lib/utils.js');
var pJson  = require('./../../package.json');

module.exports.serverInfoResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      info: {
        build_version: '0.24.0-rc1',
        complete_ledgers: '32570-6595042',
        hostid: 'ARTS',
        last_close: { converge_time_s: 2.007, proposers: 4 },
        load_factor: 1,
        peers: 53,
        pubkey_node: 'n94wWvFUmaKGYrKUGgpv1DyYgDeXRGdACkNQaSe7zJiy5Znio7UC',
        server_state: 'full',
        validated_ledger: {
          age: 5,
          base_fee_xrp: 0.00001,
          hash: '4482DEE5362332F54A4036ED57EE1767C9F33CF7CE5A6670355C16CECE381D46',
          reserve_base_xrp: 20,
          reserve_inc_xrp: 5,
          seq: 6595042
        },
        validation_quorum: 3
      }
    }
  });
};

module.exports.RESTServerInfoResponse = JSON.stringify({
  success: true,
  api_documentation_url: 'https://github.com/ripple/ripple-rest',
  rippled_server_url: 'ws://localhost:5995',
  rippled_server_status: {
    build_version: '0.24.0-rc1',
    complete_ledgers: '32570-6595042',
    hostid: 'ARTS',
    last_close: { converge_time_s: 2.007, proposers: 4 },
    load_factor: 1,
    peers: 53,
    pubkey_node: 'n94wWvFUmaKGYrKUGgpv1DyYgDeXRGdACkNQaSe7zJiy5Znio7UC',
    server_state: 'full',
    validated_ledger: {
      age: 5,
      base_fee_xrp: 0.00001,
      hash: '4482DEE5362332F54A4036ED57EE1767C9F33CF7CE5A6670355C16CECE381D46',
      reserve_base_xrp: 20,
      reserve_inc_xrp: 5,
      seq: 6595042 },
      validation_quorum: 3
  }
});

module.exports.RESTServerConnectedResponse = JSON.stringify({
  success: true,
  connected: true
});

module.exports.RESTServerIndexResponse = JSON.stringify({
  success: true,
  name: 'ripple-rest',
  package_version: pJson.version,
  version: '1',
  documentation: 'https://github.com/ripple/ripple-rest',
  endpoints: {
    wallet_new: '/v1/wallet/new',
    payment_paths: '/v1/accounts/{address}/payments/paths/{destination_account}/{destination_amount as value+currency or value+currency+issuer}',
    payment_submit: '/v1/accounts/{address}/payments',
    account_payments: '/v1/accounts/{address}/payments/{hash,client_resource_id}{?direction,exclude_failed}',
    account_notifications: '/v1/accounts/{address}/notifications/{hash,client_resource_id}',
    account_balances: '/v1/accounts/{address}/balances',
    account_settings: '/v1/accounts/{address}/settings',
    account_trustlines: '/v1/accounts/{address}/trustlines',
    account_orders_place: '/v1/accounts/{address}/orders',
    account_orders_cancel: '/v1/accounts/{address}/orders/{sequence}',
    account_orders: '/v1/accounts/{address}/orders/',
    account_order_transaction: '/v1/accounts/{address}/orders/{hash}',
    account_order_book: '/v1/accounts/{address}/order_book/{base as currency+issuer}/{counter as currency+issuer}',
    ripple_transactions: '/v1/transactions/{hash}',
    server_status: '/v1/server',
    server_connected: '/v1/server/connected',
    transaction_fee: '/v1/transaction-fee',
    uuid_generator: '/v1/uuid'
  }
});
