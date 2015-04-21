/* eslint-disable max-len */
'use strict';
var BASE_LEDGER_INDEX = 8819951;

module.exports.subscribeResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    type: 'response',
    status: 'success',
    result: {
      fee_base: 10,
      fee_ref: 10,
      hostid: 'NAP',
      ledger_hash: '60EBABF55F6AB58864242CADA0B24FBEA027F2426917F39CA56576B335C0065A',
      ledger_index: BASE_LEDGER_INDEX,
      ledger_time: 463782770,
      load_base: 256,
      load_factor: 256,
      pubkey_node: 'n9Lt7DgQmxjHF5mYJsV2U9anALHmPem8PWQHWGpw4XMz79HA5aJY',
      random: 'EECFEE93BBB608914F190EC177B11DE52FC1D75D2C97DACBD26D2DFC6050E874',
      reserve_base: 20000000,
      reserve_inc: 5000000,
      server_status: 'full',
      validated_ledgers: '32570-' + BASE_LEDGER_INDEX.toString()
    }
  });
};

module.exports.ledgerClose = function(offset) {
  var ledgerIndex = BASE_LEDGER_INDEX + (offset || 0);
  return JSON.stringify({
    type: 'ledgerClosed',
    fee_base: 10,
    fee_ref: 10,
    ledger_hash: 'BEAE5AA56874B7F1DE3AA19ED2B8CA61EBDAEC518E421F314B3EAE9AC12BDD02',
    ledger_index: ledgerIndex,
    ledger_time: 463782900,
    reserve_base: 20000000,
    reserve_inc: 5000000,
    txn_count: 5,
    validated_ledgers: '32570-' + ledgerIndex.toString()
  });
};
