'use strict';
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

function getUserHomePath() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

function loadWallet() {
  var secretPath = path.join(getUserHomePath(), '.ripple_wallet');
  try {
    var walletRaw = fs.readFileSync(secretPath, {encoding: 'utf8'}).trim();
    return JSON.parse(walletRaw);
  } catch(e) {
    return null;
  }
}

var WALLET = loadWallet();

function getTestKey(key) {
  if (WALLET === null) {
    throw new Error('Could not find .ripple_wallet file in home directory');
  }
  if (WALLET.test === undefined) {
    throw new Error('Wallet does not contain a "test" account');
  }
  return WALLET.test[key];
}

module.exports = {
  getAddress: _.partial(getTestKey, 'address'),
  getSecret: _.partial(getTestKey, 'secret')
};
