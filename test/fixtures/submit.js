/* eslint-disable max-len */
'use strict';
var signFixtures = require('./sign');
var addresses = require('./addresses');


module.exports.submitRequest = {
  tx_blob: JSON.parse(signFixtures.signResponse).tx_blob
};

var tx_blob = '12000322000000002400000B7A201B0086961168400000000000000C732102F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D87446304402207660BDEF67105CE1EBA9AD35DC7156BAB43FF1D47633199EE257D70B6B9AAFBF0220723E54B026DF8C6FF19DC7CBEB6AB458C7D367B2BE42827E91CBA934143F2729770A726970706C652E636F6D81144FBFF73DA4ECF9B701940F27341FA8020C313443';

// Note: SingingPubKey, TxnSignature, and hash in tx_json are dummy data
var tx_json = {
  Account: addresses.VALID,
  Domain: '6162632E726970706C652E636F6D',
  Fee: '12',
  Flags: 0,
  LastLedgerSequence: 8820241,
  Sequence: 2938,
  SigningPubKey: '039371D0465097AC8F9C02EB60D5599AAD08AADBD623D6D40D642CF2D7C0481B83',
  TransactionType: 'AccountSet',
  TxnSignature: '3045022100BD1C0F7A411773D84AEEBFE35749467C1EE6F815E9237FCA38850A2A3432AC300220064EDAB08B202685AEE3685E475D8008EC7349F80A021200B27475412C899454',
  hash: '3455FA783DE44EACAD2243C53EA243C96A32BB8A1EC96E8939C43CFAFED802A9'
};

module.exports.submitRippledResponse = function(request) {
  return JSON.stringify({
    id: request.id,
    status: 'success',
    type: 'response',
    result: {
      success: true,
      engine_result: 'tesSUCCESS',
      engine_result_code: 0,
      engine_result_message: 'The transaction was applied. Only final in a validated ledger.',
      tx_blob: tx_blob,
      tx_json: tx_json
    }
  });
};

module.exports.submitResponse = JSON.stringify({
  success: true,
  engine_result: 'tesSUCCESS',
  engine_result_code: 0,
  engine_result_message: 'The transaction was applied. Only final in a validated ledger.',
  tx_blob: tx_blob,
  tx_json: tx_json
});
