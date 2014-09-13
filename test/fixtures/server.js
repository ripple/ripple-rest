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
