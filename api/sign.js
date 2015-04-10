'use strict';
var sjcl = require('ripple-lib').sjcl;
var Seed = require('ripple-lib').Seed;
var SerializedObject = require('ripple-lib').SerializedObject;
var validate = require('./lib/validate');

/**
 * These prefixes are inserted before the source material used to
 * generate various hashes. This is done to put each hash in its own
 * "space." This way, two different types of objects with the
 * same binary data will produce different hashes.
 *
 * Each prefix is a 4-byte value with the last byte set to zero
 * and the first three bytes formed from the ASCII equivalent of
 * some arbitrary string. For example "TXN".
 */
var HASH_TX_ID = 0x54584E00; // 'TXN'
var HASH_TX_SIGN = 0x53545800; // 'STX'
var HASH_TX_SIGN_TESTNET = 0x73747800; // 'stx'

function getKeyPair(address, secret) {
  return Seed.from_json(secret).get_key(address);
}

function getPublicKeyHex(keypair) {
  return keypair.to_hex_pub();
}

function serialize(txJSON) {
  return SerializedObject.from_json(txJSON);
}

function hashSerialization(serialized, prefix) {
  return serialized.hash(prefix || HASH_TX_ID).to_hex();
}

function hashJSON(txJSON, prefix) {
  return hashSerialization(serialize(txJSON), prefix);
}

function signingHash(txJSON, isTestNet) {
  return hashJSON(txJSON, isTestNet ? HASH_TX_SIGN_TESTNET : HASH_TX_SIGN);
}

function computeSignature(txJSON, keypair) {
  var signature = keypair.sign(signingHash(txJSON));
  return sjcl.codec.hex.fromBits(signature).toUpperCase();
}

function sign(txJSON, secret) {
  validate.txJSON(txJSON);
  validate.addressAndSecret({address: txJSON.Account, secret: secret});

  var keypair = getKeyPair(txJSON.Acccount, secret);
  if (txJSON.SigningPubKey === undefined) {
    txJSON.SigningPubKey = getPublicKeyHex(keypair);
  }
  txJSON.TxnSignature = computeSignature(txJSON, keypair);
  var serialized = serialize(txJSON);
  return {
    tx_blob: serialized.to_hex(),
    hash: hashSerialization(serialized, HASH_TX_ID)
  };
}

module.exports = sign;
